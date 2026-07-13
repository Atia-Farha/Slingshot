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
const dragOverIndex = ref(null);
const terminalPane = ref(null);
const notifications = useNotificationsStore();

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

function onDragStart(event, index) {
    event.dataTransfer.setData("text/plain", index.toString());
    event.dataTransfer.effectAllowed = "move";
    dragOverIndex.value = index;
}

function onDragOver(event, index) {
    event.preventDefault();
    dragOverIndex.value = index;
}

function onDrop(event, index) {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
        const urls = [...form.launchUrls];
        const [moved] = urls.splice(fromIndex, 1);
        urls.splice(index, 0, moved);
        form.launchUrls = urls;
    }
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
        <!-- Page header: project name + launch button -->
        <div
            class="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
            <div class="min-w-0">
                <p
                    class="text-primary text-xs font-semibold tracking-[0.18em] uppercase"
                >
                    Project
                </p>
                <h2
                    id="project-page-title"
                    class="mt-0.5 truncate text-xl font-semibold sm:text-2xl"
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
                {{ isLaunching ? "Launching…" : "Launch workspace" }}
            </AppButton>
        </div>

        <form class="grid gap-5" novalidate @submit.prevent="submit">
            <!-- Project details -->
            <section class="bg-panel rounded-xl border border-white/8 p-5">
                <div class="mb-5">
                    <h3 class="font-semibold">Project details</h3>
                    <p class="mt-1 text-sm text-zinc-500">
                        Name, local folder, and description for this workspace.
                    </p>
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                    <label class="grid gap-1.5 text-sm text-zinc-300">
                        <span
                            >Project name
                            <span class="text-primary">*</span></span
                        >
                        <input
                            v-model="form.name"
                            name="name"
                            maxlength="100"
                            autocomplete="off"
                            :aria-invalid="Boolean(errors.name)"
                            class="app-input"
                        />
                        <span v-if="errors.name" class="text-xs text-red-300">
                            {{ errors.name }}
                        </span>
                    </label>

                    <div class="grid gap-1.5 text-sm text-zinc-300">
                        <label for="detail-folder-path">
                            Folder path <span class="text-primary">*</span>
                        </label>
                        <div class="flex gap-2">
                            <input
                                id="detail-folder-path"
                                :value="form.folderPath"
                                name="folderPath"
                                readonly
                                :aria-invalid="Boolean(errors.folderPath)"
                                class="app-input min-w-0 flex-1 cursor-default font-mono"
                            />
                            <AppButton
                                :disabled="isSaving || isPickingFolder"
                                @click="chooseFolder"
                            >
                                {{
                                    isPickingFolder
                                        ? "Opening…"
                                        : "Choose folder"
                                }}
                            </AppButton>
                        </div>
                        <span
                            v-if="errors.folderPath"
                            class="text-xs text-red-300"
                        >
                            {{ errors.folderPath }}
                        </span>
                    </div>

                    <label
                        class="grid gap-1.5 text-sm text-zinc-300 lg:col-span-2"
                    >
                        <span>Description</span>
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
                            class="text-xs text-red-300"
                        >
                            {{ errors.description }}
                        </span>
                    </label>
                </div>
            </section>

            <!-- Browser URLs -->
            <section class="bg-panel rounded-xl border border-white/8 p-5">
                <div class="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h3 class="font-semibold">Browser URLs</h3>
                        <p class="mt-1 text-sm text-zinc-500">
                            Pages to open when the workspace launches. Drag to
                            reorder.
                        </p>
                    </div>
                    <AppButton type="button" class="shrink-0" @click="addUrl">
                        + Add URL
                    </AppButton>
                </div>

                <ul class="grid gap-3" role="list">
                    <li
                        v-for="(url, index) in form.launchUrls"
                        :key="index"
                        class="flex items-start gap-2 rounded-lg border border-white/8 p-3 transition-all duration-150"
                        :class="{
                            'border-primary/50 bg-primary/5':
                                dragOverIndex === index,
                        }"
                        @dragover.prevent="onDragOver($event, index)"
                        @drop.prevent="onDrop($event, index)"
                    >
                        <!-- Drag handle -->
                        <button
                            type="button"
                            class="mt-2.5 shrink-0 cursor-grab touch-none text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
                            aria-label="Drag to reorder"
                            tabindex="-1"
                            draggable="true"
                            @dragstart="onDragStart($event, index)"
                            @dragend="dragOverIndex = null"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <rect x="5" y="3" width="2" height="2" />
                                <rect x="9" y="3" width="2" height="2" />
                                <rect x="5" y="7" width="2" height="2" />
                                <rect x="9" y="7" width="2" height="2" />
                                <rect x="5" y="11" width="2" height="2" />
                                <rect x="9" y="11" width="2" height="2" />
                            </svg>
                        </button>

                        <!-- URL input -->
                        <div class="min-w-0 flex-1">
                            <div
                                class="mb-1 flex items-center gap-1.5 text-xs text-zinc-500"
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
                                class="mt-1 block text-xs text-red-300"
                            >
                                {{ errors[`launchUrl_${index}`] }}
                            </span>
                        </div>

                        <!-- Remove button -->
                        <button
                            type="button"
                            class="mt-2 shrink-0 rounded p-1 text-zinc-600 transition hover:bg-white/8 hover:text-red-300"
                            :aria-label="`Remove URL ${index + 1}`"
                            @click="removeUrl(index)"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <path
                                    d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    fill="none"
                                />
                            </svg>
                        </button>
                    </li>
                </ul>

                <p class="mt-3 text-xs leading-5 text-zinc-500">
                    Only HTTP(S) URLs without credentials are allowed. Leave
                    blank to skip.
                </p>
            </section>

            <!-- Terminal command -->
            <section class="bg-panel rounded-xl border border-white/8 p-5">
                <div class="mb-5">
                    <h3 class="font-semibold">Terminal command</h3>
                    <p class="mt-1 text-sm text-zinc-500">
                        Run one command inside the project folder.
                    </p>
                </div>
                <label class="grid gap-1.5 text-sm text-zinc-300">
                    <span>Command</span>
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
                        class="text-xs text-red-300"
                    >
                        {{ errors.terminalCommand }}
                    </span>
                </label>
                <p class="mt-2 text-xs leading-5 text-zinc-500">
                    Leave blank to remove it. Never store passwords, tokens, or
                    credentials here.
                </p>
            </section>

            <!-- Footer actions -->
            <footer
                class="bg-panel flex flex-col-reverse gap-3 rounded-xl border border-white/8 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <AppButton
                    variant="danger"
                    class="w-full sm:w-auto"
                    :disabled="isSaving"
                    @click="$emit('delete', project)"
                >
                    Delete project
                </AppButton>
                <AppButton
                    type="submit"
                    variant="primary"
                    class="w-full sm:w-auto"
                    :disabled="isSaving"
                >
                    {{ isSaving ? "Saving…" : "Save all changes" }}
                </AppButton>
            </footer>
        </form>

        <TerminalPane
            ref="terminalPane"
            @error="notifications.add($event, 'error')"
        />
    </section>
</template>
