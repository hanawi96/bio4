<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import { AVAILABLE_FONTS, findFont } from '$lib/appearance/fontConstants';
	import { validateAndNormalizeHexColor } from '$lib/utils/colorUtils';

	const fonts = AVAILABLE_FONTS;

	let fontDropdownOpen = false;
	let dropdownButton: HTMLElement;

	// Get theme's default font (from theme config)
	$: themeFontFamily = (() => {
		// Try tokens.typography.fontFamily.sans first (new structure)
		const sansFontFamily = $appearance?.theme?.config?.tokens?.typography?.fontFamily?.sans;
		if (sansFontFamily) return sansFontFamily;
		
		// Fallback to tokens.fontFamily (old structure)
		return $appearance?.theme?.config?.tokens?.fontFamily || 'Inter, sans-serif';
	})();
	$: themeDefaultFontName = themeFontFamily.split(',')[0].trim();
	
	// Determine selected font with proper fallback
	$: selectedFont = (() => {
		// Priority 1: Override
		const override = $appearanceState.overrides?.['tokens.fontFamily'];
		if (override) {
			return (override as string).split(',')[0].trim();
		}
		
		// Priority 2: Theme config - return first font name
		return themeDefaultFontName;
	})();

	$: selectedFontObj = fonts.find(f => f.name === selectedFont) || fonts[0];

	$: currentTextColor = ($appearanceState.overrides?.['tokens.text'] as string) 
		|| $appearance?.tokens?.text 
		|| '#000000';

	// Typography Colors
	$: headingColor = $appearanceState.overrides?.['typography.headingColor'] 
		?? $appearance?.theme?.config?.semantic?.color?.text?.default 
		?? '#18181b';
	
	$: mutedTextColor = $appearanceState.overrides?.['typography.mutedColor'] 
		?? $appearance?.theme?.config?.semantic?.color?.text?.muted 
		?? '#71717a';

	function updateHeadingColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('typography.headingColor', value);
	}

	function updateMutedColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('typography.mutedColor', value);
	}

	function selectFont(fontName: string) {
		const font = fonts.find(f => f.name === fontName);
		updateAppearance('tokens.fontFamily', font ? `${fontName}, sans-serif` : null);
		fontDropdownOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (fontDropdownOpen && dropdownButton && !dropdownButton.contains(event.target as Node)) {
			fontDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<section class="card-ios">
	<div class="section-header-ios">
		<h2 class="section-title-ios">Typography</h2>
		<p class="text-sm text-gray-500 mt-1">Customize fonts and text appearance</p>
	</div>
	
	<div class="p-6 space-y-5">
		<!-- Font Family - Custom Dropdown Panel -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
			<div class="relative" bind:this={dropdownButton}>
				<button
					on:click|stopPropagation={() => fontDropdownOpen = !fontDropdownOpen}
					class="w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all {fontDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div 
								class="text-2xl font-bold text-gray-900"
								style="font-family: '{selectedFont}', sans-serif;"
							>
								Aa
							</div>
							<div>
								<div class="text-sm font-medium text-gray-900">{selectedFont}</div>
								<div class="text-xs text-gray-500">
									{selectedFontObj.category}
								</div>
							</div>
						</div>
						<svg 
							class="w-5 h-5 text-gray-400 transition-transform {fontDropdownOpen ? 'rotate-180' : ''}" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</button>

				<!-- Dropdown Panel -->
				{#if fontDropdownOpen}
					<div class="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
						<div class="max-h-80 overflow-y-auto">
							{#each fonts as font}
								<button
									on:click={() => selectFont(font.name)}
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedFont === font.name ? 'bg-blue-50' : ''}"
								>
									<div 
										class="text-2xl font-bold {selectedFont === font.name ? 'text-blue-600' : 'text-gray-900'}"
										style="font-family: '{font.name}', sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">
											{font.category}
										</div>
									</div>
									{#if selectedFont === font.name}
										<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<!-- Font Preview -->
			<div 
				class="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
				style="font-family: '{selectedFont}', sans-serif;"
			>
				<div class="text-2xl font-bold text-gray-900 mb-1">The quick brown fox</div>
				<div class="text-sm text-gray-600">jumps over the lazy dog</div>
			</div>
		</div>

		<!-- Text Color - Compact -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						value={currentTextColor}
						on:input={(e) => updateAppearance('tokens.text', e.currentTarget.value)}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {currentTextColor};"
					></div>
				</div>
				<div class="flex-1">
					<input
						type="text"
						value={currentTextColor}
						on:input={(e) => updateAppearance('tokens.text', e.currentTarget.value)}
						class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="#000000"
					/>
				</div>
			</div>
			<p class="mt-2 text-xs text-gray-500 flex items-start gap-1.5">
				<svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>Ensure good contrast with background</span>
			</p>
		</div>

		<!-- Typography Colors -->
		<div>
			<h3 class="text-base font-semibold text-gray-900 mb-4">Typography Colors</h3>
			
			<div class="space-y-4">
				<!-- Heading Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Heading Color
					</label>
					<div class="flex items-center gap-3">
						<div class="relative">
							<input
								type="color"
								value={headingColor}
								on:input={updateHeadingColor}
								class="color-picker-round w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer"
							/>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={headingColor}
								on:input={updateHeadingColor}
								class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aa4f] focus:border-transparent"
								placeholder="#18181b"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500 mt-1.5">
						Color for name/title and headings
					</p>
				</div>

				<!-- Muted Text Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Muted Text Color
					</label>
					<div class="flex items-center gap-3">
						<div class="relative">
							<input
								type="color"
								value={mutedTextColor}
								on:input={updateMutedColor}
								class="color-picker-round w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer"
							/>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={mutedTextColor}
								on:input={updateMutedColor}
								class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aa4f] focus:border-transparent"
								placeholder="#71717a"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500 mt-1.5">
						Color for bio and secondary text
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Make color picker inner swatch circular */
	.color-picker-round::-webkit-color-swatch-wrapper {
		padding: 0;
		border-radius: 50%;
	}
	
	.color-picker-round::-webkit-color-swatch {
		border: none;
		border-radius: 50%;
	}
	
	.color-picker-round::-moz-color-swatch {
		border: none;
		border-radius: 50%;
	}
</style>
