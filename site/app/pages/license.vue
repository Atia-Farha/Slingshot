<script setup>
import rawMd from "~/legal/license.md?raw";
import { useMarkdown } from "~/composables/useMarkdown";

const {
    public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = "July 17, 2026";
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
    title: "License | Slingshot",
    description: "Human-readable summary of the Slingshot license (AGPL v3).",
    ogTitle: "License — Slingshot",
    ogDescription: "Human-readable summary of the Slingshot license (AGPL v3).",
    ogUrl: `${siteUrl}/license`,
    twitterTitle: "License — Slingshot",
    twitterDescription:
        "Human-readable summary of the Slingshot license (AGPL v3).",
    canonical: `${siteUrl}/license`,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "License — Slingshot",
                url: `${siteUrl}/license`,
                isPartOf: {
                    "@type": "WebSite",
                    name: "Slingshot",
                    url: siteUrl,
                },
            }),
        },
    ],
});
</script>

<template>
    <div>
        <!-- Hero -->
        <section
            aria-labelledby="license-hero-heading"
            class="relative overflow-hidden pt-32 pb-20"
        >
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
                    id="license-hero-heading"
                    class="animate-fade-in-up text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
                >
                    <span class="text-primary">License</span>
                </h1>
                <p
                    class="animate-fade-in-up animate-delay-100 text-text-muted mx-auto mt-4 text-sm"
                >
                    Last updated: {{ lastUpdated }}
                </p>
            </div>
        </section>

        <!-- Content (rendered from Markdown) -->
        <section class="relative overflow-hidden px-6 pb-38">
            <div
                class="pointer-events-none absolute inset-x-0 bottom-0 h-[32em]"
            >
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

            <article
                class="legal-content mx-auto max-w-3xl space-y-10 text-[15px] leading-relaxed"
                v-html="html"
            />
        </section>
    </div>
</template>

<style scoped>
:deep(.legal-section-divider) {
    border-top: 1px solid rgba(20, 216, 212, 0.1);
    padding-top: 1.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted, rgba(255, 255, 255, 0.4));
}

:deep(.legal-content h2) {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary, #fff);
}

:deep(.legal-content p) {
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

:deep(.legal-content ul),
:deep(.legal-content ol) {
    margin-left: 1.25rem;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

:deep(.legal-content li) {
    margin-bottom: 0.5rem;
}

:deep(.legal-content ul ul),
:deep(.legal-content ol ul),
:deep(.legal-content ul ol),
:deep(.legal-content ol ol) {
    margin-top: 0.5rem;
    margin-bottom: 0;
}

:deep(.legal-content strong) {
    color: var(--color-text-primary, #fff);
    font-weight: 600;
}

:deep(.legal-content code) {
    background: var(--color-surface, rgba(255, 255, 255, 0.05));
    color: rgba(20, 216, 212, 0.7);
    border-radius: 0.25rem;
    padding: 0.125rem 0.375rem;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.875em;
}

:deep(.legal-content a) {
    color: rgba(20, 216, 212, 0.7);
    text-decoration: none;
    transition: color 0.2s;
}

:deep(.legal-content a:hover) {
    color: rgba(20, 216, 212, 1);
}

:deep(.legal-content ol) {
    list-style-type: decimal;
}

:deep(.legal-content ul) {
    list-style-type: disc;
}

/* Tables */
:deep(.legal-content table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

:deep(.legal-content th),
:deep(.legal-content td) {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid rgba(20, 216, 212, 0.1);
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 0.875rem;
}

:deep(.legal-content th) {
    color: var(--color-text-primary, #fff);
    font-weight: 600;
}
</style>
