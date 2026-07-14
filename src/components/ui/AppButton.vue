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
        class="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        :class="{
            'border-primary/60 bg-primary focus-visible:ring-primary focus-visible:ring-offset-jet text-black shadow-[0_0_20px_rgba(20,216,212,0.2)] hover:bg-[#0fc4c0] hover:shadow-[0_0_28px_rgba(20,216,212,0.3)] active:scale-[0.98]':
                variant === 'primary',
            'focus-visible:ring-offset-jet border-white/8 bg-white/5 text-zinc-100 hover:border-white/[0.14] hover:bg-white/8 focus-visible:ring-white/20 active:scale-[0.98]':
                variant === 'secondary',
            'border-danger/30 bg-danger/10 hover:border-danger/40 hover:bg-danger/15 focus-visible:ring-danger/40 focus-visible:ring-offset-jet text-red-300 active:scale-[0.98]':
                variant === 'danger',
            'focus-visible:ring-offset-jet border-transparent bg-transparent text-zinc-400 hover:bg-white/6 hover:text-zinc-100 focus-visible:ring-white/20 active:scale-[0.98]':
                variant === 'ghost',
        }"
    >
        <slot />
    </button>
</template>
