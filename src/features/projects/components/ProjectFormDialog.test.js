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
        await fireEvent.click(screen.getByRole("button", { name: "Browse" }));
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

    it("keeps an empty path when folder selection is cancelled", async () => {
        selectProjectFolder.mockResolvedValue(null);
        render(ProjectFormDialog);

        await fireEvent.click(screen.getByRole("button", { name: "Browse" }));

        expect(selectProjectFolder).toHaveBeenCalledWith("");
        expect(screen.getByLabelText(/Folder path/)).toHaveValue("");
    });
});
