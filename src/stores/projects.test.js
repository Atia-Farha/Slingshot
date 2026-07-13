import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    listProjects: vi.fn(),
    saveProjectUrl: vi.fn(),
    updateProject: vi.fn(),
}));

const launcher = vi.hoisted(() => ({
    launchProject: vi.fn(),
}));

vi.mock("../repositories/projectRepository", () => repository);
vi.mock("../services/projectLauncher", () => launcher);

import { useProjectsStore } from "./projects";

const project = {
    id: 1,
    name: "Slingshot",
    description: "Desktop workspace",
    folderPath: "/projects/slingshot",
    isFavorite: false,
    lastOpened: null,
    createdAt: "2026-07-13 10:00:00",
    launchUrl: "",
};

beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
});

describe("projects store", () => {
    it("loads projects", async () => {
        repository.listProjects.mockResolvedValue([project]);
        const store = useProjectsStore();

        await store.fetchProjects();

        expect(store.projects).toEqual([project]);
        expect(store.isLoading).toBe(false);
    });

    it("adds a created project to the front", async () => {
        const created = {
            ...project,
            id: 2,
            name: "Created",
        };
        repository.createProject.mockResolvedValue(created);
        const store = useProjectsStore();
        store.projects = [project];

        await store.createProject(created);

        expect(store.projects.map(({ id }) => id)).toEqual([2, 1]);
        expect(store.isSaving).toBe(false);
    });

    it("replaces an updated project", async () => {
        const updated = { ...project, name: "Updated" };
        repository.updateProject.mockResolvedValue(updated);
        const store = useProjectsStore();
        store.projects = [project];

        await store.updateProject(project.id, updated);

        expect(store.projects[0]).toEqual(updated);
    });

    it("removes a deleted project", async () => {
        repository.deleteProject.mockResolvedValue(undefined);
        const store = useProjectsStore();
        store.projects = [project];

        await store.deleteProject(project.id);

        expect(store.projects).toEqual([]);
    });

    it("retains a readable repository error", async () => {
        repository.listProjects.mockRejectedValue(
            new Error("Projects could not be loaded."),
        );
        const store = useProjectsStore();

        await expect(store.fetchProjects()).rejects.toThrow(
            "Projects could not be loaded.",
        );
        expect(store.error).toBe("Projects could not be loaded.");
        expect(store.isLoading).toBe(false);
    });

    it("saves a project URL and updates local state", async () => {
        repository.saveProjectUrl.mockResolvedValue("https://example.com");
        const store = useProjectsStore();
        store.projects = [project];

        await store.saveProjectUrl(project.id, "https://example.com");

        expect(repository.saveProjectUrl).toHaveBeenCalledWith(
            project.id,
            "https://example.com",
        );
        expect(store.projects[0].launchUrl).toBe("https://example.com");
    });

    it("tracks a project while its workspace launches", async () => {
        let finishLaunch;
        launcher.launchProject.mockReturnValue(
            new Promise((resolve) => {
                finishLaunch = resolve;
            }),
        );
        const store = useProjectsStore();
        const launch = store.launchProject(project);

        expect(store.isLaunching(project.id)).toBe(true);
        finishLaunch({ editorOpened: true, urlOpened: false });

        await expect(launch).resolves.toEqual({
            editorOpened: true,
            urlOpened: false,
        });
        expect(store.isLaunching(project.id)).toBe(false);
    });
});
