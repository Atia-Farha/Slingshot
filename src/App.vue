<script setup>
import { onMounted, ref } from "vue";
import AppButton from "./components/ui/AppButton.vue";
import ConfirmDialog from "./components/ui/ConfirmDialog.vue";
import ToastRegion from "./components/ui/ToastRegion.vue";
import ProjectCard from "./features/projects/components/ProjectCard.vue";
import ProjectFormDialog from "./features/projects/components/ProjectFormDialog.vue";
import ProjectUrlDialog from "./features/projects/components/ProjectUrlDialog.vue";
import { useNotificationsStore } from "./stores/notifications";
import { useProjectsStore } from "./stores/projects";

const projectsStore = useProjectsStore();
const notifications = useNotificationsStore();
const editingProject = ref(null);
const deletingProject = ref(null);
const configuringProject = ref(null);
const isProjectFormOpen = ref(false);

async function loadProjects() {
    try {
        await projectsStore.fetchProjects();
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

function openCreateDialog() {
    editingProject.value = null;
    isProjectFormOpen.value = true;
}

function openEditDialog(project) {
    editingProject.value = project;
    isProjectFormOpen.value = true;
}

function closeProjectForm() {
    if (!projectsStore.isSaving) {
        isProjectFormOpen.value = false;
        editingProject.value = null;
    }
}

async function saveProject(project) {
    try {
        if (editingProject.value) {
            await projectsStore.updateProject(editingProject.value.id, project);
            notifications.add("Project updated.");
        } else {
            await projectsStore.createProject(project);
            notifications.add("Project added.");
        }

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
        notifications.add("Project deleted.");
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

async function saveProjectUrl(launchUrl) {
    const project = configuringProject.value;

    if (!project) {
        return;
    }

    try {
        await projectsStore.saveProjectUrl(project.id, launchUrl);
        configuringProject.value = null;
        notifications.add(
            launchUrl ? "Project URL saved." : "Project URL removed.",
        );
    } catch (error) {
        notifications.add(error.message, "error");
    }
}

async function launchProject(project) {
    try {
        const result = await projectsStore.launchProject(project);

        if (result) {
            notifications.add(
                result.urlOpened
                    ? "Workspace and project URL opened."
                    : "Workspace opened in VS Code.",
            );
        }
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
                        <p class="text-xs text-zinc-500">Project library</p>
                    </div>
                </div>
                <AppButton variant="primary" @click="openCreateDialog">
                    <span aria-hidden="true">＋</span>
                    Add project
                </AppButton>
            </div>
        </header>

        <main class="mx-auto max-w-7xl px-6 py-8">
            <div class="mb-6 flex items-end justify-between">
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
                v-if="projectsStore.isLoading"
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
                    projectsStore.error && projectsStore.projects.length === 0
                "
                class="flex min-h-80 flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center"
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
                v-else-if="projectsStore.projects.length === 0"
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
                v-else
                aria-label="Projects"
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
                <ProjectCard
                    v-for="project in projectsStore.projects"
                    :key="project.id"
                    :project="project"
                    :is-launching="projectsStore.isLaunching(project.id)"
                    @launch="launchProject"
                    @configure-url="configuringProject = $event"
                    @edit="openEditDialog"
                    @delete="deletingProject = $event"
                />
            </section>
        </main>

        <ProjectFormDialog
            v-if="isProjectFormOpen"
            :project="editingProject"
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

        <ProjectUrlDialog
            v-if="configuringProject"
            :project="configuringProject"
            :is-saving="projectsStore.isSaving"
            @close="configuringProject = null"
            @save="saveProjectUrl"
        />

        <ToastRegion />
    </div>
</template>
