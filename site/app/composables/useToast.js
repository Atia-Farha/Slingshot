let toastId = 0;

const toasts = ref([]);

export function useToast() {
    function add(message, type = "success", duration = 4000) {
        const id = ++toastId;
        toasts.value.push({ id, message, type });
        if (duration > 0) {
            setTimeout(() => remove(id), duration);
        }
        return id;
    }

    function remove(id) {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    }

    function success(message, duration) {
        return add(message, "success", duration);
    }

    function error(message, duration) {
        return add(message, "error", duration);
    }

    return { toasts, add, remove, success, error };
}
