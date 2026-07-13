import { beforeEach, describe, expect, it, vi } from "vitest";

const open = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/plugin-dialog", () => ({ open }));

import { selectProjectFolder } from "./folderPicker";

beforeEach(() => {
    open.mockReset();
});

describe("folder picker", () => {
    it("opens a single-directory native picker", async () => {
        open.mockResolvedValue("/projects/slingshot");

        await expect(selectProjectFolder("/projects/current")).resolves.toBe(
            "/projects/slingshot",
        );
        expect(open).toHaveBeenCalledWith({
            directory: true,
            multiple: false,
            title: "Select project folder",
            defaultPath: "/projects/current",
        });
    });

    it("returns null when selection is cancelled", async () => {
        open.mockResolvedValue(null);

        await expect(selectProjectFolder()).resolves.toBeNull();
    });

    it("converts native failures into readable errors", async () => {
        open.mockRejectedValue(new Error("private native detail"));

        await expect(selectProjectFolder()).rejects.toThrow(
            "The folder picker could not be opened.",
        );
    });
});
