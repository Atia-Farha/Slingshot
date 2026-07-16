CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('bug', 'feature', 'feedback', 'question')),
  message TEXT NOT NULL,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
