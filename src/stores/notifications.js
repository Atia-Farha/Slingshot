import { defineStore } from "pinia";

let nextNotificationId = 1;

export const useNotificationsStore = defineStore("notifications", {
    state: () => ({
        notifications: [],
    }),
    actions: {
        add(message, type = "success") {
            const id = nextNotificationId++;
            this.notifications.push({ id, message, type });
            window.setTimeout(() => this.remove(id), 4000);
            return id;
        },
        remove(id) {
            this.notifications = this.notifications.filter(
                (notification) => notification.id !== id,
            );
        },
    },
});
