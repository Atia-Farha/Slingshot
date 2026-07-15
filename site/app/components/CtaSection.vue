<template>
    <section class="relative overflow-hidden py-38">
        <div class="absolute inset-0">
            <!-- Base gradient — top -->
            <div
                class="absolute inset-0"
                style="
                    background: radial-gradient(
                        ellipse 80% 30% at 50% 0%,
                        rgba(20, 216, 212, 0.1) 0%,
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
                        rgba(20, 216, 212, 0.1) 0%,
                        transparent 60%
                    );
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
            <div class="mt-8 flex flex-col items-center justify-center gap-4">
                <NuxtLink
                    to="/download"
                    class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
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
                        aria-hidden="true"
                    >
                        <path
                            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                        />
                    </svg>
                    Download
                </NuxtLink>
            </div>
        </div>
    </section>
</template>
