<script setup>
const { public: publicConfig } = useRuntimeConfig();
const siteUrl = publicConfig.siteUrl;
const turnstileSiteKey = publicConfig.turnstileSiteKey;

useSeoMeta({
    title: "Feedback | Slingshot",
    description:
        "Share your feedback, bug reports, or feature ideas for Slingshot. We read every message.",
    ogTitle: "Feedback — Slingshot",
    ogDescription:
        "Help us improve Slingshot. Bug reports, feature requests, or just a quick note.",
    ogUrl: `${siteUrl}/feedback`,
    twitterTitle: "Feedback — Slingshot",
    twitterDescription:
        "Help us improve Slingshot. Bug reports, feature requests, or just a quick note.",
    canonical: `${siteUrl}/feedback`,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ContactPage",
                name: "Feedback — Slingshot",
                url: `${siteUrl}/feedback`,
                mainEntity: {
                    "@type": "Organization",
                    name: "Slingshot",
                    url: siteUrl,
                },
            }),
        },
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: siteUrl,
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Feedback",
                        item: `${siteUrl}/feedback`,
                    },
                ],
            }),
        },
        {
            src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
            async: true,
        },
    ],
});

const { success, error: showError } = useToast();
const turnstileToken = ref("");
const turnstileWidgetId = ref(null);
const turnstileError = ref("");
const turnstileLoaded = ref(false);
let turnstileLoadTimeout = null;

const feedbackTypes = [
    { value: "bug", label: "Bug Report", icon: "bug" },
    { value: "feature", label: "Feature Request", icon: "lightbulb" },
    { value: "feedback", label: "General Feedback", icon: "message" },
    { value: "question", label: "Question", icon: "question" },
];

const MAX_LENGTHS = { name: 100, email: 254, message: 2000 };
const REQUEST_TIMEOUT_MS = 30000;
const TURNSTILE_LOAD_TIMEOUT_MS = 10000;

const form = reactive({
    name: "",
    email: "",
    type: "",
    message: "",
});

const isSubmitting = ref(false);
const formErrors = reactive({ name: "", email: "", type: "", message: "" });

let turnstileCheckInterval = null;

onMounted(() => {
    turnstileCheckInterval = setInterval(() => {
        if (window.turnstile) {
            clearInterval(turnstileCheckInterval);
            turnstileCheckInterval = null;
            turnstileLoaded.value = true;

            turnstileWidgetId.value = window.turnstile.render("#cf-turnstile", {
                sitekey: turnstileSiteKey,
                callback: (token) => {
                    turnstileToken.value = token;
                    turnstileError.value = "";
                },
                "expired-callback": () => {
                    turnstileToken.value = "";
                    turnstileError.value =
                        "Verification expired. Please complete it again.";
                },
                "error-callback": () => {
                    turnstileError.value =
                        "Verification failed. Please refresh the page.";
                    turnstileToken.value = "";
                },
                theme: "dark",
            });
        }
    }, 100);

    turnstileLoadTimeout = setTimeout(() => {
        if (!turnstileLoaded.value) {
            clearInterval(turnstileCheckInterval);
            turnstileCheckInterval = null;
            turnstileError.value =
                "Security verification failed to load. Please refresh the page.";
        }
    }, TURNSTILE_LOAD_TIMEOUT_MS);
});

onUnmounted(() => {
    if (turnstileCheckInterval) clearInterval(turnstileCheckInterval);
    if (turnstileLoadTimeout) clearTimeout(turnstileLoadTimeout);
});

function resetTurnstile() {
    if (window.turnstile && turnstileWidgetId.value !== null) {
        window.turnstile.reset(turnstileWidgetId.value);
        turnstileToken.value = "";
        turnstileError.value = "";
    }
}

