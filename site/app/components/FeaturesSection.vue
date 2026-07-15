<script setup>
const features = [
    {
        title: "One-click Launch",
        description:
            "Open your editor, terminals, browser tabs, and apps exactly how you left them — no manual setup.",
        icon: "rocket",
        span: "wide",
    },
    {
        title: "Embedded Terminal",
        description:
            "Run dev servers and commands without leaving the app. Live output streamed directly to an integrated terminal.",
        icon: "terminal",
        span: "tall",
    },
    {
        title: "Project Library",
        description:
            "Organize projects with tags, favorites, and notes. Find anything with instant search.",
        icon: "library",
        span: "normal",
    },
    {
        title: "Command Sequences",
        description:
            "Chain commands like git pull → npm install → npm run dev. Run once, run every time.",
        icon: "chain",
        span: "normal",
    },
    {
        title: "Pre-launch Checks",
        description:
            "Verify Node, Git, Docker, and ports before launch. Know what's missing before it breaks.",
        icon: "check",
        span: "wide",
    },
    {
        title: "Git at a Glance",
        description:
            "See branch, uncommitted changes, and ahead/behind status on every project card.",
        icon: "git",
        span: "normal",
    },
];
</script>

<template>
    <section id="features" class="relative pt-38 pb-20">
        <div class="mx-auto max-w-6xl px-6">
            <div class="mb-16 text-center">
                <p
                    class="text-primary text-xs font-medium tracking-widest uppercase"
                >
                    Capabilities
                </p>
                <h2 class="mt-3 text-3xl tracking-tight capitalize sm:text-4xl">
                    Everything you need.<br class="hidden sm:inline" />
                    Nothing you don't.
                </h2>
                <p
                    class="text-text-secondary mx-auto mt-4 max-w-xl text-base leading-relaxed"
                >
                    Built for developers who repeat the same startup ritual
                    every day. Save it once, launch it forever.
                </p>
            </div>

            <div
                class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                style="grid-auto-rows: minmax(0, auto)"
            >
                <div
                    v-for="feature in features"
                    :key="feature.title"
                    class="feature-card section-card group relative overflow-hidden p-6"
                    :class="{
                        'lg:col-span-2': feature.span === 'wide',
                        'lg:row-span-2': feature.span === 'tall',
                    }"
                >
                    <div class="relative z-10">
                        <div class="feature-icon mb-4">
                            <!-- Rocket -->
                            <svg
                                v-if="feature.icon === 'rocket'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"
                                />
                                <path
                                    d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"
                                />
                                <path
                                    d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
                                />
                                <path
                                    d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
                                />
                            </svg>
                            <!-- Terminal -->
                            <svg
                                v-else-if="feature.icon === 'terminal'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polyline points="4 17 10 11 4 5" />
                                <line x1="12" y1="19" x2="20" y2="19" />
                            </svg>
                            <!-- Library -->
                            <svg
                                v-else-if="feature.icon === 'library'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                <path
                                    d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                                />
                            </svg>
                            <!-- Chain -->
                            <svg
                                v-else-if="feature.icon === 'chain'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                                />
                                <path
                                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                                />
                            </svg>
                            <!-- Check -->
                            <svg
                                v-else-if="feature.icon === 'check'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <!-- Git -->
                            <svg
                                v-else-if="feature.icon === 'git'"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="18" cy="18" r="3" />
                                <circle cx="6" cy="6" r="3" />
                                <path d="M6 21V9a9 9 0 009 9" />
                            </svg>
                        </div>
                        <h3 class="text-base font-semibold">
                            {{ feature.title }}
                        </h3>
                        <p
                            class="text-text-secondary mt-2 text-sm leading-relaxed"
                        >
                            {{ feature.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
