<script lang="ts">
	import { BLOCK_GAP_PRESETS, BLOCK_PADDING_PRESETS, type BlockGapPreset, type BlockPaddingPreset } from '$lib/appearance/spacingTokens';
	
	export let maxWidth: number;
	export let textAlign: 'left' | 'center' | 'right';
	export let pagePadding: number;
	export let blockGapPreset: BlockGapPreset;
	export let blockPaddingX: number;
	export let blockPaddingY: number;
	export let blockBorderRadiusType: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
	export let selectedLinkGroupLayout: 'list' | 'grid' | 'cards' = 'list';
	
	// Disable "full" option for grid and card layouts
	$: isFullDisabled = selectedLinkGroupLayout === 'grid' || selectedLinkGroupLayout === 'cards';
	
	// Auto-adjust to 'xl' if currently 'full' and switching to grid/card
	$: if (isFullDisabled && blockBorderRadiusType === 'full') {
		blockBorderRadiusType = 'xl';
	}
	
	const blockGapOptions: Array<{ value: BlockGapPreset; label: string; description: string }> = [
		{ value: 'compact', label: 'Compact', description: 'Tight spacing (8px)' },
		{ value: 'default', label: 'Default', description: 'Balanced spacing (16px)' },
		{ value: 'spacious', label: 'Spacious', description: 'Generous spacing (24px)' }
	];
	
	// Block Padding preset mode
	let blockPaddingMode: BlockPaddingPreset | 'custom' = 'default';
	let isInitialized = false;
	
	// Auto-detect preset only on initial load
	$: if (!isInitialized && blockPaddingX && blockPaddingY) {
		const matchedPreset = Object.entries(BLOCK_PADDING_PRESETS).find(
			([_, preset]) => preset.x === blockPaddingX && preset.y === blockPaddingY
		);
		blockPaddingMode = matchedPreset ? (matchedPreset[0] as BlockPaddingPreset) : 'custom';
		isInitialized = true;
	}
	
	function selectPaddingPreset(preset: BlockPaddingPreset | 'custom') {
		blockPaddingMode = preset;
		if (preset !== 'custom') {
			const values = BLOCK_PADDING_PRESETS[preset];
			blockPaddingX = values.x;
			blockPaddingY = values.y;
		}
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Layout</h2>
	
	<div class="space-y-5">
		<!-- Max Width -->
		<div>
			<label for="maxWidth" class="block text-sm font-medium text-gray-700 mb-2">
				Max Width (px)
			</label>
			<input
				id="maxWidth"
				type="number"
				bind:value={maxWidth}
				min="320"
				max="1200"
				class="input-ios"
			/>
		</div>
		
		<!-- Text Align -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Text Align
			</label>
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					on:click={() => textAlign = 'left'}
					class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {textAlign === 'left'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14" />
					</svg>
					<span class="font-semibold">Left</span>
				</button>
				<button
					type="button"
					on:click={() => textAlign = 'center'}
					class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {textAlign === 'center'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14" />
					</svg>
					<span class="font-semibold">Center</span>
				</button>
				<button
					type="button"
					on:click={() => textAlign = 'right'}
					class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {textAlign === 'right'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14" />
					</svg>
					<span class="font-semibold">Right</span>
				</button>
			</div>
		</div>
		
		<!-- Page Padding -->
		<div>
			<label for="pagePadding" class="block text-sm font-medium text-gray-700 mb-2">
				Page Padding (px)
			</label>
			<input
				id="pagePadding"
				type="number"
				bind:value={pagePadding}
				min="8"
				max="48"
				class="input-ios"
			/>
		</div>
		
		<!-- Block Gap -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Block Gap
			</label>
			<div class="grid grid-cols-3 gap-2">
				{#each blockGapOptions as option}
					<button
						type="button"
						on:click={() => blockGapPreset = option.value}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockGapPreset === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60 mt-0.5">{BLOCK_GAP_PRESETS[option.value]}px</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1.5">{blockGapOptions.find(o => o.value === blockGapPreset)?.description || ''}</p>
		</div>
		
		<!-- Block Padding -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Block Padding
			</label>
			<div class="grid grid-cols-4 gap-2 mb-3">
				<button
					type="button"
					on:click={() => selectPaddingPreset('tight')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockPaddingMode === 'tight'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Tight</div>
					<div class="text-[10px] opacity-60 mt-0.5">12×8</div>
				</button>
				<button
					type="button"
					on:click={() => selectPaddingPreset('default')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockPaddingMode === 'default'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Default</div>
					<div class="text-[10px] opacity-60 mt-0.5">16×12</div>
				</button>
				<button
					type="button"
					on:click={() => selectPaddingPreset('spacious')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockPaddingMode === 'spacious'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Spacious</div>
					<div class="text-[10px] opacity-60 mt-0.5">24×16</div>
				</button>
				<button
					type="button"
					on:click={() => selectPaddingPreset('custom')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockPaddingMode === 'custom'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Custom</div>
					<div class="text-[10px] opacity-60 mt-0.5">•••</div>
				</button>
			</div>
			
			{#if blockPaddingMode === 'custom'}
				<div class="grid grid-cols-2 gap-3 mt-3">
					<div>
						<label for="blockPaddingX" class="block text-xs font-medium text-gray-600 mb-1.5">
							Horizontal (px)
						</label>
						<input
							id="blockPaddingX"
							type="number"
							bind:value={blockPaddingX}
							min="4"
							max="32"
							class="input-ios text-sm"
						/>
					</div>
					<div>
						<label for="blockPaddingY" class="block text-xs font-medium text-gray-600 mb-1.5">
							Vertical (px)
						</label>
						<input
							id="blockPaddingY"
							type="number"
							bind:value={blockPaddingY}
							min="4"
							max="32"
							class="input-ios text-sm"
						/>
					</div>
				</div>
			{/if}
			<p class="text-xs text-gray-500 mt-1.5">Padding inside blocks (X × Y)</p>
		</div>
		
		<!-- Block Border Radius -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Block Border Radius
			</label>
			<div class="grid grid-cols-6 gap-2">
				{#each [
					{ value: 'none', label: 'None', size: '0px' },
					{ value: 'sm', label: 'Small', size: '4px' },
					{ value: 'md', label: 'Medium', size: '8px' },
					{ value: 'lg', label: 'Large', size: '12px' },
					{ value: 'xl', label: 'XL', size: '16px' },
					{ value: 'full', label: 'Full', size: 'Pill' }
				] as option}
					<button
						type="button"
						on:click={() => blockBorderRadiusType = option.value}
						disabled={option.value === 'full' && isFullDisabled}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {blockBorderRadiusType === option.value
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: option.value === 'full' && isFullDisabled
								? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
								: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">{option.label}</div>
						<div class="text-[10px] opacity-60">{option.size}</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-500 mt-1.5">
				{#if isFullDisabled}
					<span class="text-orange-600">Full radius disabled for Grid/Card layouts</span>
				{:else}
					Border radius style for blocks/links
				{/if}
			</p>
		</div>
	</div>
</section>
