import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({
	execute: vi.fn(),
	select: vi.fn(),
}));

const load = vi.hoisted(() => vi.fn(() => Promise.resolve(database)));

vi.mock('@tauri-apps/plugin-sql', () => ({
	default: { load },
}));

import { createProject, deleteProject, listProjects, saveProjectTerminalCommand, saveProjectUrl, saveProjectUrls, updateProject } from './projectRepository';

const databaseRow = {
	id: 7,
	name: 'Slingshot',
	description: null,
	folder_path: '/projects/slingshot',
	is_favorite: 1,
	last_opened: null,
	created_at: '2026-07-13 10:00:00',
	launch_url: null,
	terminal_command: null,
};

beforeEach(() => {
	database.execute.mockReset();
	database.select.mockReset();
});

describe('project repository', () => {
	it('loads and maps project rows', async () => {
		database.select.mockResolvedValueOnce([databaseRow]).mockResolvedValueOnce([]);

		await expect(listProjects()).resolves.toEqual([
			{
				id: 7,
				name: 'Slingshot',
				description: '',
				folderPath: '/projects/slingshot',
				isFavorite: true,
				lastOpened: null,
				createdAt: '2026-07-13 10:00:00',
				launchUrl: '',
				launchUrls: [],
				terminalCommand: '',
			},
		]);
		expect(load).toHaveBeenCalledWith('sqlite:slingshot.db');
	});

	it('creates projects using bound values', async () => {
		database.execute.mockResolvedValue({
			lastInsertId: 7,
			rowsAffected: 1,
		});
		database.select.mockResolvedValueOnce([databaseRow]);

		await createProject({
			name: 'Slingshot',
			description: '',
			folderPath: '/projects/slingshot',
		});

		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO projects'), ['Slingshot', null, '/projects/slingshot']);
		expect(database.select).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [7]);
	});

	it('updates projects using a bound identifier', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });
		database.select.mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...databaseRow, name: 'Updated' }]);

		const updated = await updateProject(7, {
			name: 'Updated',
			description: 'Description',
			folderPath: '/projects/updated',
		});

		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('UPDATE projects'), ['Updated', 'Description', '/projects/updated', 7]);
		expect(updated.name).toBe('Updated');
	});

	it('returns a readable error when deletion affects no row', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 0 });

		await expect(deleteProject(99)).rejects.toThrow('Project could not be deleted.');
	});

	it('completes deletion when exactly one row is affected', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		await expect(deleteProject(7)).resolves.toBeUndefined();
		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM projects'), [7]);
	});

	it('saves a project URL using bound values', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		await expect(saveProjectUrl(7, 'https://example.com/project')).resolves.toBe('https://example.com/project');

		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM launch_actions'), [7]);
		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO launch_actions'), [7, 'https://example.com/project', 0]);
	});

	it('removes a project URL when given an empty value', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		await expect(saveProjectUrl(7, '')).resolves.toBe('');

		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM launch_actions'), [7]);
	});

	it('saves a terminal command using bound values', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		await expect(saveProjectTerminalCommand(7, 'pnpm dev')).resolves.toBe('pnpm dev');

		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining('type, label, command'), [7, 'pnpm dev']);
	});

	it('removes a terminal command when given an empty value', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		await expect(saveProjectTerminalCommand(7, '')).resolves.toBe('');
		expect(database.execute).toHaveBeenCalledWith(expect.stringContaining("type = 'terminal'"), [7]);
	});

	it('maps URL rows to launchUrl and launchUrls', async () => {
		const projectRow = { ...databaseRow };
		const urlRows = [
			{ project_id: 7, target: 'https://example.com/a' },
			{ project_id: 7, target: 'https://example.com/b' },
		];
		database.select.mockResolvedValueOnce([projectRow]).mockResolvedValueOnce(urlRows);

		const [mapped] = await listProjects();

		expect(mapped.launchUrl).toBe('https://example.com/a');
		expect(mapped.launchUrls).toEqual(['https://example.com/a', 'https://example.com/b']);
	});

	it('rejects createProject when the inserted row cannot be read back', async () => {
		database.execute.mockResolvedValue({ lastInsertId: 7, rowsAffected: 1 });
		database.select.mockResolvedValueOnce([]);

		await expect(
			createProject({
				name: 'Slingshot',
				description: '',
				folderPath: '/projects/slingshot',
			}),
		).rejects.toThrow('Project could not be created.');
	});

	it('rejects updateProject when no row was affected', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 0 });

		try {
			await updateProject(99, {
				name: 'Slingshot',
				description: '',
				folderPath: '/projects/slingshot',
			});
			throw new Error('expected updateProject to throw');
		} catch (error) {
			expect(error.message).toBe('Project could not be updated.');
			expect(error.cause.message).toBe('Project no longer exists.');
		}
	});

	it('maps URL rows to launchUrls when updating a project', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });
		database.select.mockResolvedValueOnce([{ project_id: 7, target: 'https://example.com/a' }]).mockResolvedValueOnce([{ ...databaseRow, name: 'Updated' }]);

		const updated = await updateProject(7, {
			name: 'Updated',
			description: 'Description',
			folderPath: '/projects/updated',
		});

		expect(updated.launchUrls).toEqual(['https://example.com/a']);
		expect(updated.launchUrl).toBe('https://example.com/a');
	});

	it('rejects updateProject when the updated row cannot be read back', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });
		database.select.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

		await expect(
			updateProject(7, {
				name: 'Slingshot',
				description: '',
				folderPath: '/projects/slingshot',
			}),
		).rejects.toThrow('Project could not be updated.');
	});

	it('skips empty entries when persisting multiple URLs', async () => {
		database.execute.mockResolvedValue({ rowsAffected: 1 });

		const result = await saveProjectUrls(7, ['', 'https://a.example.com', '', 'https://b.example.com', '']);

		expect(result).toEqual(['https://a.example.com', 'https://b.example.com']);
		// Only the two truthy URLs should result in INSERT calls.
		const insertCalls = database.execute.mock.calls.filter(([sql]) => sql.includes('INSERT INTO launch_actions'));
		expect(insertCalls).toHaveLength(2);
		expect(insertCalls[0][1]).toEqual([7, 'https://a.example.com', 1]);
		expect(insertCalls[1][1]).toEqual([7, 'https://b.example.com', 3]);
	});
});
