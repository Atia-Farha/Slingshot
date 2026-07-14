<script setup>
import { ref } from "vue";

const isMobileMenuOpen = ref(false);

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

const steps = [
    {
        number: "01",
        title: "Add your project",
        description:
            "Select a folder with the native picker. Name it, tag it, done.",
    },
    {
        number: "02",
        title: "Configure actions",
        description:
            "Pick which editor to open, URLs to launch, and commands to run.",
    },
    {
        number: "03",
        title: "Launch with one click",
        description:
            "Everything opens exactly how you need it. Every single time.",
    },
];
</script>

<template>
    <div class="bg-jet text-text-primary min-h-screen">
        <!-- Navigation -->
        <nav class="fixed top-0 z-50 w-full px-5 pt-5 sm:px-8">
            <div
                class="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/6 bg-[#0a0a0c]/80 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
            >
                <!-- Brand — far left -->
                <a href="#" class="flex items-center gap-1">
                    <img src="/logo.svg" alt="Slingshot" class="h-7 w-7" />
                    <span class="font-display text-[15px] tracking-wide"
                        >Slingshot</span
                    >
                </a>

                <!-- Links — center (desktop) -->
                <div class="hidden items-center gap-1 md:flex">
                    <a href="#features" class="nav-link">Features</a>
                    <a href="#how-it-works" class="nav-link">How it works</a>
                    <a href="#about" class="nav-link">About</a>
                    <a href="#feedback" class="nav-link">Feedback</a>
                </div>

                <!-- Right side: CTA + Hamburger -->
                <div class="flex items-center gap-2">
                    <a
                        href="#download"
                        class="bg-primary hidden h-9 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] hover:shadow-[0_0_20px_rgba(20,216,212,0.3)] active:scale-[0.97] md:inline-flex"
                    >
                        Download
                    </a>

                    <!-- Hamburger button — mobile only -->
                    <button
                        class="text-text-secondary hover:text-text-primary flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 md:hidden"
                        aria-label="Toggle menu"
                        @click="isMobileMenuOpen = !isMobileMenuOpen"
                    >
                        <div
                            class="hamburger"
                            :class="{ active: isMobileMenuOpen }"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Mobile menu dropdown -->
            <Transition name="mobile-menu">
                <div
                    v-if="isMobileMenuOpen"
                    class="mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0c]/95 text-center backdrop-blur-2xl md:hidden"
                >
                    <div class="flex flex-col items-center p-3">
                        <a
                            href="#features"
                            class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors duration-150 hover:bg-white/4"
                            @click="isMobileMenuOpen = false"
                            >Features</a
                        >
                        <a
                            href="#how-it-works"
                            class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors duration-150 hover:bg-white/4"
                            @click="isMobileMenuOpen = false"
                            >How it works</a
                        >
                        <a
                            href="#about"
                            class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors duration-150 hover:bg-white/4"
                            @click="isMobileMenuOpen = false"
                            >About</a
                        >
                        <a
                            href="#feedback"
                            class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors duration-150 hover:bg-white/4"
                            @click="isMobileMenuOpen = false"
                            >Feedback</a
                        >
                        <div class="mt-1 w-full border-t border-white/6 pt-3">
                            <a
                                href="#download"
                                class="bg-primary flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] hover:shadow-[0_0_20px_rgba(20,216,212,0.3)] active:scale-[0.97]"
                                @click="isMobileMenuOpen = false"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            </Transition>
        </nav>

        <!-- Hero Section -->
        <section
            class="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
            <!-- Semi-circle dome glow background -->
            <div class="absolute inset-0 overflow-hidden">
                <!-- Outer dome glow -->
                <div class="hero-dome"></div>
                <!-- Arc ring -->
                <div class="hero-dome-ring"></div>
                <!-- Inner bright core -->
                <div class="hero-dome-inner"></div>
                <!-- Grid overlay -->
                <div class="grid-overlay absolute inset-0 opacity-40"></div>
                <!-- Top fade -->
                <div
                    class="from-jet absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent"
                ></div>
                <!-- Bottom fade -->
                <div
                    class="from-jet via-jet/80 absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent"
                ></div>
            </div>

            <div class="relative z-10 mx-auto max-w-4xl px-6 pt-28 text-center">
                <!-- Eyebrow -->
                <div
                    class="animate-fade-in-up border-primary/20 bg-primary/6 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                >
                    <span
                        class="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                    ></span>
                    <span class="text-primary text-xs font-medium tracking-wide"
                        >Tool for Developers</span
                    >
                </div>

                <!-- Headline -->
                <h1
                    class="animate-fade-in-up animate-delay-100 text-5xl font-extrabold tracking-tight uppercase sm:text-6xl md:text-7xl"
                >
                    Start your day<br />
                    with<br />
                    <span class="text-primary">One click</span>
                </h1>

                <!-- Subheadline -->
                <p
                    class="animate-fade-in-up animate-delay-200 text-text-secondary mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
                >
                    Instead of opening an editor, terminals, a browser, and
                    running the same commands every morning — save that routine
                    once and replay it instantly.
                </p>

                <!-- CTA row -->
                <div
                    class="animate-fade-in-up animate-delay-300 mt-10 flex flex-wrap items-center justify-center gap-4"
                >
                    <a
                        href="#download"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-11 items-center gap-2.5 rounded-lg border px-6 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] active:scale-[0.98]"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                            />
                        </svg>
                        Download for free
                    </a>
                    <a
                        href="#features"
                        class="inline-flex h-11 items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 px-6 text-sm font-semibold text-zinc-100 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/8 active:scale-[0.98]"
                    >
                        See what it does
                    </a>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="relative pt-46">
            <div class="mx-auto max-w-6xl px-6">
                <div class="mb-16 text-center">
                    <p
                        class="text-primary text-xs font-medium tracking-widest uppercase"
                    >
                        Capabilities
                    </p>
                    <h2
                        class="mt-3 text-3xl tracking-tight capitalize sm:text-4xl"
                    >
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
                                    <path
                                        d="M22 11.08V12a10 10 0 11-5.93-9.14"
                                    />
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

        <!-- How it works -->
        <section id="how-it-works" class="relative overflow-hidden py-46">
            <!-- Background -->
            <div class="absolute inset-0">
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 60% 50% at 50% 50%,
                            rgba(20, 216, 212, 0.04) 0%,
                            transparent 70%
                        );
                    "
                ></div>
            </div>
            <div class="relative mx-auto max-w-6xl px-6">
                <div class="mb-20 text-center">
                    <p
                        class="text-primary text-xs font-medium tracking-widest uppercase"
                    >
                        How it works
                    </p>
                    <h2 class="mt-3 text-3xl tracking-tight sm:text-4xl">
                        Three steps. That's it.
                    </h2>
                </div>

                <!-- Timeline -->
                <div class="relative">
                    <!-- Desktop connector line -->
                    <div
                        class="absolute top-12 right-[16.67%] left-[16.67%] hidden h-px sm:block"
                        style="
                            background: linear-gradient(
                                90deg,
                                transparent,
                                rgba(20, 216, 212, 0.2) 20%,
                                rgba(20, 216, 212, 0.2) 80%,
                                transparent
                            );
                        "
                    ></div>

                    <div
                        class="flex flex-col items-center sm:grid sm:grid-cols-3 sm:gap-8"
                    >
                        <template
                            v-for="(step, index) in steps"
                            :key="step.number"
                        >
                            <!-- Step card -->
                            <div class="relative text-center">
                                <div
                                    class="bg-panel mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/6"
                                >
                                    <span
                                        class="text-primary font-display text-3xl tracking-wide"
                                        >{{ step.number }}</span
                                    >
                                </div>
                                <h3 class="text-lg font-semibold">
                                    {{ step.title }}
                                </h3>
                                <p
                                    class="text-text-secondary mx-auto mt-3 max-w-xs text-sm leading-relaxed"
                                >
                                    {{ step.description }}
                                </p>
                            </div>

                            <!-- Flowing arrow — mobile only -->
                            <div
                                v-if="index < steps.length - 1"
                                class="flex justify-center py-5 sm:hidden"
                            >
                                <svg
                                    width="2"
                                    height="48"
                                    viewBox="0 0 2 48"
                                    fill="none"
                                    class="flow-arrow overflow-visible"
                                >
                                    <line
                                        x1="1"
                                        y1="0"
                                        x2="1"
                                        y2="40"
                                        stroke="rgba(20, 216, 212, 0.2)"
                                        stroke-width="2"
                                    />
                                    <line
                                        x1="1"
                                        y1="0"
                                        x2="1"
                                        y2="40"
                                        stroke="rgba(20, 216, 212, 0.6)"
                                        stroke-width="2"
                                        stroke-dasharray="4 8"
                                        class="flow-line"
                                    />
                                    <path
                                        d="M1 44 L-5 35 M1 44 L7 35"
                                        stroke="rgba(20, 216, 212, 0.6)"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </section>

        <!-- Download / CTA -->
        <section id="download" class="relative overflow-hidden py-34">
            <!-- Modern gradient background -->
            <div class="absolute inset-0">
                <!-- Base gradient — top -->
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 80% 30% at 50% 0%,
                            rgba(20, 216, 212, 0.05) 0%,
                            transparent 60%
                        );
                    "
                ></div>
                <!-- Base gradient — bottom -->
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 80% 30% at 50% 100%,
                            rgba(20, 216, 212, 0.05) 0%,
                            transparent 60%
                        );
                    "
                ></div>
                <!-- Left accent -->
                <div
                    class="absolute top-1/4 -left-32 h-96 w-96 rounded-full opacity-[0.04]"
                    style="
                        background: radial-gradient(
                            circle,
                            #14d8d4 0%,
                            transparent 70%
                        );
                        filter: blur(60px);
                    "
                ></div>
                <!-- Right accent -->
                <div
                    class="absolute top-1/3 -right-32 h-80 w-80 rounded-full opacity-[0.03]"
                    style="
                        background: radial-gradient(
                            circle,
                            #6366f1 0%,
                            transparent 70%
                        );
                        filter: blur(60px);
                    "
                ></div>
                <!-- Grid lines -->
                <div
                    class="absolute inset-0 opacity-[0.025]"
                    style="
                        background-image:
                            linear-gradient(
                                rgba(255, 255, 255, 0.5) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(255, 255, 255, 0.5) 1px,
                                transparent 1px
                            );
                        background-size: 80px 80px;
                    "
                ></div>
                <!-- Top edge glow -->
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
                <h2 class="text-3xl tracking-tight sm:text-4xl">
                    Ready to stop repeating yourself?
                </h2>
                <p class="text-text-secondary mt-4 text-base leading-relaxed">
                    Free and open source. Works on macOS, Windows, and Linux. No
                    account required.
                </p>
                <div
                    class="mt-8 flex flex-col items-center justify-center gap-4"
                >
                    <a
                        href="#"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-200 hover:bg-[#0fc4c0] active:scale-[0.98]"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                            />
                        </svg>
                        Download
                    </a>
                    <div
                        class="text-text-muted flex items-center gap-2 text-sm"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Free forever. Open source.
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="">
            <!-- Links grid -->
            <div class="mx-auto max-w-6xl px-6 pt-16 pb-20">
                <div class="flex flex-col justify-between gap-12 sm:flex-row">
                    <!-- Brand block -->
                    <div class="sm:col-span-1">
                        <a href="#" class="flex items-center gap-1">
                            <img
                                src="/logo.svg"
                                alt="Slingshot"
                                class="ml-[-0.4rem] h-7 w-7"
                            />
                            <span
                                class="text-primary font-display text-[15px] tracking-wide"
                                >Slingshot</span
                            >
                        </a>
                        <p class="text-sm leading-relaxed">
                            Start your full dev environment with one click.
                        </p>
                        <div class="mt-6 flex items-center gap-4">
                            <a
                                href="https://github.com/Atia-Farha/Slingshot"
                                class="text-text-muted hover:text-primary/70 transition-colors duration-200"
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#"
                                class="text-text-muted hover:text-primary/70 transition-colors duration-200"
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.801 0-.993-.805-1.799-1.801-1.799zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804c2.319 0 4.2 1.88 4.2 4.199 0 2.321-1.881 4.201-4.201 4.201z"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="flex flex-col gap-12 sm:flex-row sm:gap-24">
                        <!-- Product -->
                        <div>
                            <h4
                                class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                            >
                                Product
                            </h4>
                            <ul class="space-y-2.5">
                                <li>
                                    <a
                                        href="#features"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >Features</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >How it works</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="#download"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >Download</a
                                    >
                                </li>
                            </ul>
                        </div>

                        <!-- Community -->
                        <div>
                            <h4
                                class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                            >
                                Community
                            </h4>
                            <ul class="space-y-2.5">
                                <li>
                                    <a
                                        href="#"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >About us</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >Give Feedback</a
                                    >
                                </li>
                            </ul>
                        </div>

                        <!-- Legal -->
                        <div>
                            <h4
                                class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                            >
                                Legal
                            </h4>
                            <ul class="space-y-2.5">
                                <li>
                                    <a
                                        href="#"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >License</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-150"
                                        >Privacy</a
                                    >
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Big brand name — bleeds to edges -->
            <div class="overflow-hidden">
                <h1
                    class="text-primary/10 font-display text-center leading-[0.85] tracking-tight select-none"
                    style="
                        font-size: clamp(0rem, 26.5vw, 16rem);
                        padding: 0.5rem 0 0 0;
                    "
                >
                    SLINGSHOT
                </h1>
            </div>

            <!-- Copyright bar -->
            <div class="border-t border-white/4">
                <div
                    class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row"
                >
                    <span class="text-text-muted text-xs"
                        >&copy; {{ new Date().getFullYear() }} Slingshot. Open
                        source under MIT.</span
                    >
                    <p class="text-text-muted text-xs">
                        Developed by
                        <a
                            href="https://atia-farha.netlify.app"
                            target="_blank"
                            rel="noopener"
                            class="text-primary/60 hover:text-primary transition-colors duration-150"
                            >Atia Farha</a
                        >
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>
