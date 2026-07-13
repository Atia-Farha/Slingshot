use std::{env, path::PathBuf};

pub fn resolve_executable() -> Option<PathBuf> {
    find_first_existing(platform_candidates()).or_else(find_on_path)
}

fn find_first_existing(candidates: Vec<PathBuf>) -> Option<PathBuf> {
    candidates.into_iter().find(|candidate| candidate.is_file())
}

fn find_on_path() -> Option<PathBuf> {
    let executable_name = if cfg!(windows) { "code.exe" } else { "code" };
    let path = env::var_os("PATH")?;

    find_first_existing(
        env::split_paths(&path)
            .map(|directory| directory.join(executable_name))
            .collect(),
    )
}

#[cfg(target_os = "linux")]
fn platform_candidates() -> Vec<PathBuf> {
    [
        "/usr/bin/code",
        "/usr/local/bin/code",
        "/snap/bin/code",
        "/var/lib/flatpak/exports/bin/com.visualstudio.code",
    ]
    .into_iter()
    .map(PathBuf::from)
    .collect()
}

#[cfg(target_os = "macos")]
fn platform_candidates() -> Vec<PathBuf> {
    let mut candidates = vec![PathBuf::from(
        "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
    )];

    if let Some(home) = env::var_os("HOME") {
        candidates.push(
            PathBuf::from(home)
                .join("Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"),
        );
    }

    candidates
}

#[cfg(target_os = "windows")]
fn platform_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    if let Some(local_app_data) = env::var_os("LOCALAPPDATA") {
        candidates.push(
            PathBuf::from(local_app_data)
                .join("Programs")
                .join("Microsoft VS Code")
                .join("Code.exe"),
        );
    }

    for variable in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Some(program_files) = env::var_os(variable) {
            candidates.push(
                PathBuf::from(program_files)
                    .join("Microsoft VS Code")
                    .join("Code.exe"),
            );
        }
    }

    candidates
}

#[cfg(test)]
mod tests {
    use super::find_first_existing;
    use std::{fs, path::PathBuf};

    #[test]
    fn returns_first_existing_file() {
        let directory =
            std::env::temp_dir().join(format!("slingshot-vscode-resolver-{}", std::process::id()));
        let missing = directory.join("missing-code");
        let existing = directory.join("code");
        fs::create_dir_all(&directory).expect("test directory should be created");
        fs::write(&existing, []).expect("test executable should be created");

        let result = find_first_existing(vec![missing, existing.clone()]);

        assert_eq!(result, Some(existing));
        fs::remove_dir_all(directory).expect("test directory should be removed");
    }

    #[test]
    fn returns_none_when_no_file_exists() {
        assert_eq!(
            find_first_existing(vec![PathBuf::from("/missing/slingshot-code")]),
            None
        );
    }
}
