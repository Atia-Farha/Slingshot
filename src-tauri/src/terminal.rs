use portable_pty::{native_pty_system, ChildKiller, MasterPty, PtySize};
use serde::Deserialize;
use std::{
    io::{Read, Write},
    path::PathBuf,
    sync::{
        atomic::{AtomicU32, Ordering},
        Arc, Mutex,
    },
    thread,
};
use tauri::{
    ipc::{Channel, Response},
    AppHandle, Manager, State,
};

const MAX_DIMENSION: u16 = 1000;
const MAX_COMMAND_LENGTH: usize = 4096;
const READ_BUFFER_SIZE: usize = 16 * 1024;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalStartRequest {
    folder_path: String,
    command: String,
    cols: u16,
    rows: u16,
}

pub struct TerminalState {
    session: Mutex<Option<Arc<TerminalSession>>>,
    next_id: AtomicU32,
}

impl Default for TerminalState {
    fn default() -> Self {
        Self {
            session: Mutex::new(None),
            next_id: AtomicU32::new(1),
        }
    }
}

struct TerminalSession {
    id: u32,
    writer: Mutex<Box<dyn Write + Send>>,
    master: Mutex<Box<dyn MasterPty + Send>>,
    killer: Mutex<Box<dyn ChildKiller + Send + Sync>>,
}

impl Drop for TerminalSession {
    fn drop(&mut self) {
        if let Ok(mut killer) = self.killer.lock() {
            let _ = killer.kill();
        }
    }
}

#[tauri::command]
pub fn terminal_start(
    app: AppHandle,
    state: State<'_, TerminalState>,
    request: TerminalStartRequest,
    on_data: Channel<Response>,
    on_exit: Channel<u32>,
) -> Result<u32, String> {
    validate_request(
        &request.folder_path,
        &request.command,
        request.cols,
        request.rows,
    )?;

    let working_directory = PathBuf::from(request.folder_path);
    let command_builder =
        crate::platform::shell::build_command(&request.command, &working_directory)?;
    let size = PtySize {
        rows: request.rows,
        cols: request.cols,
        pixel_width: 0,
        pixel_height: 0,
    };
    let pair = native_pty_system()
        .openpty(size)
        .map_err(|_| "The embedded terminal could not be created.".to_string())?;
    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|_| "The terminal output stream could not be created.".to_string())?;
    let writer = pair
        .master
        .take_writer()
        .map_err(|_| "The terminal input stream could not be created.".to_string())?;
    let mut child = pair
        .slave
        .spawn_command(command_builder)
        .map_err(|_| "The terminal command could not be started.".to_string())?;
    drop(pair.slave);

    let session_id = state.next_id.fetch_add(1, Ordering::Relaxed);
    let session = Arc::new(TerminalSession {
        id: session_id,
        writer: Mutex::new(writer),
        master: Mutex::new(pair.master),
        killer: Mutex::new(child.clone_killer()),
    });

    let previous = state
        .session
        .lock()
        .map_err(|_| "Terminal state is unavailable.".to_string())?
        .replace(session);
    stop_session(previous);

    let reader_channel = on_data.clone();
    let reader_thread = thread::Builder::new()
        .name("slingshot-terminal-reader".into())
        .spawn(move || {
            let mut buffer = [0_u8; READ_BUFFER_SIZE];

            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(count) => {
                        if reader_channel
                            .send(Response::new(buffer[..count].to_vec()))
                            .is_err()
                        {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        });
    let reader_thread = match reader_thread {
        Ok(thread) => thread,
        Err(_) => {
            stop_session(take_session(&state, session_id));
            return Err("The terminal output worker could not be started.".into());
        }
    };

    let waiter_thread = thread::Builder::new()
        .name("slingshot-terminal-waiter".into())
        .spawn(move || {
            let exit_code = child.wait().map(|status| status.exit_code()).unwrap_or(1);
            let _ = reader_thread.join();
            let _ = on_exit.send(exit_code);
            clear_finished_session(&app, session_id);
        });

    if waiter_thread.is_err() {
        stop_session(take_session(&state, session_id));
        return Err("The terminal process monitor could not be started.".into());
    }

    Ok(session_id)
}

#[tauri::command]
pub fn terminal_write(
    state: State<'_, TerminalState>,
    session_id: u32,
    data: String,
) -> Result<(), String> {
    let session = current_session(&state, session_id)?;
    let result = session
        .writer
        .lock()
        .map_err(|_| "Terminal input is unavailable.".to_string())?
        .write_all(data.as_bytes())
        .map_err(|_| "Terminal input could not be written.".to_string());

    result
}

#[tauri::command]
pub fn terminal_resize(
    state: State<'_, TerminalState>,
    session_id: u32,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    validate_dimensions(cols, rows)?;
    let session = current_session(&state, session_id)?;
    let result = session
        .master
        .lock()
        .map_err(|_| "Terminal sizing is unavailable.".to_string())?
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|_| "Terminal size could not be updated.".to_string());

    result
}

