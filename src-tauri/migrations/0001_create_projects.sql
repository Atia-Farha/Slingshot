CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    folder_path TEXT NOT NULL,
    icon TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    last_opened DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
