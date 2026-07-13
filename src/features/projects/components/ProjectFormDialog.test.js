import { fireEvent, render, screen } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectFormDialog from "./ProjectFormDialog.vue";

const selectProjectFolder = vi.hoisted(() => vi.fn());

vi.mock("../../../services/folderPicker", () => ({ selectProjectFolder }));

beforeEach(() => {
    selectProjectFolder.mockReset();
});

describe("ProjectFormDialog", () => {
    it("shows required field errors", async () => {
        render(ProjectFormDialog);

        await fireEvent.click(
            screen.getByRole("button", { name: "Add project" }),
        );

        expect(
            screen.getByText("Project name is required."),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Folder path is required."),
        ).toBeInTheDocument();
    });

    it("emits normalized project details", async () => {
        const view = render(ProjectFormDialog);

        await fireEvent.update(
            screen.getByLabelText(/Project name/),
            "  Slingshot  ",
        );
        selectProjectFolder.mockResolvedValue("/projects/slingshot");
        await fireEvent.click(
            screen.getByRole("button", { name: "Choose folder" }),
        );
        await fireEvent.update(
            screen.getByLabelText("Description"),
            "  Desktop workspace  ",
        );
        await fireEvent.click(
            screen.getByRole("button", { name: "Add project" }),
        );

        expect(view.emitted().save).toEqual([
            [
                {
                    name: "Slingshot",
                    description: "Desktop workspace",
                    folderPath: "/projects/slingshot",
                },
            ],
        ]);
    });

    it("prefills an existing project for editing", () => {
        render(ProjectFormDialog, {
            props: {
                project: {
                    id: 1,
                    name: "Existing",
                    description: "Existing project",
                    folderPath: "/projects/existing",
                },
            },
        });

        expect(
            screen.getByRole("heading", { name: "Edit project" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Project name/)).toHaveValue("Existing");
        expect(screen.getByLabelText(/Folder path/)).toHaveValue(
            "/projects/existing",
        );
    });

    it("keeps the existing path when folder selection is cancelled", async () => {
        selectProjectFolder.mockResolvedValue(null);
        render(ProjectFormDialog, {
            props: {
                project: {
                    id: 1,
                    name: "Existing",
                    description: "",
                    folderPath: "/projects/existing",
                },
            },
        });

        await fireEvent.click(
            screen.getByRole("button", { name: "Choose folder" }),
        );

        expect(selectProjectFolder).toHaveBeenCalledWith("/projects/existing");
        expect(screen.getByLabelText(/Folder path/)).toHaveValue(
            "/projects/existing",
        );
    });
});
