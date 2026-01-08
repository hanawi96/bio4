import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

interface ToastOptions {
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	let idCounter = 0;

	function generateId(): string {
		return `toast-${Date.now()}-${idCounter++}`;
	}

	function addToast(type: ToastType, message: string, options: ToastOptions = {}) {
		const id = generateId();
		const duration = options.duration ?? getDefaultDuration(type);

		const toast: Toast = {
			id,
			type,
			message,
			duration,
			action: options.action
		};

		update(toasts => {
			// Limit to max 5 toasts
			const newToasts = [...toasts, toast];
			return newToasts.slice(-5);
		});

		return id;
	}

	function getDefaultDuration(type: ToastType): number {
		switch (type) {
			case 'success':
			case 'info':
				return 3000;
			case 'warning':
				return 5000;
			case 'error':
				return 7000;
			default:
				return 3000;
		}
	}

	return {
		subscribe,
		success: (message: string, options?: ToastOptions) => addToast('success', message, options),
		error: (message: string, options?: ToastOptions) => addToast('error', message, options),
		warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
		info: (message: string, options?: ToastOptions) => addToast('info', message, options),
		dismiss: (id: string) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		dismissAll: () => {
			update(() => []);
		}
	};
}

export const toast = createToastStore();
