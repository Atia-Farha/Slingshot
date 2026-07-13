<script setup>
import { computed, reactive, ref } from "vue";
import AppButton from "../../../components/ui/AppButton.vue";
import ModalDialog from "../../../components/ui/ModalDialog.vue";
import {
    EMPTY_PROJECT,
    normalizeProjectInput,
    validateProject,
} from "../projectValidation";
import { selectProjectFolder } from "../../../services/folderPicker";

const props = defineProps({
    project: {
        type: Object,
        default: null,
    },
    isSaving: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close", "save"]);
const form = reactive({ ...EMPTY_PROJECT, ...props.project });
const errors = ref({});
const isPickingFolder = ref(false);
const isEditing = computed(() => Boolean(props.project));

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
        :title="isEditing ? 'Edit project' : 'Add project'"
        description="Store the project details used by your development workspace."
        :prevent-close="isSaving"
        @close="$emit('close')"
    >
        <form novalidate @submit.prevent="submit">
            <div class="grid gap-4 px-5 py-5">
                <label class="grid gap-1.5 text-sm text-zinc-300">
                    <span
                        >Project name <span class="text-primary">*</span></span
                    >
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
                        placeholder="Slingshot"
                    />
                    <span
                        v-if="errors.name"
                        id="name-error"
                        class="text-xs text-red-300"
                    >
                        {{ errors.name }}
                    </span>
                </label>

                <div class="grid gap-1.5 text-sm text-zinc-300">
                    <label for="folder-path">
                        Folder path <span class="text-primary">*</span>
                    </label>
                    <div class="flex gap-2">
                        <input
                            id="folder-path"
                            :value="form.folderPath"
                            name="folderPath"
                            readonly
                            :aria-invalid="Boolean(errors.folderPath)"
                            :aria-describedby="
                                errors.folderPath
                                    ? 'folder-path-error'
                                    : undefined
                            "
                            class="app-input min-w-0 flex-1 cursor-default font-mono"
                            placeholder="No folder selected"
                        />
                        <AppButton
                            :disabled="isSaving || isPickingFolder"
                            @click="chooseFolder"
                        >
                            {{ isPickingFolder ? "Opening…" : "Choose folder" }}
                        </AppButton>
                    </div>
                    <span
                        v-if="errors.folderPath"
                        id="folder-path-error"
                        class="text-xs text-red-300"
                    >
                        {{ errors.folderPath }}
                    </span>
                </div>

                <label class="grid gap-1.5 text-sm text-zinc-300">
                    <span>Description</span>
                    <textarea
                        v-model="form.description"
                        name="description"
                        maxlength="500"
                        rows="3"
                        :aria-invalid="Boolean(errors.description)"
                        class="app-input resize-none"
                        placeholder="What this project does"
                    ></textarea>
                    <span
                        v-if="errors.description"
                        class="text-xs text-red-300"
                    >
                        {{ errors.description }}
                    </span>
                </label>
            </div>

            <footer
                class="flex justify-end gap-2 border-t border-white/8 bg-black/20 px-5 py-3"
            >
                <AppButton :disabled="isSaving" @click="$emit('close')"
                    >Cancel</AppButton
                >
                <AppButton type="submit" variant="primary" :disabled="isSaving">
                    {{
                        isSaving
                            ? "Saving…"
                            : isEditing
                              ? "Save changes"
                              : "Add project"
                    }}
                </AppButton>
            </footer>
        </form>
    </ModalDialog>
</template>
