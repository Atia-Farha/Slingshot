<script setup>
const siteUrl = "https://sling-shot.pages.dev";

useSeoMeta({
    title: "Page Not Found | Slingshot",
    description:
        "The page you're looking for doesn't exist or has been moved.",
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
    <div class="bg-jet text-text-primary flex min-h-screen items-center justify-center px-6">
        <div class="text-center">
            <p class="text-primary text-8xl font-extrabold tracking-tight">404</p>
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
    </div>
</template>