function resetForm() {
    form.name = "";
    form.email = "";
    form.type = "";
    form.message = "";
    Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
    resetTurnstile();
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
        "10minutemail.com",
        "guerrillamailblock.com",
        "grr.la",
        "dispostable.com",
        "sharklasers.com",
        "spam4.me",
        "bccto.me",
        "chacuo.net",
        "disposableemailaddresses.emailmiser.com",
        "tempinbox.com",
        "tempail.com",
        "tempomail.fr",
        "temporaryemail.net",
        "temporaryforwarding.com",
        "throwawayemailaddress.com",
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

function extractErrorMessage(err) {
    // Network error (no internet, DNS failure, CORS block)
    if (err?.name === "TypeError" || err?.message?.includes("fetch")) {
        return "Network error. Please check your connection and try again.";
    }

    // Request timeout
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
        return "Request timed out. Please try again.";
    }

    // Server returned JSON error response
    const data = err?.data;
    if (data) {
        // Structured validation errors from API
        if (data.errors && typeof data.errors === "object") {
            const firstError = Object.values(data.errors)[0];
            if (firstError) return firstError;
        }
        // Simple error message from API
        if (typeof data.error === "string") return data.error;
    }

    // HTTP status-based fallback
    if (err?.statusCode || err?.status) {
        const status = err.statusCode || err.status;
        if (status === 503)
            return "Service temporarily unavailable. Please try again later.";
        if (status === 500)
            return "Something went wrong on our end. Please try again later.";
        if (status === 413)
            return "Your message is too long. Please shorten it.";
        if (status === 429) return "Please wait before submitting again.";
        if (status === 403) return "Verification failed. Please try again.";
        if (status === 400)
            return "Invalid request. Please refresh and try again.";
    }

    // Non-JSON response (HTML error page from Cloudflare/origin)
    if (err?.data && typeof err.data !== "object") {
        return "Something went wrong. Please try again later.";
    }

    // Last resort
    return "Something went wrong. Please try again later.";
}

