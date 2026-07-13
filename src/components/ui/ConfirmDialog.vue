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
        <div class="px-5 py-4">
            <p class="text-sm leading-6 text-zinc-300">{{ message }}</p>
        </div>
        <footer
            class="flex justify-end gap-2 border-t border-white/8 bg-black/20 px-5 py-3"
        >
            <AppButton :disabled="isWorking" @click="$emit('cancel')"
                >Cancel</AppButton
            >
            <AppButton
                variant="danger"
                :disabled="isWorking"
                @click="$emit('confirm')"
            >
                {{ isWorking ? "Deleting…" : "Delete project" }}
            </AppButton>
        </footer>
    </ModalDialog>
</template>
