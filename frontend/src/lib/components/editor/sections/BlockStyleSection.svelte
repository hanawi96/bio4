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
	import { resolveToken, resolveAutoTextColor } from '$lib/appearance/tokenResolver';

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
			border: border ? `2px solid ${border}` : 'none',
			boxShadow: shadow || (glow ? `0 0 20px ${glow}` : 'none'),
			backdropFilter: recipe.blur ? `blur(${recipe.blur}px)` : 'none'
		};
	}

	// Get current block style from appearance (for applying to preview)
	$: currentBlockStyle = $appearance?.blockStyle;

	// Memoize display styles for all recipes (reactive)
	$: displayStyles = recipes.reduce((acc, recipeId) => {
		if (recipeId === currentRecipeId && currentBlockStyle) {
			acc[recipeId] = {
				backgroundColor: currentBlockStyle.fill,
				color: currentBlockStyle.text,
				border: currentBlockStyle.border ? `2px solid ${currentBlockStyle.border}` : 'none',
				boxShadow: currentBlockStyle.shadow || (currentBlockStyle.glow ? `0 0 20px ${currentBlockStyle.glow}` : 'none'),
				backdropFilter: currentBlockStyle.blur ? `blur(${currentBlockStyle.blur}px)` : 'none'
			};
		} else {
			acc[recipeId] = getPreviewStyle(recipeId);
		}
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

	// Shadow options
	const shadowOptions = [
		{ id: 'none', label: 'None', value: 'none' },
		{ id: 'subtle', label: 'Subtle', value: '0 1px 2px rgba(0,0,0,0.05)' },
		{ id: 'strong', label: 'Strong', value: '0 4px 6px rgba(0,0,0,0.1)' },
		{ id: 'hard', label: 'Hard', value: '4px 4px 0px rgba(0,0,0,1)' }
	];

	$: currentShadow = (() => {
		// If on Brutal recipe, always show Hard as selected
		if (currentRecipeId === 'brutal') {
			return '4px 4px 0px rgba(0,0,0,1)'; // Match the Hard button value
		}
		
		// Otherwise use override or theme default
		return $appearanceState.overrides?.['block.shadow'] 
			|| $appearance?.theme?.config?.defaults?.blockShadow 
			|| 'none';
	})();

	function selectShadow(shadowId: string) {
		const shadow = shadowOptions.find((s) => s.id === shadowId);
		const shadowValue = shadow?.value || 'none';
		
		// If currently on Brutal and user selects a different shadow, switch to Solid
		if (currentRecipeId === 'brutal' && shadowValue !== currentBlockStyle?.shadow) {
			updateAppearance('block.stylePreset', 'solid');
		}
		
		// If currently on Solid and user selects Hard shadow, switch to Brutal
		if (currentRecipeId === 'solid' && shadowId === 'hard') {
			updateAppearance('block.stylePreset', 'brutal');
			return; // Don't set shadow override, let Brutal use its built-in shadow
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
			<div class="grid grid-cols-6 gap-3">
				{#each recipes as recipeId}
					<button
						on:click={() => selectRecipe(recipeId)}
						class="group rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {currentRecipeId === recipeId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
					>
						<!-- Preview -->
						<div
							class="aspect-square p-4 flex items-center justify-center relative"
							style="background: {previewBackground};"
						>
							<!-- Subtle pattern overlay to make blocks visible on any background -->
							<div class="absolute inset-0 opacity-[0.03]" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px);"></div>
							
							{#if $appearance?.tokens}
								{@const displayStyle = displayStyles[recipeId]}
								<div
									class="w-full h-8 transition-all flex items-center justify-center {shapeClass} relative z-10"
									style="
										background-color: {displayStyle.backgroundColor};
										color: {displayStyle.color};
										border: {displayStyle.border};
										box-shadow: {displayStyle.boxShadow || 'none'};
										backdrop-filter: {displayStyle.backdropFilter || 'none'};
									"
								>
									<div class="w-3 h-3 rounded-full bg-current opacity-60"></div>
								</div>
							{/if}
						</div>
						
						<!-- Name & Description -->
						<div class="py-2 px-2 bg-white border-t border-gray-100">
							<p class="text-xs font-semibold text-gray-900 truncate text-center">
								{getBlockStyleRecipeName(recipeId)}
							</p>
							<p class="text-[10px] text-gray-500 truncate text-center mt-0.5">
								{getBlockStyleRecipeDescription(recipeId)}
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

		<!-- Shadows -->
		<div>
			<h3 class="text-sm font-medium text-gray-900 mb-3">Shadows</h3>
			<div class="grid grid-cols-4 gap-2">
				{#each shadowOptions as shadow}
					<button
						on:click={() => selectShadow(shadow.id)}
						class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all hover:scale-105 {currentShadow === shadow.value
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
					>
						{shadow.label}
					</button>
				{/each}
			</div>
		</div>

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

		<!-- Shadow Color (only show when Brutal is selected) -->
		{#if currentRecipeId === 'brutal'}
			<div class="pt-6 border-t border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-medium text-gray-900">Shadow Color</p>
						<p class="text-xs text-gray-500">Color for brutal shadow effect</p>
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
					🎨 Customize the shadow color for brutal style
				</p>
			</div>
		{/if}
	</div>
</section>
