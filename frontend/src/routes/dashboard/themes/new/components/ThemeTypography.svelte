<script lang="ts">
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	
	export let fontFamily: string;
	export let headingFontFamily: string;
	export let headingFontSize: 'lg' | 'xl' | '2xl';
	export let linkFontSize: 'xs' | '13' | 'sm' | '15' | 'base' | 'lg' | 'xl';
	export let bioFontSize: 'xs' | '13' | 'sm' | '15' | 'base';
	export let subtitleFontSize: 'xs' | '13' | 'sm' | '15' | 'base';

	const fonts = [
		{ name: 'Inter', category: 'Sans Serif', value: 'Inter, system-ui, -apple-system, sans-serif' },
		{ name: 'Poppins', category: 'Sans Serif', value: 'Poppins, sans-serif' },
		{ name: 'Roboto', category: 'Sans Serif', value: 'Roboto, sans-serif' },
		{ name: 'Open Sans', category: 'Sans Serif', value: 'Open Sans, sans-serif' },
		{ name: 'Montserrat', category: 'Sans Serif', value: 'Montserrat, sans-serif' },
		{ name: 'Lato', category: 'Sans Serif', value: 'Lato, sans-serif' },
		{ name: 'Playfair Display', category: 'Serif', value: 'Playfair Display, serif' },
		{ name: 'Merriweather', category: 'Serif', value: 'Merriweather, serif' },
		{ name: 'Crimson Text', category: 'Serif', value: 'Crimson Text, serif' },
		{ name: 'Space Mono', category: 'Monospace', value: 'Space Mono, monospace' },
		{ name: 'JetBrains Mono', category: 'Monospace', value: 'JetBrains Mono, monospace' },
		{ name: 'Pacifico', category: 'Display', value: 'Pacifico, cursive' },
		{ name: 'System Default', category: 'System', value: 'system-ui, -apple-system, sans-serif' }
	];

	let fontDropdownOpen = false;
	let headingFontDropdownOpen = false;
	let dropdownButton: HTMLElement;
	let headingDropdownButton: HTMLElement;

	$: selectedFontName = (() => {
		const match = fonts.find(f => fontFamily?.includes(f.name));
		return match ? match.name : fonts[0].name;
	})();

	$: selectedFontObj = fonts.find(f => f.name === selectedFontName) || fonts[0];
	
	$: selectedHeadingFontName = (() => {
		// Fallback to body font if heading font not set
		const fontToCheck = headingFontFamily || fontFamily;
		const match = fonts.find(f => fontToCheck?.includes(f.name));
		return match ? match.name : fonts[0].name;
	})();

	$: selectedHeadingFontObj = fonts.find(f => f.name === selectedHeadingFontName) || fonts[0];

	function selectFont(font: typeof fonts[0]) {
		fontFamily = font.value;
		fontDropdownOpen = false;
	}
	
	function selectHeadingFont(font: typeof fonts[0]) {
		headingFontFamily = font.value;
		headingFontDropdownOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (fontDropdownOpen && dropdownButton && !dropdownButton.contains(event.target as Node)) {
			fontDropdownOpen = false;
		}
		if (headingFontDropdownOpen && headingDropdownButton && !headingDropdownButton.contains(event.target as Node)) {
			headingFontDropdownOpen = false;
		}
	}
	
	// Font size options - using tokens
	// Common options for bio and subtitle (12-16px range)
	const commonFontSizeOptions = [
		{ value: 'xs' as const, label: '12' },
		{ value: '13' as const, label: '13' },
		{ value: 'sm' as const, label: '14' },
		{ value: '15' as const, label: '15' },
		{ value: 'base' as const, label: '16' }
	];
	
	// Link font size options (12-20px range)
	const linkFontSizeOptions = [
		...commonFontSizeOptions,
		{ value: 'lg' as const, label: '18' },
		{ value: 'xl' as const, label: '20' }
	];
	
	// Heading font size options (18-24px range)
	const headingFontSizeOptions = [
		{ value: 'lg' as const, label: 'LG', size: FONT_SIZE_TOKENS.lg },
		{ value: 'xl' as const, label: 'XL', size: FONT_SIZE_TOKENS.xl },
		{ value: '2xl' as const, label: '2XL', size: FONT_SIZE_TOKENS['2xl'] }
	];


</script>

