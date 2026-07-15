<template>
    <div class="bg-jet text-text-primary min-h-screen">
        <a
            href="#main-content"
            class="focus:bg-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black focus:outline-none"
        >
            Skip to content
        </a>
        <AppNav />
        <main id="main-content">
            <slot />
        </main>
        <AppFooter />
        <ToastRegion />
    </div>
</template>
