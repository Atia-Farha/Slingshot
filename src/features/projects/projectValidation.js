export const EMPTY_PROJECT = Object.freeze({
    name: "",
    description: "",
    folderPath: "",
});

export function normalizeProjectInput(project) {
    return {
        name: project.name.trim(),
        description: project.description.trim(),
        folderPath: project.folderPath.trim(),
    };
}

export function validateProject(project) {
    const errors = {};

    if (!project.name) {
        errors.name = "Project name is required.";
    } else if (project.name.length > 100) {
        errors.name = "Project name must be 100 characters or fewer.";
    }

    if (!project.folderPath) {
        errors.folderPath = "Folder path is required.";
    } else if (project.folderPath.length > 4096) {
        errors.folderPath = "Folder path is too long.";
    }

    if (project.description.length > 500) {
        errors.description = "Description must be 500 characters or fewer.";
    }

    return errors;
}
