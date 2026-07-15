<script setup>
import { useToast } from "../composables/useToast";

useHead({
    title: "Feedback | Slingshot",
});

const { success, error: showError } = useToast();

const feedbackTypes = [
    { value: "bug", label: "Bug Report", icon: "bug" },
    { value: "feature", label: "Feature Request", icon: "lightbulb" },
    { value: "feedback", label: "General Feedback", icon: "message" },
    { value: "question", label: "Question", icon: "question" },
];

const MAX_LENGTHS = { name: 100, email: 254, message: 2000 };
const RATE_LIMIT_MS = 60000;

const form = reactive({
    name: "",
    email: "",
    type: "",
    message: "",
});

const isSubmitting = ref(false);
const lastSubmitTime = ref(0);
const formErrors = reactive({ name: "", email: "", type: "", message: "" });

function resetForm() {
    form.name = "";
    form.email = "";
    form.type = "";
    form.message = "";
    Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
}

function validateEmail(email) {
    const re =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email) return "Email is required.";
    if (email.length > MAX_LENGTHS.email) return "Email is too long.";
    if (!re.test(email)) return "Please enter a valid email address.";
    const disposableDomains = [
        "tempmail.com",
        "throwaway.email",
        "guerrillamail.com",
        "mailinator.com",
        "yopmail.com",
        "trashmail.com",
        "fakeinbox.com",
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    if (disposableDomains.includes(domain))
        return "Please use a permanent email address.";
    return "";
}

function validateName(name) {
    if (!name.trim()) return "Name is required.";
    if (name.length > MAX_LENGTHS.name) return "Name is too long.";
    if (/[<>{}]/.test(name)) return "Name contains invalid characters.";
    return "";
}

function validateType(type) {
    if (!type) return "Please select a feedback type.";
    if (!feedbackTypes.some((t) => t.value === type))
        return "Invalid feedback type.";
    return "";
}

function validateMessage(message) {
    if (!message.trim()) return "Message is required.";
    if (message.length > MAX_LENGTHS.message)
        return `Message must be ${MAX_LENGTHS.message} characters or less.`;
    const spamPatterns = [
        /(.)\1{10,}/i,
        /https?:\/\/[^\s]+/i,
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
    ];
    if (spamPatterns.some((p) => p.test(message)))
        return "Message contains disallowed content.";
    return "";
}

function validateForm() {
    formErrors.name = validateName(form.name);
    formErrors.email = validateEmail(form.email);
    formErrors.type = validateType(form.type);
    formErrors.message = validateMessage(form.message);
    return !Object.values(formErrors).some((e) => e);
}

