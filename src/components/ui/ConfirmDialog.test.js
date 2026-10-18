import { fireEvent, render, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ConfirmDialog from './ConfirmDialog.vue';

describe('ConfirmDialog', () => {
	let originalInnerWidth;
	let originalClientWidth;

	beforeEach(() => {
		originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
		originalClientWidth = Object.getOwnPropertyDescriptor(document.documentElement, 'clientWidth');
		Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 1000 });
		Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 1000 });
	});

	afterEach(() => {
		if (originalInnerWidth) Object.defineProperty(window, 'innerWidth', originalInnerWidth);
		if (originalClientWidth) Object.defineProperty(document.documentElement, 'clientWidth', originalClientWidth);
		document.body.innerHTML = '';
	});

	it('renders the supplied title in the modal header', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'This cannot be undone.' },
		});

		expect(screen.getByRole('heading', { name: 'Delete project' })).toBeInTheDocument();
	});

	it('renders the supplied message in the body', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'This cannot be undone.' },
		});

		expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
	});

	it('emits cancel when the cancel button is clicked', async () => {
		const view = render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?' },
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(view.emitted().cancel).toHaveLength(1);
		expect(view.emitted().confirm).toBeUndefined();
	});

	it('emits confirm when the danger button is clicked', async () => {
		const view = render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?' },
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Delete project' }));

		expect(view.emitted().confirm).toHaveLength(1);
		expect(view.emitted().cancel).toBeUndefined();
	});

	it('emits cancel when the modal emits close (Escape key)', async () => {
		const view = render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?' },
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(view.emitted().cancel).toHaveLength(1);
	});

	it('does not emit cancel via the modal close event while isWorking is true (Escape is ignored)', async () => {
		const view = render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?', isWorking: true },
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(view.emitted().cancel).toBeUndefined();
	});

	it('switches the confirm button label to Deleting... while working', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?', isWorking: true },
		});

		expect(screen.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Delete project' })).toBeNull();
	});

	it('disables both buttons while working', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?', isWorking: true },
		});

		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
	});

	it('enables both buttons by default', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?' },
		});

		expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
		expect(screen.getByRole('button', { name: 'Delete project' })).not.toBeDisabled();
	});

	it('marks the danger confirm button with the destructive variant', () => {
		render(ConfirmDialog, {
			props: { title: 'Delete project', message: 'Are you sure?' },
		});

		const confirm = screen.getByRole('button', { name: 'Delete project' });
		expect(confirm.className).toContain('bg-danger/10');
	});
});
