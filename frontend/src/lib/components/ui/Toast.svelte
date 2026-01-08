<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import type { Toast } from '$lib/stores/toast';

	export let toast: Toast;
	export let onDismiss: () => void;

	let progress = 100;
	let isPaused = false;
	let startTime: number;
	let remainingTime: number;
	let animationFrame: number;

	onMount(() => {
		startTime = Date.now();
		remainingTime = toast.duration;
		animate();

		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	});

	function animate() {
		if (isPaused) return;

		const elapsed = Date.now() - startTime;
		remainingTime = toast.duration - elapsed;
		progress = (remainingTime / toast.duration) * 100;

		if (remainingTime <= 0) {
			onDismiss();
		} else {
			animationFrame = requestAnimationFrame(animate);
		}
	}

	function handleMouseEnter() {
		isPaused = true;
		if (animationFrame) cancelAnimationFrame(animationFrame);
	}

	function handleMouseLeave() {
		isPaused = false;
		startTime = Date.now();
		animate();
	}

	function handleAction() {
		if (toast.action?.onClick) {
			toast.action.onClick();
			onDismiss();
		}
	}

	// Icon SVG paths
	const icons = {
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};

	// Colors
	const colors = {
		success: {
			bg: 'bg-green-50',
			border: 'border-green-200',
			icon: 'text-green-600',
			text: 'text-green-900',
			progress: 'bg-green-500'
		},
		error: {
			bg: 'bg-red-50',
			border: 'border-red-200',
			icon: 'text-red-600',
			text: 'text-red-900',
			progress: 'bg-red-500'
		},
		warning: {
			bg: 'bg-orange-50',
			border: 'border-orange-200',
			icon: 'text-orange-600',
			text: 'text-orange-900',
			progress: 'bg-orange-500'
		},
		info: {
			bg: 'bg-blue-50',
			border: 'border-blue-200',
			icon: 'text-blue-600',
			text: 'text-blue-900',
			progress: 'bg-blue-500'
		}
	};

	$: colorScheme = colors[toast.type];
</script>

<div
	role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
	aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
	class="toast-item relative w-full max-w-sm {colorScheme.bg} border {colorScheme.border} rounded-xl shadow-lg overflow-hidden"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	in:fly={{ y: 20, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Content -->
	<div class="flex items-start gap-3 p-4">
		<!-- Icon -->
		<div class="flex-shrink-0 {colorScheme.icon}">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d={icons[toast.type]} />
			</svg>
		</div>

		<!-- Message -->
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium {colorScheme.text} leading-snug">
				{toast.message}
			</p>
		</div>

		<!-- Action Button -->
		{#if toast.action}
			<button
				on:click={handleAction}
				class="flex-shrink-0 text-sm font-medium {colorScheme.icon} hover:underline"
			>
				{toast.action.label}
			</button>
		{/if}

		<!-- Close Button -->
		<button
			on:click={onDismiss}
			class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
			aria-label="Dismiss"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Progress Bar -->
	<div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
		<div
			class="{colorScheme.progress} h-full transition-all duration-100 ease-linear"
			style="width: {progress}%"
		/>
	</div>
</div>

<style>
	.toast-item {
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
</style>
