// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const siteUrl = "https://sling-shot.pages.dev";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: false },
    telemetry: false,

    runtimeConfig: {
        public: {},
    },

    css: ["~/assets/css/main.css"],

    vite: {
        plugins: [tailwindcss()],
    },

    modules: ["@nuxtjs/sitemap"],

    site: {
        url: siteUrl,
    },

    app: {
        head: {
            title: "Slingshot | One-click dev environments",
            htmlAttrs: { lang: "en" },
            meta: [
                {
                    name: "description",
                    content:
                        "Open your full dev environment — editor, terminals, browser tabs — with one click instead of repeating the same setup for every project.",
                },
                { name: "theme-color", content: "#050505" },
                {
                    name: "referrer",
                    content: "strict-origin-when-cross-origin",
                },
                // Open Graph
                { property: "og:type", content: "website" },
                { property: "og:site_name", content: "Slingshot" },
                {
                    property: "og:title",
                    content: "Slingshot | One-click dev environments",
                },
                {
                    property: "og:description",
                    content:
                        "Open your full dev environment — editor, terminals, browser tabs — with one click instead of repeating the same setup for every project.",
                },
                { property: "og:url", content: siteUrl },
                // Twitter
                { name: "twitter:card", content: "summary_large_image" },
                {
                    name: "twitter:title",
                    content: "Slingshot | One-click dev environments",
                },
                {
                    name: "twitter:description",
                    content:
                        "Open your full dev environment — editor, terminals, browser tabs — with one click instead of repeating the same setup for every project.",
                },
            ],
            link: [
                {
                    rel: "preload",
                    href: "/fonts/inter-latin.woff2",
                    as: "font",
                    type: "font/woff2",
                    crossorigin: "",
                },
                {
                    rel: "preload",
                    href: "/fonts/anton-latin.woff2",
                    as: "font",
                    type: "font/woff2",
                    crossorigin: "",
                },
                {
                    rel: "preload",
                    href: "/fonts/jetbrains-mono-latin.woff2",
                    as: "font",
                    type: "font/woff2",
                    crossorigin: "",
                },
            ],
            script: [],
        },
    },

    nitro: {
        preset: "static",
        routeRules: {
            "/**": {
                headers: {
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "DENY",
                    "X-XSS-Protection": "1; mode=block",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "Permissions-Policy":
                        "camera=(), microphone=(), geolocation=(), payment=()",
                    "Content-Security-Policy":
                        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self'; frame-src 'self';",
                },
            },
            "/fonts/**": {
                headers: {
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            },
            "/_nuxt/**": {
                headers: {
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            },
        },
    },

    experimental: {
        renderJsonPayloads: false,
    },

    future: {
        compatibilityVersion: 4,
    },
});
