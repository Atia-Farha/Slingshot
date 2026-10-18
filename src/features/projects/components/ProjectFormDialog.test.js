import { fireEvent, render, screen } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ProjectFormDialog from './ProjectFormDialog.vue';

const selectProjectFolder = vi.hoisted(() => vi.fn());

vi.mock('../../../services/folderPicker', () => ({ selectProjectFolder }));

beforeEach(() => {
	selectProjectFolder.mockReset();
});

describe('ProjectFormDialog', () => {
	it('shows required field errors', async () => {
		render(ProjectFormDialog);

		await fireEvent.click(screen.getByRole('button', { name: 'Add project' }));

		expect(screen.getByText('Project name is required.')).toBeInTheDocument();
		expect(screen.getByText('Folder path is required.')).toBeInTheDocument();
	});

	it('emits normalized project details', async () => {
		const view = render(ProjectFormDialog);

		await fireEvent.update(screen.getByLabelText(/Project name/), '  Slingshot  ');
		selectProjectFolder.mockResolvedValue('/projects/slingshot');
		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));
		await fireEvent.update(screen.getByLabelText('Description'), '  Desktop workspace  ');
		await fireEvent.click(screen.getByRole('button', { name: 'Add project' }));

		expect(view.emitted().save).toEqual([
			[
				{
					name: 'Slingshot',
					description: 'Desktop workspace',
					folderPath: '/projects/slingshot',
				},
			],
		]);
	});

	it('keeps an empty path when folder selection is cancelled', async () => {
		selectProjectFolder.mockResolvedValue(null);
		render(ProjectFormDialog);

		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));

		expect(selectProjectFolder).toHaveBeenCalledWith('');
		expect(screen.getByLabelText(/Folder path/)).toHaveValue('');
	});

	it('shows the picker error message when the folder dialog rejects', async () => {
		selectProjectFolder.mockRejectedValue(new Error('Permission denied.'));
		render(ProjectFormDialog);

		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));

		expect(screen.getByText('Permission denied.')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Browse' })).toBeEnabled();
	});

	it('does not link the name input to an error description until validation fails', async () => {
		render(ProjectFormDialog);

		// Fresh render: no name error, so aria-describedby stays undefined.
		expect(screen.getByLabelText(/Project name/).getAttribute('aria-describedby')).toBeNull();

		// After submitting empty, the error appears and aria-describedby is populated.
		fireEvent.click(screen.getByRole('button', { name: 'Add project' }));
		await nextTick();
		expect(screen.getByLabelText(/Project name/).getAttribute('aria-describedby')).toBe('name-error');
	});

	it('keeps the folder input unaffected by described-while-valid until the picker fails', async () => {
		render(ProjectFormDialog);

		expect(screen.getByLabelText(/Folder path/).getAttribute('aria-describedby')).toBeNull();

		selectProjectFolder.mockRejectedValue(new Error('Permission denied.'));
		await fireEvent.click(screen.getByRole('button', { name: 'Browse' }));
		await nextTick();

		expect(screen.getByLabelText(/Folder path/).getAttribute('aria-describedby')).toBe('folder-path-error');
	});

	it('disables the actions while saving and shows the saving label', () => {
		render(ProjectFormDialog, { props: { isSaving: true } });

		expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Browse' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
	});

	it('shows the picking state while the folder dialog is open', async () => {
		let resolvePicker;
		selectProjectFolder.mockReturnValue(
			new Promise((resolve) => {
				resolvePicker = resolve;
			}),
		);
		render(ProjectFormDialog);

		fireEvent.click(screen.getByRole('button', { name: 'Browse' }));
		await nextTick();

		expect(screen.getByRole('button', { name: 'Opening...' })).toBeDisabled();

		resolvePicker(null);
		await new Promise((r) => setTimeout(r, 0));
	});

	it('allows typing directly into the folder path input', async () => {
		render(ProjectFormDialog);

		await fireEvent.update(screen.getByLabelText(/Folder path/), '/projects/typed');

		expect(screen.getByLabelText(/Folder path/)).toHaveValue('/projects/typed');
	});

	it('forwards the ModalDialog close event to a parent close emit', async () => {
		const view = render(ProjectFormDialog);

		await fireEvent.keyDown(document, { key: 'Escape' });

		expect(view.emitted().close).toBeDefined();
	});

	it('emits a close event when the cancel button is clicked', async () => {
		const view = render(ProjectFormDialog);

		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(view.emitted().close).toBeDefined();
	});

	it('shows the description error when the description is too long', async () => {
		render(ProjectFormDialog);

		await fireEvent.update(screen.getByLabelText('Description'), 'x'.repeat(501));
		await fireEvent.click(screen.getByRole('button', { name: 'Add project' }));

		expect(screen.getByText('Description must be 500 characters or fewer.')).toBeVisible();
	});
});