<svelte:window on:click={handleClickOutside} />

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
	<div class="space-y-4">
		<!-- Font Family - Custom Dropdown -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Body Font Family</label>
			<div class="relative" bind:this={dropdownButton}>
				<button
					type="button"
					on:click|stopPropagation={() => fontDropdownOpen = !fontDropdownOpen}
					class="w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all {fontDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div 
								class="text-2xl font-bold text-gray-900"
								style="font-family: '{selectedFontObj.name}', sans-serif;"
							>
								Aa
							</div>
							<div>
								<div class="text-sm font-medium text-gray-900">{selectedFontObj.name}</div>
								<div class="text-xs text-gray-500">{selectedFontObj.category}</div>
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
									type="button"
									on:click={() => selectFont(font)}
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedFontName === font.name ? 'bg-blue-50' : ''}"
								>
									<div 
										class="text-2xl font-bold {selectedFontName === font.name ? 'text-blue-600' : 'text-gray-900'}"
										style="font-family: '{font.name}', sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">{font.category}</div>
									</div>
									{#if selectedFontName === font.name}
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
				style="font-family: '{selectedFontObj.name}', sans-serif;"
			>
				<div class="text-2xl font-bold text-gray-900 mb-1">The quick brown fox</div>
				<div class="text-sm text-gray-600">jumps over the lazy dog</div>
			</div>
		</div>
		
		<!-- Heading Font Family - Custom Dropdown -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Heading Font Family</label>
			<div class="relative" bind:this={headingDropdownButton}>
				<button
					type="button"
					on:click|stopPropagation={() => headingFontDropdownOpen = !headingFontDropdownOpen}
					class="w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all {headingFontDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div 
								class="text-2xl font-bold text-gray-900"
								style="font-family: '{selectedHeadingFontObj.name}', sans-serif;"
							>
								Aa
							</div>
							<div>
								<div class="text-sm font-medium text-gray-900">{selectedHeadingFontObj.name}</div>
								<div class="text-xs text-gray-500">{selectedHeadingFontObj.category}</div>
							</div>
						</div>
						<svg 
							class="w-5 h-5 text-gray-400 transition-transform {headingFontDropdownOpen ? 'rotate-180' : ''}" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</button>

				<!-- Dropdown Panel -->
				{#if headingFontDropdownOpen}
					<div class="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
						<div class="max-h-80 overflow-y-auto">
							{#each fonts as font}
								<button
									type="button"
									on:click={() => selectHeadingFont(font)}
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedHeadingFontName === font.name ? 'bg-blue-50' : ''}"
								>
									<div 
										class="text-2xl font-bold {selectedHeadingFontName === font.name ? 'text-blue-600' : 'text-gray-900'}"
										style="font-family: '{font.name}', sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">{font.category}</div>
									</div>
									{#if selectedHeadingFontName === font.name}
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
				style="font-family: '{selectedHeadingFontObj.name}', sans-serif;"
			>
				<div class="text-2xl font-bold text-gray-900">Your Name Here</div>
			</div>
			<p class="text-xs text-gray-500 mt-2">Font used for your display name/title</p>
		</div>
		
		<!-- Heading Font Size - Button Preset (Full Width) -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Heading Font Size
			</label>
			<div class="grid grid-cols-3 gap-2">
				{#each headingFontSizeOptions as option}
					<button
						type="button"
						on:click={() => headingFontSize = option.value}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {headingFontSize === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60">{option.size}px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1">Name/title size</p>
		</div>
		
		<!-- Link Font Size - Button Preset (Full Width) -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Link Font Size
			</label>
			<div class="grid grid-cols-7 gap-1.5">
				{#each linkFontSizeOptions as option}
					<button
						type="button"
						on:click={() => linkFontSize = option.value}
						class="py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all {linkFontSize === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[9px] opacity-60">px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1">Link button text size</p>
		</div>
		
		<!-- Bio Font Size - Button Preset (Full Width) -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Bio Font Size
			</label>
			<div class="grid grid-cols-5 gap-1.5">
				{#each commonFontSizeOptions as option}
					<button
						type="button"
						on:click={() => bioFontSize = option.value}
						class="py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all {bioFontSize === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[9px] opacity-60">px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1">Bio/description text size</p>
		</div>
		
		<!-- Subtitle Font Size - Button Preset (Full Width) -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Subtitle Font Size
			</label>
			<div class="grid grid-cols-5 gap-1.5">
				{#each commonFontSizeOptions as option}
					<button
						type="button"
						on:click={() => subtitleFontSize = option.value}
						class="py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all {subtitleFontSize === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[9px] opacity-60">px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1">Link subtitle text size</p>
		</div>
	</div>
</section>
