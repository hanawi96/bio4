<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import {
		getBlockStyleRecipeIds,
		getBlockStyleRecipeName,
		getBlockStyleRecipeDescription,
		getBlockStyleRecipe,
		getShadowStyleIds,
		getShadowStyleName,
		getShadowRecipe,
		type BlockStylePresetId,
		type ShadowStylePreset
	} from '$lib/appearance/blockStyles';
	import { resolveToken, resolveAutoTextColor } from '$lib/appearance/tokenResolver';
	import { validateAndNormalizeHexColor, darkenColor, applyOpacity } from '$lib/utils/colorUtils';

	// Get all available recipes
	const recipes = getBlockStyleRecipeIds();
	const shadowStyles = getShadowStyleIds();

	// Current selected recipe (simplified logic)
	$: currentRecipeId =
		($appearanceState.overrides?.['block.stylePreset'] as BlockStylePresetId) ||
		$appearance?.theme?.config?.page?.defaults?.blockStylePreset ||
		'solid';

	// Select recipe
	function selectRecipe(recipeId: BlockStylePresetId) {
		updateAppearance('block.stylePreset', recipeId);
		
		// Clear shadow override for recipes that don't support custom shadows
		if (recipeId === 'neon' || recipeId === 'glass') {
			// Neon uses glow, Glass uses blur - clear any shadow override
			updateAppearance('block.shadow', 'none');
		}
	}

	// Get preview style for each recipe (resolve with current theme tokens)
	function getPreviewStyle(recipeId: BlockStylePresetId) {
		if (!$appearance?.tokens) return {};

		const recipe = getBlockStyleRecipe(recipeId);
		const tokens = $appearance.tokens;

		let fill = resolveToken(recipe.fill, tokens);
		
		// Handle gradient fill FIRST (before opacity)
		if (recipe.fill.startsWith('gradient:')) {
			const baseColor = resolveToken(recipe.fill.replace('gradient:', ''), tokens);
			const darkColor = darkenColor(baseColor, 20);
			fill = `linear-gradient(135deg, ${baseColor} 0%, ${darkColor} 100%)`;
		}
		
		// Glass: Apply special opacity mapping (10-35% range) AFTER gradient
		if (recipeId === 'glass') {
			// For glass preview, use max opacity (35%) to show the effect clearly
			const glassOpacity = 35;
			fill = applyOpacity(fill, glassOpacity);
		}
		
		const text =
			recipe.text === 'auto'
				? resolveAutoTextColor(recipe.fill, tokens)
				: resolveToken(recipe.text, tokens);
		const border = recipe.border ? resolveToken(recipe.border, tokens) : undefined;
		const glow = recipe.glow ? resolveToken(recipe.glow, tokens) : undefined;
		
		// Resolve shadow - if it's a token reference, resolve it; otherwise use as-is
		const shadow = recipe.shadow 
			? (recipe.shadow.includes('px') 
				? recipe.shadow 
				: `4px 4px 0px ${resolveToken(recipe.shadow, tokens)}`)
			: undefined;

		return {
			backgroundColor: fill,
			backgroundImage: recipe.fill.startsWith('gradient:') ? fill : 'none',
			color: text,
			border: border ? `1px solid ${border}` : 'none',
			boxShadow: shadow || (glow ? `0 0 20px ${glow}` : 'none'),
			backdropFilter: recipe.blur ? `blur(${recipe.blur}px)` : 'none'
		};
	}

	$: currentShadow = (() => {
		if (currentRecipeId === 'neon') return 'none';
		return $appearanceState.overrides?.['block.shadow'] 
			|| $appearance?.theme?.config?.defaults?.blockShadow 
			|| $appearance?.blockStyle?.shadow 
			|| 'none';
	})();

	// Helper: Get display style for a recipe
	function getDisplayStyle(recipeId: BlockStylePresetId): any {
		const baseStyle = getPreviewStyle(recipeId);
		
		if (recipeId !== 'neon' && currentShadow && currentShadow !== 'none') {
			const shadowValue = resolveToken(
				getShadowRecipe(currentShadow as ShadowStylePreset).value,
				$appearance?.tokens || {}
			);
			baseStyle.boxShadow = shadowValue;
		}
		
		return baseStyle;
	}

	// Memoize display styles (reactive to shadow and tokens changes)
	$: displayStyles = recipes.reduce((acc, recipeId) => {
		acc[recipeId] = getDisplayStyle(recipeId);
		return acc;
	}, {} as Record<BlockStylePresetId, any>);

	// Get border-radius from preset or override (normalize to number)
	$: blockBorderRadius = (() => {
		const override = $appearanceState.overrides?.['block.borderRadius'];
		if (override !== undefined) {
			// Override is already a number from UI
			return typeof override === 'number' ? override : 12;
		}
		
		// Get from appearance (could be string token or number)
		const themeValue = $appearance?.block?.borderRadius;
		if (themeValue === undefined) return 12;
		
		// Normalize string tokens to numbers (match Theme Editor)
		if (typeof themeValue === 'string') {
			const tokenMap: Record<string, number> = {
				'none': 0,
				'sm': 4,
				'md': 8,
				'lg': 12,
				'xl': 16,
				'full': 9999
			};
			return tokenMap[themeValue] ?? 12;
		}
		
		return themeValue;
	})();

	function selectShadow(shadowId: ShadowStylePreset) {
		updateAppearance('block.shadow', shadowId);
	}

	// Block Color & Text Color
	$: blockColor = $appearanceState.overrides?.['block.color'] ?? $appearance?.theme?.config?.semantic?.color?.primary ?? '#00aa4f';
	$: blockTextColor = $appearanceState.overrides?.['block.textColor'] ?? $appearance?.theme?.config?.semantic?.color?.block?.text ?? '#ffffff';

	function updateBlockColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('block.color', value);
	}

	function updateBlockTextColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('block.textColor', value);
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Block Style</h2>
	<div class="space-y-6">
		<!-- Button Style -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Button Style
			</label>
			<div class="grid grid-cols-3 gap-3">
				{#each recipes as recipeId}
					{@const isSelected = currentRecipeId === recipeId}
					{@const displayStyle = displayStyles[recipeId] || {}}
					<button
						type="button"
						on:click={() => selectRecipe(recipeId)}
						class="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-[#00aa4f]' : 'hover:ring-2 hover:ring-gray-300'}"
					>
						<!-- Preview Container -->
						<div
							class="h-20 p-2 flex items-center justify-center relative border border-gray-200 overflow-hidden"
							style="background-color: #dbdde0;"
						>
							<div
								class="w-full transition-all flex items-center justify-center relative"
								style="
									background-color: {displayStyle.backgroundImage !== 'none' ? 'transparent' : displayStyle.backgroundColor};
									background-image: {displayStyle.backgroundImage !== 'none' ? displayStyle.backgroundImage : 'none'};
									color: {displayStyle.color};
									border: {displayStyle.border};
									box-shadow: {displayStyle.boxShadow || 'none'};
									backdrop-filter: {displayStyle.backdropFilter || 'none'};
									-webkit-backdrop-filter: {displayStyle.backdropFilter || 'none'};
									border-radius: {blockBorderRadius}px;
									padding: 12px 16px;
								"
							>
								<span class="text-xs font-semibold">Button</span>
							</div>
						</div>
						
						<!-- Name Label -->
						<div class="py-1.5 px-2 border-t border-gray-200 {isSelected ? 'bg-[#e6f7ed]' : 'bg-gray-50'}">
							<p class="text-xs font-semibold {isSelected ? 'text-[#00aa4f]' : 'text-gray-700'} truncate text-center">
								{getBlockStyleRecipeName(recipeId)}
							</p>
						</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-2">Button color and visual effect style</p>
		</div>

		<!-- Block Border Radius -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Block Border Radius
			</label>
			<div class="grid grid-cols-6 gap-2">
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 0)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 0
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">None</div>
					<div class="text-[10px] opacity-60">0px</div>
				</button>
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 4)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 4
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Small</div>
					<div class="text-[10px] opacity-60">4px</div>
				</button>
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 8)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 8
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Medium</div>
					<div class="text-[10px] opacity-60">8px</div>
				</button>
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 12)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 12
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Large</div>
					<div class="text-[10px] opacity-60">12px</div>
				</button>
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 16)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 16
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">XL</div>
					<div class="text-[10px] opacity-60">16px</div>
				</button>
				<button
					type="button"
					on:click={() => updateAppearance('block.borderRadius', 9999)}
					class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadius === 9999
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Full</div>
					<div class="text-[10px] opacity-60">Pill</div>
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-1.5">Border radius style for blocks/links</p>
		</div>

		<!-- Shadow Style Selector -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Shadow Style {#if currentRecipeId === 'neon'}<span class="text-orange-600 text-xs">(disabled for Neon)</span>{/if}
			</label>
			<div class="grid grid-cols-6 gap-2">
				{#each shadowStyles as shadowId}
					{@const isSelected = currentShadow === shadowId}
					{@const isDisabled = currentRecipeId === 'neon'}
					<button
						type="button"
						on:click={() => selectShadow(shadowId)}
						disabled={isDisabled}
						class="px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all {isDisabled ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500' : isSelected ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}"
					>
						{getShadowStyleName(shadowId)}
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-2">
				{#if currentRecipeId === 'neon'}
					Neon style uses glow effect instead of shadow
				{:else}
					Shadow depth applied to buttons
				{/if}
			</p>
		</div>

		<!-- Block Colors -->
		<div>
			<h3 class="text-base font-semibold text-gray-900 mb-4">Block Colors</h3>
			
			<div class="grid grid-cols-2 gap-6">
				<!-- Block Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-3">
						Block Color
					</label>
					<div class="flex items-center gap-3 mb-2">
						<div class="relative">
							<input
								type="color"
								value={blockColor}
								on:input={updateBlockColor}
								class="color-picker-round w-14 h-14 rounded-full border-2 border-gray-200 cursor-pointer"
							/>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={blockColor}
								on:input={updateBlockColor}
								class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aa4f] focus:border-transparent"
								placeholder="#000000"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500">
						Main accent color for buttons and links
					</p>
				</div>

				<!-- Block Text Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-3">
						Block Text Color
					</label>
					<div class="flex items-center gap-3 mb-2">
						<div class="relative">
							<input
								type="color"
								value={blockTextColor}
								on:input={updateBlockTextColor}
								class="color-picker-round w-14 h-14 rounded-full border-2 border-gray-200 cursor-pointer"
							/>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={blockTextColor}
								on:input={updateBlockTextColor}
								class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aa4f] focus:border-transparent"
								placeholder="#ffffff"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500">
						Text color inside buttons and links
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
