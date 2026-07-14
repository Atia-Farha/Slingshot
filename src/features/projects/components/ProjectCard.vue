<script setup>
import AppButton from "../../../components/ui/AppButton.vue";

defineProps({
    project: {
        type: Object,
        required: true,
    },
    isLaunching: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["launch", "manage"]);

function initials(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}
</script>

<template>
    <article
        class="group bg-panel hover:border-primary/20 relative flex min-h-56 min-w-0 flex-col rounded-xl border border-white/6 p-5 transition-all duration-200 hover:shadow-[0_0_30px_rgba(20,216,212,0.04)]"
    >
        <header class="flex items-start gap-3.5">
            <div
                class="text-primary group-hover:border-primary/20 group-hover:bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-base font-bold transition-colors duration-200"
                aria-hidden="true"
            >
                {{ initials(project.name) }}
            </div>
            <div class="min-w-0 flex-1">
                <h2
                    class="text-text-primary truncate font-semibold tracking-tight"
                >
                    {{ project.name }}
                </h2>
                <p
                    class="text-text-muted mt-1 truncate font-mono text-xs"
                    :title="project.folderPath"
                >
                    {{ project.folderPath }}
                </p>
            </div>
        </header>

        <p
            class="text-text-secondary mt-4 line-clamp-3 flex-1 text-sm leading-relaxed"
        >
            {{ project.description }}
        </p>

        <footer class="mt-4 flex flex-col gap-2 border-t border-white/6 pt-4">
            <AppButton
                variant="primary"
                class="w-full"
                :disabled="isLaunching"
                :aria-label="`Launch ${project.name}`"
                @click="$emit('launch', project)"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    class="shrink-0"
                >
                    <path
                        d="M4.5 2.5L11.5 7L4.5 11.5V2.5Z"
                        fill="currentColor"
                    />
                </svg>
                {{ isLaunching ? "Launching..." : "Launch workspace" }}
            </AppButton>
            <AppButton
                variant="ghost"
                class="w-full"
                :aria-label="`Manage ${project.name}`"
                @click="$emit('manage', project)"
            >
                Configure
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    class="shrink-0"
                >
                    <path
                        d="M4.5 2.5L8 6L4.5 9.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </AppButton>
        </footer>
    </article>
</template>
