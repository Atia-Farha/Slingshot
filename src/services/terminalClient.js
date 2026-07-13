import { Channel, invoke } from "@tauri-apps/api/core";

function readableError(cause, fallback) {
    return new Error(typeof cause === "string" ? cause : fallback, { cause });
}

export async function startTerminal(project, dimensions, handlers) {
    const onData = new Channel();
    const onExit = new Channel();

    onData.onmessage = handlers.onData;
    onExit.onmessage = handlers.onExit;

    try {
        const sessionId = await invoke("terminal_start", {
            request: {
                folderPath: project.folderPath,
                command: project.terminalCommand,
                cols: dimensions.cols,
                rows: dimensions.rows,
            },
            onData,
            onExit,
        });

        return { sessionId, channels: [onData, onExit] };
    } catch (cause) {
        throw readableError(
            cause,
            "The embedded terminal could not be started.",
        );
    }
}

export async function writeTerminal(sessionId, data) {
    try {
        await invoke("terminal_write", { sessionId, data });
    } catch (cause) {
        throw readableError(cause, "Terminal input could not be written.");
    }
}

export async function resizeTerminal(sessionId, dimensions) {
    try {
        await invoke("terminal_resize", {
            sessionId,
            cols: dimensions.cols,
            rows: dimensions.rows,
        });
    } catch (cause) {
        throw readableError(cause, "Terminal size could not be updated.");
    }
}

export async function stopTerminal(sessionId) {
    try {
        await invoke("terminal_stop", { sessionId });
    } catch (cause) {
        throw readableError(cause, "Terminal process could not be stopped.");
    }
}
