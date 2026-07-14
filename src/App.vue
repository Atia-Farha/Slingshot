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
        <!-- Header -->
        <header
            class="bg-jet/80 sticky top-0 z-20 border-b border-white/6 backdrop-blur-xl backdrop-saturate-150"
        >
            <div
                class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6"
            >
                <div class="flex items-center gap-1">
                    <img
                        src="/icon-mark.svg"
                        alt=""
                        class="h-8 w-8"
                        aria-hidden="true"
                    />
                    <div class="flex items-baseline gap-2">
                        <h1 class="text-sm font-bold tracking-tight">
                            Slingshot
                        </h1>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <AppButton
                        v-if="selectedProject"
                        variant="ghost"
                        aria-label="Back to projects"
                        @click="selectedProjectId = null"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            class="shrink-0"
                        >
                            <path
                                d="M8.5 3L4.5 7L8.5 11"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        Back
                    </AppButton>

                    <AppButton
                        v-else
                        variant="primary"
                        @click="openCreateDialog"
                    >
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
                        <span class="hidden sm:inline">New project</span>
                    </AppButton>
                </div>
            </div>
        </header>

        <!-- Main content -->
        <main class="mx-auto max-w-7xl px-6 py-8">
            <Transition name="page" mode="out-in">
                <!-- Project list view -->
                <div v-if="!selectedProject" key="list">
                    <!-- View header -->
                    <div
                        class="mb-8 flex flex-wrap items-end justify-between gap-4"
                    >
                        <div>
                            <p
                                class="text-primary text-xs font-medium tracking-widest uppercase"
                            >
                                Workspace
                            </p>
                            <h2
                                class="mt-1.5 text-2xl font-semibold tracking-tight"
                            >
                                Your projects
                            </h2>
                        </div>
                        <p
                            v-if="!projectsStore.isLoading"
                            class="text-text-muted text-sm"
                        >
                            {{ projectsStore.projects.length }}
                            {{
                                projectsStore.projects.length === 1
                                    ? "project"
                                    : "projects"
                            }}
                        </p>
                    </div>

                    <!-- Loading state -->
                    <div
                        v-if="projectsStore.isLoading"
                        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        <div
                            v-for="index in 3"
                            :key="index"
                            class="skeleton h-56"
                            :style="{ animationDelay: `${index * 100}ms` }"
                        ></div>
                    </div>

                    <!-- Error state -->
                    <section
                        v-else-if="
                            projectsStore.error &&
                            projectsStore.projects.length === 0
                        "
                        class="section-card border-danger/20 bg-danger/5 flex min-h-80 flex-col items-center justify-center p-8 text-center"
                    >
                        <div
                            class="bg-danger/10 text-danger mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    d="M10 6V10.5M10 13.5V14M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </div>
                        <h2 class="font-semibold">Could not load projects</h2>
                        <p class="text-text-secondary mt-2 max-w-md text-sm">
                            {{ projectsStore.error }}
                        </p>
                        <AppButton class="mt-5" @click="loadProjects">
                            Try again
                        </AppButton>
                    </section>

                    <!-- Empty state -->
                    <section
                        v-else-if="projectsStore.projects.length === 0"
                        class="section-card flex min-h-80 flex-col items-center justify-center border-dashed p-8 text-center"
                    >
                        <div
                            class="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                class="text-primary"
                            >
                                <path
                                    d="M12 5V19M5 12H19"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </div>
                        <h2 class="text-lg font-semibold">No projects yet</h2>
                        <p
                            class="text-text-secondary mt-2 max-w-sm text-sm leading-6"
                        >
                            Add your first project to start building a reusable
                            development workspace.
                        </p>
                        <AppButton
                            variant="primary"
                            class="mt-6"
                            @click="openCreateDialog"
                        >
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
                            Add project
                        </AppButton>
                    </section>

                    <!-- Project grid -->
                    <section
                        v-else
                        aria-label="Projects"
                        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        <ProjectCard
                            v-for="(project, index) in projectsStore.projects"
                            :key="project.id"
                            :project="project"
                            :is-launching="
                                projectsStore.isLaunching(project.id)
                            "
                            class="card-stagger"
                            :style="{ animationDelay: `${index * 60}ms` }"
                            @launch="launchProject"
                            @manage="selectedProjectId = $event.id"
                        />
                    </section>
                </div>

                <!-- Project detail view -->
                <ProjectDetailPage
                    v-else
                    key="detail"
                    ref="projectDetailPage"
                    :project="selectedProject"
                    :is-saving="projectsStore.isSaving || isSavingConfiguration"
                    :is-launching="
                        projectsStore.isLaunching(selectedProject.id)
                    "
                    @back="selectedProjectId = null"
                    @launch="launchProject"
                    @save="saveProjectConfiguration"
                    @delete="deletingProject = $event"
                />
            </Transition>
        </main>

        <!-- Overlays -->
        <Transition name="modal">
            <ProjectFormDialog
                v-if="isProjectFormOpen"
                :is-saving="projectsStore.isSaving"
                @close="closeProjectForm"
                @save="saveProject"
            />
        </Transition>

        <Transition name="modal">
            <ConfirmDialog
                v-if="deletingProject"
                title="Delete project?"
                :message="`Remove ${deletingProject.name} from Slingshot? This cannot be undone.`"
                :is-working="projectsStore.isSaving"
                @cancel="deletingProject = null"
                @confirm="confirmDelete"
            />
        </Transition>

        <ToastRegion />
    </div>
</template>