async function handleSubmit() {
    if (isSubmitting.value) return;

    const now = Date.now();
    if (now - lastSubmitTime.value < RATE_LIMIT_MS) {
        showError("Please wait before submitting again.");
        return;
    }

    if (!validateForm()) {
        showError("Please fix the errors in the form.");
        return;
    }

    isSubmitting.value = true;

    try {
        // Simulate submission (no backend)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        lastSubmitTime.value = Date.now();
        success("Feedback sent successfully! Thank you for your input.");
        resetForm();
    } catch (err) {
        showError(
            err.message || "Something went wrong. Please try again later.",
        );
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div>
        <!-- Hero -->
        <section class="relative overflow-hidden pt-32 pb-20">
            <!-- Background -->
            <div class="absolute inset-0">
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 60% 50% at 50% 30%,
                            rgba(20, 216, 212, 0.06) 0%,
                            transparent 70%
                        );
                    "
                ></div>
                <div
                    class="absolute inset-x-0 top-0 h-px"
                    style="
                        background: linear-gradient(
                            90deg,
                            transparent 10%,
                            rgba(20, 216, 212, 0.15) 50%,
                            transparent 90%
                        );
                    "
                ></div>
            </div>

            <div class="relative mx-auto max-w-4xl px-6 text-center">
                <h1
                    class="animate-fade-in-up text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
                >
                    Help us<br />
                    <span class="text-primary">improve</span>
                </h1>

                <p
                    class="animate-fade-in-up animate-delay-100 text-text-secondary mx-auto mt-6 max-w-xl text-lg leading-relaxed"
                >
                    Your feedback shapes what Slingshot becomes. Bug reports,
                    feature ideas, or just a quick "this works great" — it all
                    helps.
                </p>
            </div>
        </section>

        <!-- Feedback form -->
        <form
            id="feedback-form"
            class="bg-panel relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/8"
            @submit.prevent="handleSubmit"
        >
            <!-- Top edge glow -->
            <div
                class="absolute inset-x-0 top-0 h-px"
                style="
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(20, 216, 212, 0.4),
                        transparent
                    );
                "
            ></div>

            <!-- Bottom edge glow -->
            <div
                class="absolute inset-x-0 bottom-0 h-px"
                style="
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(20, 216, 212, 0.4),
                        transparent
                    );
                "
            ></div>

            <div class="p-8 sm:p-10">
                <!-- Header -->
                <div class="mt-6 mb-12 text-center">
                    <h2 class="text-primary text-3xl">Send feedback</h2>
                    <p class="text-text-muted mt-1.5 text-sm">
                        We read every message you send
                    </p>
                </div>

                <div class="grid gap-4">
                    <!-- Name & Email row -->
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="grid gap-2 text-sm">
                            <span class="text-text-primary font-medium">
                                Name <span class="text-primary">*</span>
                            </span>
                            <input
                                v-model="form.name"
                                type="text"
                                name="name"
                                :maxlength="MAX_LENGTHS.name"
                                required
                                class="app-input"
                                :class="{ 'border-danger/50': formErrors.name }"
                                placeholder="Your name"
                                @input="formErrors.name = ''"
                            />
                            <span
                                v-if="formErrors.name"
                                class="text-danger text-xs"
                                >{{ formErrors.name }}</span
                            >
                        </label>

                        <label class="grid gap-2 text-sm">
                            <span class="text-text-primary font-medium">
                                Email
                                <span class="text-primary">*</span>
                            </span>
                            <input
                                v-model="form.email"
                                type="email"
                                name="email"
                                :maxlength="MAX_LENGTHS.email"
                                required
                                class="app-input"
                                :class="{
                                    'border-danger/50': formErrors.email,
                                }"
                                placeholder="you@example.com"
                                @input="formErrors.email = ''"
                            />
                            <span
                                v-if="formErrors.email"
                                class="text-danger text-xs"
                                >{{ formErrors.email }}</span
                            >
                        </label>
                    </div>

                    <!-- Type -->
                    <label class="grid gap-2 text-sm">
                        <span class="text-text-primary font-medium">
                            Type <span class="text-primary">*</span>
                        </span>
                        <div class="relative">
                            <select
                                v-model="form.type"
                                name="type"
                                required
                                class="app-input appearance-none pr-10"
                                :class="{ 'border-danger/50': formErrors.type }"
                                @change="formErrors.type = ''"
                            >
                                <option value="" disabled class="bg-surface">
                                    Select a type
                                </option>
                                <option
                                    v-for="t in feedbackTypes"
                                    :key="t.value"
                                    :value="t.value"
                                    class="bg-surface"
                                >
                                    {{ t.label }}
                                </option>
                            </select>
                            <svg
                                class="text-text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                        <span
                            v-if="formErrors.type"
                            class="text-danger text-xs"
                            >{{ formErrors.type }}</span
                        >
                    </label>

                    <!-- Message -->
                    <label class="grid gap-2 text-sm">
                        <span class="text-text-primary font-medium">
                            Message <span class="text-primary">*</span>
                        </span>
                        <textarea
                            v-model="form.message"
                            name="message"
                            :maxlength="MAX_LENGTHS.message"
                            rows="5"
                            required
                            class="app-input resize-none"
                            :class="{ 'border-danger/50': formErrors.message }"
                            placeholder="Tell us what's on your mind..."
                            @input="formErrors.message = ''"
                        ></textarea>
                        <div class="flex items-center justify-between">
                            <span
                                v-if="formErrors.message"
                                class="text-danger text-xs"
                                >{{ formErrors.message }}</span
                            >
                            <span class="text-text-muted ml-auto text-xs"
                                >{{ form.message.length }}/{{
                                    MAX_LENGTHS.message
                                }}</span
                            >
                        </div>
                    </label>
                </div>

                <!-- Submit -->
                <footer
                    class="flex flex-col items-center justify-center gap-4 px-0 pt-6"
                >
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="border-primary/60 bg-primary inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(20,216,212,0.2)] transition-all duration-150 hover:bg-[#0fc4c0] hover:shadow-[0_0_28px_rgba(20,216,212,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg
                            v-if="!isSubmitting"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        <svg
                            v-else
                            class="animate-spin"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                class="opacity-25"
                            />
                            <path
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                fill="currentColor"
                                class="opacity-75"
                            />
                        </svg>
                        {{ isSubmitting ? "Submitting..." : "Submit" }}
                    </button>

                    <span class="text-text-muted text-xs"
                        >We'll never share your email.</span
                    >
                </footer>
            </div>
        </form>

        <section class="relative overflow-hidden py-38">
            <div class="absolute inset-0">
                <!-- Base gradient — bottom -->
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 80% 30% at 50% 100%,
                            rgba(20, 216, 212, 0.1) 0%,
                            transparent 60%
                        );
                    "
                ></div>

                <!-- Bottom edge glow -->
                <div
                    class="absolute inset-x-0 bottom-0 h-px"
                    style="
                        background: linear-gradient(
                            90deg,
                            transparent 10%,
                            rgba(20, 216, 212, 0.15) 50%,
                            transparent 90%
                        );
                    "
                ></div>
            </div>

            <div class="relative mx-auto max-w-2xl px-6 text-center">
                <h2 class="text-3xl tracking-tight capitalize sm:text-4xl">
                    Prefer GitHub?
                </h2>
                <p class="text-text-secondary mt-4 text-base leading-relaxed">
                    Open an issue directly on GitHub for feature requests or bug
                    reports with your OS, app version, and steps to reproduce.
                </p>
                <div
                    class="mt-8 flex flex-col items-center justify-center gap-4"
                >
                    <a
                        href="https://github.com/Atia-Farha/Slingshot/issues/new"
                        target="_blank"
                        rel="noopener"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] active:scale-[0.98]"
                    >
                        Open an Issue
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
