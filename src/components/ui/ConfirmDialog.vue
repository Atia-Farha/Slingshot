<script setup>
import AppButton from "./AppButton.vue";
import ModalDialog from "./ModalDialog.vue";

defineProps({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isWorking: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["cancel", "confirm"]);
</script>

<template>
    <ModalDialog
        :title="title"
        :prevent-close="isWorking"
        @close="$emit('cancel')"
    >
        <div class="px-6 py-5">
            <div class="flex items-center gap-3">
                <div
                    class="bg-danger/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        class="text-danger"
                    >
                        <path
                            d="M8 5V8.5M8 11V11.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                        />
                    </svg>
                </div>
                <p class="text-text-secondary text-sm leading-relaxed">
                    {{ message }}
                </p>
            </div>
        </div>
        <footer
            class="flex justify-end gap-2.5 border-t border-white/6 bg-black/20 px-6 py-4"
        >
            <AppButton :disabled="isWorking" @click="$emit('cancel')">
                Cancel
            </AppButton>
            <AppButton
                variant="danger"
                :disabled="isWorking"
                @click="$emit('confirm')"
            >
                {{ isWorking ? "Deleting..." : "Delete project" }}
            </AppButton>
        </footer>
    </ModalDialog>
</template>
