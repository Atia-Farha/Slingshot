<script setup>
import { reactive, ref, watch } from "vue";
import AppButton from "../../../components/ui/AppButton.vue";
import TerminalPane from "../../../features/terminal/components/TerminalPane.vue";
import { selectProjectFolder } from "../../../services/folderPicker";
import { normalizeLaunchUrl, validateLaunchUrl } from "../launchValidation";
import { normalizeProjectInput, validateProject } from "../projectValidation";
import {
    normalizeTerminalCommand,
    validateTerminalCommand,
} from "../terminalCommandValidation";
import { useNotificationsStore } from "../../../stores/notifications";

const props = defineProps({
    project: {
        type: Object,
        required: true,
    },
    isSaving: {
        type: Boolean,
        default: false,
    },
    isLaunching: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["back", "delete", "launch", "save"]);
const form = reactive({
    name: "",
    description: "",
    folderPath: "",
    launchUrls: [""],
    terminalCommand: "",
});
const errors = ref({});
const isPickingFolder = ref(false);
const terminalPane = ref(null);
const notifications = useNotificationsStore();

const drag = ref({
    active: false,
    fromIndex: -1,
    overIndex: -1,
    itemHeight: 0,
    gap: 12,
    offset: 0,
    startY: 0,
    currentY: 0,
    itemTops: [],
    settleTimer: null,
});

function resetDrag() {
    if (drag.value.settleTimer) clearTimeout(drag.value.settleTimer);
    drag.value = {
        active: false,
        fromIndex: -1,
        overIndex: -1,
        itemHeight: 0,
        gap: 12,
        offset: 0,
        startY: 0,
        currentY: 0,
        itemTops: [],
        settleTimer: null,
    };
}

function measureItems(list) {
    return Array.from(list.children).map((el) => ({
        top: el.offsetTop,
        height: el.offsetHeight,
    }));
}

function resetForm(project) {
    const urls =
        project.launchUrls && project.launchUrls.length > 0
            ? [...project.launchUrls]
            : project.launchUrl
              ? [project.launchUrl]
              : [""];
    Object.assign(form, {
        name: project.name,
        description: project.description ?? "",
        folderPath: project.folderPath,
        launchUrls: urls,
        terminalCommand: project.terminalCommand ?? "",
    });
    errors.value = {};
}

watch(() => props.project, resetForm, { immediate: true });

function addUrl() {
    form.launchUrls.push("");
}

function removeUrl(index) {
    form.launchUrls.splice(index, 1);
    if (form.launchUrls.length === 0) {
        form.launchUrls.push("");
    }
}

function onPointerDown(event, index) {
    const handle = event.currentTarget;
    const li = handle.closest("li");
    const list = li?.parentElement;
    if (!li || !list) return;

    event.preventDefault();

    const items = measureItems(list);
    const itemTop = items[index].top;
    const itemHeight = items[index].height;
    const gap = items.length > 1 ? items[1].top - items[0].top - itemHeight : 0;

    drag.value = {
        active: true,
        fromIndex: index,
        overIndex: index,
        itemHeight,
        gap,
        offset: event.clientY - li.getBoundingClientRect().top,
        startY: event.clientY,
        currentY: itemTop,
        itemTops: items,
        settleTimer: null,
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
}

function onPointerMove(event) {
    const d = drag.value;
    if (!d.active) return;

    const list = document.querySelector('[aria-label="url-list"]');
    if (!list) return;

    const listRect = list.getBoundingClientRect();
    const rawY = event.clientY - listRect.top - d.offset;
    const maxY = d.itemTops[d.itemTops.length - 1].top;
    d.currentY = Math.max(0, Math.min(rawY, maxY));

    const cursorY = event.clientY - listRect.top;
    let newOver = d.fromIndex;
    for (let i = 0; i < d.itemTops.length; i++) {
        if (i === d.fromIndex) continue;
        const slotMid = d.itemTops[i].top + d.itemHeight / 2;
        if (i < d.fromIndex && cursorY < slotMid) {
            newOver = i;
            break;
        }
        if (i > d.fromIndex && cursorY >= slotMid) {
            newOver = i;
        }
    }
    // If dragging downward and cursor is past the last item's top, target last slot
    if (
        d.fromIndex < d.itemTops.length - 1 &&
        cursorY >= d.itemTops[d.itemTops.length - 1].top
    ) {
        newOver = d.itemTops.length - 1;
    }
    d.overIndex = newOver;
}

function onPointerUp() {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);

    const d = drag.value;
    if (!d.active) return;

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    const { fromIndex, overIndex } = d;

    if (fromIndex !== overIndex && overIndex >= 0) {
        // Animate to target slot, then reorder
        const targetY = d.itemTops[overIndex].top;
        d.currentY = targetY;
        d.overIndex = overIndex;

        d.settleTimer = setTimeout(() => {
            const urls = [...form.launchUrls];
            const [moved] = urls.splice(fromIndex, 1);
            urls.splice(overIndex, 0, moved);
            form.launchUrls = urls;
            resetDrag();
        }, 200);
    } else {
        resetDrag();
    }
}

function isDragItem(index) {
    const d = drag.value;
    return d.active && index === d.fromIndex;
}

function isDragTarget(index) {
    const d = drag.value;
    return d.active && index === d.overIndex && index !== d.fromIndex;
}

function getItemStyle(index) {
    const d = drag.value;
    if (!d.active) return {};

    if (index === d.fromIndex) {
        const fromTop = d.itemTops[d.fromIndex].top;
        const offset = d.currentY - fromTop;
        return {
            transform: `translateY(${offset}px) scale(1.02)`,
            transition: "none",
            boxShadow:
                "0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(20, 216, 212, 0.15)",
            zIndex: 30,
            willChange: "transform",
        };
    }

    // Other items shift to fill/make gap
    const from = d.fromIndex;
    const over = d.overIndex;
    let shift = 0;
    if (from < over && index > from && index <= over) {
        shift = -(d.itemHeight + d.gap);
    } else if (from > over && index < from && index >= over) {
        shift = d.itemHeight + d.gap;
    }

    if (shift !== 0) {
        return {
            transform: `translateY(${shift}px)`,
            transition: "transform 200ms cubic-bezier(0.2, 0, 0, 1.15)",
            zIndex: 10,
        };
    }

    return {};
}

function submit() {
    const project = normalizeProjectInput(form);
    const launchUrls = form.launchUrls
        .map((u) => normalizeLaunchUrl(u))
        .filter(Boolean);
    const terminalCommand = normalizeTerminalCommand(form.terminalCommand);
    const projectErrors = validateProject(project);
    const terminalCommandError = validateTerminalCommand(terminalCommand);

    const urlErrors = {};
    for (let i = 0; i < form.launchUrls.length; i++) {
        const normalized = normalizeLaunchUrl(form.launchUrls[i]);
        const err = normalized ? validateLaunchUrl(normalized) : "";
        if (err) {
            urlErrors[`launchUrl_${i}`] = err;
        }
    }

    errors.value = {
        ...projectErrors,
        ...urlErrors,
        ...(terminalCommandError
            ? { terminalCommand: terminalCommandError }
            : {}),
    };

    if (Object.keys(errors.value).length === 0) {
        emit("save", { project, launchUrls, terminalCommand });
    }
}

async function chooseFolder() {
    isPickingFolder.value = true;

    try {
        const selectedPath = await selectProjectFolder(form.folderPath);

        if (selectedPath) {
            form.folderPath = selectedPath;
            delete errors.value.folderPath;
        }
    } catch (error) {
        errors.value.folderPath = error.message;
    } finally {
        isPickingFolder.value = false;
    }
}

async function startTerminal(project) {
    if (project.terminalCommand && terminalPane.value) {
        await terminalPane.value.start(project);
    }
}

defineExpose({ startTerminal });
</script>

<template>
    <section aria-labelledby="project-page-title">
        <!-- Page header -->
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div class="min-w-0">
                <p
                    class="text-primary text-xs font-medium tracking-widest uppercase"
                >
                    Project
                </p>
                <h2
                    id="project-page-title"
                    class="mt-1.5 truncate text-2xl font-semibold tracking-tight sm:text-2xl"
                >
                    {{ project.name }}
                </h2>
            </div>
            <AppButton
                variant="primary"
                class="w-full sm:w-auto"
                :disabled="isLaunching"
                @click="$emit('launch', project)"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    class="shrink-0"
                >
                    <path
                        d="M4.5 2.5L11.5 7L4.5 11.5V2.5Z"
                        fill="currentColor"
                    />
                </svg>
                {{ isLaunching ? "Launching..." : "Launch workspace" }}
            </AppButton>
        </div>

        <form class="grid gap-5" novalidate @submit.prevent="submit">
            <!-- Project details -->
            <section class="section-card">
                <div class="mb-6">
                    <div class="flex items-center gap-2.5">
                        <div
                            class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                class="text-text-secondary"
                            >
                                <path
                                    d="M2 4C2 3.44772 2.44772 3 3 3H6L7.5 4.5H13C13.5523 4.5 14 4.94772 14 5.5V11.5C14 12.0523 13.5523 12.5 13 12.5H3C2.44772 12.5 2 12.0523 2 11.5V4Z"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-text-primary font-semibold">
                                Project details
                            </h3>
                            <p class="text-text-secondary mt-0.5 text-sm">
                                Name, local folder, and description for this
                                workspace.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                    <label class="text-text-secondary grid gap-2 text-sm">
                        <span class="text-text-primary font-medium">
                            Project name
                            <span class="text-primary">*</span>
                        </span>
                        <input
                            v-model="form.name"
                            name="name"
                            maxlength="100"
                            autocomplete="off"
                            :aria-invalid="Boolean(errors.name)"
                            class="app-input"
                        />
                        <span v-if="errors.name" class="text-danger text-xs">
                            {{ errors.name }}
                        </span>
                    </label>

                    <div class="text-text-secondary grid gap-2 text-sm">
                        <label
                            for="detail-folder-path"
                            class="text-text-primary font-medium"
                        >
                            Folder path
                            <span class="text-primary">*</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <input
                                id="detail-folder-path"
                                v-model="form.folderPath"
                                name="folderPath"
                                :aria-invalid="Boolean(errors.folderPath)"
                                class="app-input min-w-0 flex-1 font-mono text-xs"
                            />
                            <AppButton
                                :disabled="isSaving || isPickingFolder"
                                @click="chooseFolder"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    class="shrink-0"
                                >
                                    <path
                                        d="M12.25 5.25V11C12.25 11.4142 11.9142 11.75 11.5 11.75H2.5C2.08579 11.75 1.75 11.4142 1.75 11V4.5C1.75 4.08579 2.08579 3.75 2.5 3.75H5.25L6.5 5.25H11.5C11.9142 5.25 12.25 5.58579 12.25 6Z"
                                        stroke="currentColor"
                                        stroke-width="1.2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                                {{ isPickingFolder ? "Opening..." : "Browse" }}
                            </AppButton>
                        </div>
                        <span
                            v-if="errors.folderPath"
                            class="text-danger text-xs"
                        >
                            {{ errors.folderPath }}
                        </span>
                    </div>

                    <label
                        class="text-text-secondary grid gap-2 text-sm lg:col-span-2"
                    >
                        <span class="text-text-primary font-medium">
                            Description
                        </span>
                        <textarea
                            v-model="form.description"
                            name="description"
                            maxlength="500"
                            rows="3"
                            :aria-invalid="Boolean(errors.description)"
                            class="app-input resize-none"
                            placeholder="What this project does"
                        ></textarea>
                        <span
                            v-if="errors.description"
                            class="text-danger text-xs"
                        >
                            {{ errors.description }}
                        </span>
                    </label>
                </div>
            </section>

            <!-- Browser URLs -->
            <section class="section-card">
                <div class="mb-6 flex items-start justify-between gap-4">
                    <div class="flex items-start gap-2.5">
                        <div
                            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                class="text-text-secondary"
                            >
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="5.5"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                />
                                <path
                                    d="M2.5 8H13.5M8 2.5C9.5 4 10.25 5.9 10.25 8C10.25 10.1 9.5 12 8 13.5M8 2.5C6.5 4 5.75 5.9 5.75 8C5.75 10.1 6.5 12 8 13.5"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-text-primary font-semibold">
                                Browser URLs
                            </h3>
                            <p class="text-text-secondary mt-0.5 text-sm">
                                Pages to open when the workspace launches. Drag
                                to reorder.
                            </p>
                        </div>
                    </div>
                    <AppButton type="button" class="shrink-0" @click="addUrl">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            class="shrink-0"
                        >
                            <path
                                d="M7 2.5V11.5M2.5 7H11.5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                            />
                        </svg>
                        Add URL
                    </AppButton>
                </div>

                <ul
                    class="relative grid gap-3"
                    role="list"
                    aria-label="url-list"
                >
                    <li
                        v-for="(url, index) in form.launchUrls"
                        :key="index"
                        class="flex items-start gap-2.5 rounded-lg border p-3"
                        :class="[
                            isDragItem(index)
                                ? 'border-primary/30 bg-surface z-20 shadow-2xl shadow-black/50'
                                : isDragTarget(index)
                                  ? 'border-primary/30 bg-primary/5'
                                  : 'border-white/6 bg-white/2',
                        ]"
                        :style="getItemStyle(index)"
                    >
                        <!-- Drag handle -->
                        <button
                            type="button"
                            class="text-text-muted hover:text-text-secondary mt-2.5 shrink-0 cursor-grab touch-none transition-colors active:cursor-grabbing"
                            aria-label="Drag to reorder"
                            tabindex="-1"
                            @pointerdown="onPointerDown($event, index)"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <circle cx="6" cy="4" r="1" />
                                <circle cx="10" cy="4" r="1" />
                                <circle cx="6" cy="8" r="1" />
                                <circle cx="10" cy="8" r="1" />
                                <circle cx="6" cy="12" r="1" />
                                <circle cx="10" cy="12" r="1" />
                            </svg>
                        </button>

                        <!-- URL input -->
                        <div class="min-w-0 flex-1">
                            <div
                                class="text-text-muted mb-1.5 flex items-center gap-1.5 text-xs font-medium"
                            >
                                <span>URL {{ index + 1 }}</span>
                            </div>
                            <input
                                v-model="form.launchUrls[index]"
                                type="url"
                                maxlength="2048"
                                autocomplete="off"
                                spellcheck="false"
                                :aria-label="`URL ${index + 1}`"
                                :aria-invalid="
                                    Boolean(errors[`launchUrl_${index}`])
                                "
                                class="app-input"
                                placeholder="https://localhost:5173"
                            />
                            <span
                                v-if="errors[`launchUrl_${index}`]"
                                class="text-danger mt-1.5 block text-xs"
                            >
                                {{ errors[`launchUrl_${index}`] }}
                            </span>
                        </div>

                        <!-- Remove button -->
                        <button
                            type="button"
                            class="text-text-muted hover:bg-danger/10 hover:text-danger mt-2 shrink-0 rounded-md p-1 transition-colors"
                            :aria-label="`Remove URL ${index + 1}`"
                            @click="removeUrl(index)"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    </li>
                </ul>

                <p class="text-text-muted mt-3 text-xs leading-5">
                    Only HTTP(S) URLs without credentials are allowed. Leave
                    blank to skip.
                </p>
            </section>

            <!-- Terminal command -->
            <section class="section-card">
                <div class="mb-6">
                    <div class="flex items-center gap-2.5">
                        <div
                            class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                class="text-text-secondary"
                            >
                                <path
                                    d="M2.5 4.5L6 8L2.5 11.5"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M8.5 11.5H13.5"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-text-primary font-semibold">
                                Terminal command
                            </h3>
                            <p class="text-text-secondary mt-0.5 text-sm">
                                Run one command inside the project folder.
                            </p>
                        </div>
                    </div>
                </div>
                <label class="text-text-secondary grid gap-2 text-sm">
                    <span class="text-text-primary font-medium">Command</span>
                    <input
                        v-model="form.terminalCommand"
                        name="terminalCommand"
                        maxlength="4096"
                        autocomplete="off"
                        spellcheck="false"
                        :aria-invalid="Boolean(errors.terminalCommand)"
                        class="app-input font-mono"
                        placeholder="pnpm dev"
                    />
                    <span
                        v-if="errors.terminalCommand"
                        class="text-danger text-xs"
                    >
                        {{ errors.terminalCommand }}
                    </span>
                </label>
                <p class="text-text-muted mt-2 text-xs leading-5">
                    Leave blank to remove it. Never store passwords, tokens, or
                    credentials here.
                </p>
            </section>

            <!-- Footer actions -->
            <footer
                class="section-card flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <AppButton
                    variant="danger"
                    class="w-full sm:w-auto"
                    :disabled="isSaving"
                    @click="$emit('delete', project)"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        class="shrink-0"
                    >
                        <path
                            d="M2.5 4H11.5M5 4V2.5H9V4M3.5 4V11.5C3.5 12.0523 3.94772 12.5 4.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5V4"
                            stroke="currentColor"
                            stroke-width="1.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    Delete project
                </AppButton>
                <AppButton
                    type="submit"
                    variant="primary"
                    class="w-full sm:w-auto"
                    :disabled="isSaving"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        class="shrink-0"
                    >
                        <path
                            d="M3 7.5L5.5 10L11 4"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    {{ isSaving ? "Saving..." : "Save all changes" }}
                </AppButton>
            </footer>
        </form>

        <TerminalPane
            ref="terminalPane"
            @error="notifications.add($event, 'error')"
        />
    </section>
</template>
