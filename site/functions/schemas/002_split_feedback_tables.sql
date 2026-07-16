-- Split single feedback table into 4 separate tables by type
-- Run: wrangler d1 execute slingshot-feedback --remote --file=./functions/schemas/002_split_feedback_tables.sql

-- 1. Rename old table
ALTER TABLE feedback RENAME TO feedback_old;

-- 2. Create new tables (no type column — each table is a type)
CREATE TABLE IF NOT EXISTS bugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
);

CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
);

-- 3. Migrate existing data from old table
INSERT INTO bugs (name, email, message, ip, created_at, status)
  SELECT name, email, message, ip, created_at, status FROM feedback_old WHERE type = 'bug';

INSERT INTO features (name, email, message, ip, created_at, status)
  SELECT name, email, message, ip, created_at, status FROM feedback_old WHERE type = 'feature';

INSERT INTO feedback (name, email, message, ip, created_at, status)
  SELECT name, email, message, ip, created_at, status FROM feedback_old WHERE type = 'feedback';

INSERT INTO questions (name, email, message, ip, created_at, status)
  SELECT name, email, message, ip, created_at, status FROM feedback_old WHERE type = 'question';

-- 4. Drop old table
DROP TABLE IF EXISTS feedback_old;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_bugs_created ON bugs(created_at);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_features_created ON features(created_at);
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
