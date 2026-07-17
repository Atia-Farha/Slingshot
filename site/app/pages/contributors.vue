<script setup>
const {
    public: { siteUrl },
} = useRuntimeConfig();

useSeoMeta({
    title: "Contributors | Slingshot",
    description:
        "Meet the people who make Slingshot possible. Every contribution matters.",
    ogTitle: "Slingshot Contributors",
    ogDescription:
        "Meet the people who make Slingshot possible. Every contribution matters.",
    ogUrl: `${siteUrl}/contributors`,
    twitterTitle: "Slingshot Contributors",
    twitterDescription:
        "Meet the people who make Slingshot possible. Every contribution matters.",
    canonical: `${siteUrl}/contributors`,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: siteUrl,
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Contributors",
                        item: `${siteUrl}/contributors`,
                    },
                ],
            }),
        },
    ],
});

const { data: contributors } = await useFetch(
    "https://api.github.com/repos/atia-farha/slingshot/contributors?per_page=100",
);

const searchQuery = ref("");
const currentPage = ref(1);
const perPage = 24;

const filteredContributors = computed(() => {
    if (!contributors.value) return [];
    return contributors.value.filter(
        (c) =>
            c.login !== "Atia-Farha" &&
            c.login.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
});

const totalPages = computed(() =>
    Math.ceil(filteredContributors.value.length / perPage),
);

const paginatedContributors = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    return filteredContributors.value.slice(start, start + perPage);
});

const goToPage = (page) => {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
};

watch(searchQuery, () => {
    currentPage.value = 1;
});
</script>

