import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
    execute: vi.fn(),
    select: vi.fn(),
}));

const load = vi.hoisted(() => vi.fn(() => Promise.resolve(database)));

vi.mock("@tauri-apps/plugin-sql", () => ({
    default: { load },
}));

import {
    createProject,
    deleteProject,
    listProjects,
    saveProjectTerminalCommand,
    saveProjectUrl,
    updateProject,
} from "./projectRepository";

const databaseRow = {
    id: 7,
    name: "Slingshot",
    description: null,
    folder_path: "/projects/slingshot",
    is_favorite: 1,
    last_opened: null,
    created_at: "2026-07-13 10:00:00",
    launch_url: null,
    terminal_command: null,
};

beforeEach(() => {
    database.execute.mockReset();
    database.select.mockReset();
});

describe("project repository", () => {
    it("loads and maps project rows", async () => {
        database.select
            .mockResolvedValueOnce([databaseRow]) // projects query
            .mockResolvedValueOnce([]); // url rows query

        await expect(listProjects()).resolves.toEqual([
            {
                id: 7,
                name: "Slingshot",
                description: "",
                folderPath: "/projects/slingshot",
                isFavorite: true,
                lastOpened: null,
                createdAt: "2026-07-13 10:00:00",
                launchUrl: "",
                launchUrls: [],
                terminalCommand: "",
            },
        ]);
        expect(load).toHaveBeenCalledWith("sqlite:slingshot.db");
    });

    it("creates projects using bound values", async () => {
        database.execute.mockResolvedValue({
            lastInsertId: 7,
            rowsAffected: 1,
        });
        database.select.mockResolvedValueOnce([databaseRow]);

        await createProject({
            name: "Slingshot",
            description: "",
            folderPath: "/projects/slingshot",
        });

        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO projects"),
            ["Slingshot", null, "/projects/slingshot"],
        );
        expect(database.select).toHaveBeenCalledWith(
            expect.stringContaining("WHERE id = $1"),
            [7],
        );
    });

    it("updates projects using a bound identifier", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 1 });
        database.select
            .mockResolvedValueOnce([]) // url rows
            .mockResolvedValueOnce([{ ...databaseRow, name: "Updated" }]); // project row

        const updated = await updateProject(7, {
            name: "Updated",
            description: "Description",
            folderPath: "/projects/updated",
        });

        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE projects"),
            ["Updated", "Description", "/projects/updated", 7],
        );
        expect(updated.name).toBe("Updated");
    });

    it("returns a readable error when deletion affects no row", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 0 });

        await expect(deleteProject(99)).rejects.toThrow(
            "Project could not be deleted.",
        );
    });

    it("saves a project URL using bound values", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 1 });

        await expect(
            saveProjectUrl(7, "https://example.com/project"),
        ).resolves.toBe("https://example.com/project");

        // First call is DELETE, second is INSERT
        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM launch_actions"),
            [7],
        );
        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO launch_actions"),
            [7, "https://example.com/project", 0],
        );
    });

    it("removes a project URL when given an empty value", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 1 });

        await expect(saveProjectUrl(7, "")).resolves.toBe("");

        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM launch_actions"),
            [7],
        );
    });

    it("saves a terminal command using bound values", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 1 });

        await expect(saveProjectTerminalCommand(7, "pnpm dev")).resolves.toBe(
            "pnpm dev",
        );

        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("type, label, command"),
            [7, "pnpm dev"],
        );
    });

    it("removes a terminal command when given an empty value", async () => {
        database.execute.mockResolvedValue({ rowsAffected: 1 });

        await expect(saveProjectTerminalCommand(7, "")).resolves.toBe("");
        expect(database.execute).toHaveBeenCalledWith(
            expect.stringContaining("type = 'terminal'"),
            [7],
        );
    });
});
