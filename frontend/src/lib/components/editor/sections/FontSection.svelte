<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';

	const fonts = [
		{ name: 'Default', category: 'System', isDefault: true },
		{ name: 'Inter', category: 'Sans Serif' },
		{ name: 'Poppins', category: 'Sans Serif' },
		{ name: 'Roboto', category: 'Sans Serif' },
		{ name: 'Open Sans', category: 'Sans Serif' },
		{ name: 'Montserrat', category: 'Sans Serif' },
		{ name: 'Lato', category: 'Sans Serif' },
		{ name: 'Playfair Display', category: 'Serif' },
		{ name: 'Merriweather', category: 'Serif' },
		{ name: 'Crimson Text', category: 'Serif' },
		{ name: 'Space Mono', category: 'Monospace' },
		{ name: 'JetBrains Mono', category: 'Monospace' },
		{ name: 'Pacifico', category: 'Display' }
	];

	let fontDropdownOpen = false;
	let dropdownButton: HTMLElement;

	// Get theme's default font (from theme config)
	$: themeFontFamily = $appearance?.theme?.config?.tokens?.fontFamily || 'Inter, sans-serif';
	$: themeDefaultFontName = themeFontFamily.split(',')[0].trim();
	
	// Determine selected font
	$: selectedFont = $appearanceState.overrides?.['tokens.fontFamily']
		? ($appearanceState.overrides['tokens.fontFamily'] as string).split(',')[0].trim()
		: 'Default';

	$: selectedFontObj = fonts.find(f => f.name === selectedFont) || fonts[0];

	$: currentTitleSize = ($appearanceState.overrides?.['page.titleFontSize'] as number) || 20;

	$: currentTextColor = ($appearanceState.overrides?.['tokens.text'] as string) 
		|| $appearance?.tokens?.text 
		|| '#000000';

	function selectFont(fontName: string) {
		updateAppearance('tokens.fontFamily', fontName === 'Default' ? null : `${fontName}, sans-serif`);
		fontDropdownOpen = false;
	}

	function updateTitleSize(size: number) {
		updateAppearance('page.titleFontSize', size);
	}

	function handleClickOutside(event: MouseEvent) {
		if (fontDropdownOpen && dropdownButton && !dropdownButton.contains(event.target as Node)) {
			fontDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<section class="bg-white rounded-xl border border-gray-200">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Typography</h2>
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
								style="font-family: {selectedFont === 'Default' ? themeDefaultFontName : `'${selectedFont}'`}, sans-serif;"
							>
								Aa
							</div>
							<div>
								<div class="text-sm font-medium text-gray-900">{selectedFont}</div>
								<div class="text-xs text-gray-500">
									{selectedFontObj.isDefault ? themeDefaultFontName : selectedFontObj.category}
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
										style="font-family: {font.isDefault ? themeDefaultFontName : `'${font.name}'`}, sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">
											{font.isDefault ? themeDefaultFontName : font.category}
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
				style="font-family: {selectedFont === 'Default' ? themeDefaultFontName : `'${selectedFont}'`}, sans-serif;"
			>
				<div class="text-2xl font-bold text-gray-900 mb-1">The quick brown fox</div>
				<div class="text-sm text-gray-600">jumps over the lazy dog</div>
			</div>
		</div>

		<!-- Title Size - Slider -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-sm font-medium text-gray-700">Title Size</label>
				<span class="text-sm font-semibold text-blue-600">{currentTitleSize}px</span>
			</div>
			<input
				type="range"
				min="14"
				max="32"
				step="1"
				value={currentTitleSize}
				on:input={(e) => updateTitleSize(Number(e.currentTarget.value))}
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
			/>
			<div class="flex justify-between text-xs text-gray-500 mt-1">
				<span>Small</span>
				<span>Large</span>
			</div>
			<!-- Live Preview -->
			<div class="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
				<div 
					class="font-bold text-gray-900"
					style="font-size: {currentTitleSize}px; font-family: {selectedFont === 'Default' ? themeDefaultFontName : `'${selectedFont}'`}, sans-serif;"
				>
					Your Name
				</div>
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
	</div>
</section>
