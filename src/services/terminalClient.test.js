import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    class MockChannel {
        onmessage = undefined;
    }

    return {
        invoke: vi.fn(),
        MockChannel,
    };
});

vi.mock("@tauri-apps/api/core", () => ({
    Channel: mocks.MockChannel,
    invoke: mocks.invoke,
}));

import {
    resizeTerminal,
    startTerminal,
    stopTerminal,
    writeTerminal,
} from "./terminalClient";

beforeEach(() => {
    mocks.invoke.mockReset();
});

describe("terminal client", () => {
    it("starts a terminal with channels and bounded dimensions", async () => {
        mocks.invoke.mockResolvedValue(4);
        const handlers = { onData: vi.fn(), onExit: vi.fn() };

        const result = await startTerminal(
            {
                folderPath: "/projects/slingshot",
                terminalCommand: "pnpm dev",
            },
            { cols: 100, rows: 30 },
            handlers,
        );

        expect(result.sessionId).toBe(4);
        expect(result.channels).toHaveLength(2);
        expect(result.channels[0].onmessage).toBe(handlers.onData);
        expect(result.channels[1].onmessage).toBe(handlers.onExit);
        expect(mocks.invoke).toHaveBeenCalledWith("terminal_start", {
            request: {
                folderPath: "/projects/slingshot",
                command: "pnpm dev",
                cols: 100,
                rows: 30,
            },
            onData: expect.any(mocks.MockChannel),
            onExit: expect.any(mocks.MockChannel),
        });
    });

    it("writes, resizes, and stops through scoped commands", async () => {
        mocks.invoke.mockResolvedValue(undefined);

        await writeTerminal(4, "q");
        await resizeTerminal(4, { cols: 120, rows: 40 });
        await stopTerminal(4);

        expect(mocks.invoke).toHaveBeenNthCalledWith(1, "terminal_write", {
            sessionId: 4,
            data: "q",
        });
        expect(mocks.invoke).toHaveBeenNthCalledWith(2, "terminal_resize", {
            sessionId: 4,
            cols: 120,
            rows: 40,
        });
        expect(mocks.invoke).toHaveBeenNthCalledWith(3, "terminal_stop", {
            sessionId: 4,
        });
    });

    it("converts rejected IPC calls into Error objects", async () => {
        mocks.invoke.mockRejectedValue(
            "Terminal session is no longer running.",
        );

        await expect(writeTerminal(4, "q")).rejects.toThrow(
            "Terminal session is no longer running.",
        );
    });
});
