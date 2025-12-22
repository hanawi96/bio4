<script lang="ts">
	import { theme, DEFAULT_THEME } from '$lib/stores/page';

	const fonts = [
		{ name: 'Inter', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Poppins', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Roboto', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Open Sans', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Montserrat', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Lato', category: 'Sans Serif', preview: 'Aa' },
		{ name: 'Playfair Display', category: 'Serif', preview: 'Aa' },
		{ name: 'Merriweather', category: 'Serif', preview: 'Aa' },
		{ name: 'Crimson Text', category: 'Serif', preview: 'Aa' },
		{ name: 'Space Mono', category: 'Monospace', preview: 'Aa' },
		{ name: 'JetBrains Mono', category: 'Monospace', preview: 'Aa' },
		{ name: 'Pacifico', category: 'Handwriting', preview: 'Aa' }
	];

	$: currentTheme = $theme || DEFAULT_THEME;
	$: selectedFont = currentTheme.fontFamily;

	function selectFont(fontName: string) {
		theme.update(t => t ? { ...t, fontFamily: fontName } : { ...DEFAULT_THEME, fontFamily: fontName });
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
						<!-- Preview -->
						<div 
							class="text-4xl font-bold mb-2 {selectedFont === font.name ? 'text-blue-600' : 'text-gray-900'}"
							style="font-family: {font.name}, sans-serif;"
						>
							{font.preview}
						</div>
						<!-- Name -->
						<p class="text-sm font-medium text-gray-900 truncate">{font.name}</p>
						<p class="text-xs text-gray-500">{font.category}</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- Font Size Options -->
		<div class="mt-6 pt-6 border-t border-gray-100">
			<div class="flex items-center justify-between mb-3">
				<div>
					<p class="text-sm font-medium text-gray-900">Font Size</p>
					<p class="text-xs text-gray-500">Adjust text size</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<button class="flex-1 py-2 px-3 text-xs border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
					Small
				</button>
				<button class="flex-1 py-2 px-3 text-sm border-2 border-blue-500 bg-blue-50 rounded-lg font-medium">
					Medium
				</button>
				<button class="flex-1 py-2 px-3 text-base border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
					Large
				</button>
			</div>
		</div>

		<!-- Text Color -->
		<div class="mt-6 pt-6 border-t border-gray-100">
			<div class="flex items-center justify-between mb-3">
				<div>
					<p class="text-sm font-medium text-gray-900">Text Color</p>
					<p class="text-xs text-gray-500">Choose your text color</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex-1">
					<div class="relative">
						<input
							type="color"
							value={currentTheme.textColor}
							on:input={(e) => theme.update(t => t ? { ...t, textColor: e.currentTarget.value } : { ...DEFAULT_THEME, textColor: e.currentTarget.value })}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
							<div 
								class="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
								style="background-color: {currentTheme.textColor};"
							></div>
							<div class="flex-1">
								<p class="text-xs font-medium text-gray-500 uppercase">Text Color</p>
								<p class="text-sm font-bold text-gray-900 font-mono">{currentTheme.textColor}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
