<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';

	const fonts = [
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

	const titleSizes = [
		{ id: 'small', name: 'Small', size: 16, description: '16px' },
		{ id: 'medium', name: 'Medium', size: 20, description: '20px' },
		{ id: 'large', name: 'Large', size: 24, description: '24px' }
	];

	$: currentFontFamily = ($appearanceState.overrides?.['tokens.fontFamily'] as string)
		|| $appearance?.tokens?.fontFamily
		|| 'Inter';
	
	// Extract font name without fallbacks for comparison
	$: selectedFont = currentFontFamily.split(',')[0].trim();

	$: currentTitleSize = ($appearanceState.overrides?.['page.titleFontSize'] as number)
		|| 20; // Default medium
	
	$: selectedTitleSize = currentTitleSize <= 17 ? 'small'
		: currentTitleSize >= 22 ? 'large'
		: 'medium';

	$: currentTextColor = ($appearanceState.overrides?.['tokens.text'] as string)
		|| $appearance?.tokens?.text
		|| '#000000';

	function selectFont(fontName: string) {
		// Store with fallbacks for better compatibility
		const fontValue = `${fontName}, sans-serif`;
		updateAppearance('tokens.fontFamily', fontValue);
	}

	function selectTitleSize(sizeOption: typeof titleSizes[0]) {
		updateAppearance('page.titleFontSize', sizeOption.size);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Typography</h2>
		<p class="text-sm text-gray-500 mt-1">Choose a font for your bio page</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Font Grid -->
		<div>
			<h3 class="text-sm font-medium text-gray-900 mb-3">Font Family</h3>
			<div class="grid grid-cols-3 gap-3">
				{#each fonts as font}
					<button
						on:click={() => selectFont(font.name)}
						class="group rounded-xl border-2 transition-all hover:scale-105 {selectedFont === font.name ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
					>
						<div class="p-4 text-center">
							<!-- Preview with actual font -->
							<div 
								class="mb-2 {selectedFont === font.name ? 'text-blue-600' : 'text-gray-900'}"
								style="font-family: '{font.name}', sans-serif;"
							>
								<div class="text-3xl font-bold leading-none">Aa</div>
								<div class="text-xs mt-1 opacity-60">Quick fox</div>
							</div>
							<!-- Name -->
							<p class="text-sm font-medium text-gray-900 truncate">{font.name}</p>
							<p class="text-xs text-gray-500">{font.category}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Title Size -->
		<div class="pt-6 border-t border-gray-100">
			<h3 class="text-sm font-medium text-gray-900 mb-3">Title Size</h3>
			<div class="grid grid-cols-3 gap-3">
				{#each titleSizes as sizeOption}
					<button
						on:click={() => selectTitleSize(sizeOption)}
						class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedTitleSize === sizeOption.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
					>
						<!-- Preview -->
						<div class="mb-3 flex items-center justify-center" style="height: 48px;">
							<div 
								class="font-bold {selectedTitleSize === sizeOption.id ? 'text-blue-600' : 'text-gray-900'}"
								style="font-size: {sizeOption.size}px;"
							>
								Aa
							</div>
						</div>
						<!-- Info -->
						<p class="text-sm font-medium text-gray-900">{sizeOption.name}</p>
						<p class="text-xs text-gray-500 mt-1">{sizeOption.description}</p>
					</button>
				{/each}
			</div>
		</div>

		<!-- Text Color -->
		<div class="pt-6 border-t border-gray-100">
			<h3 class="text-sm font-medium text-gray-900 mb-3">Text Color</h3>
			<div class="flex items-center justify-between py-2">
				<span class="text-sm text-gray-600">Text</span>
				<div class="relative">
					<input
						type="color"
						value={currentTextColor}
						on:input={(e) => updateAppearance('tokens.text', e.currentTarget.value)}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
						style="background-color: {currentTextColor};"
					></div>
				</div>
			</div>
			<div class="mt-2 flex items-start gap-2 text-xs text-gray-500">
				<svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>Ensure good contrast with background for readability</span>
			</div>
		</div>
	</div>
</section>
