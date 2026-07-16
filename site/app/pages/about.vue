<script setup>
const {
    public: { siteUrl },
} = useRuntimeConfig();

useSeoMeta({
    title: "About | Slingshot",
    description:
        "Slingshot was born from a simple frustration: why do developers repeat the same setup for every project? Learn about our open source mission.",
    ogTitle: "About Slingshot",
    ogDescription:
        "Built by developers, for developers. Slingshot is free, open source, and cross-platform.",
    ogUrl: `${siteUrl}/about`,
    twitterTitle: "About Slingshot",
    twitterDescription:
        "Built by developers, for developers. Slingshot is free, open source, and cross-platform.",
    canonical: `${siteUrl}/about`,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "AboutPage",
                name: "About Slingshot",
                url: `${siteUrl}/about`,
                mainEntity: {
                    "@type": "Organization",
                    name: "Slingshot",
                    url: siteUrl,
                    description: "Free, open source dev environment launcher.",
                    logo: `${siteUrl}/logo.png`,
                    sameAs: ["https://github.com/Atia-Farha/Slingshot"],
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
                        name: "About",
                        item: `${siteUrl}/about`,
                    },
                ],
            }),
        },
    ],
});

const values = [
    {
        title: "Open Source",
        description:
            "Every line of code is on GitHub. No vendor lock-in, no hidden agendas — just transparent software you can trust.",
        icon: "code",
    },
    {
        title: "Developer First",
        description:
            "Built by developers who were tired of the same ritual. Every feature solves a real pain point.",
        icon: "heart",
    },
    {
        title: "Cross-Platform",
        description:
            "macOS, Windows, and Linux. Your workflow shouldn't be limited by your operating system.",
        icon: "globe",
    },
];
</script>

