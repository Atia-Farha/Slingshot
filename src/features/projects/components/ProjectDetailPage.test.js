import { fireEvent, render, screen } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import ProjectDetailPage from './ProjectDetailPage.vue';

const selectProjectFolder = vi.hoisted(() => vi.fn());
const addNotification = vi.hoisted(() => vi.fn());
const terminalStart = vi.hoisted(() => vi.fn());

const triggerError = vi.hoisted(() => {
	let emitError = null;
	const fn = (msg) => emitError?.(msg);
	fn._setEmitter = (emitter) => {
		emitError = emitter;
	};
	return fn;
});

const { TerminalPaneStub } = vi.hoisted(() => ({
	TerminalPaneStub: {
		name: 'TerminalPane',
		template: '<div data-testid="terminal-pane-stub"></div>',
		setup(_, { expose, emit }) {
			triggerError._setEmitter((msg) => emit('error', msg));
			expose({ start: terminalStart });
			return {};
		},
	},
}));

vi.mock('../../../services/folderPicker', () => ({ selectProjectFolder }));
vi.mock('../../../stores/notifications', () => ({
	useNotificationsStore: () => ({ add: addNotification }),
}));
vi.mock('../../../features/terminal/components/TerminalPane.vue', () => ({
	default: TerminalPaneStub,
}));

const project = {
	id: 1,
	name: 'Slingshot',
	description: 'Desktop workspace',
	folderPath: '/projects/slingshot',
	launchUrl: 'https://localhost:1420',
	launchUrls: ['https://localhost:1420'],
	terminalCommand: 'pnpm dev',
};

beforeEach(() => {
	selectProjectFolder.mockReset();
	terminalStart.mockReset();
});

function getUrlList() {
	return screen.getByRole('list', { name: 'url-list' });
}

function getUrlHandles() {
	return screen.getAllByRole('button', { name: 'Drag to reorder' });
}

function stubListGeometry(list, itemCount, itemHeight = 60, gap = 12) {
	const items = Array.from(list.querySelectorAll('li'));
	const tops = [];
	items.forEach((li, i) => {
		const top = i * (itemHeight + gap);
		tops.push(top);
		Object.defineProperty(li, 'offsetTop', { configurable: true, value: top });
		Object.defineProperty(li, 'offsetHeight', { configurable: true, value: itemHeight });
	});

	list.getBoundingClientRect = () => ({ top: 0, left: 0, right: 1000, bottom: 1000, width: 1000, height: 1000, x: 0, y: 0 });
	items.forEach((li, i) => {
		li.getBoundingClientRect = () => ({ top: tops[i], left: 0, right: 1000, bottom: tops[i] + itemHeight, width: 1000, height: itemHeight, x: 0, y: tops[i] });
	});

	return { tops, itemHeight, gap };
}

