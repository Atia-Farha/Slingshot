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
            class="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
            @mousedown.self="requestClose"
        >
            <section
                ref="panel"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                class="modal-panel bg-panel w-full max-w-lg overflow-hidden rounded-2xl border border-white/8 shadow-2xl shadow-black/60"
            >
                <header class="border-b border-white/6 px-6 py-5">
                    <h2
                        :id="titleId"
                        class="text-text-primary text-base font-semibold tracking-tight"
                    >
                        {{ title }}
                    </h2>
                    <p
                        v-if="description"
                        class="text-text-secondary mt-1 text-sm"
                    >
                        {{ description }}
                    </p>
                </header>
                <slot />
            </section>
        </div>
    </Teleport>
</template>
