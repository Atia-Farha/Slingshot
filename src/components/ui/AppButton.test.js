import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import AppButton from './AppButton.vue';

describe('AppButton', () => {
	it('renders the default secondary variant and exposes slot content', () => {
		render(AppButton, {
			slots: { default: 'Save changes' },
		});

		const button = screen.getByRole('button', { name: 'Save changes' });
		expect(button).toBeInTheDocument();
		expect(button.tagName).toBe('BUTTON');
	});

	it('uses button as the default type attribute', () => {
		render(AppButton, {
			slots: { default: 'Click me' },
		});

		const button = screen.getByRole('button', { name: 'Click me' });
		expect(button.getAttribute('type')).toBe('button');
	});

	it('forwards a custom type attribute', () => {
		render(AppButton, {
			props: { type: 'submit' },
			slots: { default: 'Submit' },
		});

		const button = screen.getByRole('button', { name: 'Submit' });
		expect(button.getAttribute('type')).toBe('submit');
	});

	it('emits a click event when activated', async () => {
		const view = render(AppButton, {
			slots: { default: 'Click me' },
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Click me' }));

		expect(view.emitted().click).toHaveLength(1);
	});

	it('applies the disabled attribute when disabled is true', () => {
		render(AppButton, {
			props: { disabled: true },
			slots: { default: 'Disabled action' },
		});

		const button = screen.getByRole('button', { name: 'Disabled action' });
		expect(button.hasAttribute('disabled')).toBe(true);
	});

	it('does not apply the disabled attribute by default', () => {
		render(AppButton, {
			slots: { default: 'Active action' },
		});

		const button = screen.getByRole('button', { name: 'Active action' });
		expect(button.hasAttribute('disabled')).toBe(false);
	});

	it('renders the primary variant with its accent class', () => {
		render(AppButton, {
			props: { variant: 'primary' },
			slots: { default: 'Primary' },
		});

		const button = screen.getByRole('button', { name: 'Primary' });
		expect(button.className).toContain('bg-primary');
	});

	it('renders the secondary variant with its subtle class', () => {
		render(AppButton, {
			props: { variant: 'secondary' },
			slots: { default: 'Secondary' },
		});

		const button = screen.getByRole('button', { name: 'Secondary' });
		expect(button.className).toContain('bg-white/5');
	});

	it('renders the danger variant with its destructive class', () => {
		render(AppButton, {
			props: { variant: 'danger' },
			slots: { default: 'Danger' },
		});

		const button = screen.getByRole('button', { name: 'Danger' });
		expect(button.className).toContain('bg-danger/10');
	});

	it('renders the ghost variant with its transparent class', () => {
		render(AppButton, {
			props: { variant: 'ghost' },
			slots: { default: 'Ghost' },
		});

		const button = screen.getByRole('button', { name: 'Ghost' });
		expect(button.className).toContain('bg-transparent');
	});

	it('warns at the validator level when given an unknown variant', () => {
		const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(AppButton, {
			props: { variant: 'mystery' },
			slots: { default: 'Mystery' },
		});

		expect(consoleWarn).toHaveBeenCalled();
		consoleWarn.mockRestore();
	});

	it('renders the slotted content untouched', () => {
		render(AppButton, {
			slots: { default: '<span data-testid="content">Save</span>' },
		});

		expect(screen.getByTestId('content')).toHaveTextContent('Save');
	});
});
