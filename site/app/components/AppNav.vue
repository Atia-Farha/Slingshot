<script setup>
const isMobileMenuOpen = ref(false);
const hamburgerRef = ref(null);
const mobileMenuRef = ref(null);

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "How to Setup", href: "#how-to-setup" },
    { label: "About", href: "/about" },
];

function toggleMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMenu() {
    isMobileMenuOpen.value = false;
    nextTick(() => hamburgerRef.value?.focus());
}

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(e) {
    if (!isMobileMenuOpen.value || e.key !== "Tab") return;
    const menu = mobileMenuRef.value;
    if (!menu) return;
    const focusable = menu.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}

function handleKeydown(e) {
    if (e.key === "Escape" && isMobileMenuOpen.value) {
        closeMenu();
    }
    trapFocus(e);
}

onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
    <nav
        aria-label="Main navigation"
        class="fixed top-0 z-50 w-full px-5 pt-5 sm:px-8"
    >
        <div
            class="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/6 bg-[#0a0a0c]/80 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
        >
            <!-- Brand -->
            <NuxtLink to="/" class="flex items-center gap-1">
                <img src="/logo.svg" alt="Slingshot" class="h-7 w-7" />
                <span class="font-display text-[15px] tracking-wide"
                    >Slingshot</span
                >
            </NuxtLink>

            <!-- Links — center (desktop) -->
            <ul class="hidden items-center gap-1 md:flex" role="list">
                <li v-for="link in navLinks" :key="link.label">
                    <NuxtLink :to="link.href" class="nav-link">
                        {{ link.label }}
                    </NuxtLink>
                </li>
            </ul>

            <!-- Right side: CTA + Hamburger -->
            <div class="flex items-center gap-2">
                <NuxtLink
                    to="/download"
                    class="bg-primary hidden h-9 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] hover:shadow-[0_0_20px_rgba(20,216,212,0.3)] active:scale-[0.97] md:inline-flex"
                >
                    Download
                </NuxtLink>

                <!-- Hamburger button — mobile only -->
                <button
                    ref="hamburgerRef"
                    class="text-text-secondary hover:text-text-primary flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-300 md:hidden"
                    aria-label="Toggle menu"
                    :aria-expanded="isMobileMenuOpen"
                    @click="toggleMenu"
                >
                    <div
                        class="hamburger"
                        :class="{ active: isMobileMenuOpen }"
                        aria-hidden="true"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>
        </div>

        <!-- Mobile menu dropdown -->
        <Transition name="mobile-menu">
            <div
                v-if="isMobileMenuOpen"
                ref="mobileMenuRef"
                role="menu"
                aria-label="Mobile navigation"
                class="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0c]/95 text-center backdrop-blur-2xl md:hidden"
                @keydown.esc="closeMenu"
            >
                <div class="flex flex-col items-center p-3">
                    <NuxtLink
                        v-for="link in navLinks"
                        :key="link.label"
                        :to="link.href"
                        role="menuitem"
                        class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors duration-300 hover:bg-white/4"
                        @click="closeMenu"
                    >
                        {{ link.label }}
                    </NuxtLink>
                    <div class="mt-1 w-full border-t border-white/6 pt-3">
                        <NuxtLink
                            to="/download"
                            role="menuitem"
                            class="bg-primary flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-[#0fc4c0] hover:shadow-[0_0_20px_rgba(20,216,212,0.3)] active:scale-[0.97]"
                            @click="closeMenu"
                        >
                            Download
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </Transition>
    </nav>
</template>
