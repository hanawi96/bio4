<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import { BLOCK_GAP_PRESETS, type BlockGapPreset } from '$lib/appearance/spacingTokens';

	const spacingLevels = [
		{ id: 'compact' as BlockGapPreset, name: 'Compact', spacing: 8, description: 'Tight spacing' },
		{ id: 'default' as BlockGapPreset, name: 'Default', spacing: 16, description: 'Balanced spacing' },
		{ id: 'spacious' as BlockGapPreset, name: 'Spacious', spacing: 24, description: 'Generous spacing' }
	];

	// Get current blockGap value (can be semantic key or number)
	$: currentBlockGapValue = $appearanceState.overrides?.['page.blockGap'] 
		?? $appearance?.theme?.config?.page?.layout?.blockGap;
	
	// Resolve to number for comparison
	$: currentBlockGapPx = typeof currentBlockGapValue === 'string' && currentBlockGapValue in BLOCK_GAP_PRESETS
		? BLOCK_GAP_PRESETS[currentBlockGapValue as BlockGapPreset]
		: typeof currentBlockGapValue === 'number'
			? currentBlockGapValue
			: 16;
	
	// Determine selected preset based on px value
	$: selectedSpacing = currentBlockGapPx <= 10 ? 'compact' 
		: currentBlockGapPx >= 20 ? 'spacious' 
		: 'default';

	function selectSpacing(level: typeof spacingLevels[0]) {
		// Save as semantic key to match theme format
		updateAppearance('page.blockGap', level.id);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Block Spacing</h2>
		<p class="text-sm text-gray-500 mt-1">Adjust space between elements</p>
	</div>
	
	<div class="p-6">
		<div class="grid grid-cols-3 gap-3">
			{#each spacingLevels as level}
				<button
					on:click={() => selectSpacing(level)}
					class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedSpacing === level.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
				>
					<!-- Preview -->
					<div class="mb-3 p-3 bg-gray-50 rounded-lg">
						<div class="space-y-{level.spacing === 8 ? '1' : level.spacing === 16 ? '2' : '3'}">
							<div class="h-3 bg-blue-600 rounded"></div>
							<div class="h-3 bg-blue-600 rounded"></div>
							<div class="h-3 bg-blue-600 rounded"></div>
						</div>
					</div>
					<!-- Info -->
					<p class="text-sm font-medium text-gray-900">{level.name}</p>
					<p class="text-xs text-gray-500 mt-1">{level.description}</p>
				</button>
			{/each}
		</div>
	</div>
</section>
