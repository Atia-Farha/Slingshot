// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: false },

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
                        "Open your full dev environment — editor, terminals, browser tabs — with one click instead of repeating the same setup every day.",
                },
                { name: "theme-color", content: "#050505" },
            ],
            link: [
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
                },
            ],
        },
    },

    future: {
        compatibilityVersion: 4,
    },
});
