<script setup>
import { reactive, ref } from "vue";
import AppButton from "../../../components/ui/AppButton.vue";
import ModalDialog from "../../../components/ui/ModalDialog.vue";
import {
    EMPTY_PROJECT,
    normalizeProjectInput,
    validateProject,
} from "../projectValidation";
import { selectProjectFolder } from "../../../services/folderPicker";

defineProps({
    isSaving: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close", "save"]);
const form = reactive({ ...EMPTY_PROJECT });
const errors = ref({});
const isPickingFolder = ref(false);

function submit() {
    const normalizedProject = normalizeProjectInput(form);
    errors.value = validateProject(normalizedProject);

    if (Object.keys(errors.value).length === 0) {
        emit("save", normalizedProject);
    }
}

async function chooseFolder() {
    isPickingFolder.value = true;

    try {
        const selectedPath = await selectProjectFolder(form.folderPath);

        if (selectedPath) {
            form.folderPath = selectedPath;
            delete errors.value.folderPath;
        }
    } catch (error) {
        errors.value.folderPath = error.message;
    } finally {
        isPickingFolder.value = false;
    }
}
</script>

<template>
    <ModalDialog
        title="Add project"
        description="Store the project details used by your development workspace."
        :prevent-close="isSaving"
        @close="$emit('close')"
    >
        <form novalidate @submit.prevent="submit">
            <div class="grid gap-5 px-6 py-5">
                <label class="text-text-secondary grid gap-2 text-sm">
                    <span class="text-text-primary font-medium">
                        Project name <span class="text-primary">*</span>
                    </span>
                    <input
                        v-model="form.name"
                        name="name"
                        maxlength="100"
                        autocomplete="off"
                        :aria-invalid="Boolean(errors.name)"
                        :aria-describedby="
                            errors.name ? 'name-error' : undefined
                        "
                        class="app-input"
                        placeholder="My project"
                    />
                    <span
                        v-if="errors.name"
                        id="name-error"
                        class="text-danger text-xs"
                    >
                        {{ errors.name }}
                    </span>
                </label>

                <div class="text-text-secondary grid gap-2 text-sm">
                    <label
                        for="folder-path"
                        class="text-text-primary font-medium"
                    >
                        Folder path <span class="text-primary">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                        <input
                            id="folder-path"
                            v-model="form.folderPath"
                            name="folderPath"
                            :aria-invalid="Boolean(errors.folderPath)"
                            :aria-describedby="
                                errors.folderPath
                                    ? 'folder-path-error'
                                    : undefined
                            "
                            class="app-input min-w-0 flex-1 font-mono"
                            placeholder="/path/to/project"
                        />
                        <AppButton
                            :disabled="isSaving || isPickingFolder"
                            @click="chooseFolder"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                class="shrink-0"
                            >
                                <path
                                    d="M12.25 5.25V11C12.25 11.4142 11.9142 11.75 11.5 11.75H2.5C2.08579 11.75 1.75 11.4142 1.75 11V4.5C1.75 4.08579 2.08579 3.75 2.5 3.75H5.25L6.5 5.25H11.5C11.9142 5.25 12.25 5.58579 12.25 6Z"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            {{ isPickingFolder ? "Opening..." : "Browse" }}
                        </AppButton>
                    </div>
                    <span
                        v-if="errors.folderPath"
                        id="folder-path-error"
                        class="text-danger text-xs"
                    >
                        {{ errors.folderPath }}
                    </span>
                </div>

                <label class="text-text-secondary grid gap-2 text-sm">
                    <span class="text-text-primary font-medium">
                        Description
                    </span>
                    <textarea
                        v-model="form.description"
                        name="description"
                        maxlength="500"
                        rows="3"
                        :aria-invalid="Boolean(errors.description)"
                        class="app-input resize-none"
                        placeholder="What this project does"
                    ></textarea>
                    <span v-if="errors.description" class="text-danger text-xs">
                        {{ errors.description }}
                    </span>
                </label>
            </div>

            <footer
                class="flex justify-end gap-2.5 border-t border-white/6 bg-black/20 px-6 py-4"
            >
                <AppButton :disabled="isSaving" @click="$emit('close')">
                    Cancel
                </AppButton>
                <AppButton type="submit" variant="primary" :disabled="isSaving">
                    {{ isSaving ? "Saving..." : "Add project" }}
                </AppButton>
            </footer>
        </form>
    </ModalDialog>
</template>
