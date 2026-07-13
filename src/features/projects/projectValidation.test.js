import { describe, expect, it } from "vitest";
import { normalizeProjectInput, validateProject } from "./projectValidation";

describe("project validation", () => {
    it("normalizes user-entered project values", () => {
        expect(
            normalizeProjectInput({
                name: "  Slingshot  ",
                description: "  Desktop workspace  ",
                folderPath: "  /projects/slingshot  ",
            }),
        ).toEqual({
            name: "Slingshot",
            description: "Desktop workspace",
            folderPath: "/projects/slingshot",
        });
    });

    it("requires a name and folder path", () => {
        expect(
            validateProject({
                name: "",
                description: "",
                folderPath: "",
            }),
        ).toEqual({
            name: "Project name is required.",
            folderPath: "Folder path is required.",
        });
    });

    it("enforces persisted field limits", () => {
        const errors = validateProject({
            name: "n".repeat(101),
            description: "d".repeat(501),
            folderPath: "p".repeat(4097),
        });

        expect(Object.keys(errors)).toEqual([
            "name",
            "folderPath",
            "description",
        ]);
    });
});
