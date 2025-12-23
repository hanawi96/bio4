<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { page } from '$lib/stores/page';
	import type { ThemePreset } from '$lib/types';

	const username = 'demo';
	let themes: ThemePreset[] = [];
	let loading = true;
	let selecting = false;
	let activeTab = 'Classic';

	const tabs = ['Classic', 'Vibrant', 'Cozy', 'Bold'];

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

	async function selectTheme(preset: ThemePreset) {
		if (selecting) return;
		selecting = true;

		try {
			console.log('[ThemeSection] Selecting theme:', preset.key);
			
			// Update store immediately for instant preview
			page.update(p => {
				if (!p) return p;
				
				// RESET ALL CUSTOMIZATIONS - use ONLY theme preset
				// Set all custom fields to null to delete them
				const newAppearance = {
					themeKey: preset.key,
					customTheme: null,   // Delete custom theme (includes backgrounds, backgroundVideo)
					headerStyle: null,   // Delete header customization
					blockStyle: null     // Delete block customization
				};
				
				console.log('[ThemeSection] Reset to theme preset:', preset.key);
				console.log('[ThemeSection] Cleared appearance:', newAppearance);
				
				return {
					...p,
					theme_preset_key: preset.key,
					draft_appearance: JSON.stringify(newAppearance)
				};
			});

			// Save to API - MUST save both theme_preset_key AND draft_appearance
			const currentPage = $page;
			if (currentPage) {
				await api.saveDraft(username, {
					theme_preset_key: preset.key,
					draft_appearance: currentPage.draft_appearance  // Save cleaned appearance
				});
			}
			
			console.log('[ThemeSection] Theme saved successfully - all customizations reset');
		} catch (e) {
			console.error('[ThemeSection] Failed to save theme:', e);
		} finally {
			selecting = false;
		}
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Theme</h2>
	</div>
	
	<div class="p-6">
		<!-- Tabs -->
		<div class="flex gap-2 mb-6">
			{#each tabs as tab}
				<button 
					class="px-4 py-2 text-sm font-medium rounded-full transition {activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					on:click={() => activeTab = tab}
				>
					{tab}
				</button>
			{/each}
		</div>

		<!-- Theme Grid -->
		{#if loading}
			<div class="flex gap-4">
				{#each [1, 2, 3, 4] as _}
					<div class="w-32 h-48 bg-gray-100 rounded-xl animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="flex gap-4 overflow-x-auto pb-2">
				{#each themes as preset}
					<button
						on:click={() => selectTheme(preset)}
						disabled={selecting}
						class="flex-shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed {$page?.theme_preset_key === preset.key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}"
					>
						<!-- Preview -->
						<div 
							class="h-40 p-3 flex flex-col relative"
							style="background: {preset.config.backgroundColor}; color: {preset.config.textColor};"
						>
							<!-- Loading overlay -->
							{#if selecting && $page?.theme_preset_key === preset.key}
								<div class="absolute inset-0 bg-white/50 flex items-center justify-center">
									<div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
								</div>
							{/if}

							<!-- Mini avatar -->
							<div 
								class="w-8 h-8 rounded-full mx-auto mb-2"
								style="background: {preset.config.primaryColor};"
							></div>
							<div class="text-[10px] font-medium text-center mb-3 truncate">Preview</div>
							<!-- Mini links -->
							<div class="space-y-1.5">
								{#each [1, 2, 3] as _}
									<div 
										class="h-4 rounded"
										style="background: {preset.config.primaryColor};"
									></div>
								{/each}
							</div>
						</div>
						<!-- Name -->
						<div class="py-2 px-3 bg-white border-t border-gray-100">
							<p class="text-xs font-medium text-gray-900 truncate">{preset.name}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</section>
