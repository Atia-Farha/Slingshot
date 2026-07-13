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
        class="group bg-panel hover:border-primary/30 flex min-h-56 min-w-0 flex-col rounded-xl border border-white/8 p-4 shadow-lg shadow-black/20 transition"
    >
        <header class="flex items-start gap-3">
            <div
                class="text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-lg font-bold"
                aria-hidden="true"
            >
                {{ initials(project.name) }}
            </div>
            <div class="min-w-0 flex-1">
                <h2 class="truncate font-semibold text-zinc-100">
                    {{ project.name }}
                </h2>
                <p
                    class="mt-1 truncate font-mono text-xs text-zinc-500"
                    :title="project.folderPath"
                >
                    {{ project.folderPath }}
                </p>
            </div>
        </header>

        <p class="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-zinc-400">
            {{ project.description || "No description added." }}
        </p>

        <footer class="mt-4 flex flex-col gap-2 border-t border-white/8 pt-3">
            <AppButton
                variant="primary"
                class="w-full"
                :disabled="isLaunching"
                :aria-label="`Launch ${project.name}`"
                @click="$emit('launch', project)"
            >
                {{ isLaunching ? "Launching…" : "Launch workspace" }}
            </AppButton>
            <AppButton
                variant="ghost"
                class="w-full"
                :aria-label="`Manage ${project.name}`"
                @click="$emit('manage', project)"
            >
                Manage project →
            </AppButton>
        </footer>
    </article>
</template>
