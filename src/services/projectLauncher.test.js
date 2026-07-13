import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.hoisted(() => vi.fn());
const openUrl = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/api/core", () => ({ invoke }));
vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl }));

import { launchProject } from "./projectLauncher";

const project = {
    folderPath: "/projects/slingshot",
    launchUrl: "https://example.com/project",
};

beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockResolvedValue(undefined);
    openUrl.mockResolvedValue(undefined);
});

describe("project launcher", () => {
    it("opens VS Code and the configured URL", async () => {
        await expect(launchProject(project)).resolves.toEqual({
            editorOpened: true,
            urlOpened: true,
        });
        expect(invoke).toHaveBeenCalledWith("launch_vscode", {
            folderPath: "/projects/slingshot",
        });
        expect(openUrl).toHaveBeenCalledWith("https://example.com/project");
    });

    it("only opens VS Code when no URL is configured", async () => {
        await expect(
            launchProject({ ...project, launchUrl: "" }),
        ).resolves.toEqual({ editorOpened: true, urlOpened: false });
        expect(openUrl).not.toHaveBeenCalled();
    });

    it("reports partial failure without exposing raw errors", async () => {
        openUrl.mockRejectedValue(new Error("private system detail"));

        await expect(launchProject(project)).rejects.toThrow(
            "VS Code was opened, but the configured URL could not be opened.",
        );
    });
});
