const toasts = ref([]);

export function useToast() {
	function add(message, type = 'success', duration = 6000) {
		const id = crypto.randomUUID();
		toasts.value.push({ id, message, type });

		if (duration > 0) setTimeout(() => remove(id), duration);
		return id;
	}

	function remove(id) {
		toasts.value = toasts.value.filter((t) => t.id !== id);
	}

	return {
		toasts,
		add,
		remove,
		success: (message, duration) => add(message, 'success', duration),
		error: (message, duration) => add(message, 'error', duration),
	};
}
