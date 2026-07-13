import { defineStore } from "pinia";
import {
    createProject as insertProject,
    deleteProject as removeProject,
    listProjects,
    saveProjectTerminalCommand as persistTerminalCommand,
    saveProjectUrl as persistProjectUrl,
    saveProjectUrls as persistProjectUrls,
    updateProject as saveProject,
} from "../repositories/projectRepository";
import { launchProject as launchWorkspace } from "../services/projectLauncher";

export const useProjectsStore = defineStore("projects", {
    state: () => ({
        projects: [],
        isLoading: false,
        isSaving: false,
        launchingProjectIds: [],
        error: "",
    }),
    getters: {
        isLaunching: (state) => (projectId) =>
            state.launchingProjectIds.includes(projectId),
    },
    actions: {
        async fetchProjects() {
            this.isLoading = true;
            this.error = "";

            try {
                this.projects = await listProjects();
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async createProject(project) {
            return this.runSave(async () => {
                const createdProject = await insertProject(project);
                this.projects.unshift(createdProject);
                return createdProject;
            });
        },
        async updateProject(id, project) {
            return this.runSave(async () => {
                const updatedProject = await saveProject(id, project);
                const index = this.projects.findIndex((item) => item.id === id);

                if (index !== -1) {
                    this.projects[index] = updatedProject;
                }
                return updatedProject;
            });
        },
        async deleteProject(id) {
            return this.runSave(async () => {
                await removeProject(id);
                this.projects = this.projects.filter(
                    (project) => project.id !== id,
                );
            });
        },
        async saveProjectUrl(projectId, launchUrl) {
            return this.runSave(async () => {
                const savedUrl = await persistProjectUrl(projectId, launchUrl);
                const index = this.projects.findIndex(
                    (project) => project.id === projectId,
                );

                if (index !== -1) {
                    this.projects[index] = {
                        ...this.projects[index],
                        launchUrl: savedUrl,
                        launchUrls: savedUrl ? [savedUrl] : [],
                    };
                }

                return savedUrl;
            });
        },
        async saveProjectUrls(projectId, launchUrls) {
            return this.runSave(async () => {
                const savedUrls = await persistProjectUrls(
                    projectId,
                    launchUrls,
                );
                const index = this.projects.findIndex(
                    (project) => project.id === projectId,
                );

                if (index !== -1) {
                    this.projects[index] = {
                        ...this.projects[index],
                        launchUrl: savedUrls[0] ?? "",
                        launchUrls: savedUrls,
                    };
                }

                return savedUrls;
            });
        },
        async saveProjectTerminalCommand(projectId, command) {
            return this.runSave(async () => {
                const savedCommand = await persistTerminalCommand(
                    projectId,
                    command,
                );
                const index = this.projects.findIndex(
                    (project) => project.id === projectId,
                );

                if (index !== -1) {
                    this.projects[index] = {
                        ...this.projects[index],
                        terminalCommand: savedCommand,
                    };
                }

                return savedCommand;
            });
        },
        async launchProject(project) {
            if (this.isLaunching(project.id)) {
                return null;
            }

            this.launchingProjectIds.push(project.id);
            this.error = "";

            try {
                return await launchWorkspace(project);
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.launchingProjectIds = this.launchingProjectIds.filter(
                    (projectId) => projectId !== project.id,
                );
            }
        },
        async runSave(operation) {
            this.isSaving = true;
            this.error = "";

            try {
                return await operation();
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isSaving = false;
            }
        },
    },
});
