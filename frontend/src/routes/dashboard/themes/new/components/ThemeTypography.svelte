<script lang="ts">
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	import { AVAILABLE_FONTS, findFont } from '$lib/appearance/fontConstants';
	
	export let fontFamily: string;
	export let headingFontFamily: string;
	export let headingFontSize: 'lg' | 'xl' | '2xl';
	export let linkFontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
	export let bioFontSize: 'xs' | 'sm' | 'base' | 'lg';
	export let subtitleFontSize: 'xs' | 'sm' | 'base' | 'lg';

	const fonts = AVAILABLE_FONTS;

	let fontDropdownOpen = false;
	let headingFontDropdownOpen = false;
	let dropdownButton: HTMLElement;
	let headingDropdownButton: HTMLElement;

	$: selectedFontName = findFont(fontFamily)?.name || fonts[0].name;
	$: selectedFontObj = fonts.find(f => f.name === selectedFontName) || fonts[0];
	
	$: selectedHeadingFontName = findFont(headingFontFamily || fontFamily)?.name || fonts[0].name;
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
	
	// Font size options - 5 options for better UX
	// Common options for bio and subtitle (12-18px range)
	const commonFontSizeOptions = [
		{ value: 'xs' as const, label: 'XS', size: FONT_SIZE_TOKENS.xs },
		{ value: 'sm' as const, label: 'SM', size: FONT_SIZE_TOKENS.sm },
		{ value: 'base' as const, label: 'MD', size: FONT_SIZE_TOKENS.base },
		{ value: 'lg' as const, label: 'LG', size: FONT_SIZE_TOKENS.lg }
	];
	
	// Link font size options (12-20px range)
	const linkFontSizeOptions = [
		...commonFontSizeOptions,
		{ value: 'xl' as const, label: 'XL', size: FONT_SIZE_TOKENS.xl }
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
					class="w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all {fontDropdownOpen ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20' : 'border-gray-300 hover:border-gray-400'}"
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
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedFontName === font.name ? 'bg-[#e6f7ed]' : ''}"
								>
									<div 
										class="text-2xl font-bold {selectedFontName === font.name ? 'text-[#00aa4f]' : 'text-gray-900'}"
										style="font-family: '{font.name}', sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">{font.category}</div>
									</div>
									{#if selectedFontName === font.name}
										<svg class="w-5 h-5 text-[#00aa4f]" fill="currentColor" viewBox="0 0 20 20">
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
					class="w-full px-4 py-3 bg-white border-2 rounded-lg text-left transition-all {headingFontDropdownOpen ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20' : 'border-gray-300 hover:border-gray-400'}"
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
									class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors {selectedHeadingFontName === font.name ? 'bg-[#e6f7ed]' : ''}"
								>
									<div 
										class="text-2xl font-bold {selectedHeadingFontName === font.name ? 'text-[#00aa4f]' : 'text-gray-900'}"
										style="font-family: '{font.name}', sans-serif;"
									>
										Aa
									</div>
									<div class="flex-1 text-left">
										<div class="text-sm font-medium text-gray-900">{font.name}</div>
										<div class="text-xs text-gray-500">{font.category}</div>
									</div>
									{#if selectedHeadingFontName === font.name}
										<svg class="w-5 h-5 text-[#00aa4f]" fill="currentColor" viewBox="0 0 20 20">
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
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
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
			<div class="grid grid-cols-5 gap-2">
				{#each linkFontSizeOptions as option}
					<button
						type="button"
						on:click={() => linkFontSize = option.value}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {linkFontSize === option.value
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60">{option.size}px</div>
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
			<div class="grid grid-cols-4 gap-2">
				{#each commonFontSizeOptions as option}
					<button
						type="button"
						on:click={() => bioFontSize = option.value}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {bioFontSize === option.value
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60">{option.size}px</div>
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
			<div class="grid grid-cols-4 gap-2">
				{#each commonFontSizeOptions as option}
					<button
						type="button"
						on:click={() => subtitleFontSize = option.value}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {subtitleFontSize === option.value
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60">{option.size}px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1">Link subtitle text size</p>
		</div>
	</div>
</section>
