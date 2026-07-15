// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: false },

    runtimeConfig: {
        public: {
            recaptchaSiteKey: "",
        },
    },

    css: ["~/assets/css/main.css"],

    vite: {
        plugins: [tailwindcss()],
    },

    app: {
        head: {
            title: "Slingshot | One-click dev environments",
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
            ],
            link: [
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
                },
            ],
            script: [
                {
                    src: "https://www.google.com/recaptcha/api.js",
                    defer: true,
                },
            ],
        },
    },

    nitro: {
        preset: "cloudflare_pages",
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
                        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com; frame-src https://www.google.com;",
                },
            },
        },
    },

    future: {
        compatibilityVersion: 4,
    },
});
