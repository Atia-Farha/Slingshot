import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.hoisted(() => vi.fn());
const openUrl = vi.hoisted(() => vi.fn());

vi.mock('@tauri-apps/api/core', () => ({ invoke }));
vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl }));

import { launchProject } from './projectLauncher';

const project = {
	folderPath: '/projects/slingshot',
	launchUrl: 'https://example.com/project',
	launchUrls: ['https://example.com/project'],
};

beforeEach(() => {
	vi.clearAllMocks();
	invoke.mockResolvedValue(undefined);
	openUrl.mockResolvedValue(undefined);
});

describe('project launcher', () => {
	it('opens VS Code and the configured URL', async () => {
		await expect(launchProject(project)).resolves.toEqual({
			editorOpened: true,
			urlOpened: true,
		});
		expect(invoke).toHaveBeenCalledWith('launch_vscode', {
			folderPath: '/projects/slingshot',
		});
		expect(openUrl).toHaveBeenCalledWith('https://example.com/project');
	});

	it('only opens VS Code when no URL is configured', async () => {
		await expect(launchProject({ ...project, launchUrl: '', launchUrls: [] })).resolves.toEqual({ editorOpened: true, urlOpened: false });
		expect(openUrl).not.toHaveBeenCalled();
	});

	it('reports partial failure without exposing raw errors', async () => {
		openUrl.mockRejectedValue(new Error('private system detail'));

		await expect(launchProject(project)).rejects.toThrow('VS Code was opened, but some configured URL(s) could not be opened.');
	});

	it('falls back to the single launchUrl when launchUrls is missing', async () => {
		const legacyProject = {
			folderPath: '/projects/slingshot',
			launchUrl: 'https://example.com/legacy',
			launchUrls: undefined,
		};

		await expect(launchProject(legacyProject)).resolves.toEqual({
			editorOpened: true,
			urlOpened: true,
		});
		expect(openUrl).toHaveBeenCalledWith('https://example.com/legacy');
	});

	it('reports editor-only failure when the URL opened successfully', async () => {
		invoke.mockRejectedValue(new Error('vscode crashed'));

		await expect(launchProject(project)).rejects.toThrow('VS Code could not be opened. The configured URL(s) were opened.');
	});

	it('reports combined editor and URL failure', async () => {
		invoke.mockRejectedValue(new Error('vscode crashed'));
		openUrl.mockRejectedValue(new Error('browser crashed'));

		await expect(launchProject(project)).rejects.toThrow('VS Code and the configured URL(s) could not be opened.');
	});

	it('reports the short editor failure when no URLs were configured', async () => {
		invoke.mockRejectedValue(new Error('vscode crashed'));

		await expect(launchProject({ ...project, launchUrl: '', launchUrls: [] })).rejects.toThrow('VS Code could not be opened.');
	});

	it('handles a project with neither launchUrl nor launchUrls without invoking openUrl', async () => {
		const bareProject = { folderPath: '/projects/slingshot' };

		await expect(launchProject(bareProject)).resolves.toEqual({ editorOpened: true, urlOpened: false });
		expect(openUrl).not.toHaveBeenCalled();
	});
});
