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

	$: currentFontFamily = ($appearanceState.overrides?.['tokens.fontFamily'] as string)
		|| $appearance?.tokens?.fontFamily
		|| 'Inter';
	
	// Extract font name without fallbacks for comparison
	$: selectedFont = currentFontFamily.split(',')[0].trim();

	function selectFont(fontName: string) {
		// Store with fallbacks for better compatibility
		const fontValue = `${fontName}, sans-serif`;
		updateAppearance('tokens.fontFamily', fontValue);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Typography</h2>
		<p class="text-sm text-gray-500 mt-1">Choose a font for your bio page</p>
	</div>
	
	<div class="p-6">
		<!-- Font Grid -->
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
</section>
