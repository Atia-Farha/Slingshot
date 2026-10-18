import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotificationsStore } from './notifications';

beforeEach(() => {
	setActivePinia(createPinia());
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('notifications store', () => {
	it('adds a success notification with a generated id and returns the id', () => {
		const store = useNotificationsStore();

		const id = store.add('Project created.');

		expect(typeof id).toBe('number');
		expect(store.notifications).toHaveLength(1);
		expect(store.notifications[0]).toMatchObject({
			id,
			message: 'Project created.',
			type: 'success',
		});
	});

	it('supports each supported notification type', () => {
		const store = useNotificationsStore();

		store.add('Success message', 'success');
		store.add('Failure message', 'error');
		store.add('Caution message', 'warning');
		store.add('Heads-up message', 'info');

		expect(store.notifications.map((notification) => notification.type)).toEqual(['success', 'error', 'warning', 'info']);
	});

	it('falls back to success when an unknown type is provided', () => {
		const store = useNotificationsStore();

		store.add('Mystery message', 'bogus');

		expect(store.notifications[0].type).toBe('success');
	});

	it('coerces non-string messages into their string representation', () => {
		const store = useNotificationsStore();

		store.add(42);
		store.add({ toString: () => 'object message' });
		store.add(null);
		store.add(undefined);

		expect(store.notifications.map((notification) => notification.message)).toEqual(['42', 'object message', '', '']);
	});

	it('truncates messages that exceed the maximum length with an ellipsis', () => {
		const store = useNotificationsStore();
		const longMessage = 'x'.repeat(600);

		store.add(longMessage);

		const stored = store.notifications[0].message;
		expect(stored.endsWith('\u2026')).toBe(true);
		expect(stored.length).toBe(501);
	});

	it('does not truncate messages that fit within the maximum length', () => {
		const store = useNotificationsStore();

		store.add('Short message');

		const stored = store.notifications[0].message;
		expect(stored.endsWith('\u2026')).toBe(false);
		expect(stored).toBe('Short message');
	});

	it('auto-removes notifications after the TTL elapses', () => {
		const store = useNotificationsStore();

		store.add('Auto-removed message');

		expect(store.notifications).toHaveLength(1);

		vi.advanceTimersByTime(4000);

		expect(store.notifications).toEqual([]);
	});

	it('keeps notifications present until the TTL has fully elapsed', () => {
		const store = useNotificationsStore();

		store.add('Still visible');

		vi.advanceTimersByTime(3999);

		expect(store.notifications).toHaveLength(1);
	});

	it('keeps a notification that was added less than a TTL ago while another ages out', () => {
		const store = useNotificationsStore();

		store.add('First', 'success');
		vi.advanceTimersByTime(2000);
		store.add('Second', 'success');
		vi.advanceTimersByTime(2000);

		expect(store.notifications).toHaveLength(1);
		expect(store.notifications[0].message).toBe('Second');
	});

	it('removes only the requested notification by id', () => {
		const store = useNotificationsStore();

		const firstId = store.add('First', 'success');
		const secondId = store.add('Second', 'success');

		store.remove(firstId);

		expect(store.notifications.map((notification) => notification.id)).toEqual([secondId]);
	});

	it('is a no-op when removing an id that does not exist', () => {
		const store = useNotificationsStore();
		store.add('Only notification', 'success');

		store.remove(999);

		expect(store.notifications).toHaveLength(1);
	});

	it('assigns monotonically increasing ids to notifications', () => {
		const store = useNotificationsStore();

		const firstId = store.add('First');
		const secondId = store.add('Second');
		const thirdId = store.add('Third');

		expect(secondId).toBeGreaterThan(firstId);
		expect(thirdId).toBeGreaterThan(secondId);
	});

	it('keeps the notification list empty until add() is called', () => {
		const store = useNotificationsStore();

		expect(store.notifications).toEqual([]);
	});
});
