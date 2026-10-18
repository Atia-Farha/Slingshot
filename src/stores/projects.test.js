import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({
	createProject: vi.fn(),
	deleteProject: vi.fn(),
	listProjects: vi.fn(),
	saveProjectTerminalCommand: vi.fn(),
	saveProjectUrl: vi.fn(),
	saveProjectUrls: vi.fn(),
	updateProject: vi.fn(),
}));

const launcher = vi.hoisted(() => ({
	launchProject: vi.fn(),
}));

vi.mock('../repositories/projectRepository', () => repository);
vi.mock('../services/projectLauncher', () => launcher);

import { useProjectsStore } from './projects';

const project = {
	id: 1,
	name: 'Slingshot',
	description: 'Desktop workspace',
	folderPath: '/projects/slingshot',
	isFavorite: false,
	lastOpened: null,
	createdAt: '2026-07-13 10:00:00',
	launchUrl: '',
	launchUrls: [],
	terminalCommand: '',
};

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
});

describe('projects store', () => {
	it('loads projects', async () => {
		repository.listProjects.mockResolvedValue([project]);
		const store = useProjectsStore();

		await store.fetchProjects();

		expect(store.projects).toEqual([project]);
		expect(store.isLoading).toBe(false);
	});

	it('adds a created project to the front', async () => {
		const created = {
			...project,
			id: 2,
			name: 'Created',
		};
		repository.createProject.mockResolvedValue(created);
		const store = useProjectsStore();
		store.projects = [project];

		await store.createProject(created);

		expect(store.projects.map(({ id }) => id)).toEqual([2, 1]);
		expect(store.isSaving).toBe(false);
	});

	it('replaces an updated project', async () => {
		const updated = { ...project, name: 'Updated' };
		repository.updateProject.mockResolvedValue(updated);
		const store = useProjectsStore();
		store.projects = [project];

		await store.updateProject(project.id, updated);

		expect(store.projects[0]).toEqual(updated);
	});

	it('removes a deleted project', async () => {
		repository.deleteProject.mockResolvedValue(undefined);
		const store = useProjectsStore();
		store.projects = [project];

		await store.deleteProject(project.id);

		expect(store.projects).toEqual([]);
	});

	it('retains a readable repository error', async () => {
		repository.listProjects.mockRejectedValue(new Error('Projects could not be loaded.'));
		const store = useProjectsStore();

		await expect(store.fetchProjects()).rejects.toThrow('Projects could not be loaded.');
		expect(store.error).toBe('Projects could not be loaded.');
		expect(store.isLoading).toBe(false);
	});

	it('saves a project URL and updates local state', async () => {
		repository.saveProjectUrl.mockResolvedValue('https://example.com');
		const store = useProjectsStore();
		store.projects = [project];

		await store.saveProjectUrl(project.id, 'https://example.com');

		expect(repository.saveProjectUrl).toHaveBeenCalledWith(project.id, 'https://example.com');
		expect(store.projects[0].launchUrl).toBe('https://example.com');
	});

	it('tracks a project while its workspace launches', async () => {
		let finishLaunch;
		launcher.launchProject.mockReturnValue(
			new Promise((resolve) => {
				finishLaunch = resolve;
			}),
		);
		const store = useProjectsStore();
		const launch = store.launchProject(project);

		expect(store.isLaunching(project.id)).toBe(true);
		finishLaunch({ editorOpened: true, urlOpened: false });

		await expect(launch).resolves.toEqual({
			editorOpened: true,
			urlOpened: false,
		});
		expect(store.isLaunching(project.id)).toBe(false);
	});

	it('saves a terminal command and updates local state', async () => {
		repository.saveProjectTerminalCommand.mockResolvedValue('pnpm dev');
		const store = useProjectsStore();
		store.projects = [project];

		await store.saveProjectTerminalCommand(project.id, 'pnpm dev');

		expect(repository.saveProjectTerminalCommand).toHaveBeenCalledWith(project.id, 'pnpm dev');
		expect(store.projects[0].terminalCommand).toBe('pnpm dev');
	});

	it('does not change local state when updating a project not yet loaded', async () => {
		const updated = { ...project, name: 'Updated' };
		repository.updateProject.mockResolvedValue(updated);
		const store = useProjectsStore();
		store.projects = [];

		const result = await store.updateProject(project.id, updated);

		expect(result).toBe(updated);
		expect(store.projects).toEqual([]);
	});

	it('propagates deleteProject failures through the runSave wrapper', async () => {
		repository.deleteProject.mockRejectedValue(new Error('Project could not be deleted.'));
		const store = useProjectsStore();
		store.projects = [project];

		await expect(store.deleteProject(project.id)).rejects.toThrow('Project could not be deleted.');
		expect(store.error).toBe('Project could not be deleted.');
		expect(store.isSaving).toBe(false);
	});

	it('propagates createProject failures through the runSave wrapper', async () => {
		repository.createProject.mockRejectedValue(new Error('Project could not be created.'));
		const store = useProjectsStore();

		await expect(store.createProject(project)).rejects.toThrow('Project could not be created.');
		expect(store.error).toBe('Project could not be created.');
		expect(store.isSaving).toBe(false);
	});

	it('clears local URLs when persisted URL is empty', async () => {
		repository.saveProjectUrl.mockResolvedValue('');
		const store = useProjectsStore();
		store.projects = [{ ...project, launchUrl: 'https://old.com', launchUrls: ['https://old.com'] }];

		await store.saveProjectUrl(project.id, '');

		expect(store.projects[0].launchUrl).toBe('');
		expect(store.projects[0].launchUrls).toEqual([]);
	});

	it('saves multiple URLs and updates local state with the full array', async () => {
		const savedUrls = ['https://a.example.com', 'https://b.example.com'];
		repository.saveProjectUrls.mockResolvedValue(savedUrls);
		const store = useProjectsStore();
		store.projects = [project];

		const result = await store.saveProjectUrls(project.id, savedUrls);

		expect(result).toBe(savedUrls);
		expect(store.projects[0].launchUrl).toBe('https://a.example.com');
		expect(store.projects[0].launchUrls).toEqual(savedUrls);
	});

	it('returns null when launching a project that is already launching', async () => {
		let resolveFirst;
		launcher.launchProject.mockReturnValue(
			new Promise((resolve) => {
				resolveFirst = resolve;
			}),
		);
		const store = useProjectsStore();

		const first = store.launchProject(project);
		const second = await store.launchProject(project);

		expect(second).toBeNull();
		expect(launcher.launchProject).toHaveBeenCalledTimes(1);

		resolveFirst({ editorOpened: true, urlOpened: false });
		await first;
	});

	it('records launcher failures on the store and rethrows', async () => {
		launcher.launchProject.mockRejectedValue(new Error('VS Code crashed.'));
		const store = useProjectsStore();

		await expect(store.launchProject(project)).rejects.toThrow('VS Code crashed.');
		expect(store.error).toBe('VS Code crashed.');
		expect(store.isLaunching(project.id)).toBe(false);
	});

	it('saves a project URL without touching local state when the project is not loaded', async () => {
		repository.saveProjectUrl.mockResolvedValue('https://example.com');
		const store = useProjectsStore();
		store.projects = [];

		const result = await store.saveProjectUrl(42, 'https://example.com');

		expect(result).toBe('https://example.com');
		expect(store.projects).toEqual([]);
		expect(repository.saveProjectUrl).toHaveBeenCalledWith(42, 'https://example.com');
	});

	it('saves multiple URLs without touching local state when the project is not loaded', async () => {
		const savedUrls = ['https://a.example.com', 'https://b.example.com'];
		repository.saveProjectUrls.mockResolvedValue(savedUrls);
		const store = useProjectsStore();
		store.projects = [];

		const result = await store.saveProjectUrls(42, savedUrls);

		expect(result).toBe(savedUrls);
		expect(store.projects).toEqual([]);
	});

	it('saves a terminal command without touching local state when the project is not loaded', async () => {
		repository.saveProjectTerminalCommand.mockResolvedValue('pnpm dev');
		const store = useProjectsStore();
		store.projects = [];

		const result = await store.saveProjectTerminalCommand(42, 'pnpm dev');

		expect(result).toBe('pnpm dev');
		expect(store.projects).toEqual([]);
		expect(repository.saveProjectTerminalCommand).toHaveBeenCalledWith(42, 'pnpm dev');
	});

	it('clears the local launchUrl when persisted URLs is an empty array', async () => {
		repository.saveProjectUrls.mockResolvedValue([]);
		const store = useProjectsStore();
		store.projects = [{ ...project, launchUrl: 'https://old.example.com', launchUrls: ['https://old.example.com'] }];

		const result = await store.saveProjectUrls(project.id, []);

		expect(result).toEqual([]);
		expect(store.projects[0].launchUrl).toBe('');
		expect(store.projects[0].launchUrls).toEqual([]);
	});
});
