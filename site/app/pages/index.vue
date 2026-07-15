<script setup>
const siteUrl = "https://sling-shot.pages.dev";

useSeoMeta({
    title: "Slingshot | One-Click Dev Environments",
    description:
        "Open your editor, terminals, browser tabs, and dev servers with one click. Free, open source, cross-platform dev environment launcher.",
    ogTitle: "Slingshot — One-Click Dev Environments",
    ogDescription:
        "Open your editor, terminals, browser tabs, and dev servers with one click. Free, open source, cross-platform.",
    ogUrl: siteUrl,
    twitterTitle: "Slingshot — One-Click Dev Environments",
    twitterDescription:
        "Open your editor, terminals, browser tabs, and dev servers with one click. Free, open source, cross-platform.",
    canonical: siteUrl,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Slingshot",
                url: siteUrl,
                description:
                    "One-click dev environment launcher for developers.",
                author: {
                    "@type": "Organization",
                    name: "Slingshot",
                    url: siteUrl,
                },
            }),
        },
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Slingshot",
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                sameAs: ["https://github.com/Atia-Farha/Slingshot"],
            }),
        },
    ],
});
</script>

<template>
    <div>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SetupSection />
        <CtaSection />
    </div>
</template>
