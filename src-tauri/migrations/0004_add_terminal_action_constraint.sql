CREATE UNIQUE INDEX IF NOT EXISTS launch_actions_project_terminal_unique
ON launch_actions (project_id, type)
WHERE type = 'terminal';
