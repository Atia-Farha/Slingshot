<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from "vue";

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    preventClose: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close"]);
const panel = ref(null);
const titleId = useId();

function requestClose() {
    if (!props.preventClose) {
        emit("close");
    }
}

function handleKeydown(event) {
    if (event.key === "Escape") {
        requestClose();
    }
}

onMounted(async () => {
    window.addEventListener("keydown", handleKeydown);
    await nextTick();
    panel.value?.querySelector("input, textarea, button")?.focus();
});

onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
            @mousedown.self="requestClose"
        >
            <section
                ref="panel"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                class="bg-panel w-full max-w-lg overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/70"
            >
                <header class="border-b border-white/8 px-5 py-4">
                    <h2
                        :id="titleId"
                        class="text-base font-semibold text-zinc-50"
                    >
                        {{ title }}
                    </h2>
                    <p v-if="description" class="mt-1 text-sm text-zinc-500">
                        {{ description }}
                    </p>
                </header>
                <slot />
            </section>
        </div>
    </Teleport>
</template>
