<script lang="ts">
	import { page, theme } from '$lib/stores/page';
	import { api } from '$lib/api.client';
	import { onMount } from 'svelte';
	import type { ThemePreset } from '$lib/types';

	let themes: ThemePreset[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const result = await api.getThemes();
			themes = result.themes;
		} catch (e) {
			console.error('Failed to load themes:', e);
		} finally {
			loading = false;
		}
	});

	function selectPreset(preset: ThemePreset) {
		page.update(p => p ? { ...p, theme_preset_key: preset.key } : p);
		theme.set(preset.config);
	}
</script>

<div class="space-y-4">
	<h3 class="font-semibold">Choose Theme</h3>
	
	{#if loading}
		<p class="text-gray-500">Loading themes...</p>
	{:else}
		<div class="grid grid-cols-2 gap-4">
			{#each themes as preset}
				<button
					on:click={() => selectPreset(preset)}
					class="p-4 border rounded-lg hover:border-blue-500 transition text-left {$page?.theme_preset_key === preset.key ? 'border-blue-500 ring-2 ring-blue-200' : ''}"
				>
					<div 
						class="aspect-video rounded mb-2" 
						style="background: {preset.config.backgroundColor}"
					></div>
					<p class="text-sm font-medium">{preset.name}</p>
				</button>
			{/each}
		</div>
	{/if}
</div>
