<script setup>
const {
    public: { siteUrl },
} = useRuntimeConfig();

useSeoMeta({
    title: "Page Not Found | Slingshot",
    description: "The page you're looking for doesn't exist or has been moved.",
    ogTitle: "Page Not Found | Slingshot",
    ogDescription:
        "The page you're looking for doesn't exist or has been moved.",
    ogUrl: siteUrl,
    twitterTitle: "Page Not Found | Slingshot",
    twitterDescription:
        "The page you're looking for doesn't exist or has been moved.",
    robots: "noindex, nofollow",
    canonical: siteUrl,
});

const props = defineProps({
    error: { type: Object, required: true },
});
</script>

<template>
    <NuxtLayout>
        <section
            class="relative flex min-h-[80vh] items-center justify-center overflow-hidden pt-32 pb-20"
        >
            <!-- Background -->
            <div class="absolute inset-0">
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 60% 50% at 50% 50%,
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

            <div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <p
                    class="text-primary text-8xl font-extrabold tracking-tight uppercase"
                >
                    404
                </p>
                <h1 class="mt-4 text-2xl font-bold">Page not found</h1>
                <p class="text-text-secondary mt-2 text-base">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <NuxtLink
                    to="/"
                    class="border-primary/60 bg-primary mt-8 inline-flex h-11 items-center gap-2.5 rounded-lg border px-6 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
                >
                    Back to Home
                </NuxtLink>
            </div>
        </section>
    </NuxtLayout>
</template>
