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

    const urls =
        project.launchUrls || (project.launchUrl ? [project.launchUrl] : []);
    for (let i = 0; i < urls.length; i++) {
        actions.push({
            name: `url-${i}`,
            promise: openUrl(urls[i]),
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
        const urlFailed = failures.some((name) => name.startsWith("url"));

        if (editorFailed && urlFailed) {
            throw new Error(
                "VS Code and the configured URL(s) could not be opened.",
            );
        }

        if (editorFailed) {
            throw new Error(
                urls.length > 0
                    ? "VS Code could not be opened. The configured URL(s) were opened."
                    : "VS Code could not be opened.",
            );
        }

        throw new Error(
            "VS Code was opened, but some configured URL(s) could not be opened.",
        );
    }

    return {
        editorOpened: true,
        urlOpened: urls.length > 0,
    };
}
