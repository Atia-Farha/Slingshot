<script setup>
import { computed, onMounted, ref } from "vue";
import AppButton from "./components/ui/AppButton.vue";
import ConfirmDialog from "./components/ui/ConfirmDialog.vue";
import ToastRegion from "./components/ui/ToastRegion.vue";
import ProjectCard from "./features/projects/components/ProjectCard.vue";
import ProjectDetailPage from "./features/projects/components/ProjectDetailPage.vue";
import ProjectFormDialog from "./features/projects/components/ProjectFormDialog.vue";
import { useNotificationsStore } from "./stores/notifications";
import { useProjectsStore } from "./stores/projects";

const projectsStore = useProjectsStore();
const notifications = useNotificationsStore();
const deletingProject = ref(null);
const selectedProjectId = ref(null);
const isProjectFormOpen = ref(false);
const isSavingConfiguration = ref(false);
const projectDetailPage = ref(null);
const selectedProject = computed(() =>
    projectsStore.projects.find(
        (project) => project.id === selectedProjectId.value,
    ),
);

async function loadProjects() {
    try {
        await projectsStore.fetchProjects();
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

function openCreateDialog() {
    isProjectFormOpen.value = true;
}

function closeProjectForm() {
    if (!projectsStore.isSaving) {
        isProjectFormOpen.value = false;
    }
}

async function saveProject(project) {
    try {
        await projectsStore.createProject(project);
        notifications.add("Project added.");
        closeProjectForm();
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

async function confirmDelete() {
    const project = deletingProject.value;

    if (!project) {
        return;
    }

    try {
        await projectsStore.deleteProject(project.id);
        deletingProject.value = null;
        selectedProjectId.value = null;
        notifications.add("Project deleted.");
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

async function saveProjectConfiguration(configuration) {
    const projectId = selectedProjectId.value;

    if (!projectId) {
        return;
    }

    isSavingConfiguration.value = true;

    try {
        await projectsStore.updateProject(projectId, configuration.project);
        await projectsStore.saveProjectUrls(
            projectId,
            configuration.launchUrls,
        );
        await projectsStore.saveProjectTerminalCommand(
            projectId,
            configuration.terminalCommand,
        );
        notifications.add("Project settings saved.");
    } catch (error) {
        notifications.add(error.message, "error");
    } finally {
        isSavingConfiguration.value = false;
    }
}

async function launchProject(project) {
    try {
        await projectsStore.launchProject(project);
        const urlCount =
            (project.launchUrls || []).length || (project.launchUrl ? 1 : 0);
        const opened = ["VS Code"].filter(Boolean);
        if (urlCount > 0) {
            opened.push(urlCount === 1 ? "project URL" : `${urlCount} URLs`);
        }
        if (project.terminalCommand) {
            await projectDetailPage.value?.startTerminal(project);
            opened.push("terminal");
        }
        notifications.add(`${opened.join(", ")} opened.`);
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

onMounted(loadProjects);
</script>

<template>
    <div class="bg-jet min-h-screen text-zinc-100">
        <header
            class="bg-jet/95 sticky top-0 z-20 border-b border-white/8 backdrop-blur"
        >
            <div
                class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-black"
                        aria-hidden="true"
                    >
                        S
                    </div>
                    <div>
                        <h1 class="text-sm font-bold tracking-wide">
                            Slingshot
                        </h1>
                        <p class="text-xs text-zinc-500">
                            Project Launchpad
                        </p>
                    </div>
                </div>

                <AppButton
                    v-if="selectedProject"
                    aria-label="Back to projects"
                    @click="selectedProjectId = null"
                >
                    ← Back
                </AppButton>

                <AppButton
                    v-else
                    variant="primary"
                    @click="openCreateDialog"
                >
                    <span aria-hidden="true">＋</span>
                    <span class="hidden sm:inline">Add project</span>
                </AppButton>
            </div>
        </header>

        <main class="mx-auto max-w-7xl px-6 py-8">
            <div
                v-if="!selectedProject"
                class="mb-6 flex flex-wrap items-end justify-between gap-4"
            >
                <div>
                    <p
                        class="text-primary text-xs font-semibold tracking-[0.18em] uppercase"
                    >
                        Workspace
                    </p>
                    <h2 class="mt-1 text-2xl font-semibold">Your projects</h2>
                </div>
                <p
                    v-if="!projectsStore.isLoading"
                    class="text-sm text-zinc-500"
                >
                    {{ projectsStore.projects.length }}
                    {{
                        projectsStore.projects.length === 1
                            ? "project"
                            : "projects"
                    }}
                </p>
            </div>

            <div
                v-if="projectsStore.isLoading && !selectedProject"
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
                <div
                    v-for="index in 3"
                    :key="index"
                    class="bg-panel h-56 animate-pulse rounded-xl border border-white/8"
                ></div>
            </div>

            <section
                v-else-if="
                    !selectedProject &&
                    projectsStore.error &&
                    projectsStore.projects.length === 0
                "
                class="flex min-h-80 flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/4 p-8 text-center"
            >
                <div class="mb-4 text-2xl text-red-300">!</div>
                <h2 class="font-semibold">Could not load projects</h2>
                <p class="mt-2 max-w-md text-sm text-zinc-500">
                    {{ projectsStore.error }}
                </p>
                <AppButton class="mt-5" @click="loadProjects"
                    >Try again</AppButton
                >
            </section>

            <section
                v-else-if="
                    !selectedProject && projectsStore.projects.length === 0
                "
                class="bg-panel/50 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center"
            >
                <div
                    class="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                >
                    ◇
                </div>
                <h2 class="font-semibold">No projects yet</h2>
                <p class="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                    Add your first project to start building a reusable
                    development workspace.
                </p>
                <AppButton
                    variant="primary"
                    class="mt-5"
                    @click="openCreateDialog"
                    >Add project</AppButton
                >
            </section>

            <section
                v-else-if="!selectedProject"
                aria-label="Projects"
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
                <ProjectCard
                    v-for="project in projectsStore.projects"
                    :key="project.id"
                    :project="project"
                    :is-launching="projectsStore.isLaunching(project.id)"
                    @launch="launchProject"
                    @manage="selectedProjectId = $event.id"
                />
            </section>

            <ProjectDetailPage
                v-else
                ref="projectDetailPage"
                :project="selectedProject"
                :is-saving="projectsStore.isSaving || isSavingConfiguration"
                :is-launching="projectsStore.isLaunching(selectedProject.id)"
                @back="selectedProjectId = null"
                @launch="launchProject"
                @save="saveProjectConfiguration"
                @delete="deletingProject = $event"
            />
        </main>

        <ProjectFormDialog
            v-if="isProjectFormOpen"
            :is-saving="projectsStore.isSaving"
            @close="closeProjectForm"
            @save="saveProject"
        />

        <ConfirmDialog
            v-if="deletingProject"
            title="Delete project?"
            :message="`Remove ${deletingProject.name} from Slingshot? This cannot be undone.`"
            :is-working="projectsStore.isSaving"
            @cancel="deletingProject = null"
            @confirm="confirmDelete"
        />
        <ToastRegion />
    </div>
</template>
