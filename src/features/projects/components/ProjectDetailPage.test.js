import { fireEvent, render, screen } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectDetailPage from "./ProjectDetailPage.vue";

const selectProjectFolder = vi.hoisted(() => vi.fn());
const addNotification = vi.hoisted(() => vi.fn());

vi.mock("../../../services/folderPicker", () => ({ selectProjectFolder }));
vi.mock("../../../stores/notifications", () => ({
    useNotificationsStore: () => ({ add: addNotification }),
}));
vi.mock("../../../features/terminal/components/TerminalPane.vue", () => ({
    default: {
        name: "TerminalPane",
        template: "<div data-testid='terminal-pane'></div>",
    },
}));

const project = {
    id: 1,
    name: "Slingshot",
    description: "Desktop workspace",
    folderPath: "/projects/slingshot",
    launchUrl: "https://localhost:1420",
    launchUrls: ["https://localhost:1420"],
    terminalCommand: "pnpm dev",
};

beforeEach(() => {
    selectProjectFolder.mockReset();
});

describe("ProjectDetailPage", () => {
    it("shows every project setting on one page", () => {
        render(ProjectDetailPage, { props: { project } });

        expect(screen.getByLabelText(/Project name/)).toHaveValue("Slingshot");
        expect(screen.getByLabelText(/Folder path/)).toHaveValue(
            "/projects/slingshot",
        );
        expect(screen.getByLabelText("URL 1")).toHaveValue(
            "https://localhost:1420",
        );
        expect(screen.getByLabelText("Command")).toHaveValue("pnpm dev");
    });

    it("emits all normalized settings in one save", async () => {
        const view = render(ProjectDetailPage, { props: { project } });

        await fireEvent.update(
            screen.getByLabelText(/Project name/),
            "  Slingshot App  ",
        );
        await fireEvent.update(
            screen.getByLabelText("URL 1"),
            "  https://example.com/app  ",
        );
        await fireEvent.update(
            screen.getByLabelText("Command"),
            "  pnpm tauri dev  ",
        );
        await fireEvent.click(
            screen.getByRole("button", { name: "Save all changes" }),
        );

        expect(view.emitted().save).toEqual([
            [
                {
                    project: {
                        name: "Slingshot App",
                        description: "Desktop workspace",
                        folderPath: "/projects/slingshot",
                    },
                    launchUrls: ["https://example.com/app"],
                    terminalCommand: "pnpm tauri dev",
                },
            ],
        ]);
    });

    it("validates every settings section before saving", async () => {
        const view = render(ProjectDetailPage, { props: { project } });

        await fireEvent.update(screen.getByLabelText(/Project name/), "");
        await fireEvent.update(
            screen.getByLabelText("URL 1"),
            "https://user:secret@example.com",
        );
        await fireEvent.update(screen.getByLabelText("Command"), "pnpm dev\0");
        await fireEvent.click(
            screen.getByRole("button", { name: "Save all changes" }),
        );

        expect(screen.getByText("Project name is required.")).toBeVisible();
        expect(screen.getByText(/credentials cannot be stored/i)).toBeVisible();
        expect(screen.getByText(/unsupported character/i)).toBeVisible();
        expect(view.emitted().save).toBeUndefined();
    });

    it("uses the native folder picker", async () => {
        selectProjectFolder.mockResolvedValue("/projects/new-folder");
        render(ProjectDetailPage, { props: { project } });

        await fireEvent.click(
            screen.getByRole("button", { name: "Choose folder" }),
        );

        expect(selectProjectFolder).toHaveBeenCalledWith("/projects/slingshot");
        expect(screen.getByLabelText(/Folder path/)).toHaveValue(
            "/projects/new-folder",
        );
    });
});
