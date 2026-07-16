<script setup>
const {
    public: { siteUrl },
} = useRuntimeConfig();

useSeoMeta({
    title: "Privacy Policy | Slingshot",
    description:
        "How Slingshot handles your data. We collect minimal data and respect your privacy.",
    ogTitle: "Privacy Policy — Slingshot",
    ogDescription:
        "How Slingshot handles your data. We collect minimal data and respect your privacy.",
    ogUrl: `${siteUrl}/privacy`,
    twitterTitle: "Privacy Policy — Slingshot",
    twitterDescription:
        "How Slingshot handles your data. We collect minimal data and respect your privacy.",
    canonical: `${siteUrl}/privacy`,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "Privacy Policy — Slingshot",
                url: `${siteUrl}/privacy`,
                isPartOf: {
                    "@type": "WebSite",
                    name: "Slingshot",
                    url: siteUrl,
                },
            }),
        },
    ],
});

const lastUpdated = "July 16, 2026";
</script>

<template>
    <div>
        <!-- Hero -->
        <section
            aria-labelledby="privacy-hero-heading"
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
                    id="privacy-hero-heading"
                    class="animate-fade-in-up text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
                >
                    Privacy<br />
                    <span class="text-primary">policy</span>
                </h1>
                <p
                    class="animate-fade-in-up animate-delay-100 text-text-muted mx-auto mt-4 text-sm"
                >
                    Last updated: {{ lastUpdated }}
                </p>
            </div>
        </section>

        <!-- Content -->
        <section class="mx-auto max-w-3xl px-6">
            <div class="space-y-10 text-[15px] leading-relaxed">
                <div>
                    <h2 class="mb-3 text-xl font-semibold">Overview</h2>
                    <p class="text-text-secondary">
                        Slingshot is free, open source software. This privacy
                        policy covers only the
                        <NuxtLink
                            to="/"
                            class="text-primary/70 hover:text-primary transition-colors"
                            >Slingshot website</NuxtLink
                        >
                        and its feedback form — not the desktop application,
                        which runs entirely on your machine and does not
                        communicate with our servers.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">Data we collect</h2>
                    <p class="text-text-secondary mb-3">
                        When you submit feedback through our form, we collect
                        only what you provide:
                    </p>
                    <ul class="text-text-secondary ml-5 list-disc space-y-2">
                        <li>
                            <strong class="text-text-primary">Name</strong> — to
                            address you in responses
                        </li>
                        <li>
                            <strong class="text-text-primary">Email</strong> —
                            to follow up on your feedback if needed
                        </li>
                        <li>
                            <strong class="text-text-primary">Message</strong> —
                            your feedback content
                        </li>
                        <li>
                            <strong class="text-text-primary"
                                >Feedback type</strong
                            >
                            — bug, feature, general feedback, or question
                        </li>
                    </ul>
                    <p class="text-text-secondary mt-3">
                        We do <strong class="text-text-primary">not</strong>
                        collect IP addresses, browser fingerprints, cookies,
                        analytics, or any tracking data.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">
                        How we use your data
                    </h2>
                    <p class="text-text-secondary">
                        Your feedback is used solely to improve Slingshot. We
                        may email you if we need clarification on your
                        submission. We will never sell, share, or use your data
                        for marketing purposes.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">Data storage</h2>
                    <p class="text-text-secondary">
                        Feedback is stored in a Cloudflare D1 database. We do
                        not use third-party analytics or tracking services on
                        this website.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">
                        Third-party services
                    </h2>
                    <p class="text-text-secondary mb-3">
                        We use the following services to operate this website:
                    </p>
                    <ul class="text-text-secondary ml-5 list-disc space-y-2">
                        <li>
                            <strong class="text-text-primary"
                                >Cloudflare Pages</strong
                            >
                            — website hosting
                        </li>
                        <li>
                            <strong class="text-text-primary"
                                >Cloudflare Turnstile</strong
                            >
                            — bot protection on the feedback form (does not use
                            cookies)
                        </li>
                        <li>
                            <strong class="text-text-primary">Resend</strong> —
                            email delivery for feedback notifications
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">Data retention</h2>
                    <p class="text-text-secondary">
                        Feedback data is retained for the lifetime of the
                        project to help track recurring issues and feature
                        requests. We do not delete individual submissions.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">
                        Changes to this policy
                    </h2>
                    <p class="text-text-secondary">
                        We may update this policy occasionally. Changes will be
                        posted on this page with an updated date. Continued use
                        of the site after changes constitutes acceptance of the
                        updated policy.
                    </p>
                </div>

                <div>
                    <h2 class="mb-3 text-xl font-semibold">Contact</h2>
                    <p class="text-text-secondary">
                        For privacy-related questions, open an issue on our
                        <a
                            href="https://github.com/Atia-Farha/Slingshot/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-primary/70 hover:text-primary transition-colors"
                            >GitHub repository</a
                        >.
                    </p>
                </div>
            </div>
        </section>

        <!-- Bottom gradient -->
        <section class="relative overflow-hidden py-48">
            <div class="absolute inset-0">
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
        </section>
    </div>
</template>
