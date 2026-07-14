<script setup>
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { nextTick, onBeforeUnmount, ref } from "vue";
import AppButton from "../../../components/ui/AppButton.vue";
import {
    resizeTerminal,
    startTerminal,
    stopTerminal,
    writeTerminal,
} from "../../../services/terminalClient";

const emit = defineEmits(["error"]);
const terminalElement = ref(null);
const currentProject = ref(null);
const status = ref("idle");

let terminal;
let fitAddon;
let inputDisposable;
let resizeObserver;
let resizeFrame;
let sessionId;
const channelHandles = [];
let generation = 0;

function terminalDimensions() {
    return {
        cols: Math.max(1, terminal?.cols ?? 80),
        rows: Math.max(1, terminal?.rows ?? 24),
    };
}

function terminalBytes(data) {
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }

    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    return new Uint8Array(data);
}

function createTerminal() {
    disposeTerminal();
    terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontFamily:
            '"JetBrains Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.25,
        scrollback: 5000,
        theme: {
            background: "#08090a",
            foreground: "#d4d4d8",
            cursor: "#14d8d4",
            selectionBackground: "#14d8d440",
            black: "#18181b",
            brightBlack: "#71717a",
            cyan: "#14d8d4",
            brightCyan: "#67e8f9",
        },
    });
    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalElement.value);
    inputDisposable = terminal.onData((data) => {
        if (sessionId) {
            writeTerminal(sessionId, data).catch((error) =>
                emit("error", error.message),
            );
        }
    });
    resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(terminalElement.value);
    fitAddon.fit();
}

function scheduleFit() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
        if (!terminal || !terminalElement.value) {
            return;
        }

        fitAddon.fit();

        if (sessionId) {
            resizeTerminal(sessionId, terminalDimensions()).catch((error) =>
                emit("error", error.message),
            );
        }
    });
}

function disposeTerminal() {
    cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    inputDisposable?.dispose();
    terminal?.dispose();
    resizeObserver = undefined;
    inputDisposable = undefined;
    terminal = undefined;
    fitAddon = undefined;
}

async function start(project) {
    const startGeneration = ++generation;
    const previousSessionId = sessionId;
    sessionId = undefined;
    channelHandles.splice(0);

    if (previousSessionId) {
        await stopTerminal(previousSessionId).catch(() => undefined);
    }

    currentProject.value = project;
    status.value = "starting";
    await nextTick();
    createTerminal();
    terminal.writeln(`\x1b[2m$ ${project.terminalCommand}\x1b[0m`);

    let exitedWhileStarting = false;
    let session;

    try {
        session = await startTerminal(project, terminalDimensions(), {
            onData(data) {
                if (generation === startGeneration) {
                    terminal?.write(terminalBytes(data));
                }
            },
            onExit(code) {
                if (generation !== startGeneration) {
                    return;
                }

                exitedWhileStarting = true;
                status.value = "exited";
                sessionId = undefined;
                terminal?.writeln(
                    `\r\n\x1b[2m[process exited with code ${code}]\x1b[0m`,
                );
            },
        });
    } catch (error) {
        if (generation === startGeneration) {
            status.value = "error";
            terminal?.writeln(`\r\n\x1b[31m[${error.message}]\x1b[0m`);
        }

        throw error;
    }

    if (generation !== startGeneration) {
        await stopTerminal(session.sessionId).catch(() => undefined);
        return null;
    }

    channelHandles.push(...session.channels);

    if (exitedWhileStarting) {
        status.value = "exited";
        return session.sessionId;
    }

    sessionId = session.sessionId;
    status.value = "running";
    terminal.focus();
    return session.sessionId;
}

async function stop() {
    ++generation;
    const stoppingSessionId = sessionId;
    sessionId = undefined;
    channelHandles.splice(0);

    if (stoppingSessionId) {
        status.value = "stopping";

        try {
            await stopTerminal(stoppingSessionId);
        } catch (error) {
            emit("error", error.message);
        }
    }

    status.value = "stopped";
    terminal?.writeln("\r\n\x1b[2m[process stopped]\x1b[0m");
}

async function close() {
    await stop();
    currentProject.value = null;
    disposeTerminal();
}

onBeforeUnmount(() => {
    ++generation;

    if (sessionId) {
        stopTerminal(sessionId).catch(() => undefined);
    }

    channelHandles.splice(0);
    disposeTerminal();
});

defineExpose({ close, start, stop });
</script>

<template>
    <section
        v-if="currentProject"
        aria-label="Embedded terminal"
        class="bg-panel mt-6 overflow-hidden rounded-xl border border-white/8 shadow-xl shadow-black/20"
    >
        <header
            class="flex items-center justify-between gap-4 border-b border-white/6 px-4 py-3"
        >
            <div class="min-w-0">
                <div class="flex items-center gap-2.5">
                    <span
                        class="h-2 w-2 rounded-full transition-colors duration-300"
                        :class="
                            status === 'running'
                                ? 'bg-primary shadow-[0_0_8px_rgba(20,216,212,0.4)]'
                                : status === 'starting' || status === 'stopping'
                                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                  : status === 'error'
                                    ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                    : 'bg-text-muted'
                        "
                        aria-hidden="true"
                    ></span>
                    <h2
                        class="text-text-primary truncate text-sm font-semibold"
                    >
                        {{ currentProject.name }} terminal
                    </h2>
                    <span
                        class="text-text-muted rounded-full bg-white/5 px-2 py-0.5 text-xs"
                    >
                        {{ status }}
                    </span>
                </div>
                <p
                    class="text-text-muted mt-1 truncate font-mono text-xs"
                    :title="currentProject.terminalCommand"
                >
                    {{ currentProject.terminalCommand }}
                </p>
            </div>
            <div class="flex shrink-0 gap-2">
                <AppButton
                    v-if="status === 'running' || status === 'starting'"
                    variant="danger"
                    @click="stop"
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        class="shrink-0"
                    >
                        <rect x="2" y="2" width="8" height="8" rx="1.5" />
                    </svg>
                    Stop
                </AppButton>
                <AppButton variant="ghost" @click="close">
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        class="shrink-0"
                    >
                        <path
                            d="M3 3L9 9M9 3L3 9"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                        />
                    </svg>
                    Close
                </AppButton>
            </div>
        </header>
        <div ref="terminalElement" class="h-80 bg-[#08090a] p-3"></div>
    </section>
</template>