<template>
    <div>
        <!-- Hero -->
        <section
            aria-labelledby="about-hero-heading"
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
                <div class="grid-overlay absolute inset-0 opacity-30"></div>
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
                <!-- Badge -->
                <div
                    class="animate-fade-in-up border-primary/20 bg-primary/6 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                >
                    <span
                        class="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                    ></span>
                    <span class="text-primary text-xs font-medium tracking-wide"
                        >Free & Open Source</span
                    >
                </div>

                <h1
                    id="about-hero-heading"
                    class="animate-fade-in-up animate-delay-100 text-5xl font-extrabold tracking-tight uppercase sm:text-6xl md:text-7xl"
                >
                    Built by<br />
                    <span class="text-primary">developers</span>,<br />
                    for developers
                </h1>

                <p
                    class="animate-fade-in-up animate-delay-200 text-text-secondary mx-auto mt-8 max-w-2xl text-lg leading-relaxed"
                >
                    Slingshot was born from a simple frustration: why do we have
                    to repeat the same setup over and over?
                </p>
            </div>
        </section>

        <!-- Story -->
        <section aria-labelledby="story-heading" class="relative">
            <h2 id="story-heading" class="sr-only-heading">Our Story</h2>
            <div class="mx-auto max-w-3xl space-y-6 px-6 py-4">
                <!-- Problem -->
                <div class="group relative">
                    <div
                        class="section-card relative overflow-hidden p-8 md:p-10"
                    >
                        <!-- Left accent glow -->
                        <div
                            class="absolute inset-y-0 left-0 w-px"
                            style="
                                background: linear-gradient(
                                    180deg,
                                    transparent,
                                    rgba(239, 68, 68, 0.4),
                                    transparent
                                );
                            "
                        ></div>
                        <div
                            class="absolute top-1/2 -left-24 h-48 w-48 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                            style="background: rgba(239, 68, 68, 0.07)"
                        ></div>

                        <div class="relative flex gap-6">
                            <!-- Step icon -->
                            <div class="hidden shrink-0 md:flex">
                                <div
                                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="text-red-400"
                                        aria-hidden="true"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                </div>
                            </div>

                            <div class="flex-1">
                                <div class="mb-1 flex items-center gap-3">
                                    <span
                                        class="text-[11px] font-semibold tracking-widest text-red-400/80 uppercase md:hidden"
                                        >01</span
                                    >
                                    <h3
                                        class="text-xl font-semibold md:text-2xl"
                                    >
                                        The problem
                                    </h3>
                                </div>
                                <p
                                    class="text-text-secondary mt-4 text-[15px] leading-relaxed"
                                >
                                    Every project starts with the same ritual.
                                    Open your editor, spin up terminals,
                                    navigate to the project, run
                                    <code
                                        class="bg-surface text-primary rounded px-1.5 py-0.5 font-mono text-sm"
                                        >git pull</code
                                    >, install dependencies, fire up the dev
                                    server, and find your place in the codebase.
                                    Then do it all over again for the next
                                    project.
                                </p>
                                <p
                                    class="text-text-secondary mt-4 text-[15px] leading-relaxed"
                                >
                                    Ten minutes of repetitive setup before you
                                    write a single line of real code. Across a
                                    team of five, that's nearly an hour lost
                                    every day — to work that looks identical
                                    across every project.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Solution -->
                <div class="group relative">
                    <div
                        class="section-card relative overflow-hidden p-8 md:p-10"
                    >
                        <!-- Left accent glow -->
                        <div
                            class="absolute inset-y-0 left-0 w-px"
                            style="
                                background: linear-gradient(
                                    180deg,
                                    transparent,
                                    rgba(20, 216, 212, 0.5),
                                    transparent
                                );
                            "
                        ></div>
                        <div
                            class="absolute top-1/2 -left-24 h-48 w-48 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                            style="background: rgba(20, 216, 212, 0.07)"
                        ></div>

                        <div class="relative flex gap-6">
                            <!-- Step icon -->
                            <div class="hidden shrink-0 md:flex">
                                <div
                                    class="border-primary/20 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl border"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="text-primary"
                                        aria-hidden="true"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>

                            <div class="flex-1">
                                <div class="mb-1 flex items-center gap-3">
                                    <span
                                        class="text-primary text-[11px] font-semibold tracking-widest uppercase md:hidden"
                                        >02</span
                                    >
                                    <h3
                                        class="text-xl font-semibold md:text-2xl"
                                    >
                                        The solution
                                    </h3>
                                </div>
                                <p
                                    class="text-text-secondary mt-4 text-[15px] leading-relaxed"
                                >
                                    Configure your setup once — editor,
                                    terminals, browser tabs, dev servers,
                                    commands — exactly how you like them. Save
                                    it to a project, and launch everything with
                                    a single click. No repetition, no
                                    context-switching, no forgotten steps.
                                </p>
                                <p
                                    class="text-text-secondary mt-4 text-[15px] leading-relaxed"
                                >
                                    Slingshot replaces the repetitive setup with
                                    one button. Free, open source, and built to
                                    work wherever you do.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Values -->
        <section aria-labelledby="values-heading" class="relative pt-24 pb-4">
            <div class="mx-auto max-w-6xl px-6">
                <!-- Section header -->
                <div class="mb-16 text-center">
                    <span
                        class="text-primary text-[11px] font-semibold tracking-widest uppercase"
                        >Our principles</span
                    >
                    <h2
                        id="values-heading"
                        class="mt-3 text-3xl font-bold sm:text-4xl"
                    >
                        What we believe
                    </h2>
                    <div
                        class="mx-auto mt-5 h-px w-16"
                        style="
                            background: linear-gradient(
                                90deg,
                                transparent,
                                rgba(20, 216, 212, 0.4),
                                transparent
                            );
                        "
                    ></div>
                </div>

                <div class="grid gap-5 sm:grid-cols-3">
                    <div
                        v-for="value in values"
                        :key="value.title"
                        class="feature-card section-card group hover:border-primary/20 relative overflow-hidden p-8 transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(20,216,212,0.15)]"
                    >
                        <div class="relative z-10">
                            <!-- Icon -->
                            <div
                                class="border-primary/15 bg-primary/8 group-hover:border-primary/25 group-hover:bg-primary/12 mb-6 flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-500"
                            >
                                <svg
                                    v-if="value.icon === 'code'"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-primary"
                                    aria-hidden="true"
                                >
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                                <svg
                                    v-else-if="value.icon === 'heart'"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-primary"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                    />
                                </svg>
                                <svg
                                    v-else-if="value.icon === 'globe'"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-primary"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path
                                        d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                                    />
                                </svg>
                            </div>

                            <h3 class="mb-2.5 text-base font-semibold">
                                {{ value.title }}
                            </h3>
                            <p
                                class="text-text-secondary text-sm leading-relaxed"
                            >
                                {{ value.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section
            aria-labelledby="about-cta-heading"
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
                    id="about-cta-heading"
                    class="text-3xl tracking-tight sm:text-4xl"
                >
                    Help us make Slingshot better
                </h2>
                <p class="text-text-secondary mt-4 text-base leading-relaxed">
                    Your feedback shapes what Slingshot becomes. Bug reports,
                    feature ideas, or just a quick "this works great" — it all
                    helps.
                </p>
                <div
                    class="mt-8 flex flex-col items-center justify-center gap-4"
                >
                    <NuxtLink
                        to="/feedback"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
                        >Give Feedback</NuxtLink
                    >
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* Hide visually but keep in a11y tree for section labelling */
.sr-only-heading {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>
