<script setup>
useHead({
    title: "About | Slingshot",
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
                    to repeat the same setup every single morning?
                </p>
            </div>
        </section>

        <!-- Story -->
        <section class="relative pt-4 pb-24">
            <div class="mx-auto max-w-2xl space-y-4 px-6">
                <!-- Problem -->
                <div class="section-card p-8">
                    <h2 class="mb-4 text-xl font-semibold">The Problem</h2>
                    <p class="text-text-secondary text-base leading-relaxed">
                        Every project starts the same way. Open VS Code. Open
                        three terminals. cd into the project. Run
                        <code
                            class="bg-surface text-primary rounded px-1.5 py-0.5 font-mono text-sm"
                            >git pull</code
                        >. Run
                        <code
                            class="bg-surface text-primary rounded px-1.5 py-0.5 font-mono text-sm"
                            >npm install</code
                        >. Open the browser. Navigate to localhost. Check Slack.
                        Check email. Repeat for every project.
                    </p>
                    <p
                        class="text-text-secondary mt-4 text-base leading-relaxed"
                    >
                        That's 10+ minutes of mechanical work before you've done
                        a single productive thing. Multiplied by every developer
                        on the team, for every single project — it adds up fast.
                    </p>
                </div>

                <!-- Solution -->
                <div class="section-card p-8">
                    <h2 class="mb-4 text-xl font-semibold">The Solution</h2>
                    <p class="text-text-secondary text-base leading-relaxed">
                        Save your startup routine once. Open editor, terminals,
                        browser tabs, run commands — all configured exactly how
                        you need them. Then launch everything with one click.
                        Every. Single. Time.
                    </p>
                    <p
                        class="text-text-secondary mt-4 text-base leading-relaxed"
                    >
                        Slingshot is the tool we wished existed, so we built it.
                        Free, open source, and cross-platform.
                    </p>
                </div>
            </div>
        </section>

        <!-- Values -->
        <section class="relative pt-4 pb-24">
            <div class="mx-auto max-w-6xl px-6">
                <!-- Section header -->
                <div class="mb-12 text-center">
                    <span
                        class="text-primary text-xs font-medium tracking-wider uppercase"
                        >Our principles</span
                    >
                    <h2 class="mt-2 text-3xl font-bold">What we believe</h2>
                </div>

                <div class="grid gap-4 sm:grid-cols-3">
                    <div
                        v-for="value in values"
                        :key="value.title"
                        class="group bg-panel hover:border-primary/20 relative overflow-hidden rounded-2xl border border-white/8 p-7 transition-all duration-500"
                    >
                        <!-- Hover glow -->
                        <div
                            class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            style="
                                background: radial-gradient(
                                    ellipse 80% 50% at 50% 0%,
                                    rgba(20, 216, 212, 0.06) 0%,
                                    transparent 70%
                                );
                            "
                        ></div>

                        <div class="relative">
                            <!-- Icon -->
                            <div class="feature-icon mb-5">
                                <svg
                                    v-if="value.icon === 'code'"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                                <svg
                                    v-else-if="value.icon === 'heart'"
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
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                    />
                                </svg>
                                <svg
                                    v-else-if="value.icon === 'globe'"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path
                                        d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                                    />
                                </svg>
                            </div>

                            <h3 class="mb-2 text-lg font-semibold">
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

        <!-- CTA -->
        <section class="relative pt-4 pb-24">
            <div class="mx-auto max-w-2xl px-6">
                <div
                    class="bg-panel relative overflow-hidden rounded-2xl border border-white/8"
                >
                    <!-- Gradient accent -->
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

                    <div class="p-8 text-center sm:p-10">
                        <h2 class="text-2xl font-bold">Found a bug?</h2>
                        <p
                            class="text-text-secondary mx-auto mt-3 max-w-md text-sm leading-relaxed"
                        >
                            Help us make Slingshot better. Open an issue on
                            GitHub with your OS, app version, and steps to
                            reproduce.
                        </p>
                        <div
                            class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
                        >
                            <a
                                href="https://github.com/Atia-Farha/Slingshot/issues/new"
                                target="_blank"
                                rel="noopener"
                                class="cta-glow border-primary/60 bg-primary inline-flex h-11 items-center gap-2.5 rounded-lg border px-6 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] active:scale-[0.98]"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="16" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                                Report an issue
                            </a>
                            <a
                                href="https://github.com/Atia-Farha/Slingshot"
                                target="_blank"
                                rel="noopener"
                                class="inline-flex h-11 items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 px-6 text-sm font-semibold text-zinc-100 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/8 active:scale-[0.98]"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                                    />
                                </svg>
                                View source
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
