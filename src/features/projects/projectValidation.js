export const EMPTY_PROJECT = Object.freeze({
	name: '',
	description: '',
	folderPath: '',
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
		errors.name = 'Project name is required.';
	} else if (project.name.length > 100) {
		errors.name = 'Project name must be 100 characters or fewer.';
	} else if (
		// eslint-disable-next-line no-control-regex -- intentional: reject control characters in user-supplied project name
		/[\x00-\x1f\x7f]/.test(project.name)
	) {
		// Reject ASCII control characters (newlines, tabs, null bytes, etc.)
		// which can corrupt terminal output, terminal command log, and DB column display.
		errors.name = 'Project name contains invalid characters.';
	}

	if (!project.folderPath) {
		errors.folderPath = 'Folder path is required.';
	} else if (project.folderPath.length > 4096) {
		errors.folderPath = 'Folder path is too long.';
	} else if (
		// eslint-disable-next-line no-control-regex -- intentional: reject null bytes in folder path
		/[\x00]/.test(project.folderPath)
	) {
		// Reject null bytes specifically — these can truncate path comparisons
		// and confuse the OS file APIs on some platforms.
		errors.folderPath = 'Folder path contains an invalid character.';
	}

	if (project.description.length > 500) {
		errors.description = 'Description must be 500 characters or fewer.';
	} else if (
		// eslint-disable-next-line no-control-regex -- intentional: reject non-tab/newline control chars in description
		/[\x00-\x08\x0b-\x1f\x7f]/.test(project.description)
	) {
		// Allow \n (0x0a) and \t (0x09) since the textarea is multi-line,
		// but reject other control characters.
		errors.description = 'Description contains invalid characters.';
	}

	return errors;
}
