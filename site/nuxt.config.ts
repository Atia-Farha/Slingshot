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

    sitemap: {
        defaults: {
            lastmod: new Date().toISOString(),
            changefreq: "weekly",
            priority: 0.7,
        },
    },

    app: {
        head: {
            title: "Slingshot | One-click dev environments",
            htmlAttrs: { lang: "en", dir: "ltr" },
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
                {
                    name: "google-site-verification",
                    content: "ombz00eG8vi57xR8pLJFnP4Lc_sEi3PJ7rl-6Nd0EqI",
                },
                {
                    name: "yandex-verification",
                    content: "4bc2c6d27fc6bb5e",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "author",
                    content: "Atia Farha",
                },
                // Open Graph — image-only (title/description/url set per page)
                { property: "og:type", content: "website" },
                { property: "og:site_name", content: "Slingshot" },
                { property: "og:locale", content: "en_US" },
                {
                    property: "og:image",
                    content: `${siteUrl}/og-image.png`,
                },
                {
                    property: "og:image:secure_url",
                    content: `${siteUrl}/og-image.png`,
                },
                {
                    property: "og:image:type",
                    content: "image/png",
                },
                {
                    property: "og:image:width",
                    content: "1200",
                },
                {
                    property: "og:image:height",
                    content: "630",
                },
                {
                    property: "og:image:alt",
                    content: "Slingshot — One-click dev environments",
                },
                // Twitter / X — image-only (title/description set per page)
                { name: "twitter:card", content: "summary_large_image" },
                {
                    name: "twitter:image",
                    content: `${siteUrl}/og-image.png`,
                },
                {
                    name: "twitter:image:alt",
                    content: "Slingshot — One-click dev environments",
                },
                // Pinterest
                {
                    name: "pinterest",
                    content: "nopin",
                },
                // Windows
                {
                    name: "msapplication-TileColor",
                    content: "#050505",
                },
                {
                    name: "msapplication-TileImage",
                    content: `${siteUrl}/favicons/mstile-150x150.png`,
                },
            ],
            link: [
                {
                    rel: "icon",
                    type: "image/x-icon",
                    href: "/favicons/favicon.ico",
                },
                {
                    rel: "icon",
                    type: "image/png",
                    sizes: "16x16",
                    href: "/favicons/favicon-16x16.png",
                },
                {
                    rel: "icon",
                    type: "image/png",
                    sizes: "32x32",
                    href: "/favicons/favicon-32x32.png",
                },
                {
                    rel: "apple-touch-icon",
                    sizes: "180x180",
                    href: "/favicons/apple-touch-icon.png",
                },
                {
                    rel: "mask-icon",
                    href: "/favicons/safari-pinned-tab.svg",
                    color: "#14D8D4",
                },
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
            script: [
                {
                    src: "https://www.clarity.ms/tag/xmytjn7y04",
                    async: true,
                },
                {
                    innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=110772680','ym');ym(110772680,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
                },
            ],
            noscript: [
                {
                    children: '<div><img src="https://mc.yandex.ru/watch/110772680" style="position:absolute; left:-9999px;" alt="" /></div>',
                },
            ],
        },
    },

    nitro: {
        preset: "static",
        routeRules: {
            "/**": {
                headers: {
                    "Strict-Transport-Security":
                        "max-age=63072000; includeSubDomains; preload",
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "DENY",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "Permissions-Policy":
                        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), document-domain=(), encrypted-media=(), picture-in-picture=(), speaker=(), sync-xhr=(self)",
                    "Cross-Origin-Opener-Policy": "same-origin",
                    "Cross-Origin-Resource-Policy": "same-origin",
                    "Content-Security-Policy":
                        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
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
            "/og-image.png": {
                headers: {
                    "Cache-Control":
                        "public, max-age=604800, stale-while-revalidate=86400",
                },
            },
            "/favicons/**": {
                headers: {
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            },
        },
    },

    experimental: {
        renderJsonPayloads: false,
        payloadExtraction: false,
    },

    future: {
        compatibilityVersion: 4,
    },
});
