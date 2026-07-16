<template>
    <footer class="relative overflow-hidden" aria-label="Site footer">
        <div class="mx-auto max-w-6xl px-6 pt-16 pb-20">
            <div class="flex flex-col justify-between gap-12 sm:flex-row">
                <div class="sm:col-span-1">
                    <NuxtLink to="/" class="flex items-center gap-1">
                        <img
                            src="/logo.svg"
                            alt="Slingshot logo"
                            class="ml-[-0.4rem] h-7 w-7"
                            loading="lazy"
                            width="28"
                            height="28"
                        />
                        <span
                            class="text-primary font-display text-[15px] tracking-wide"
                            >Slingshot</span
                        >
                    </NuxtLink>

                    <p class="text-sm leading-relaxed">
                        Launch your full dev environment with one click.
                    </p>

                    <div class="mt-6 flex items-center gap-4">
                        <a
                            href="https://github.com/Atia-Farha/Slingshot"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            class="text-text-muted hover:text-primary/70 transition-colors duration-300"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                                />
                            </svg>
                        </a>
                    </div>
                </div>

                <div class="flex flex-col gap-12 sm:flex-row sm:gap-24">
                    <div>
                        <h3
                            class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                        >
                            Product
                        </h3>
                        <ul class="space-y-2.5" role="list">
                            <li>
                                <NuxtLink
                                    to="/download"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    Download</NuxtLink
                                >
                            </li>
                            <li>
                                <NuxtLink
                                    to="/#features"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    Features</NuxtLink
                                >
                            </li>
                            <li>
                                <NuxtLink
                                    to="/#how-it-works"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    How it works</NuxtLink
                                >
                            </li>
                            <li>
                                <NuxtLink
                                    to="/#how-to-setup"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    How to setup</NuxtLink
                                >
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3
                            class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                        >
                            Community
                        </h3>
                        <ul class="space-y-2.5" role="list">
                            <li>
                                <NuxtLink
                                    to="/about"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    About</NuxtLink
                                >
                            </li>
                            <li>
                                <NuxtLink
                                    to="/feedback"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    Feedback</NuxtLink
                                >
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3
                            class="text-text-primary mb-4 text-xs font-semibold tracking-wider uppercase"
                        >
                            Legal
                        </h3>
                        <ul class="space-y-2.5" role="list">
                            <li>
                                <span
                                    class="text-text-muted text-sm capitalize"
                                    aria-disabled="true"
                                    >License</span
                                >
                            </li>
                            <li>
                                <NuxtLink
                                    to="/privacy"
                                    class="text-text-secondary hover:text-text-primary text-sm capitalize transition-colors duration-300"
                                >
                                    Privacy</NuxtLink
                                >
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Decorative watermark — hidden from assistive technology -->
        <div class="overflow-hidden" aria-hidden="true">
            <p
                class="text-primary/75 font-display text-center leading-[0.85] tracking-tight select-none"
                style="
                    font-size: clamp(0rem, 26.5vw, 16rem);
                    padding: 0.5rem 0 0 0;
                "
            >
                SLINGSHOT
            </p>
        </div>

        <div
            class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/4 px-6 py-5 sm:flex-row"
        >
            <span class="text-text-muted text-xs"
                >&copy; {{ new Date().getFullYear() }} Slingshot</span
            >

            <p class="text-text-muted text-xs">
                Developed by
                <a
                    href="https://atia-farha.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer me"
                    class="text-primary/60 hover:text-primary transition-colors duration-300"
                    >Atia Farha</a
                >
            </p>
        </div>
    </footer>
</template>
