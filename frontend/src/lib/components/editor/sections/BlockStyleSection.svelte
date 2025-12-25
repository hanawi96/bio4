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

		// Resolve colors for this specific recipe
		const fill = resolveToken(recipe.fill, tokens);
		const text =
			recipe.text === 'auto'
				? resolveAutoTextColor(recipe.fill, tokens)
				: resolveToken(recipe.text, tokens);
		const border = recipe.border ? resolveToken(recipe.border, tokens) : undefined;
		const glow = recipe.glow ? resolveToken(recipe.glow, tokens) : undefined;

		return {
			backgroundColor: fill,
			color: text,
			border: border ? `2px solid ${border}` : 'none',
			boxShadow: glow ? `0 0 20px ${glow}` : 'none',
			backdropFilter: recipe.blur ? `blur(${recipe.blur}px)` : 'none'
		};
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Block Style</h2>
		<p class="text-sm text-gray-500 mt-1">Choose how your link buttons look</p>
	</div>
	
	<div class="p-6">
		<!-- Block Style Recipes Grid -->
		<div class="grid grid-cols-5 gap-3">
			{#each recipes as recipeId}
				<button
					on:click={() => selectRecipe(recipeId)}
					class="group rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {currentRecipeId === recipeId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
				>
					<!-- Preview -->
					<div
						class="aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 p-3 flex flex-col items-center justify-center gap-2"
					>
						{#if $appearance?.tokens}
							{@const previewStyle = getPreviewStyle(recipeId)}
							{#each [1, 2, 3] as _}
								<div
									class="w-full h-5 rounded-lg transition-all"
									style="
										background-color: {previewStyle.backgroundColor};
										color: {previewStyle.color};
										border: {previewStyle.border};
										box-shadow: {previewStyle.boxShadow || 'none'};
										backdrop-filter: {previewStyle.backdropFilter || 'none'};
									"
								></div>
							{/each}
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

		<!-- Block Base Color -->
		<div class="mt-6 pt-6 border-t border-gray-100">
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
	</div>
</section>
