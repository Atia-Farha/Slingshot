<template>
    <section
        class="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
        <!-- Semi-circle dome glow background -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="hero-dome"></div>
            <div class="hero-dome-ring"></div>
            <div class="hero-dome-inner"></div>
            <div class="grid-overlay absolute inset-0 opacity-40"></div>
            <div
                class="from-jet absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent"
            ></div>
            <div
                class="from-jet via-jet/80 absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent"
            ></div>
        </div>

        <div class="relative z-10 mx-auto max-w-4xl px-6 pt-28 text-center">
            <div
                class="animate-fade-in-up border-primary/20 bg-primary/6 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            >
                <span
                    class="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                ></span>
                <span
                    class="text-primary text-xs font-medium tracking-wide capitalize"
                    >Your setup, automated</span
                >
            </div>

            <h1
                class="animate-fade-in-up animate-delay-100 text-5xl font-extrabold tracking-tight uppercase sm:text-6xl md:text-7xl"
            >
                Launch your full<br />
                dev environment<br />
                <span class="text-primary">in one click</span>
            </h1>

            <p
                class="animate-fade-in-up animate-delay-200 text-text-secondary mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
            >
                Open your editor, terminals, browser, and dev servers — all
                pre-configured per project. No manual setup, no repeated
                commands, no wasted time.
            </p>

            <div
                class="animate-fade-in-up animate-delay-300 mt-10 flex flex-wrap items-center justify-center gap-4"
            >
                <NuxtLink
                    to="/download"
                    class="cta-glow border-primary/60 bg-primary inline-flex h-11 min-w-52 items-center justify-center gap-2.5 rounded-lg border px-6 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
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
                    Download for Free
                </NuxtLink>
                <NuxtLink
                    to="/#features"
                    class="inline-flex h-11 min-w-52 items-center justify-center gap-2.5 rounded-lg border border-white/8 bg-white/5 px-6 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/8 active:scale-[0.98]"
                >
                    What It Can Do
                </NuxtLink>
            </div>
        </div>
    </section>
</template>
