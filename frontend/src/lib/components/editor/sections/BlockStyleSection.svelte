<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import {
		getBlockStyleRecipeIds,
		getBlockStyleRecipeName,
		getBlockStyleRecipeDescription,
		getBlockStyleRecipe,
		type BlockStylePresetId
	} from '$lib/appearance/blockStyles';
	import { resolveToken, resolveAutoTextColor, resolveShadow } from '$lib/appearance/tokenResolver';

	// Get all available recipes
	const recipes = getBlockStyleRecipeIds();

	// Current selected recipe (simplified logic)
	$: currentRecipeId =
		($appearanceState.overrides?.['block.stylePreset'] as BlockStylePresetId) ||
		$appearance?.theme?.config?.defaults?.blockStylePreset ||
		'solid';

	// Select recipe
	function selectRecipe(recipeId: BlockStylePresetId) {
		updateAppearance('block.stylePreset', recipeId);
		
		// Special case: Brutal always uses hard shadow
		if (recipeId === 'brutal') {
			const hardShadow = `4px 4px 0px ${$appearance?.tokens?.shadowColor || '#000000'}`;
			updateAppearance('block.shadow', hardShadow);
		}
		// Clear shadow override for recipes that don't support custom shadows
		else if (recipeId === 'neon' || recipeId === 'glass') {
			// Neon uses glow, Glass uses blur - clear any shadow override
			updateAppearance('block.shadow', 'none');
		}
	}

	// Get preview style for each recipe (resolve with current theme tokens)
	function getPreviewStyle(recipeId: BlockStylePresetId) {
		if (!$appearance?.tokens) return {};

		const recipe = getBlockStyleRecipe(recipeId);
		const tokens = $appearance.tokens;

		const fill = resolveToken(recipe.fill, tokens);
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
			color: text,
			border: border ? `1px solid ${border}` : 'none',
			boxShadow: shadow || (glow ? `0 0 20px ${glow}` : 'none'),
			backdropFilter: recipe.blur ? `blur(${recipe.blur}px)` : 'none'
		};
	}

	// Shadow options
	const shadowOptions = [
		{ id: 'none', label: 'None', value: 'none' },
		{ id: 'subtle', label: 'Subtle', value: '0 1px 3px rgba(0,0,0,0.12)' },
		{ id: 'strong', label: 'Strong', value: '0 4px 8px rgba(0,0,0,0.16)' },
		{ id: 'hard', label: 'Hard', value: '4px 4px 0px rgba(0,0,0,1)' }
	];

	$: currentShadow = (() => {
		// Special case: Neon uses glow, not shadow - always return 'none'
		if (currentRecipeId === 'neon') {
			return 'none';
		}
		
		// Use override first, then theme default, then recipe default
		const override = $appearanceState.overrides?.['block.shadow'];
		const themeDefault = $appearance?.theme?.config?.defaults?.blockShadow;
		const recipeDefault = $appearance?.blockStyle?.shadow;
		
		// Special case: If Brutal recipe and no override, ensure hard shadow is shown
		if (currentRecipeId === 'brutal' && !override) {
			return recipeDefault || `4px 4px 0px ${$appearance?.tokens?.shadowColor || '#000000'}`;
		}
		
		return override || themeDefault || recipeDefault || 'none';
	})();

	// Track current shadow type (none/subtle/strong/hard)
	// Compare with actual shadowOptions values for accuracy
	$: currentShadowType = (() => {
		const shadow = currentShadow;
		if (!shadow || shadow === 'none') return 'none';
		
		// Find matching shadow option by comparing values
		const matchedOption = shadowOptions.find(opt => {
			if (opt.value === 'none') return false;
			// For hard shadow, check if it contains the pattern (handles dynamic shadowColor)
			if (opt.id === 'hard') {
				return shadow.includes('4px 4px 0px');
			}
			// For other shadows, do exact match
			return shadow === opt.value;
		});
		
		return matchedOption ? matchedOption.id : 'none';
	})();

	// Get current block style from appearance (for applying to preview)
	$: currentBlockStyle = $appearance?.blockStyle;

	// Helper: Get display style for a recipe
	function getDisplayStyle(recipeId: BlockStylePresetId): any {
		const isCurrentRecipe = recipeId === currentRecipeId;
		
		if (isCurrentRecipe && currentBlockStyle) {
			// For current recipe, use resolved block style
			const shadowToUse = recipeId === 'neon' 
				? '' // Neon: ignore shadow override, only use glow
				: (currentShadow !== 'none' ? currentShadow : (currentBlockStyle.shadow || ''));
			
			const resolvedShadow = resolveShadow(shadowToUse, $appearance?.tokens?.shadowColor || '#000000');
			
			return {
				backgroundColor: currentBlockStyle.fill,
				color: currentBlockStyle.text,
				border: currentBlockStyle.border ? `1px solid ${currentBlockStyle.border}` : 'none',
				boxShadow: resolvedShadow !== 'none' ? resolvedShadow : (currentBlockStyle.glow ? `0 0 20px ${currentBlockStyle.glow}` : 'none'),
				backdropFilter: currentBlockStyle.blur ? `blur(${currentBlockStyle.blur}px)` : 'none'
			};
		}
		
		// For other recipes, get base style
		const baseStyle = getPreviewStyle(recipeId);
		
		// Apply shadow overrides based on recipe type
		if (recipeId === 'brutal') {
			// Brutal: always show hard shadow
			baseStyle.boxShadow = `4px 4px 0px ${$appearance?.tokens?.shadowColor || '#000000'}`;
		} else if (recipeId !== 'neon' && currentShadow && currentShadow !== 'none') {
			// Other recipes (except Neon): apply shadow override
			baseStyle.boxShadow = resolveShadow(currentShadow, $appearance?.tokens?.shadowColor || '#000000');
		}
		
		return baseStyle;
	}

	// Memoize display styles for all recipes (reactive)
	$: displayStyles = recipes.reduce((acc, recipeId) => {
		acc[recipeId] = getDisplayStyle(recipeId);
		return acc;
	}, {} as Record<BlockStylePresetId, any>);

	// Get background style from theme
	$: previewBackground = $appearance?.tokens?.backgroundColor || '#ffffff';

	// Get block shape from current block preset
	$: blockShape = $appearance?.block?.shape || 'rounded';

	// Get border-radius from preset or override
	$: blockBorderRadius = (() => {
		const overrideBorderRadius = $appearanceState.overrides?.['block.borderRadius'];
		if (overrideBorderRadius !== undefined) {
			return overrideBorderRadius;
		}
		return $appearance?.block?.borderRadius || 12;
	})();

	// Map shape to border-radius class for preview
	$: shapeClass = {
		rounded: 'rounded-lg',
		pill: 'rounded-full',
		square: 'rounded-none'
	}[blockShape] || 'rounded-lg';

	function selectShadow(shadowId: string) {
		const shadow = shadowOptions.find((s) => s.id === shadowId);
		let shadowValue = shadow?.value || 'none';
		
		// If selecting hard shadow, use shadowColor token instead of fixed black
		if (shadowId === 'hard' && $appearance?.tokens?.shadowColor) {
			shadowValue = `4px 4px 0px ${$appearance.tokens.shadowColor}`;
		}
		
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
			<div class="grid grid-cols-4 gap-3 p-1">
				{#each recipes as recipeId}
					{@const isSelected = currentRecipeId === recipeId}
					<button
						on:click={() => selectRecipe(recipeId)}
						class="group relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] {isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}"
					>
						<!-- Preview Container -->
						<div
							class="aspect-square p-3 flex items-center justify-center relative border {isSelected ? 'border-blue-500' : 'border-gray-200'} bg-white"
							style="background: {previewBackground};"
						>
							{#if $appearance?.tokens}
								{@const displayStyle = displayStyles[recipeId]}
								<div
									class="w-full h-7 transition-all flex items-center justify-center {shapeClass} relative z-10"
									style="
										background-color: {displayStyle.backgroundColor};
										color: {displayStyle.color};
										border: {displayStyle.border};
										box-shadow: {displayStyle.boxShadow || 'none'};
										backdrop-filter: {displayStyle.backdropFilter || 'none'};
										-webkit-backdrop-filter: {displayStyle.backdropFilter || 'none'};
									"
								>
									<span class="text-[10px] font-semibold">Button</span>
								</div>
							{/if}
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
				<h3 class="text-sm font-medium text-gray-900 mb-3">Shadows</h3>
				{#if currentRecipeId === 'brutal'}
					<p class="text-xs text-gray-500 mb-2">Brutal style uses hard shadow by default</p>
				{/if}
				<div class="grid grid-cols-4 gap-2">
					{#each shadowOptions as shadow}
						{@const isDisabled = currentRecipeId === 'brutal' && shadow.id !== 'hard'}
						{@const isActive = currentShadowType === shadow.id}
						<button
							on:click={() => selectShadow(shadow.id)}
							disabled={isDisabled}
							class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all {isDisabled 
								? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
								: isActive
									? 'border-blue-500 bg-blue-50 text-blue-700 hover:scale-105'
									: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-105'}"
						>
							{shadow.label}
							{#if isActive && currentRecipeId === 'brutal'}
								<span class="ml-1">✓</span>
							{/if}
						</button>
					{/each}
				</div>
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

		<!-- Shadow Color (only show when Hard shadow is selected) -->
		{#if currentShadowType === 'hard'}
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
