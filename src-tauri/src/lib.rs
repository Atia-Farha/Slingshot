mod platform;

use std::path::PathBuf;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn launch_vscode(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let folder = PathBuf::from(&folder_path);

    if !folder.is_dir() {
        return Err("Project folder does not exist or is not a directory.".into());
    }

    let executable = platform::vscode::resolve_executable().ok_or_else(|| {
        "VS Code was not found. Install it or add the `code` command to PATH.".to_string()
    })?;

    app.shell()
        .command(executable)
        .arg(folder)
        .spawn()
        .map(|_| ())
        .map_err(|_| "VS Code could not be started.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_projects_table",
            sql: include_str!("../migrations/0001_create_projects.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_launch_actions_table",
            sql: include_str!("../migrations/0002_create_launch_actions.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "rebuild_project_storage",
            sql: include_str!("../migrations/0003_rebuild_project_storage.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:slingshot.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![launch_vscode])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