#[tauri::command]
pub fn terminal_stop(state: State<'_, TerminalState>, session_id: u32) -> Result<(), String> {
    let session = {
        let mut current = state
            .session
            .lock()
            .map_err(|_| "Terminal state is unavailable.".to_string())?;

        if current
            .as_ref()
            .is_some_and(|session| session.id == session_id)
        {
            current.take()
        } else {
            None
        }
    };

    stop_session(session);
    Ok(())
}

fn validate_request(folder_path: &str, command: &str, cols: u16, rows: u16) -> Result<(), String> {
    if !PathBuf::from(folder_path).is_dir() {
        return Err("Project folder does not exist or is not a directory.".into());
    }

    let trimmed = command.trim();

    if trimmed.is_empty() {
        return Err("Terminal command is required.".into());
    }

    if command.len() > MAX_COMMAND_LENGTH || command.contains(['\r', '\n', '\0']) {
        return Err("Terminal command is invalid.".into());
    }

    validate_dimensions(cols, rows)
}

fn validate_dimensions(cols: u16, rows: u16) -> Result<(), String> {
    if cols == 0 || rows == 0 || cols > MAX_DIMENSION || rows > MAX_DIMENSION {
        return Err("Terminal dimensions are invalid.".into());
    }

    Ok(())
}

fn current_session(
    state: &State<'_, TerminalState>,
    session_id: u32,
) -> Result<Arc<TerminalSession>, String> {
    state
        .session
        .lock()
        .map_err(|_| "Terminal state is unavailable.".to_string())?
        .as_ref()
        .filter(|session| session.id == session_id)
        .cloned()
        .ok_or_else(|| "Terminal session is no longer running.".to_string())
}

fn stop_session(session: Option<Arc<TerminalSession>>) {
    if let Some(session) = session {
        if let Ok(mut killer) = session.killer.lock() {
            let _ = killer.kill();
        }
    }
}

fn take_session(state: &TerminalState, session_id: u32) -> Option<Arc<TerminalSession>> {
    state.session.lock().ok().and_then(|mut current| {
        if current
            .as_ref()
            .is_some_and(|session| session.id == session_id)
        {
            current.take()
        } else {
            None
        }
    })
}

fn clear_finished_session(app: &AppHandle, session_id: u32) {
    let state = app.state::<TerminalState>();
    let finished = state.session.lock().ok().and_then(|mut current| {
        if current
            .as_ref()
            .is_some_and(|session| session.id == session_id)
        {
            current.take()
        } else {
            None
        }
    });

    drop(finished);
}

#[cfg(test)]
mod tests {
    use super::{validate_dimensions, validate_request};

    #[test]
    fn rejects_invalid_dimensions() {
        assert!(validate_dimensions(0, 24).is_err());
        assert!(validate_dimensions(80, 0).is_err());
        assert!(validate_dimensions(1001, 24).is_err());
    }

    #[test]
    fn rejects_multiline_commands() {
        let folder = std::env::temp_dir().to_string_lossy().to_string();

        assert!(validate_request(&folder, "pnpm install\npnpm dev", 80, 24).is_err());
    }

    #[cfg(unix)]
    #[test]
    fn executes_a_command_through_a_native_pty() {
        use portable_pty::{native_pty_system, PtySize};
        use std::io::Read;

        let pair = native_pty_system()
            .openpty(PtySize::default())
            .expect("native PTY should open");
        let mut reader = pair
            .master
            .try_clone_reader()
            .expect("PTY reader should clone");
        let command =
            crate::platform::shell::build_command("printf phase-three", &std::env::temp_dir())
                .expect("system shell should resolve");
        let mut child = pair
            .slave
            .spawn_command(command)
            .expect("command should spawn");
        drop(pair.slave);
        child.wait().expect("command should exit");

        let mut output = String::new();
        reader
            .read_to_string(&mut output)
            .expect("terminal output should be readable");

        assert!(output.contains("phase-three"));
    }
}
