import Database from "@tauri-apps/plugin-sql";

const DATABASE_URL = "sqlite:slingshot.db";

let databasePromise;

function getDatabase() {
    databasePromise ??= Database.load(DATABASE_URL);
    return databasePromise;
}

function mapProject(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        folderPath: row.folder_path,
        isFavorite: Boolean(row.is_favorite),
        lastOpened: row.last_opened,
        createdAt: row.created_at,
        launchUrl: row.launch_url ?? "",
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
                    (SELECT target FROM launch_actions
                     WHERE project_id = p.id AND type = 'url'
                     ORDER BY run_order, id LIMIT 1) AS launch_url
             FROM projects p
             ORDER BY p.created_at DESC, p.id DESC`,
        );

        return rows.map(mapProject);
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
                    NULL AS launch_url
             FROM projects WHERE id = $1`,
            [result.lastInsertId],
        );

        if (!rows[0]) {
            throw new Error("Created project could not be read.");
        }

        return mapProject(rows[0]);
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

        const rows = await database.select(
            `SELECT p.id, p.name, p.description, p.folder_path, p.is_favorite,
                    p.last_opened, p.created_at,
                    (SELECT target FROM launch_actions
                     WHERE project_id = p.id AND type = 'url'
                     ORDER BY run_order, id LIMIT 1) AS launch_url
             FROM projects p WHERE p.id = $1`,
            [id],
        );

        if (!rows[0]) {
            throw new Error("Updated project could not be read.");
        }

        return mapProject(rows[0]);
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

export async function saveProjectUrl(projectId, launchUrl) {
    return runDatabaseOperation("Project URL could not be saved.", async () => {
        const database = await getDatabase();

        if (!launchUrl) {
            await database.execute(
                "DELETE FROM launch_actions WHERE project_id = $1 AND type = 'url'",
                [projectId],
            );
            return "";
        }

        await database.execute(
            `INSERT INTO launch_actions (project_id, type, label, target, run_order)
             VALUES ($1, 'url', 'Project URL', $2, 0)
             ON CONFLICT (project_id, type) WHERE type = 'url'
             DO UPDATE SET target = excluded.target`,
            [projectId, launchUrl],
        );

        return launchUrl;
    });
}
