import { defineStore } from 'pinia';

let nextNotificationId = 1;

const MAX_NOTIFICATION_LENGTH = 500;
const NOTIFICATION_TTL_MS = 4000;

function coerceMessage(value) {
	if (value == null) return '';
	const text = typeof value === 'string' ? value : String(value);
	if (text.length > MAX_NOTIFICATION_LENGTH) {
		return text.slice(0, MAX_NOTIFICATION_LENGTH) + '\u2026';
	}
	return text;
}

export const useNotificationsStore = defineStore('notifications', {
	state: () => ({
		notifications: [],
	}),
	actions: {
		add(message, type = 'success') {
			const id = nextNotificationId++;
			const safeMessage = coerceMessage(message);
			const safeType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'success';
			this.notifications.push({ id, message: safeMessage, type: safeType });
			window.setTimeout(() => this.remove(id), NOTIFICATION_TTL_MS);
			return id;
		},
		remove(id) {
			this.notifications = this.notifications.filter((notification) => notification.id !== id);
		},
	},
});
