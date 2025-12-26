<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { appearanceState, changeThemePreset, resetToThemeDefault } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import ResetThemeModal from '$lib/components/modals/ResetThemeModal.svelte';
	import type { ThemePreset } from '$lib/types';

	let themes: ThemePreset[] = [];
	let loading = true;
	let selecting = false;
	let selectingThemeKey: string | null = null;
	let activeTab = 'Classic';

	// Reset modal state
	let showResetModal = false;
	let resetting = false;

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

	// Check if has customizations
	$: hasCustomizations = Object.keys($appearanceState.overrides || {}).length > 0;
	$: themeName = $appearance?.theme?.name || 'Default';

	async function selectTheme(preset: ThemePreset) {
		if (selecting) return;

		// If clicking current theme and has customizations, show reset modal
		if (preset.key === $appearanceState.themeKey && hasCustomizations) {
			showResetModal = true;
			return;
		}

		selecting = true;
		selectingThemeKey = preset.key;
		try {
			await changeThemePreset(preset.key);
		} catch (e) {
			console.error('[ThemeSection] Failed to change theme:', e);
		} finally {
			selecting = false;
			selectingThemeKey = null;
		}
	}

	async function handleResetConfirm() {
		resetting = true;
		try {
			await resetToThemeDefault();
			showResetModal = false;
		} catch (e) {
			console.error('Failed to reset theme:', e);
			alert('Failed to reset theme. Please try again.');
		} finally {
			resetting = false;
		}
	}
	
	// Helper: Convert bg token to CSS value
	function getBgStyle(preset: ThemePreset): string {
		const bgToken = preset.config?.tokens?.bg;
		if (!bgToken) return '#ffffff';
		
		if (bgToken.type === 'color') {
			return bgToken.value as string;
		} else if (bgToken.type === 'gradient') {
			const grad = bgToken.value as { from: string; to: string; angle: number };
			return `linear-gradient(${grad.angle}deg, ${grad.from}, ${grad.to})`;
		}
		return '#ffffff';
	}

	// Check if current preset is selected - fallback to appearance.theme.key
	$: currentThemeKey = $appearanceState.themeKey || $appearance?.theme?.key;
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
				<!-- Custom Theme Card (show when has customization) -->
				{#if hasCustomizations}
					<button
						class="flex-shrink-0 w-32 rounded-xl overflow-hidden border-2 border-purple-500 ring-2 ring-purple-200 transition-all"
					>
						<!-- Preview -->
						<div class="h-40 p-3 flex flex-col relative bg-gradient-to-br from-purple-50 to-pink-50">
							<!-- Custom badge -->
							<div class="absolute top-2 right-2 bg-purple-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
								CUSTOM
							</div>
							
							<!-- Icon -->
							<div class="flex-1 flex items-center justify-center">
								<svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
							</div>
							<div class="text-[10px] font-medium text-center text-purple-900">Customized</div>
						</div>
						<!-- Name -->
						<div class="py-2 px-3 bg-white border-t border-purple-200">
							<p class="text-xs font-bold text-purple-900 truncate">Custom Theme</p>
						</div>
					</button>
				{/if}

				<!-- Theme Presets -->
				{#each themes as preset}
					{@const isSelected = currentThemeKey === preset.key && !hasCustomizations}
					<button
						on:click={() => selectTheme(preset)}
						disabled={selecting}
						class="flex-shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed {isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}"
					>
						<!-- Preview -->
						<div 
							class="h-40 p-3 flex flex-col relative"
							style="background: {getBgStyle(preset)}; color: {preset.config.tokens.text};"
						>
							<!-- Loading overlay -->
							{#if selecting && selectingThemeKey === preset.key}
								<div class="absolute inset-0 bg-white/50 flex items-center justify-center">
									<div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
								</div>
							{/if}

							<!-- Mini avatar -->
							<div 
								class="w-8 h-8 rounded-full mx-auto mb-2"
								style="background: {preset.config.tokens.primary};"
							></div>
							<div class="text-[10px] font-medium text-center mb-3 truncate">Preview</div>
							<!-- Mini links -->
							<div class="space-y-1.5">
								{#each [1, 2, 3] as _}
									<div 
										class="h-4 rounded"
										style="background: {preset.config.tokens.primary};"
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

<!-- Reset Theme Modal -->
{#if showResetModal}
	<ResetThemeModal
		themeName={themeName}
		loading={resetting}
		on:confirm={handleResetConfirm}
		on:cancel={() => showResetModal = false}
	/>
{/if}
