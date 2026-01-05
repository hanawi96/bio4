<script lang="ts">
	import {
		getBlockStyleRecipeIds,
		getBlockStyleRecipeName,
		getBlockStyleRecipe,
		getShadowStyleIds,
		getShadowStyleName,
		getShadowRecipe,
		type BlockStylePresetId,
		type ShadowStylePreset
	} from '$lib/appearance/blockStyles';
	import { resolveToken, resolveAutoTextColor } from '$lib/appearance/tokenResolver';
	import { getGradientColors, getGradientPresetName, type GradientPreset } from '$lib/utils/colorUtils';
	import { BORDER_WIDTH_PRESETS, type BorderWidthKey } from '$lib/appearance/spacingTokens';

	export let selectedBlockStyle: 'solid' | 'outline' | 'glass' | 'neon' | 'brutal' | 'gradient';
	export let selectedLinkIconShape: 'square' | 'rounded' | 'circle';
	export let selectedShadowStyle: 'none' | 'soft' | 'medium' | 'hard' | 'brutal' | 'custom' = 'none';
	export let blockOpacity: number = 100;
	export let selectedGradientPreset: GradientPreset = 'darken';
	export let borderWidth: BorderWidthKey | number = 'default';
	export let shadowCustom = {
		offsetX: 0,
		offsetY: 4,
		blur: 8,
		spread: 0,
		opacity: 0.1
	};
	export let primaryColor: string = '#3b82f6';
	export let textColor: string = '#18181b';
	export let borderColor: string = '#e4e4e7';
	export let blockTextColor: string = '#ffffff';
	export let shadowColor: string = '#000000';
	export let bgType: 'solid' | 'gradient' | 'image' = 'solid';
	export let bgSolidColor: string = '#ffffff';
	export let bgGradientFrom: string = '#667eea';
	export let bgGradientTo: string = '#764ba2';
	export let bgGradientDirection: string = '135deg';
	export let bgImageUrl: string = '';
	
	// Check if current block style has border
	$: hasBorder = selectedBlockStyle === 'outline' || selectedBlockStyle === 'glass' || selectedBlockStyle === 'brutal';

	// Get all available recipes
	const recipes = getBlockStyleRecipeIds();
	const shadowStyles = getShadowStyleIds();

	// Default opacity for each block style (only used for initial preview cards display)
	const defaultOpacity: Record<BlockStylePresetId, number> = {
		solid: 100,
		outline: 100,
		glass: 35, // Max glass opacity (will be mapped to 10-35% range)
		neon: 100,
		brutal: 100,
		gradient: 100
	};

	// Track if user has manually adjusted opacity (to show default opacity for non-selected cards)
	let userHasAdjustedOpacity = false;

	// Detect manual opacity adjustment
	$: if (blockOpacity !== defaultOpacity[selectedBlockStyle]) {
		userHasAdjustedOpacity = true;
	}

	// Reactive tokens based on props
	$: mockTokens = {
		blockBase: primaryColor,
		blockText: blockTextColor,
		text: textColor,
		surface: '#ffffff',
		border: borderColor,
		shadowColor: shadowColor,
		backgroundColor: bgSolidColor
	};

	// Compute background value
	$: previewBackground = (() => {
		if (bgType === 'solid') {
			return bgSolidColor;
		} else if (bgType === 'gradient') {
			return `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`;
		} else if (bgType === 'image' && bgImageUrl) {
			return `url('${bgImageUrl}')`;
		}
		return '#fafafa';
	})();

	// Helper: Apply opacity to color
	function applyOpacity(color: string, opacity: number): string {
		if (color.startsWith('rgba(')) {
			// Already has alpha, replace it
			return color.replace(/[\d.]+\)$/, `${opacity / 100})`);
		}
		if (color.startsWith('rgb(')) {
			return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity / 100})`);
		}
		if (color.startsWith('#')) {
			const hex = color.replace('#', '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
		}
		return color;
	}

	// Helper: Apply opacity to gradient
	function applyOpacityToGradient(gradient: string, opacity: number): string {
		if (opacity >= 100) return gradient;
		// Extract colors from gradient and apply opacity
		return gradient.replace(/#[0-9a-fA-F]{6}/g, (color) => applyOpacity(color, opacity));
	}

	// Get preview style for each recipe
	function getPreviewStyle(recipeId: BlockStylePresetId, shadowId: ShadowStylePreset, opacity: number, useDefaultOpacity: boolean) {
		const recipe = getBlockStyleRecipe(recipeId);
		const tokens = mockTokens;

		let fill = resolveToken(recipe.fill, tokens);
		
		// Determine which opacity to use
		let effectiveOpacity = opacity;
		if (useDefaultOpacity && recipeId !== selectedBlockStyle) {
			// For non-selected cards, show their default opacity
			effectiveOpacity = defaultOpacity[recipeId];
		}
		
		// Glass: Map blockOpacity (0-100) to glass range (10-35)
		if (recipeId === 'glass') {
			effectiveOpacity = Math.max(10, Math.min(35, 10 + (effectiveOpacity / 100) * 25));
		}
		
		// Handle gradient fill
		if (recipe.fill.startsWith('gradient:')) {
			const baseColor = resolveToken(recipe.fill.replace('gradient:', ''), tokens);
			const gradient = getGradientColors(baseColor, selectedGradientPreset);
			fill = gradient.css;
			// Apply opacity to gradient (handle multiple backgrounds)
			if (effectiveOpacity < 100) {
				fill = applyOpacityToGradient(fill, effectiveOpacity);
			}
		} else if (recipeId !== 'outline') {
			// Apply opacity to all fills (except Outline which is transparent)
			fill = applyOpacity(fill, effectiveOpacity);
		}

		const text =
			recipe.text === 'auto'
				? resolveAutoTextColor(recipe.fill, tokens)
				: resolveToken(recipe.text, tokens);
		const border = recipe.border ? resolveToken(recipe.border, tokens) : undefined;
		const glow = recipe.glow ? resolveToken(recipe.glow, tokens) : undefined;

		// Resolve shadow from shadow recipe
		// Special cases: Neon has its own glow effect
		let shadow = undefined;
		if (recipeId !== 'neon') {
			if (shadowId === 'custom') {
				// Build custom shadow from shadowCustom values
				const { offsetX, offsetY, blur, spread, opacity: shadowOpacity } = shadowCustom;
				const color = applyOpacity(tokens.shadowColor, shadowOpacity * 100);
				shadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
			} else {
				const shadowRecipe = getShadowRecipe(shadowId);
				if (shadowRecipe.value !== 'none') {
					shadow = resolveToken(shadowRecipe.value, tokens);
				}
			}
		}

		// Resolve border width
		const borderWidthPx = typeof borderWidth === 'number' ? borderWidth : BORDER_WIDTH_PRESETS[borderWidth];
		const borderStyle = border ? `${borderWidthPx}px solid ${border}` : 'none';

		return {
			backgroundColor: fill,
			backgroundImage: recipe.fill.startsWith('gradient:') ? fill : 'none',
			color: text,
			border: borderStyle,
			boxShadow: shadow || (glow ? `0 0 20px ${glow}` : 'none'),
			backdropFilter: recipe.blur ? `blur(${recipe.blur}px)` : 'none'
		};
	}

	// Reactive: Recompute all styles when dependencies change
	$: displayStyles = (mockTokens && selectedShadowStyle && blockOpacity !== undefined && shadowCustom && borderWidth !== undefined) ? recipes.reduce((acc, recipeId) => {
		acc[recipeId] = getPreviewStyle(recipeId, selectedShadowStyle, blockOpacity, !userHasAdjustedOpacity);
		return acc;
	}, {} as Record<BlockStylePresetId, any>) : {};

	// Icon shape options
	const iconShapes = [
		{ value: 'square', label: 'Square', preview: 'rounded-none' },
		{ value: 'rounded', label: 'Rounded', preview: 'rounded-lg' },
		{ value: 'circle', label: 'Circle', preview: 'rounded-full' }
	];
	
	// Advanced shadow controls
	let showAdvancedShadow = false;
	
	// When user adjusts custom shadow, switch to custom mode
	function handleCustomShadowChange() {
		if (selectedShadowStyle !== 'custom') {
			selectedShadowStyle = 'custom';
		}
	}
	
	// Load preset values into custom when selecting preset
	$: if (selectedShadowStyle !== 'custom') {
		const presetValues = {
			none: { offsetX: 0, offsetY: 0, blur: 0, spread: 0, opacity: 0 },
			soft: { offsetX: 0, offsetY: 2, blur: 8, spread: 0, opacity: 0.08 },
			medium: { offsetX: 0, offsetY: 4, blur: 12, spread: 0, opacity: 0.12 },
			hard: { offsetX: 0, offsetY: 8, blur: 16, spread: 0, opacity: 0.16 },
			brutal: { offsetX: 4, offsetY: 4, blur: 0, spread: 0, opacity: 1 }
		};
		if (presetValues[selectedShadowStyle]) {
			shadowCustom = { ...presetValues[selectedShadowStyle] };
		}
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Block Style</h2>
	<div class="space-y-6">
		<!-- Block Style Grid -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Button Style
			</label>
			<div class="grid grid-cols-3 gap-3">
				{#each recipes as recipeId}
					{@const isSelected = selectedBlockStyle === recipeId}
					{@const displayStyle = displayStyles[recipeId] || {}}
					<button
						type="button"
						on:click={() => selectedBlockStyle = recipeId}
						class="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-[#00aa4f]' : 'hover:ring-2 hover:ring-gray-300'}"
					>
						<!-- Preview Container -->
						<div
							class="aspect-square p-3 flex items-center justify-center relative border {isSelected ? 'border-[#00aa4f]' : 'border-gray-200'} bg-white overflow-hidden"
							style="background: {previewBackground}; background-size: cover; background-position: center;"
						>
							<div
								class="w-full h-8 transition-all flex items-center justify-center rounded-lg relative z-10"
								style="
									background-color: {displayStyle.backgroundImage !== 'none' ? 'transparent' : displayStyle.backgroundColor};
									background-image: {displayStyle.backgroundImage !== 'none' ? displayStyle.backgroundImage : 'none'};
									color: {displayStyle.color};
									border: {displayStyle.border};
									box-shadow: {displayStyle.boxShadow || 'none'};
									backdrop-filter: {displayStyle.backdropFilter || 'none'};
									-webkit-backdrop-filter: {displayStyle.backdropFilter || 'none'};
								"
							>
								<span class="text-xs font-semibold">Button</span>
							</div>
						</div>
						
						<!-- Name Label -->
						<div class="py-2 px-2 {isSelected ? 'bg-[#e6f7ed] border-t border-[#00aa4f]/30' : 'bg-gray-50 border-t border-gray-200'}">
							<p class="text-xs font-semibold {isSelected ? 'text-[#00aa4f]' : 'text-gray-700'} truncate text-center">
								{getBlockStyleRecipeName(recipeId)}
							</p>
						</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-2">Button color and visual effect style</p>
		</div>

		<!-- Block Opacity Slider -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Block Opacity: {blockOpacity}%
			</label>
			<input
				type="range"
				bind:value={blockOpacity}
				min="10"
				max="100"
				step="1"
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
			/>
			<div class="flex justify-between text-xs text-gray-500 mt-1">
				<span>10% (Subtle)</span>
				<span>100% (Solid)</span>
			</div>
			<p class="text-xs text-gray-500 mt-2">Transparency level (not applied to Outline)</p>
		</div>

		<!-- Border Width (only show for styles with border) -->
		{#if hasBorder}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Border Width
				</label>
				<div class="grid grid-cols-5 gap-2">
					<button
						type="button"
						on:click={() => borderWidth = 'none'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {borderWidth === 'none' || borderWidth === 0 ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">None</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BORDER_WIDTH_PRESETS.none}px</div>
					</button>
					<button
						type="button"
						on:click={() => borderWidth = 'thin'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {borderWidth === 'thin' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Thin</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BORDER_WIDTH_PRESETS.thin}px</div>
					</button>
					<button
						type="button"
						on:click={() => borderWidth = 'default'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {borderWidth === 'default' || borderWidth === 2 ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Default</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BORDER_WIDTH_PRESETS.default}px</div>
					</button>
					<button
						type="button"
						on:click={() => borderWidth = 'medium'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {borderWidth === 'medium' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Medium</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BORDER_WIDTH_PRESETS.medium}px</div>
					</button>
					<button
						type="button"
						on:click={() => borderWidth = 'thick'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {borderWidth === 'thick' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Thick</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BORDER_WIDTH_PRESETS.thick}px</div>
					</button>
				</div>
				<p class="text-xs text-gray-500 mt-1.5">Border thickness for {selectedBlockStyle} style</p>
			</div>
		{/if}

		<!-- Gradient Style (only show when Gradient is selected) -->
		{#if selectedBlockStyle === 'gradient'}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-3">
					Gradient Style
				</label>
				<div class="grid grid-cols-4 gap-2">
					{#each ['diagonal-dark', 'vertical-fade', 'horizontal-flow', 'sunset-glow', 'ocean-deep', 'forest-path', 'royal-luxury', 'fire-blaze', 'spotlight', 'cosmic-burst', 'aurora', 'nebula', 'spin', 'vortex', 'prism', 'kaleidoscope'] as preset}
						{@const isSelected = selectedGradientPreset === preset}
						{@const gradient = getGradientColors(primaryColor, preset)}
						<button
							type="button"
							on:click={() => selectedGradientPreset = preset}
							class="group relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-[#00aa4f]' : 'hover:ring-2 hover:ring-gray-300'}"
						>
							<!-- Gradient Preview -->
							<div
								class="h-12 relative border {isSelected ? 'border-[#00aa4f]' : 'border-gray-200'}"
								style="background: {gradient.css};"
							>
								{#if isSelected}
									<div class="absolute top-1 right-1 w-4 h-4 bg-[#00aa4f] rounded-full flex items-center justify-center">
										<svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</div>
							
							<!-- Name Label -->
							<div class="py-1.5 px-2 {isSelected ? 'bg-[#e6f7ed] border-t border-[#00aa4f]/30' : 'bg-gray-50 border-t border-gray-200'}">
								<p class="text-xs font-semibold {isSelected ? 'text-[#00aa4f]' : 'text-gray-700'} truncate text-center">
									{getGradientPresetName(preset)}
								</p>
							</div>
						</button>
					{/each}
				</div>
				<p class="text-xs text-gray-500 mt-2">16 unique gradient styles with mixed types</p>
			</div>
		{/if}

		<!-- Shadow Style Selector -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Shadow Style {#if selectedBlockStyle === 'neon'}<span class="text-orange-600 text-xs">(disabled for Neon)</span>{/if}
			</label>
			<div class="grid grid-cols-6 gap-2">
				{#each shadowStyles as shadowId}
					{@const isSelected = selectedShadowStyle === shadowId}
					{@const isDisabled = selectedBlockStyle === 'neon'}
					<button
						type="button"
						on:click={() => { 
							selectedShadowStyle = shadowId;
							if (shadowId === 'custom') showAdvancedShadow = true;
						}}
						disabled={isDisabled}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-all {isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500' : isSelected ? 'bg-[#00aa4f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						{getShadowStyleName(shadowId)}
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-2">
				{#if selectedBlockStyle === 'neon'}
					Neon style uses glow effect instead of shadow
				{:else}
					Shadow depth applied to buttons
				{/if}
			</p>
			
			<!-- Advanced Shadow Controls -->
			{#if selectedShadowStyle === 'custom' && selectedBlockStyle !== 'neon'}
				<div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-semibold text-gray-900">Custom Shadow</h3>
						<button
							type="button"
							on:click={() => showAdvancedShadow = !showAdvancedShadow}
							class="text-xs text-[#00aa4f] hover:text-[#00aa4f]"
						>
							{showAdvancedShadow ? 'Hide' : 'Show'}
						</button>
					</div>
					
					{#if showAdvancedShadow}
						<!-- Offset X -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-1">
								Offset X: {shadowCustom.offsetX}px
							</label>
							<input
								type="range"
								bind:value={shadowCustom.offsetX}
								on:input={handleCustomShadowChange}
								min="-20"
								max="20"
								step="1"
								class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
							/>
						</div>
						
						<!-- Offset Y -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-1">
								Offset Y: {shadowCustom.offsetY}px
							</label>
							<input
								type="range"
								bind:value={shadowCustom.offsetY}
								on:input={handleCustomShadowChange}
								min="-20"
								max="20"
								step="1"
								class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
							/>
						</div>
						
						<!-- Blur -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-1">
								Blur: {shadowCustom.blur}px
							</label>
							<input
								type="range"
								bind:value={shadowCustom.blur}
								on:input={handleCustomShadowChange}
								min="0"
								max="50"
								step="1"
								class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
							/>
						</div>
						
						<!-- Spread -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-1">
								Spread: {shadowCustom.spread}px
							</label>
							<input
								type="range"
								bind:value={shadowCustom.spread}
								on:input={handleCustomShadowChange}
								min="-10"
								max="10"
								step="1"
								class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
							/>
						</div>
						
						<!-- Opacity -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-1">
								Opacity: {Math.round(shadowCustom.opacity * 100)}%
							</label>
							<input
								type="range"
								bind:value={shadowCustom.opacity}
								on:input={handleCustomShadowChange}
								min="0"
								max="1"
								step="0.01"
								class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00aa4f]"
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Link Icon Shape -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Link Icon Shape
			</label>
			<div class="grid grid-cols-3 gap-3">
				{#each iconShapes as shape}
					{@const isSelected = selectedLinkIconShape === shape.value}
					<button
						type="button"
						on:click={() => selectedLinkIconShape = shape.value}
						class="group relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-[#00aa4f]' : 'hover:ring-2 hover:ring-gray-300'}"
					>
						<!-- Preview Container -->
						<div
							class="p-4 flex items-center justify-center relative border {isSelected ? 'border-[#00aa4f]' : 'border-gray-200'} bg-white"
						>
							<div
								class="w-10 h-10 bg-gradient-to-br from-[#00aa4f] to-[#008f42] {shape.preview}"
							></div>
						</div>
						
						<!-- Name Label -->
						<div class="py-1.5 px-2 {isSelected ? 'bg-[#e6f7ed] border-t border-[#00aa4f]/30' : 'bg-gray-50 border-t border-gray-200'}">
							<p class="text-xs font-semibold {isSelected ? 'text-[#00aa4f]' : 'text-gray-700'} truncate text-center">
								{shape.label}
							</p>
						</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-2">Default shape for link thumbnails/icons</p>
		</div>
	</div>
</section>
