<script setup>
import { ref } from "vue";
import AppButton from "../../../components/ui/AppButton.vue";
import ModalDialog from "../../../components/ui/ModalDialog.vue";
import { normalizeLaunchUrl, validateLaunchUrl } from "../launchValidation";

const props = defineProps({
    project: {
        type: Object,
        required: true,
    },
    isSaving: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close", "save"]);
const launchUrl = ref(props.project.launchUrl ?? "");
const error = ref("");

function submit() {
    const normalizedUrl = normalizeLaunchUrl(launchUrl.value);
    error.value = validateLaunchUrl(normalizedUrl);

    if (!error.value) {
        emit("save", normalizedUrl);
    }
}

function removeUrl() {
    error.value = "";
    emit("save", "");
}
</script>

<template>
    <ModalDialog
        title="Project URL"
        :description="`Open a browser page when ${project.name} launches.`"
        :prevent-close="isSaving"
        @close="$emit('close')"
    >
        <form novalidate @submit.prevent="submit">
            <div class="grid gap-2 px-5 py-5">
                <label class="grid gap-1.5 text-sm text-zinc-300">
                    <span>URL</span>
                    <input
                        v-model="launchUrl"
                        name="launchUrl"
                        type="url"
                        maxlength="2048"
                        autocomplete="off"
                        :aria-invalid="Boolean(error)"
                        :aria-describedby="
                            error ? 'launch-url-error' : undefined
                        "
                        class="app-input"
                        placeholder="https://localhost:5173"
                    />
                </label>
                <span
                    v-if="error"
                    id="launch-url-error"
                    class="text-xs text-red-300"
                >
                    {{ error }}
                </span>
                <p class="text-xs leading-5 text-zinc-500">
                    Only HTTP(S) URLs are allowed. URLs containing credentials
                    are rejected.
                </p>
            </div>

            <footer
                class="flex items-center justify-between border-t border-white/8 bg-black/20 px-5 py-3"
            >
                <AppButton
                    v-if="project.launchUrl"
                    variant="danger"
                    :disabled="isSaving"
                    @click="removeUrl"
                >
                    Remove URL
                </AppButton>
                <span v-else></span>
                <div class="flex gap-2">
                    <AppButton :disabled="isSaving" @click="$emit('close')">
                        Cancel
                    </AppButton>
                    <AppButton
                        type="submit"
                        variant="primary"
                        :disabled="isSaving"
                    >
                        {{ isSaving ? "Saving…" : "Save URL" }}
                    </AppButton>
                </div>
            </footer>
        </form>
    </ModalDialog>
</template>
