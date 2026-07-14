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
        <TransitionGroup name="toast">
            <div
                v-for="notification in notifications.notifications"
                :key="notification.id"
                role="status"
                class="pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl shadow-black/40 backdrop-blur-sm"
                :class="
                    notification.type === 'error'
                        ? 'border-danger/20 bg-[#1a0a0a] text-red-200'
                        : 'border-primary/20 bg-[#0a1a1a] text-zinc-100'
                "
            >
                <span
                    class="h-2 w-2 shrink-0 rounded-full"
                    :class="
                        notification.type === 'error'
                            ? 'bg-danger'
                            : 'bg-primary'
                    "
                ></span>
                <span class="flex-1 leading-5">{{ notification.message }}</span>
                <button
                    type="button"
                    class="text-text-muted hover:text-text-primary shrink-0 rounded-md p-0.5 transition-colors"
                    aria-label="Dismiss notification"
                    @click="notifications.remove(notification.id)"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                            d="M4 4L10 10M10 4L4 10"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>
