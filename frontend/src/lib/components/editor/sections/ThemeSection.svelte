<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { appearanceState, changeThemePreset, resetToThemeDefault, hasCustomizations } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import ResetThemeModal from '$lib/components/modals/ResetThemeModal.svelte';
	import type { ThemePreset } from '$lib/types';

	let themes: ThemePreset[] = [];
	let loading = true;
	let selecting = false;
	let selectingThemeKey: string | null = null;
	let currentPage = 0;
	const itemsPerPage = 4;

	// Reset modal state
	let showResetModal = false;
	let resetting = false;

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

	$: themeName = $appearance?.theme?.name || 'Default';

	async function selectTheme(preset: ThemePreset) {
		if (selecting) return;

		// If clicking current theme and has customizations, show reset modal
		if (preset.key === $appearanceState.presetKey && $hasCustomizations) {
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
	
	// Helper: Resolve token reference (supports "ref:tokens.color.gray.50" or "tokens.color.gray.50")
	function resolveTokenValue(preset: ThemePreset, value: any, fallback: string): string {
		if (typeof value !== 'string') return value || fallback;
		
		// Remove "ref:" prefix if exists
		const cleanValue = value.startsWith('ref:') ? value.substring(4) : value;
		
		// Check if it's a token/semantic reference
		if (cleanValue.startsWith('tokens.') || cleanValue.startsWith('semantic.')) {
			const path = cleanValue.split('.');
			const root = path[0]; // 'tokens' or 'semantic'
			const keys = path.slice(1);
			
			let resolved: any = root === 'tokens' ? preset.config.tokens : preset.config.semantic;
			
			for (const key of keys) {
				resolved = resolved?.[key];
				if (resolved === undefined) return fallback;
			}
			
			// If resolved value is also a reference, resolve it recursively
			if (typeof resolved === 'string' && (resolved.startsWith('ref:') || resolved.startsWith('tokens.') || resolved.startsWith('semantic.'))) {
				return resolveTokenValue(preset, resolved, fallback);
			}
			
			return resolved;
		}
		
		return value || fallback;
	}

	// Helper: Convert bg token to CSS value (NEW structure)
	function getBgStyle(preset: ThemePreset): string {
		const bgType = preset.config?.background?.type;
		const bgValue = preset.config?.background?.value;
		
		if (bgType && bgValue) {
			if (bgType === 'solid') {
				return bgValue; // hex color
			} else if (bgType === 'gradient') {
				return bgValue; // gradient CSS
			} else if (bgType === 'image') {
				return `url('${bgValue}')`; // image URL
			} else if (bgType === 'video') {
				return '#000000'; // fallback for video
			}
		}
		
		// Fallback
		return '#ffffff';
	}

	// Helper: Get primary color (supports both old and new config)
	function getPrimaryColor(preset: ThemePreset): string {
		// New config: use semantic.color.primary
		const semanticPrimary = preset.config?.semantic?.color?.primary;
		if (semanticPrimary) {
			return resolveTokenValue(preset, semanticPrimary, '#3b82f6');
		}
		
		// Old config: use tokens.primary
		const primary = preset.config?.tokens?.primary;
		if (typeof primary === 'object' && primary.value) {
			return primary.value;
		}
		return primary || '#3b82f6';
	}

	// Helper: Get text color (supports both old and new config)
	function getTextColor(preset: ThemePreset): string {
		// New config: use semantic.color.text.default
		const semanticText = preset.config?.semantic?.color?.text?.default;
		if (semanticText) {
			return resolveTokenValue(preset, semanticText, '#000000');
		}
		
		// Old config: use tokens.text
		const text = preset.config?.tokens?.text;
		if (typeof text === 'object' && text.value) {
			return text.value;
		}
		return text || '#000000';
	}

	// Check if current preset is selected
	$: currentThemeKey = $appearanceState.presetKey;

	// Pagination
	$: totalThemes = $hasCustomizations ? themes.length + 1 : themes.length;
	$: totalPages = Math.ceil(totalThemes / itemsPerPage);
	$: visibleThemes = (() => {
		const start = currentPage * itemsPerPage;
		const end = start + itemsPerPage;
		
		// If has customizations, reserve 1 slot on first page
		if ($hasCustomizations && currentPage === 0) {
			return themes.slice(0, itemsPerPage - 1);
		}
		
		// Adjust indices if customization takes a slot
		const offset = $hasCustomizations ? 1 : 0;
		return themes.slice(start - offset, end - offset);
	})();

	function nextPage() {
		if (currentPage < totalPages - 1) currentPage++;
	}

	function prevPage() {
		if (currentPage > 0) currentPage--;
	}
</script>

<section class="bg-white rounded-xl border border-gray-200">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Theme</h2>
		<p class="text-sm text-gray-500 mt-0.5">Choose a color scheme for your page</p>
	</div>
	
	<div class="p-6">
		<!-- Theme Grid with Pagination -->
		{#if loading}
			<div class="grid grid-cols-5 gap-3">
				{#each [1, 2, 3, 4, 5] as _}
					<div class="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="relative group">
				<!-- Grid -->
				<div class="grid grid-cols-5 gap-3">
					<!-- Custom Theme Card -->
					{#if $hasCustomizations && currentPage === 0}
						<button
							class="group aspect-[3/4] rounded-lg overflow-hidden border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
						>
							<div class="h-full p-3 flex flex-col items-center justify-center relative">
								<div class="absolute top-2 right-2 bg-purple-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
									CUSTOM
								</div>
								<svg class="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
								<p class="text-[10px] font-semibold text-purple-900">Custom</p>
							</div>
						</button>
					{/if}

					<!-- Theme Presets -->
					{#each visibleThemes as preset}
						{@const isSelected = currentThemeKey === preset.key && !$hasCustomizations}
						<button
							on:click={() => selectTheme(preset)}
							disabled={selecting}
							class="group aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed {isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'}"
						>
							<div 
								class="h-full p-2.5 flex flex-col relative"
								style="background: {getBgStyle(preset)};"
							>
								{#if selecting && selectingThemeKey === preset.key}
									<div class="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
										<div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
									</div>
								{/if}
								
								<!-- Mini preview -->
								<div class="flex-1 flex flex-col justify-center space-y-1">
									<div 
										class="w-5 h-5 rounded-full mx-auto"
										style="background: {getPrimaryColor(preset)};"
									></div>
									<div class="space-y-1">
										{#each [1, 2] as _}
											<div 
												class="h-2 rounded-sm"
												style="background: {getPrimaryColor(preset)}; opacity: 0.8;"
											></div>
										{/each}
									</div>
								</div>
								
								<!-- Name -->
								<div class="mt-1.5 text-center">
									<p class="text-[9px] font-medium truncate" style="color: {getTextColor(preset)};">
										{preset.name}
									</p>
								</div>
							</div>
						</button>
					{/each}
				</div>

				<!-- Navigation Arrows (Overlay) -->
				{#if totalPages > 1}
					<!-- Left Arrow -->
					{#if currentPage > 0}
						<button
							on:click={prevPage}
							class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10"
						>
							<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
					{/if}

					<!-- Right Arrow -->
					{#if currentPage < totalPages - 1}
						<button
							on:click={nextPage}
							class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10"
						>
							<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{/if}

					<!-- Dots Indicator (Subtle) -->
					<div class="flex justify-center gap-1 mt-4">
						{#each Array(totalPages) as _, i}
							<button
								on:click={() => currentPage = i}
								class="transition-all {currentPage === i ? 'w-4 h-1 bg-blue-600 rounded-full' : 'w-1 h-1 bg-gray-300 rounded-full hover:bg-gray-400'}"
							></button>
						{/each}
					</div>
				{/if}
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
