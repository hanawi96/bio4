<script lang="ts">
	import { onMount } from 'svelte';
	import { theme, DEFAULT_THEME, applyCSSVariables } from '$lib/stores/page';

	let wrapperElement: HTMLElement;

	// Apply CSS variables directly to DOM when theme changes
	$: if (wrapperElement && $theme) {
		applyCSSVariables(wrapperElement, $theme);
	}

	// Initialize with default theme on mount
	onMount(() => {
		if (wrapperElement) {
			applyCSSVariables(wrapperElement, $theme || DEFAULT_THEME);
		}
	});
</script>

<div bind:this={wrapperElement} class="theme-wrapper min-h-screen">
	<slot />
</div>

<style>
	.theme-wrapper {
		background: var(--bg-color);
		color: var(--text-color);
		font-family: var(--font-family);
	}
</style>
