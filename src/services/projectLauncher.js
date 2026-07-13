import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";

export async function launchProject(project) {
    const actions = [
        {
            name: "editor",
            promise: invoke("launch_vscode", {
                folderPath: project.folderPath,
            }),
        },
    ];

    if (project.launchUrl) {
        actions.push({
            name: "url",
            promise: openUrl(project.launchUrl),
        });
    }

    const results = await Promise.allSettled(
        actions.map(({ promise }) => promise),
    );
    const failures = results
        .map((result, index) => ({ result, name: actions[index].name }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ name }) => name);

    if (failures.length > 0) {
        const editorFailed = failures.includes("editor");
        const urlFailed = failures.includes("url");

        if (editorFailed && urlFailed) {
            throw new Error(
                "VS Code and the configured URL could not be opened.",
            );
        }

        if (editorFailed) {
            throw new Error(
                project.launchUrl
                    ? "VS Code could not be opened. The configured URL was opened."
                    : "VS Code could not be opened.",
            );
        }

        throw new Error(
            "VS Code was opened, but the configured URL could not be opened.",
        );
    }

    return {
        editorOpened: true,
        urlOpened: Boolean(project.launchUrl),
    };
}
