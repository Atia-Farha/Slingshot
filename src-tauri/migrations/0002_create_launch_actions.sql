CREATE TABLE IF NOT EXISTS launch_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT,
    command TEXT,
    target TEXT,
    run_order INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS launch_actions_project_url_unique
ON launch_actions (project_id, type)
WHERE type = 'url';
