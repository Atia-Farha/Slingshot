<script setup>
import { useNotificationsStore } from "../../stores/notifications";

const notifications = useNotificationsStore();
</script>

<template>
    <div
        aria-live="polite"
        aria-relevant="additions removals"
        class="pointer-events-none fixed right-5 bottom-5 z-50 flex w-80 flex-col gap-2"
    >
        <div
            v-for="notification in notifications.notifications"
            :key="notification.id"
            role="status"
            class="bg-panel pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl shadow-black/50"
            :class="
                notification.type === 'error'
                    ? 'border-red-500/30 text-red-200'
                    : 'border-primary/30 text-zinc-100'
            "
        >
            <span
                class="mt-1 h-2 w-2 shrink-0 rounded-full"
                :class="
                    notification.type === 'error' ? 'bg-red-400' : 'bg-primary'
                "
            ></span>
            <span class="flex-1 leading-5">{{ notification.message }}</span>
            <button
                type="button"
                class="text-zinc-500 hover:text-zinc-100"
                aria-label="Dismiss notification"
                @click="notifications.remove(notification.id)"
            >
                ×
            </button>
        </div>
    </div>
</template>
