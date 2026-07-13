-- Drop the unique constraint index for url actions to allow multiple launch urls per project
DROP INDEX IF EXISTS launch_actions_project_url_unique;