describe('ProjectDetailPage', () => {
	it('shows every project setting on one page', () => {
		render(ProjectDetailPage, { props: { project } });

		expect(screen.getByLabelText(/Project name/)).toHaveValue('Slingshot');
		expect(screen.getByLabelText(/Folder path/)).toHaveValue('/projects/slingshot');
		expect(screen.getByLabelText('URL 1')).toHaveValue('https://localhost:1420');
		expect(screen.getByLabelText('Command')).toHaveValue('pnpm dev');
	});

	it('emits all normalized settings in one save', async () => {
		const view = render(ProjectDetailPage, { props: { project } });

		await fireEvent.update(screen.getByLabelText(/Project name/), '  Slingshot App  ');
		await fireEvent.update(screen.getByLabelText('URL 1'), '  https://example.com/app  ');
		await fireEvent.update(screen.getByLabelText('Command'), '  pnpm tauri dev  ');
		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(view.emitted().save).toEqual([
			[
				{
					project: {
						name: 'Slingshot App',
						description: 'Desktop workspace',
						folderPath: '/projects/slingshot',
					},
					launchUrls: ['https://example.com/app'],
					terminalCommand: 'pnpm tauri dev',
				},
			],
		]);
	});

	it('validates every settings section before saving', async () => {
		const view = render(ProjectDetailPage, { props: { project } });

		await fireEvent.update(screen.getByLabelText(/Project name/), '');
		await fireEvent.update(screen.getByLabelText('URL 1'), 'https://user:secret@example.com');
		await fireEvent.update(screen.getByLabelText('Command'), 'pnpm dev\0');
		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(screen.getByText('Project name is required.')).toBeVisible();
		expect(screen.getByText(/credentials cannot be stored/i)).toBeVisible();
		expect(screen.getByText(/unsupported character/i)).toBeVisible();
		expect(view.emitted().save).toBeUndefined();
	});

	it('uses the native folder picker', async () => {
		selectProjectFolder.mockResolvedValue('/projects/new-folder');
		render(ProjectDetailPage, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));

		expect(selectProjectFolder).toHaveBeenCalledWith('/projects/slingshot');
		expect(screen.getByLabelText(/Folder path/)).toHaveValue('/projects/new-folder');
	});

	it('keeps the existing path when the folder picker is cancelled', async () => {
		selectProjectFolder.mockResolvedValue(null);
		render(ProjectDetailPage, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));

		expect(screen.getByLabelText(/Folder path/)).toHaveValue('/projects/slingshot');
	});

	it('adds a new empty URL input when Add URL is clicked', async () => {
		render(ProjectDetailPage, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Add URL' }));

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(2);
		expect(inputs[1]).toHaveValue('');
	});

	it('keeps at least one empty URL input after removing the last entry', async () => {
		const single = { ...project, launchUrls: ['https://only.example.com'] };
		render(ProjectDetailPage, { props: { project: single } });

		await fireEvent.click(screen.getByRole('button', { name: 'Remove URL 1' }));

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(1);
		expect(inputs[0]).toHaveValue('');
	});

	it('removes a single URL when there are multiple, leaving the rest in place', async () => {
		const twoUrlProject = { ...project, launchUrls: ['https://a.example.com', 'https://b.example.com'] };
		render(ProjectDetailPage, { props: { project: twoUrlProject } });

		await fireEvent.click(screen.getByRole('button', { name: 'Remove URL 1' }));

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(1);
		expect(inputs[0]).toHaveValue('https://b.example.com');
	});

	it('reorders URLs by drag-and-drop from index 0 to index 1', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame'] });
		try {
			const twoUrlProject = {
				...project,
				launchUrls: ['https://first.example.com', 'https://second.example.com'],
			};
			render(ProjectDetailPage, { props: { project: twoUrlProject } });
			await nextTick();

			const list = getUrlList();
			const handles = getUrlHandles();
			stubListGeometry(list, 2);

			await fireEvent.pointerDown(handles[0], { clientX: 0, clientY: 30 });
			await fireEvent.pointerMove(document, { clientX: 0, clientY: 200 });
			await fireEvent.pointerUp(document);

			vi.advanceTimersByTime(250);
			await nextTick();

			const inputs = screen.getAllByLabelText(/^URL \d+$/);
			expect(inputs.map((el) => el.value)).toEqual(['https://second.example.com', 'https://first.example.com']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('reorders URLs by drag-and-drop from index 1 to index 0', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame'] });
		try {
			const twoUrlProject = {
				...project,
				launchUrls: ['https://first.example.com', 'https://second.example.com'],
			};
			render(ProjectDetailPage, { props: { project: twoUrlProject } });
			await nextTick();

			const list = getUrlList();
			const handles = getUrlHandles();
			stubListGeometry(list, 2);

			await fireEvent.pointerDown(handles[1], { clientX: 0, clientY: 90 });
			await fireEvent.pointerMove(document, { clientX: 0, clientY: 0 });
			await fireEvent.pointerUp(document);

			vi.advanceTimersByTime(250);
			await nextTick();

			const inputs = screen.getAllByLabelText(/^URL \d+$/);
			expect(inputs.map((el) => el.value)).toEqual(['https://second.example.com', 'https://first.example.com']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not reorder URLs when the drag pointer never moves to a different slot', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame'] });
		try {
			const twoUrlProject = {
				...project,
				launchUrls: ['https://first.example.com', 'https://second.example.com'],
			};
			render(ProjectDetailPage, { props: { project: twoUrlProject } });
			await nextTick();

			const list = getUrlList();
			const handles = getUrlHandles();
			stubListGeometry(list, 2);

			await fireEvent.pointerDown(handles[0], { clientX: 0, clientY: 30 });
			await fireEvent.pointerUp(document);
			vi.advanceTimersByTime(250);
			await nextTick();

			const inputs = screen.getAllByLabelText(/^URL \d+$/);
			expect(inputs.map((el) => el.value)).toEqual(['https://first.example.com', 'https://second.example.com']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('shows a folder picker error and keeps the previous path', async () => {
		selectProjectFolder.mockRejectedValue(new Error('Permission denied.'));
		render(ProjectDetailPage, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));

		expect(screen.getByText('Permission denied.')).toBeInTheDocument();
		expect(screen.getByLabelText(/Folder path/)).toHaveValue('/projects/slingshot');
	});

	it('emits a delete event with the current project', async () => {
		const view = render(ProjectDetailPage, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Delete project' }));

		expect(view.emitted().delete).toEqual([[project]]);
	});

	it('starts the embedded terminal when startTerminal is called from the parent', async () => {
		const ParentStub = {
			components: { ProjectDetailPage },
			template: '<ProjectDetailPage ref="page" :project="project" />',
			setup() {
				const page = ref(null);
				return { page, project };
			},
			mounted() {
				this.page.startTerminal(project);
			},
		};

		render(ParentStub);
		await nextTick();

		expect(terminalStart).toHaveBeenCalledWith(project);
	});

	it('disables the launch button and shows the launching state when isLaunching is true', () => {
		render(ProjectDetailPage, { props: { project, isLaunching: true } });

		const launchButton = screen.getByRole('button', { name: 'Launching...' });
		expect(launchButton).toBeDisabled();
	});

	it('marks form fields as invalid when validation surfaces errors', async () => {
		const emptyPathProject = { ...project, folderPath: '' };
		render(ProjectDetailPage, { props: { project: emptyPathProject } });

		await fireEvent.update(screen.getByLabelText(/Project name/), '');
		await fireEvent.update(screen.getByLabelText('Description'), '');
		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(screen.getByLabelText(/Project name/).getAttribute('aria-invalid')).toBe('true');
		expect(screen.getByLabelText(/Folder path/).getAttribute('aria-invalid')).toBe('true');
	});

	it('disables the folder browse and save buttons while saving', () => {
		render(ProjectDetailPage, { props: { project, isSaving: true } });

		expect(screen.getByRole('button', { name: 'Browse' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Delete project' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
	});

	it('skips starting the terminal when the project has no command', async () => {
		const projectWithoutCommand = { ...project, terminalCommand: '' };
		const ParentStub = {
			components: { ProjectDetailPage },
			template: '<ProjectDetailPage ref="page" :project="project" />',
			setup() {
				const page = ref(null);
				return { page, project: projectWithoutCommand };
			},
			mounted() {
				this.page.startTerminal(projectWithoutCommand);
			},
		};

		render(ParentStub);
		await nextTick();

		expect(terminalStart).not.toHaveBeenCalled();
	});

	it('emits a launch event when the launch button is clicked', async () => {
		const view = render(ProjectDetailPage, { props: { project, isLaunching: false } });

		await fireEvent.click(screen.getByRole('button', { name: 'Launch workspace' }));

		expect(view.emitted().launch).toEqual([[project]]);
	});

	it('forwards TerminalPane errors to the notifications store', async () => {
		render(ProjectDetailPage, { props: { project } });

		triggerError('PTY failed to start.');

		expect(addNotification).toHaveBeenCalledWith('PTY failed to start.', 'error');
	});

	it('falls back to a single empty URL when the project has no launch URLs at all', () => {
		const bareProject = { ...project, launchUrl: '', launchUrls: [] };
		render(ProjectDetailPage, { props: { project: bareProject } });

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(1);
		expect(inputs[0]).toHaveValue('');
	});

	it('uses the project launchUrl when launchUrls is missing', () => {
		const legacyProject = { ...project, launchUrl: 'https://legacy.example.com', launchUrls: undefined };
		render(ProjectDetailPage, { props: { project: legacyProject } });

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(1);
		expect(inputs[0]).toHaveValue('https://legacy.example.com');
	});

	it('falls back to empty description and command when project has null values', () => {
		const sparseProject = { ...project, description: null, terminalCommand: null };
		render(ProjectDetailPage, { props: { project: sparseProject } });

		expect(screen.getByLabelText('Description')).toHaveValue('');
		expect(screen.getByLabelText('Command')).toHaveValue('');
	});

	it('skips validation of empty URL entries when submitting', async () => {
		const projectWithTwoUrls = { ...project, launchUrls: ['https://one.example.com', ''] };
		const view = render(ProjectDetailPage, { props: { project: projectWithTwoUrls } });

		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(view.emitted().save).toBeDefined();
		expect(view.emitted().save[0][0].launchUrls).toEqual(['https://one.example.com']);
	});

	it('shows the description error when the description is too long', async () => {
		const longDescription = 'x'.repeat(501);
		render(ProjectDetailPage, { props: { project } });

		await fireEvent.update(screen.getByLabelText('Description'), longDescription);
		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(screen.getByText('Description must be 500 characters or fewer.')).toBeVisible();
	});

	it('ignores keydown on the read-only folder path input', async () => {
		render(ProjectDetailPage, { props: { project } });

		const input = screen.getByLabelText(/Folder path/);
		const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
		input.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(input).toHaveValue('/projects/slingshot');
	});

	it('ignores pointermove when no drag is active', async () => {
		render(ProjectDetailPage, { props: { project } });
		await nextTick();

		expect(() => fireEvent.pointerMove(document, { clientX: 0, clientY: 50 })).not.toThrow();
	});

	it('ignores pointerup when no drag is active', async () => {
		render(ProjectDetailPage, { props: { project } });
		await nextTick();

		expect(() => fireEvent.pointerUp(document)).not.toThrow();
	});

	it('ignores pointermove when the url-list element is missing from the DOM', async () => {
		const singleProject = { ...project, launchUrls: ['https://one.example.com'] };
		render(ProjectDetailPage, { props: { project: singleProject } });
		await nextTick();

		const handle = screen.getByRole('button', { name: 'Drag to reorder' });
		await fireEvent.pointerDown(handle, { clientX: 0, clientY: 30 });

		const list = getUrlList();
		list.remove();

		expect(() => fireEvent.pointerMove(document, { clientX: 0, clientY: 50 })).not.toThrow();
	});

	it('handles pointerdown when the handle is not inside a list item', async () => {
		render(ProjectDetailPage, { props: { project } });
		await nextTick();

		const handle = screen.getByRole('button', { name: 'Drag to reorder' });
		const parentLi = handle.closest('li');
		const detached = document.createElement('div');
		document.body.appendChild(detached);
		detached.appendChild(handle);

		expect(() => fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 })).not.toThrow();

		parentLi.appendChild(handle);
		detached.remove();
	});

	it('handles a single-item drag with no gap calculation', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame'] });
		try {
			const singleProject = { ...project, launchUrls: ['https://only.example.com'] };
			render(ProjectDetailPage, { props: { project: singleProject } });
			await nextTick();

			const list = getUrlList();
			const handles = getUrlHandles();
			stubListGeometry(list, 1);

			await fireEvent.pointerDown(handles[0], { clientX: 0, clientY: 30 });
			await fireEvent.pointerUp(document);
			vi.advanceTimersByTime(250);
			await nextTick();

			const inputs = screen.getAllByLabelText(/^URL \d+$/);
			expect(inputs[0]).toHaveValue('https://only.example.com');
		} finally {
			vi.useRealTimers();
		}
	});

	it('handles a downward drag that has not yet crossed the next slot midpoint', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame'] });
		try {
			const twoUrlProject = {
				...project,
				launchUrls: ['https://first.example.com', 'https://second.example.com'],
			};
			render(ProjectDetailPage, { props: { project: twoUrlProject } });
			await nextTick();

			const list = getUrlList();
			const handles = getUrlHandles();
			stubListGeometry(list, 2);

			await fireEvent.pointerDown(handles[0], { clientX: 0, clientY: 30 });
			await fireEvent.pointerMove(document, { clientX: 0, clientY: 50 });
			await fireEvent.pointerUp(document);
			vi.advanceTimersByTime(250);
			await nextTick();

			const inputs = screen.getAllByLabelText(/^URL \d+$/);
			expect(inputs.map((el) => el.value)).toEqual(['https://first.example.com', 'https://second.example.com']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('moves a URL down using the keyboard reorder button', async () => {
		const twoUrlProject = {
			...project,
			launchUrls: ['https://first.example.com', 'https://second.example.com'],
		};
		render(ProjectDetailPage, { props: { project: twoUrlProject } });

		await fireEvent.click(screen.getByRole('button', { name: 'Move URL 1 down' }));

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs.map((el) => el.value)).toEqual(['https://second.example.com', 'https://first.example.com']);
	});

	it('moves a URL up using the keyboard reorder button', async () => {
		const twoUrlProject = {
			...project,
			launchUrls: ['https://first.example.com', 'https://second.example.com'],
		};
		render(ProjectDetailPage, { props: { project: twoUrlProject } });

		await fireEvent.click(screen.getByRole('button', { name: 'Move URL 2 up' }));

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs.map((el) => el.value)).toEqual(['https://second.example.com', 'https://first.example.com']);
	});

	it('disables the up reorder button on the first URL and the down button on the last URL', () => {
		const twoUrlProject = {
			...project,
			launchUrls: ['https://first.example.com', 'https://second.example.com'],
		};
		render(ProjectDetailPage, { props: { project: twoUrlProject } });

		expect(screen.getByRole('button', { name: 'Move URL 1 up' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Move URL 2 down' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Move URL 1 down' })).not.toBeDisabled();
		expect(screen.getByRole('button', { name: 'Move URL 2 up' })).not.toBeDisabled();
	});

	it('focuses the first invalid field when save fails validation', async () => {
		const emptyPathProject = { ...project, folderPath: '' };
		render(ProjectDetailPage, { props: { project: emptyPathProject } });
		await nextTick();

		const nameInput = screen.getByLabelText(/Project name/);
		const folderInput = screen.getByLabelText(/Folder path/);
		nameInput.setAttribute('aria-invalid', 'true');
		folderInput.setAttribute('aria-invalid', 'true');

		const focusSpy = vi.spyOn(nameInput, 'focus');

		await fireEvent.update(nameInput, '');
		await fireEvent.click(screen.getByRole('button', { name: 'Save all changes' }));

		expect(focusSpy).toHaveBeenCalled();
	});

	it('is a no-op when the moveUrl target is out of range', async () => {
		const singleUrlProject = { ...project, launchUrls: ['https://only.example.com'] };
		render(ProjectDetailPage, { props: { project: singleUrlProject } });
		await nextTick();

		const upButton = screen.getByRole('button', { name: 'Move URL 1 up' });
		const downButton = screen.getByRole('button', { name: 'Move URL 1 down' });
		upButton.removeAttribute('disabled');
		downButton.removeAttribute('disabled');

		await fireEvent.click(upButton);
		await fireEvent.click(downButton);

		const inputs = screen.getAllByLabelText(/^URL \d+$/);
		expect(inputs).toHaveLength(1);
		expect(inputs[0]).toHaveValue('https://only.example.com');
	});
});
