CREATE TABLE projects_next (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    folder_path TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT 0,
    last_opened DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects_next (
    id,
    name,
    description,
    folder_path,
    is_favorite,
    last_opened,
    created_at
)
SELECT
    id,
    name,
    description,
    folder_path,
    is_favorite,
    last_opened,
    created_at
FROM projects;

CREATE TABLE launch_actions_backup (
    id INTEGER PRIMARY KEY,
    project_id INTEGER,
    type TEXT NOT NULL,
    label TEXT,
    command TEXT,
    target TEXT,
    run_order INTEGER DEFAULT 0
);

INSERT INTO launch_actions_backup
SELECT id, project_id, type, label, command, target, run_order
FROM launch_actions;

DROP TABLE launch_actions;
DROP TABLE projects;
ALTER TABLE projects_next RENAME TO projects;

CREATE TABLE launch_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT,
    command TEXT,
    target TEXT,
    run_order INTEGER DEFAULT 0
);

INSERT INTO launch_actions
SELECT id, project_id, type, label, command, target, run_order
FROM launch_actions_backup;

DROP TABLE launch_actions_backup;

CREATE UNIQUE INDEX launch_actions_project_url_unique
ON launch_actions (project_id, type)
WHERE type = 'url';
