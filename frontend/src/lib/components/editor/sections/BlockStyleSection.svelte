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

	// Helper: Darken color for gradient
	function darkenColor(hex: string, percent: number): string {
		const num = parseInt(hex.replace('#', ''), 16);
		const r = Math.max(0, ((num >> 16) & 0xff) * (1 - percent / 100));
		const g = Math.max(0, ((num >> 8) & 0xff) * (1 - percent / 100));
		const b = Math.max(0, (num & 0xff) * (1 - percent / 100));
		return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
	}

	// Get preview style for each recipe (resolve with current theme tokens)
	function getPreviewStyle(recipeId: BlockStylePresetId) {
		if (!$appearance?.tokens) return {};

		const recipe = getBlockStyleRecipe(recipeId);
		const tokens = $appearance.tokens;

		let fill = resolveToken(recipe.fill, tokens);
		
		// Handle gradient fill
		if (recipe.fill.startsWith('gradient:')) {
			const baseColor = resolveToken(recipe.fill.replace('gradient:', ''), tokens);
			const darkColor = darkenColor(baseColor, 20);
			fill = `linear-gradient(135deg, ${baseColor} 0%, ${darkColor} 100%)`;
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
		// Special case: Neon uses glow, not shadow - always return 'none'
		if (currentRecipeId === 'neon') {
			return 'none';
		}
		
		// Use override first, then theme default, then recipe default
		const override = $appearanceState.overrides?.['block.shadow'];
		const themeDefault = $appearance?.theme?.config?.defaults?.blockShadow;
		const recipeDefault = $appearance?.blockStyle?.shadow;
		
		return override || themeDefault || recipeDefault || 'none';
	})();

	// Get current shadow style ID from shadow value
	$: currentShadowStyleId = (() => {
		const shadow = currentShadow;
		if (!shadow || shadow === 'none') return 'none';
		
		// Try to match with shadow recipes
		for (const styleId of shadowStyles) {
			const recipe = getShadowRecipe(styleId as ShadowStylePreset);
			const resolvedValue = resolveToken(recipe.value, $appearance?.tokens || {});
			
			// For brutal shadow, check pattern
			if (styleId === 'brutal' && shadow.includes('4px 4px 0px')) {
				return 'brutal';
			}
			
			// For other shadows, check if values match
			if (resolvedValue === shadow) {
				return styleId;
			}
		}
		
		return 'none';
	})();

	// Helper: Get display style for a recipe
	function getDisplayStyle(recipeId: BlockStylePresetId): any {
		// Get base style from recipe
		const baseStyle = getPreviewStyle(recipeId);
		
		// Apply shadow based on current shadow selection
		if (recipeId !== 'neon' && currentShadow && currentShadow !== 'none') {
			// Apply current shadow selection (except for Neon which uses glow)
			baseStyle.boxShadow = currentShadow;
		}
		// Neon keeps its glow from baseStyle, others keep recipe default if no shadow selected
		
		return baseStyle;
	}

	// Memoize display styles for all recipes (reactive)
	// Dependencies: recipes, currentShadow, $appearance.tokens (blockBase, shadowColor, etc.)
	$: displayStyles = (() => {
		// Track dependencies
		const _shadow = currentShadow;
		const _tokens = $appearance?.tokens;
		
		return recipes.reduce((acc, recipeId) => {
			acc[recipeId] = getDisplayStyle(recipeId);
			return acc;
		}, {} as Record<BlockStylePresetId, any>);
	})();

	// Get background style from theme - check override first, then theme default
	$: previewBackground = $appearanceState.overrides?.['backgroundColor'] || $appearance?.tokens?.backgroundColor || '#ffffff';

	// Get block shape from current block preset
	$: blockShape = $appearance?.block?.shape || 'rounded';

	// Get border-radius from preset or override
	$: blockBorderRadius = $appearanceState.overrides?.['block.borderRadius'] ?? $appearance?.block?.borderRadius ?? 12;

	// Map shape to border-radius class for preview
	$: shapeClass = {
		rounded: 'rounded-lg',
		pill: 'rounded-full',
		square: 'rounded-none'
	}[blockShape] || 'rounded-lg';

	function selectShadow(shadowId: ShadowStylePreset) {
		const recipe = getShadowRecipe(shadowId);
		const shadowValue = resolveToken(recipe.value, $appearance?.tokens || {});
		updateAppearance('block.shadow', shadowValue);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Block Style</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your link buttons</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Button Style -->
		<div>
			<h3 class="text-sm font-medium text-gray-900 mb-3">Button style</h3>
			<div class="grid grid-cols-3 gap-3">
				{#each recipes as recipeId}
					{@const isSelected = currentRecipeId === recipeId}
					{@const displayStyle = displayStyles[recipeId] || {}}
					<button
						on:click={() => selectRecipe(recipeId)}
						class="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}"
					>
						<!-- Preview Container -->
						<div
							class="aspect-square p-3 flex items-center justify-center relative border {isSelected ? 'border-blue-500' : 'border-gray-200'} bg-white overflow-hidden"
							style="background: {previewBackground}; background-size: cover; background-position: center;"
						>
							<div
								class="w-full h-8 transition-all flex items-center justify-center {shapeClass} relative z-10"
								style="
									background: {displayStyle.backgroundImage !== 'none' ? displayStyle.backgroundImage : displayStyle.backgroundColor};
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
						<div class="py-2 px-2 {isSelected ? 'bg-blue-50 border-t border-blue-200' : 'bg-gray-50 border-t border-gray-200'}">
							<p class="text-xs font-semibold {isSelected ? 'text-blue-700' : 'text-gray-700'} truncate text-center">
								{getBlockStyleRecipeName(recipeId)}
							</p>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Corners Slider -->
		<div>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-medium text-gray-900">Corners</h3>
				<span class="text-xs text-gray-500">{blockBorderRadius}px</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs text-gray-500 w-12">Square</span>
				<input
					type="range"
					min="0"
					max="50"
					value={blockBorderRadius}
					on:input={(e) => updateAppearance('block.borderRadius', parseInt(e.currentTarget.value))}
					class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
				/>
				<span class="text-xs text-gray-500 w-12 text-right">Round</span>
			</div>
		</div>

		<!-- Shadows (hide when Neon is selected) -->
		{#if currentRecipeId !== 'neon'}
			<div>
				<h3 class="text-sm font-medium text-gray-900 mb-3">Shadow Style</h3>
				<div class="grid grid-cols-5 gap-2">
					{#each shadowStyles as shadowId}
						{@const isSelected = currentShadowStyleId === shadowId}
						<button
							on:click={() => selectShadow(shadowId)}
							class="px-3 py-2 rounded-lg text-sm font-medium transition-all {isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							{getShadowStyleName(shadowId)}
						</button>
					{/each}
				</div>
				<p class="text-xs text-gray-500 mt-2">Shadow depth applied to buttons</p>
			</div>
		{/if}

		<!-- Block Base Color -->
		<div class="pt-6 border-t border-gray-100">
			<div class="flex items-center justify-between mb-3">
				<div>
					<p class="text-sm font-medium text-gray-900">Block Color</p>
					<p class="text-xs text-gray-500">Base color for all block styles</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex-1">
					<div class="relative">
						<input
							type="color"
							value={$appearance?.tokens?.blockBase || '#3b82f6'}
							on:input={(e) => updateAppearance('tokens.blockBase', e.currentTarget.value)}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
							<div 
								class="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
								style="background-color: {$appearance?.tokens?.blockBase || '#3b82f6'};"
							></div>
							<div class="flex-1">
								<p class="text-xs font-medium text-gray-500 uppercase">Block Base</p>
								<p class="text-sm font-bold text-gray-900 font-mono">{$appearance?.tokens?.blockBase || '#3b82f6'}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<p class="text-xs text-gray-500 mt-2">
				💡 Changing this color will update all block styles automatically
			</p>
		</div>

		<!-- Shadow Color (only show when Hard or Brutal shadow is selected) -->
		{#if currentShadowStyleId === 'hard' || currentShadowStyleId === 'brutal'}
			<div class="pt-6 border-t border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-medium text-gray-900">Shadow Color</p>
						<p class="text-xs text-gray-500">Color for hard shadow effect</p>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="flex-1">
						<div class="relative">
							<input
								type="color"
								value={$appearance?.tokens?.shadowColor || '#000000'}
								on:input={(e) => updateAppearance('tokens.shadowColor', e.currentTarget.value)}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
								<div 
									class="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
									style="background-color: {$appearance?.tokens?.shadowColor || '#000000'};"
								></div>
								<div class="flex-1">
									<p class="text-xs font-medium text-gray-500 uppercase">Shadow Color</p>
									<p class="text-sm font-bold text-gray-900 font-mono">{$appearance?.tokens?.shadowColor || '#000000'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<p class="text-xs text-gray-500 mt-2">
					🎨 Customize the shadow color for hard shadow
				</p>
			</div>
		{/if}
	</div>
</section>
