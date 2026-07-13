import Database from "@tauri-apps/plugin-sql";

const DATABASE_URL = "sqlite:slingshot.db";

let databasePromise;

function getDatabase() {
    databasePromise ??= Database.load(DATABASE_URL);
    return databasePromise;
}

function mapProject(row, urls = []) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        folderPath: row.folder_path,
        isFavorite: Boolean(row.is_favorite),
        lastOpened: row.last_opened,
        createdAt: row.created_at,
        launchUrl: urls[0] ?? "",
        launchUrls: urls,
        terminalCommand: row.terminal_command ?? "",
    };
}

async function runDatabaseOperation(message, operation) {
    try {
        return await operation();
    } catch (cause) {
        throw new Error(message, { cause });
    }
}

export async function listProjects() {
    return runDatabaseOperation("Projects could not be loaded.", async () => {
        const database = await getDatabase();
        const rows = await database.select(
            `SELECT p.id, p.name, p.description, p.folder_path, p.is_favorite,
                    p.last_opened, p.created_at,
                    (SELECT command FROM launch_actions
                     WHERE project_id = p.id AND type = 'terminal'
                     ORDER BY run_order, id LIMIT 1) AS terminal_command
             FROM projects p
             ORDER BY p.created_at DESC, p.id DESC`,
        );

        const urlRows = await database.select(
            "SELECT project_id, target FROM launch_actions WHERE type = 'url' ORDER BY run_order, id",
        );

        const urlsByProjectId = {};
        for (const urlRow of urlRows) {
            if (!urlsByProjectId[urlRow.project_id]) {
                urlsByProjectId[urlRow.project_id] = [];
            }
            urlsByProjectId[urlRow.project_id].push(urlRow.target);
        }

        return rows.map((row) =>
            mapProject(row, urlsByProjectId[row.id] || []),
        );
    });
}

export async function createProject(project) {
    return runDatabaseOperation("Project could not be created.", async () => {
        const database = await getDatabase();
        const result = await database.execute(
            `INSERT INTO projects (name, description, folder_path)
             VALUES ($1, $2, $3)`,
            [project.name, project.description || null, project.folderPath],
        );
        const rows = await database.select(
            `SELECT id, name, description, folder_path, is_favorite, last_opened, created_at,
                    NULL AS terminal_command
             FROM projects WHERE id = $1`,
            [result.lastInsertId],
        );

        if (!rows[0]) {
            throw new Error("Created project could not be read.");
        }

        return mapProject(rows[0], []);
    });
}

export async function updateProject(id, project) {
    return runDatabaseOperation("Project could not be updated.", async () => {
        const database = await getDatabase();
        const result = await database.execute(
            `UPDATE projects
             SET name = $1, description = $2, folder_path = $3
             WHERE id = $4`,
            [project.name, project.description || null, project.folderPath, id],
        );

        if (result.rowsAffected !== 1) {
            throw new Error("Project no longer exists.");
        }

        const urlRows = await database.select(
            `SELECT target FROM launch_actions
             WHERE project_id = $1 AND type = 'url'
             ORDER BY run_order, id`,
            [id],
        );
        const urls = urlRows.map((r) => r.target);

        const rows = await database.select(
            `SELECT p.id, p.name, p.description, p.folder_path, p.is_favorite,
                    p.last_opened, p.created_at,
                    (SELECT command FROM launch_actions
                     WHERE project_id = p.id AND type = 'terminal'
                     ORDER BY run_order, id LIMIT 1) AS terminal_command
             FROM projects p WHERE p.id = $1`,
            [id],
        );

        if (!rows[0]) {
            throw new Error("Updated project could not be read.");
        }

        return mapProject(rows[0], urls);
    });
}

export async function deleteProject(id) {
    return runDatabaseOperation("Project could not be deleted.", async () => {
        const database = await getDatabase();
        const result = await database.execute(
            "DELETE FROM projects WHERE id = $1",
            [id],
        );

        if (result.rowsAffected !== 1) {
            throw new Error("Project no longer exists.");
        }
    });
}

export async function saveProjectUrls(projectId, launchUrls) {
    return runDatabaseOperation(
        "Project URLs could not be saved.",
        async () => {
            const database = await getDatabase();

            await database.execute(
                "DELETE FROM launch_actions WHERE project_id = $1 AND type = 'url'",
                [projectId],
            );

            const savedUrls = [];
            for (let i = 0; i < launchUrls.length; i++) {
                const url = launchUrls[i];
                if (url) {
                    await database.execute(
                        `INSERT INTO launch_actions (project_id, type, label, target, run_order)
                     VALUES ($1, 'url', 'Project URL', $2, $3)`,
                        [projectId, url, i],
                    );
                    savedUrls.push(url);
                }
            }

            return savedUrls;
        },
    );
}

export async function saveProjectUrl(projectId, launchUrl) {
    const urls = await saveProjectUrls(projectId, launchUrl ? [launchUrl] : []);
    return urls[0] ?? "";
}

export async function saveProjectTerminalCommand(projectId, command) {
    return runDatabaseOperation(
        "Terminal command could not be saved.",
        async () => {
            const database = await getDatabase();

            if (!command) {
                await database.execute(
                    "DELETE FROM launch_actions WHERE project_id = $1 AND type = 'terminal'",
                    [projectId],
                );
                return "";
            }

            await database.execute(
                `INSERT INTO launch_actions (project_id, type, label, command, run_order)
                 VALUES ($1, 'terminal', 'Development command', $2, 0)
                 ON CONFLICT (project_id, type) WHERE type = 'terminal'
                 DO UPDATE SET command = excluded.command`,
                [projectId, command],
            );

            return command;
        },
    );
}
