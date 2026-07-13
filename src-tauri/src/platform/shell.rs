use portable_pty::CommandBuilder;
use std::{
    env,
    path::{Path, PathBuf},
};

pub fn build_command(command: &str, working_directory: &Path) -> Result<CommandBuilder, String> {
    let shell =
        resolve_shell().ok_or_else(|| "A supported system shell was not found.".to_string())?;
    let mut builder = CommandBuilder::new(shell);

    configure_arguments(&mut builder, command);
    builder.cwd(working_directory);
    builder.env("TERM", "xterm-256color");
    builder.env("COLORTERM", "truecolor");

    Ok(builder)
}

fn resolve_shell() -> Option<PathBuf> {
    environment_shell()
        .filter(|candidate| candidate.is_file())
        .or_else(|| {
            known_shells()
                .into_iter()
                .find(|candidate| candidate.is_file())
        })
}

fn environment_shell() -> Option<PathBuf> {
    #[cfg(windows)]
    let variable = "COMSPEC";
    #[cfg(not(windows))]
    let variable = "SHELL";

    env::var_os(variable).map(PathBuf::from)
}

#[cfg(target_os = "linux")]
fn known_shells() -> Vec<PathBuf> {
    [
        "/bin/bash",
        "/usr/bin/bash",
        "/bin/zsh",
        "/usr/bin/zsh",
        "/bin/sh",
    ]
    .into_iter()
    .map(PathBuf::from)
    .collect()
}

#[cfg(target_os = "macos")]
fn known_shells() -> Vec<PathBuf> {
    ["/bin/zsh", "/bin/bash", "/bin/sh"]
        .into_iter()
        .map(PathBuf::from)
        .collect()
}

#[cfg(windows)]
fn known_shells() -> Vec<PathBuf> {
    let windows = env::var_os("SystemRoot")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\Windows"));

    vec![windows.join("System32").join("cmd.exe")]
}

#[cfg(windows)]
fn configure_arguments(builder: &mut CommandBuilder, command: &str) {
    builder.args(["/D", "/S", "/C", command]);
}

#[cfg(not(windows))]
fn configure_arguments(builder: &mut CommandBuilder, command: &str) {
    builder.args(["-l", "-i", "-c", command]);
}

#[cfg(test)]
mod tests {
    use super::build_command;

    #[test]
    fn builds_command_with_working_directory_and_terminal_environment() {
        let working_directory = std::env::temp_dir();
        let command = build_command("printf phase-three", &working_directory)
            .expect("a system shell should be available during tests");

        assert_eq!(command.get_cwd(), Some(&working_directory.into_os_string()));
        assert_eq!(
            command.get_env("TERM"),
            Some(std::ffi::OsStr::new("xterm-256color"))
        );
        assert_eq!(
            command.get_argv().last(),
            Some(&std::ffi::OsString::from("printf phase-three")),
        );
    }
}