<template>
    <div>
        <!-- Hero -->
        <section
            aria-labelledby="contributors-hero-heading"
            class="relative overflow-hidden pt-32 pb-20"
        >
            <div class="absolute inset-0">
                <div
                    class="absolute inset-0"
                    style="
                        background: radial-gradient(
                            ellipse 60% 50% at 50% 30%,
                            rgba(20, 216, 212, 0.06) 0%,
                            transparent 70%
                        );
                    "
                ></div>
                <div class="grid-overlay absolute inset-0 opacity-30"></div>
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

            <div class="relative mx-auto max-w-4xl px-6 text-center">
                <h1
                    id="feedback-hero-heading"
                    class="animate-fade-in-up text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
                >
                    <span class="text-primary">Contributors</span>
                </h1>

                <p
                    class="animate-fade-in-up animate-delay-100 text-text-secondary mx-auto mt-6 max-w-xl text-lg leading-relaxed"
                >
                    Slingshot is built by amazing people from around the world.
                    Every contribution matters.
                </p>
            </div>
        </section>

        <!-- Creator + Search + Stats -->
        <section class="relative pb-4">
            <div class="mx-auto max-w-6xl px-6">
                <div
                    class="flex flex-col items-center gap-10 md:flex-row md:justify-between"
                >
                    <!-- Creator -->
                    <a
                        href="https://github.com/Atia-Farha"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group flex items-center gap-4"
                    >
                        <img
                            src="https://avatars.githubusercontent.com/u/119663174?v=4"
                            alt="Atia Farha"
                            class="group-hover:ring-primary/30 h-16 w-16 rounded-full ring-2 ring-white/10 transition-all duration-300"
                            loading="lazy"
                            width="64"
                            height="64"
                        />
                        <div>
                            <p
                                class="text-text-primary group-hover:text-primary font-semibold transition-colors duration-300"
                            >
                                Atia Farha
                            </p>
                            <p class="text-text-muted text-sm">
                                Creator & Maintainer
                            </p>
                        </div>
                    </a>

                    <!-- Search -->
                    <div class="w-full max-w-sm">
                        <div class="relative">
                            <svg
                                class="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search top 100 contributors..."
                                class="app-input w-full rounded-lg py-2.5 pr-4 pl-10 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contributors grid -->
        <section
            aria-labelledby="contributors-list-heading"
            class="relative py-12"
        >
            <h2 id="contributors-list-heading" class="sr-only">
                All Contributors
            </h2>
            <div class="mx-auto max-w-6xl px-6">
                <!-- Showing X of Y -->
                <div
                    v-if="contributors && contributors.length"
                    class="mb-12 flex flex-col gap-3 text-center sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p class="text-text-primary text-lg">
                        <template v-if="searchQuery">
                            {{ filteredContributors.length }} result{{
                                filteredContributors.length !== 1 ? "s" : ""
                            }}
                        </template>
                        <template v-else-if="filteredContributors.length > 0">
                            Top {{ filteredContributors.length }} contributor{{
                                filteredContributors.length !== 1 ? "s" : ""
                            }}
                        </template>
                        <template v-else> No other contributors yet! </template>
                    </p>
                    <a
                        href="https://github.com/atia-farha/Slingshot/graphs/contributors"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary hover:text-primary/80 text-sm transition-colors duration-300"
                    >
                        View all on GitHub →
                    </a>
                </div>

                <!-- Grid -->
                <div
                    v-if="paginatedContributors.length"
                    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                >
                    <a
                        v-for="contributor in paginatedContributors"
                        :key="contributor.id"
                        :href="contributor.html_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="section-card group hover:border-primary/20 relative overflow-hidden p-5 text-center transition-all duration-300 hover:shadow-[0_0_40px_-15px_rgba(20,216,212,0.15)]"
                    >
                        <img
                            :src="contributor.avatar_url"
                            :alt="contributor.login"
                            class="group-hover:ring-primary/30 mx-auto mb-3 h-16 w-16 rounded-full ring-2 ring-white/10 transition-all duration-300"
                            loading="lazy"
                            width="64"
                            height="64"
                        />
                        <p
                            class="text-text-primary truncate text-sm font-medium"
                        >
                            {{ contributor.login }}
                        </p>
                        <p class="text-text-muted mt-1 text-xs">
                            {{ contributor.contributions }} commit{{
                                contributor.contributions !== 1 ? "s" : ""
                            }}
                        </p>
                    </a>
                </div>

                <!-- Empty state -->
                <div v-else class="py-16 text-center">
                    <p class="text-text-muted text-lg">
                        {{
                            searchQuery
                                ? "No one found — but there's always room for new faces."
                                : "Every project starts with one person. Ready to be the second?"
                        }}
                    </p>
                </div>

                <!-- Pagination -->
                <div
                    v-if="totalPages > 1"
                    class="mt-10 flex items-center justify-center gap-2"
                >
                    <button
                        :disabled="currentPage === 1"
                        class="section-card hover:border-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30"
                        @click="goToPage(currentPage - 1)"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <template v-for="page in totalPages" :key="page">
                        <button
                            v-if="
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                    page <= currentPage + 1)
                            "
                            :class="[
                                'section-card hover:border-primary/20 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-300',
                                page === currentPage
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : 'text-text-secondary',
                            ]"
                            @click="goToPage(page)"
                        >
                            {{ page }}
                        </button>
                        <span
                            v-else-if="
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            "
                            class="text-text-muted px-1"
                        >
                            ...
                        </span>
                    </template>

                    <button
                        :disabled="currentPage === totalPages"
                        class="section-card hover:border-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30"
                        @click="goToPage(currentPage + 1)"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section
            aria-labelledby="contributors-cta-heading"
            class="relative overflow-hidden py-38"
        >
            <div class="absolute inset-0">
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
                <h2
                    id="contributors-cta-heading"
                    class="text-3xl tracking-tight sm:text-4xl"
                >
                    Want to contribute?
                </h2>
                <p class="text-text-secondary mt-4 text-base leading-relaxed">
                    Slingshot is open source and welcomes contributions. Check
                    out the repository and start contributing today.
                </p>
                <div
                    class="mt-10 flex flex-col items-center justify-center gap-4"
                >
                    <a
                        href="https://github.com/Atia-Farha/Slingshot"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="cta-glow border-primary/60 bg-primary inline-flex h-12 items-center gap-2.5 rounded-lg border px-7 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] active:scale-[0.98]"
                    >
                        View on GitHub
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.sr-only-heading {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>
