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
    <section id="how-it-works" class="relative overflow-hidden py-20">
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
            <div class="mb-10 text-center">
                <p
                    class="text-primary text-xs font-medium tracking-widest uppercase"
                >
                    How it works
                </p>
                <h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    From grind to one click
                </h2>
            </div>

            <div
                class="bg-panel relative overflow-hidden rounded-2xl border border-white/8"
            >
                <!-- Center divider line -->
                <div
                    class="absolute inset-y-0 left-1/2 hidden w-px bg-white/8 sm:block"
                ></div>

                <div class="relative grid sm:grid-cols-2">
                    <!-- Before -->
                    <div class="p-8 sm:pr-10">
                        <div class="mb-8">
                            <span
                                class="text-text-muted text-xs font-medium tracking-wider uppercase"
                                >Before</span
                            >
                            <h3 class="text-text-secondary mt-1.5 text-lg">
                                The daily setup grind
                            </h3>
                        </div>

                        <div class="space-y-2.5">
                            <div
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
                                    class="text-text-muted mt-0.5 shrink-0"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span
                                    class="text-text-secondary text-sm leading-relaxed"
                                    >{{ item }}</span
                                >
                            </div>
                        </div>

                        <!-- Time cost -->
                        <div
                            class="mt-8 rounded-xl border border-white/6 bg-white/2 px-5 py-4 text-center"
                        >
                            <span class="text-text-muted text-xs"
                                >Time wasted per project
                            </span>
                            <p
                                class="text-text-secondary mt-1 text-3xl font-extrabold"
                            >
                                10+ min
                            </p>
                        </div>
                    </div>

                    <!-- After -->
                    <div
                        class="border-t border-white/8 p-8 sm:border-t-0 sm:border-l sm:pl-10"
                    >
                        <div class="mb-8">
                            <span
                                class="text-primary text-xs font-medium tracking-wider uppercase"
                                >After</span
                            >
                            <h3 class="mt-1.5 text-lg font-semibold">
                                One click, you're in
                            </h3>
                        </div>

                        <div class="space-y-2.5">
                            <div
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
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-primary mt-0.5 shrink-0"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span class="text-sm leading-relaxed">{{
                                    item
                                }}</span>
                            </div>
                        </div>

                        <!-- Time saved -->
                        <div
                            class="border-primary/20 bg-primary/6 mt-8 rounded-xl border px-5 py-4 text-center"
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
