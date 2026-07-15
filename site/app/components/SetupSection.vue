<script setup>
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
    <section id="how-to-setup" class="relative overflow-hidden pt-20 pb-38">
        <div class="relative mx-auto max-w-6xl px-6">
            <!-- Section header -->
            <div class="mb-20 text-center">
                <p
                    class="text-primary text-xs font-medium tracking-widest uppercase"
                >
                    Simple setup
                </p>
                <h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Three steps. That's it.
                </h2>
            </div>

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
                    <template v-for="(step, index) in steps" :key="step.number">
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
</template>
