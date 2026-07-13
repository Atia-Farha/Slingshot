import { open } from "@tauri-apps/plugin-dialog";

export async function selectProjectFolder(currentPath = "") {
    try {
        return await open({
            directory: true,
            multiple: false,
            title: "Select project folder",
            ...(currentPath ? { defaultPath: currentPath } : {}),
        });
    } catch (cause) {
        throw new Error("The folder picker could not be opened.", { cause });
    }
}
