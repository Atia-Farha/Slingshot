import { fireEvent, render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ToastRegion from './ToastRegion.vue';
import { useNotificationsStore } from '../../stores/notifications';

beforeEach(() => {
	setActivePinia(createPinia());
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('ToastRegion', () => {
	it('renders no notification items when there are no notifications', () => {
		const view = render(ToastRegion);

		const region = view.container.querySelector('[aria-live]');
		expect(region).not.toBeNull();
		const notifications = region?.querySelectorAll('[role="status"], [role="alert"]') ?? [];
		expect(notifications).toHaveLength(0);
	});

	it('renders one node per notification in the store', () => {
		const notifications = useNotificationsStore();
		notifications.add('Saved successfully.', 'success');
		notifications.add('Heads up.', 'warning');

		render(ToastRegion);

		expect(screen.getByText('Saved successfully.')).toBeInTheDocument();
		expect(screen.getByText('Heads up.')).toBeInTheDocument();
	});

	it('exposes success notifications as role="status" with a Success: prefix', () => {
		const notifications = useNotificationsStore();
		notifications.add('Project saved.', 'success');

		render(ToastRegion);

		const status = screen.getByRole('status');
		expect(status).toBeInTheDocument();
		expect(status).toHaveTextContent('Success:');
		expect(status).toHaveTextContent('Project saved.');
	});

	it('exposes error notifications as role="alert" with an Error: prefix', () => {
		const notifications = useNotificationsStore();
		notifications.add('Something broke.', 'error');

		render(ToastRegion);

		const alert = screen.getByRole('alert');
		expect(alert).toBeInTheDocument();
		expect(alert).toHaveTextContent('Error:');
		expect(alert).toHaveTextContent('Something broke.');
	});

	it('exposes warning notifications as role="status" with a Warning: prefix', () => {
		const notifications = useNotificationsStore();
		notifications.add('Be careful.', 'warning');

		render(ToastRegion);

		const status = screen.getByRole('status');
		expect(status).toHaveTextContent('Warning:');
	});

	it('exposes info notifications as role="status" with an Info: prefix', () => {
		const notifications = useNotificationsStore();
		notifications.add('For your information.', 'info');

		render(ToastRegion);

		const status = screen.getByRole('status');
		expect(status).toHaveTextContent('Info:');
	});

	it('marks the region as a polite live region', () => {
		const view = render(ToastRegion);

		const region = view.container.querySelector('[aria-live]');
		expect(region).not.toBeNull();
		expect(region?.getAttribute('aria-live')).toBe('polite');
		expect(region?.getAttribute('aria-relevant')).toBe('additions');
	});

	it('removes the notification when its dismiss button is clicked', async () => {
		const notifications = useNotificationsStore();
		notifications.add('Dismissible message', 'success');
		expect(notifications.notifications).toHaveLength(1);

		render(ToastRegion);

		const dismiss = screen.getByRole('button', { name: 'Dismiss notification' });
		await fireEvent.click(dismiss);

		expect(notifications.notifications).toEqual([]);
	});

	it('only removes the notification whose dismiss button is clicked', async () => {
		const notifications = useNotificationsStore();
		notifications.add('Keep me', 'success');
		notifications.add('Remove me', 'error');

		render(ToastRegion);

		const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
		await fireEvent.click(dismissButtons[1]);

		expect(notifications.notifications.map((notification) => notification.message)).toEqual(['Keep me']);
	});

	it('hides the visual dot icon from assistive technology', () => {
		const notifications = useNotificationsStore();
		notifications.add('Invisible icon test', 'success');

		render(ToastRegion);

		const dot = screen.getByText('Success:').parentElement?.querySelector('span.h-2.w-2');
		expect(dot).not.toBeNull();
		expect(dot?.getAttribute('aria-hidden')).toBe('true');
	});

	it('hides the dismiss icon SVG from assistive technology', () => {
		const notifications = useNotificationsStore();
		notifications.add('SVG test', 'success');

		render(ToastRegion);

		const svg = screen.getByRole('button', { name: 'Dismiss notification' }).querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
	});

	it('applies the danger color scheme to error notifications', () => {
		const notifications = useNotificationsStore();
		notifications.add('Boom.', 'error');

		render(ToastRegion);

		const alert = screen.getByRole('alert');
		expect(alert.className).toContain('border-danger/20');
	});

	it('applies the primary color scheme to non-error notifications', () => {
		const notifications = useNotificationsStore();
		notifications.add('All good.', 'success');

		render(ToastRegion);

		const status = screen.getByRole('status');
		expect(status.className).toContain('border-primary/20');
	});
});
