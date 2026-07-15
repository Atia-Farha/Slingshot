<script setup>
const before = [
    "Open your editor and navigate to the project",
    "Spin up multiple terminals manually",
    "Pull latest code and install dependencies",
    "Start your dev server and open it in a browser",
    "Repeat for every project you work on",
];

const after = [
    "Pick the project you want to work on",
    "Everything opens in the right layout",
    "Code is pulled and ready to go",
    "Dev servers start automatically",
];
</script>

<template>
    <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        class="relative overflow-hidden py-20"
    >
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
            <!-- Section header -->
            <div class="mb-16 text-center">
                <p
                    class="text-primary text-[11px] font-semibold tracking-widest uppercase"
                >
                    How it works
                </p>
                <h2
                    id="how-it-works-heading"
                    class="mt-3 text-3xl font-bold sm:text-4xl"
                >
                    From grind to one click
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

            <div
                class="bg-panel relative overflow-hidden rounded-2xl border border-white/8"
            >
                <!-- Left edge — red glow -->
                <div
                    class="absolute inset-y-0 left-0 w-px"
                    style="
                        background: linear-gradient(
                            180deg,
                            transparent,
                            rgba(239, 68, 68, 0.3),
                            transparent
                        );
                    "
                ></div>
                <!-- Right edge — teal glow -->
                <div
                    class="absolute inset-y-0 right-0 w-px"
                    style="
                        background: linear-gradient(
                            180deg,
                            transparent,
                            rgba(20, 216, 212, 0.4),
                            transparent
                        );
                    "
                ></div>
                <!-- Bottom edge — gradient -->
                <div
                    class="absolute inset-x-0 bottom-0 h-px"
                    style="
                        background: linear-gradient(
                            90deg,
                            rgba(239, 68, 68, 0.2),
                            transparent 30%,
                            transparent 70%,
                            rgba(20, 216, 212, 0.3)
                        );
                    "
                ></div>
                <!-- Top edge — gradient -->
                <div
                    class="absolute inset-x-0 top-0 h-px"
                    style="
                        background: linear-gradient(
                            90deg,
                            rgba(239, 68, 68, 0.2),
                            transparent 30%,
                            transparent 70%,
                            rgba(20, 216, 212, 0.3)
                        );
                    "
                ></div>

                <!-- Center divider line — gradient -->
                <div
                    class="absolute inset-y-0 left-1/2 hidden w-px sm:block"
                    style="
                        background: linear-gradient(
                            180deg,
                            transparent 5%,
                            rgba(255, 255, 255, 0.08) 20%,
                            rgba(255, 255, 255, 0.08) 80%,
                            transparent 95%
                        );
                    "
                ></div>

                <div class="relative grid sm:grid-cols-2">
                    <!-- Before (left — red) -->
                    <div class="relative p-8 sm:pr-10">
                        <!-- Ambient red glow -->
                        <div
                            class="pointer-events-none absolute top-1/2 -left-16 h-48 w-48 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
                            style="background: rgba(239, 68, 68, 0.06)"
                        ></div>

                        <div class="relative mb-8">
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10"
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
                                        class="text-red-400"
                                        aria-hidden="true"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                </div>
                                <div>
                                    <span
                                        class="text-[11px] font-semibold tracking-widest text-red-400/80 uppercase"
                                        >Before</span
                                    >
                                    <h3
                                        class="text-text-secondary text-lg font-semibold"
                                    >
                                        The daily setup grind
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <ul class="relative space-y-2.5" role="list">
                            <li
                                v-for="(item, i) in before"
                                :key="i"
                                class="flex items-start gap-3 rounded-lg bg-white/3 px-4 py-3"
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
                                    class="mt-0.5 shrink-0 text-red-400/60"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span
                                    class="text-text-secondary text-sm leading-relaxed"
                                    >{{ item }}</span
                                >
                            </li>
                        </ul>

                        <!-- Time cost -->
                        <div
                            class="relative mt-8 rounded-xl border border-red-500/15 bg-red-500/5 px-5 py-4 text-center"
                        >
                            <span class="text-text-muted text-xs"
                                >Time wasted per project</span
                            >
                            <p
                                class="text-text-secondary mt-1 text-3xl font-extrabold"
                            >
                                10+ min
                            </p>
                        </div>
                    </div>

                    <!-- After (right — teal) -->
                    <div
                        class="relative border-t border-white/8 p-8 sm:border-t-0 sm:border-l sm:pl-10"
                    >
                        <!-- Ambient teal glow -->
                        <div
                            class="pointer-events-none absolute top-1/2 -right-16 h-48 w-48 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
                            style="background: rgba(20, 216, 212, 0.06)"
                        ></div>

                        <div class="relative mb-8">
                            <div class="flex items-center gap-3">
                                <div
                                    class="border-primary/20 bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg border"
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
                                        class="text-primary"
                                        aria-hidden="true"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <span
                                        class="text-primary text-[11px] font-semibold tracking-widest uppercase"
                                        >After</span
                                    >
                                    <h3 class="text-lg font-semibold">
                                        One click, you're in
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <ul class="relative space-y-2.5" role="list">
                            <li
                                v-for="(item, i) in after"
                                :key="i"
                                class="bg-primary/4 flex items-start gap-3 rounded-lg px-4 py-3"
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
                                    class="text-primary mt-0.5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span class="text-sm leading-relaxed">{{
                                    item
                                }}</span>
                            </li>
                        </ul>

                        <!-- Time saved -->
                        <div
                            class="border-primary/20 bg-primary/6 relative mt-8 rounded-xl border px-5 py-4 text-center"
                        >
                            <span class="text-text-muted text-xs"
                                >Time to start coding</span
                            >
                            <p
                                class="text-primary mt-1 text-3xl font-extrabold"
                            >
                                1 click
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