async function handleSubmit() {
    if (isSubmitting.value) return;

    if (!turnstileToken.value) {
        turnstileError.value = "Please complete the verification.";
        return;
    }

    if (!validateForm()) {
        showError("Please fix the errors in the form.");
        return;
    }

    isSubmitting.value = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const res = await $fetch("/api/feedback", {
            method: "POST",
            signal: controller.signal,
            body: {
                name: form.name.trim(),
                email: form.email.trim(),
                type: form.type,
                message: form.message.trim(),
                turnstileToken: turnstileToken.value,
            },
        });

        // Handle case where response is not the expected shape
        if (!res || typeof res !== "object") {
            showError("Something went wrong. Please try again later.");
            resetTurnstile();
            return;
        }

        if (res.success) {
            success(
                "Feedback sent successfully! Thank you for being part of our journey.",
            );
            resetForm();
        } else {
            // API returned a response but not success — shouldn't happen, but handle it
            showError(
                res.error || "Something went wrong. Please try again later.",
            );
            resetTurnstile();
        }
    } catch (err) {
        showError(extractErrorMessage(err));
        resetTurnstile();
    } finally {
        clearTimeout(timeoutId);
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div>
        <!-- Hero -->
        <section
            aria-labelledby="feedback-hero-heading"
            class="relative overflow-hidden pt-32 pb-20"
        >
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
                    id="feedback-hero-heading"
                    class="animate-fade-in-up text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
                >
                    Help us<br />
                    <span class="text-primary">improve</span>
                </h1>

                <p
                    class="animate-fade-in-up animate-delay-100 text-text-secondary mx-auto mt-6 max-w-xl text-lg leading-relaxed"
                >
                    We're obsessed with building the best possible experience
                    for you. Your feedback is the fuel that drives our roadmap.
                </p>
            </div>
        </section>

        <!-- Feedback form -->
        <section class="flex w-full items-center justify-center">
            <form
                id="feedback-form"
                aria-label="Feedback form"
                class="bg-panel relative mx-3 w-full max-w-xl overflow-hidden rounded-2xl border border-white/8"
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
                                    id="feedback-name"
                                    v-model="form.name"
                                    type="text"
                                    name="name"
                                    autocomplete="name"
                                    :maxlength="MAX_LENGTHS.name"
                                    required
                                    class="app-input"
                                    :class="{
                                        'border-danger/50': formErrors.name,
                                    }"
                                    :aria-describedby="
                                        formErrors.name
                                            ? 'feedback-name-error'
                                            : undefined
                                    "
                                    placeholder="Your name"
                                    @input="formErrors.name = ''"
                                />
                                <span
                                    v-if="formErrors.name"
                                    id="feedback-name-error"
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
                                    id="feedback-email"
                                    v-model="form.email"
                                    type="email"
                                    name="email"
                                    autocomplete="email"
                                    :maxlength="MAX_LENGTHS.email"
                                    required
                                    class="app-input"
                                    :class="{
                                        'border-danger/50': formErrors.email,
                                    }"
                                    :aria-describedby="
                                        formErrors.email
                                            ? 'feedback-email-error'
                                            : undefined
                                    "
                                    placeholder="you@example.com"
                                    @input="formErrors.email = ''"
                                />
                                <span
                                    v-if="formErrors.email"
                                    id="feedback-email-error"
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
                                    id="feedback-type"
                                    v-model="form.type"
                                    name="type"
                                    required
                                    class="app-input appearance-none pr-10"
                                    :class="{
                                        'border-danger/50': formErrors.type,
                                    }"
                                    :aria-describedby="
                                        formErrors.type
                                            ? 'feedback-type-error'
                                            : undefined
                                    "
                                    @change="formErrors.type = ''"
                                >
                                    <option
                                        value=""
                                        disabled
                                        class="bg-surface"
                                    >
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
                                    aria-hidden="true"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            <span
                                v-if="formErrors.type"
                                id="feedback-type-error"
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
                                id="feedback-message"
                                v-model="form.message"
                                name="message"
                                :maxlength="MAX_LENGTHS.message"
                                rows="5"
                                required
                                class="app-input resize-none"
                                :class="{
                                    'border-danger/50': formErrors.message,
                                }"
                                :aria-describedby="
                                    formErrors.message
                                        ? 'feedback-message-error'
                                        : undefined
                                "
                                placeholder="Tell us what's on your mind..."
                                @input="formErrors.message = ''"
                            ></textarea>
                            <div class="flex items-center justify-between">
                                <span
                                    v-if="formErrors.message"
                                    id="feedback-message-error"
                                    class="text-danger text-xs"
                                    >{{ formErrors.message }}</span
                                >
                                <span
                                    class="text-text-muted ml-auto text-xs"
                                    aria-live="polite"
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
                        <!-- Turnstile -->
                        <div
                            class="flex w-full flex-col items-center justify-center gap-2"
                        >
                            <div id="cf-turnstile" class="cf-turnstile"></div>
                            <span
                                v-if="turnstileError"
                                class="text-danger mt-1 text-xs"
                                role="alert"
                                >{{ turnstileError }}</span
                            >
                        </div>
                        <button
                            type="submit"
                            :disabled="isSubmitting || !turnstileLoaded"
                            :aria-busy="isSubmitting"
                            class="border-primary/60 bg-primary inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(20,216,212,0.2)] transition-all duration-300 hover:bg-[#0fc4c0] hover:shadow-[0_0_28px_rgba(20,216,212,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
                                aria-hidden="true"
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
                                aria-hidden="true"
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
                            >By submitting, you agree to our
                            <NuxtLink
                                to="/privacy"
                                class="text-primary/60 hover:text-primary transition-colors"
                                >privacy policy</NuxtLink
                            >.</span
                        >
                    </footer>
                </div>
            </form>
        </section>

        <section
            aria-labelledby="feedback-cta-heading"
            class="relative overflow-hidden py-38"
        >
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
                <h2
                    id="feedback-cta-heading"
                    class="text-3xl tracking-tight sm:text-4xl"
                >
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
                        rel="noopener noreferrer"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
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
                            aria-hidden="true"
                        >
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
