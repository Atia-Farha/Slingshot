import { fireEvent, render, screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import ProjectUrlDialog from "./ProjectUrlDialog.vue";

const project = {
    name: "Slingshot",
    launchUrl: "",
};

describe("ProjectUrlDialog", () => {
    it("validates and emits a normalized URL", async () => {
        const view = render(ProjectUrlDialog, { props: { project } });
        const input = screen.getByRole("textbox", { name: "URL" });

        await fireEvent.update(input, "  https://example.com/project  ");
        await fireEvent.click(screen.getByRole("button", { name: "Save URL" }));

        expect(view.emitted().save[0]).toEqual(["https://example.com/project"]);
    });

    it("blocks URLs containing credentials", async () => {
        const view = render(ProjectUrlDialog, { props: { project } });

        await fireEvent.update(
            screen.getByRole("textbox", { name: "URL" }),
            "https://user:secret@example.com",
        );
        await fireEvent.click(screen.getByRole("button", { name: "Save URL" }));

        expect(screen.getByText(/credentials cannot be stored/i)).toBeTruthy();
        expect(view.emitted().save).toBeUndefined();
    });
});
