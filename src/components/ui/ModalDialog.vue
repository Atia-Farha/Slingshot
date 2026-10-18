<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue';

const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: '',
	},
	preventClose: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['close']);
const panel = ref(null);
const titleId = useId();
const descriptionId = useId();

function focusableElements() {
	if (!panel.value) return [];
	return Array.from(panel.value.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('inert'));
}

function requestClose() {
	if (!props.preventClose) {
		emit('close');
	}
}

function handleKeydown(event) {
	if (event.key === 'Escape') {
		requestClose();
		return;
	}
	if (event.key === 'Tab') {
		const focusables = focusableElements();
		if (focusables.length === 0) {
			event.preventDefault();
			return;
		}
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;
		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
}

let previouslyFocused = null;
let savedBodyOverflow = '';
let savedBodyPaddingRight = '';

function getScrollbarWidth() {
	if (typeof window === 'undefined') return 0;
	return window.innerWidth - document.documentElement.clientWidth;
}

function lockBodyScroll() {
	if (typeof document === 'undefined') return;
	const scrollbarWidth = getScrollbarWidth();
	savedBodyOverflow = document.body.style.overflow;
	savedBodyPaddingRight = document.body.style.paddingRight;
	document.body.style.overflow = 'hidden';
	if (scrollbarWidth > 0) {
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}
}

function unlockBodyScroll() {
	if (typeof document === 'undefined') return;
	document.body.style.overflow = savedBodyOverflow;
	document.body.style.paddingRight = savedBodyPaddingRight;
}

onMounted(async () => {
	previouslyFocused = document.activeElement;
	lockBodyScroll();
	window.addEventListener('keydown', handleKeydown);
	await nextTick();
	panel.value?.querySelector('input, textarea, button, a[href]')?.focus();
});

onBeforeUnmount(() => {
	unlockBodyScroll();
	window.removeEventListener('keydown', handleKeydown);

	if (previouslyFocused && typeof previouslyFocused.focus === 'function' && document.contains(previouslyFocused)) {
		previouslyFocused.focus();
	}
});

defineExpose({
	_focusableElements: focusableElements,
	_setPanelForTest(value) {
		panel.value = value;
	},
	_getScrollbarWidthForTest: getScrollbarWidth,
	_lockBodyScrollForTest: lockBodyScroll,
	_unlockBodyScrollForTest: unlockBodyScroll,
});
</script>

<template>
	<Teleport to="body">
		<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" role="presentation" @mousedown.self="requestClose">
			<section ref="panel" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="description ? descriptionId : undefined" class="modal-panel bg-panel w-full max-w-lg overflow-hidden rounded-2xl border border-white/8 shadow-2xl shadow-black/60">
				<header class="border-b border-white/6 px-6 py-5">
					<h2 :id="titleId" class="text-text-primary text-base font-semibold tracking-tight">
						{{ title }}
					</h2>
					<p v-if="description" :id="descriptionId" class="text-text-secondary mt-1 text-sm">
						{{ description }}
					</p>
				</header>
				<slot />
			</section>
		</div>
	</Teleport>
</template>
