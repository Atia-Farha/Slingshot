<script setup>
defineProps({
    variant: {
        type: String,
        default: "secondary",
        validator: (value) =>
            ["primary", "secondary", "danger", "ghost"].includes(value),
    },
    type: {
        type: String,
        default: "button",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        class="focus-visible:ring-primary focus-visible:ring-offset-jet inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        :class="{
            'border-primary bg-primary hover:bg-primary/90 text-black':
                variant === 'primary',
            'border-white/10 bg-white/[0.06] text-zinc-100 hover:bg-white/10':
                variant === 'secondary',
            'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20':
                variant === 'danger',
            'border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100':
                variant === 'ghost',
        }"
    >
        <slot />
    </button>
</template>
