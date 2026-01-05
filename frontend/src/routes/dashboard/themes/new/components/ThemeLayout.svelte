<script lang="ts">
	import { MAX_WIDTH_PRESETS, PAGE_PADDING_PRESETS, type MaxWidthKey, type PagePaddingKey } from '$lib/appearance/spacingTokens';
	
	export let maxWidth: MaxWidthKey | number;
	export let textAlign: 'left' | 'center' | 'right';
	export let pagePadding: PagePaddingKey | number;
	
	// Max Width preset mode
	let maxWidthMode: MaxWidthKey | 'custom' = 'sm';
	let isMaxWidthInitialized = false;
	
	// Auto-detect max width preset only on initial load
	$: if (!isMaxWidthInitialized && maxWidth) {
		// Check if it's a string key
		if (typeof maxWidth === 'string' && maxWidth in MAX_WIDTH_PRESETS) {
			maxWidthMode = maxWidth as MaxWidthKey;
		} else if (typeof maxWidth === 'number') {
			// Check if number matches a preset value
			const matchedPreset = Object.entries(MAX_WIDTH_PRESETS).find(
				([_, value]) => value === maxWidth
			);
			maxWidthMode = matchedPreset ? (matchedPreset[0] as MaxWidthKey) : 'custom';
		}
		isMaxWidthInitialized = true;
	}
	
	function selectMaxWidthPreset(preset: MaxWidthKey | 'custom') {
		maxWidthMode = preset;
		if (preset !== 'custom') {
			maxWidth = preset; // Set string key, not number value
		}
	}
	
	// Page Padding preset mode
	let pagePaddingMode: PagePaddingKey | 'custom' = 'default';
	let isPagePaddingInitialized = false;
	
	// Auto-detect page padding preset only on initial load
	$: if (!isPagePaddingInitialized && pagePadding) {
		// Check if it's a string key
		if (typeof pagePadding === 'string' && pagePadding in PAGE_PADDING_PRESETS) {
			pagePaddingMode = pagePadding as PagePaddingKey;
		} else if (typeof pagePadding === 'number') {
			// Check if number matches a preset value
			const matchedPreset = Object.entries(PAGE_PADDING_PRESETS).find(
				([_, value]) => value === pagePadding
			);
			pagePaddingMode = matchedPreset ? (matchedPreset[0] as PagePaddingKey) : 'custom';
		}
		isPagePaddingInitialized = true;
	}
	
	function selectPagePaddingPreset(preset: PagePaddingKey | 'custom') {
		pagePaddingMode = preset;
		if (preset !== 'custom') {
			pagePadding = preset; // Set string key, not number value
		}
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Layout</h2>
	
	<div class="space-y-5">
		<!-- Max Width -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Max Width
			</label>
			<div class="grid grid-cols-6 gap-2 mb-3">
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('xs')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'xs'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">XS</div>
					<div class="text-[10px] opacity-60 mt-0.5">320px</div>
				</button>
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('sm')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'sm'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">SM</div>
					<div class="text-[10px] opacity-60 mt-0.5">480px</div>
				</button>
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('md')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'md'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">MD</div>
					<div class="text-[10px] opacity-60 mt-0.5">640px</div>
				</button>
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('lg')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'lg'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">LG</div>
					<div class="text-[10px] opacity-60 mt-0.5">768px</div>
				</button>
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('xl')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'xl'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">XL</div>
					<div class="text-[10px] opacity-60 mt-0.5">1024px</div>
				</button>
				<button
					type="button"
					on:click={() => selectMaxWidthPreset('custom')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {maxWidthMode === 'custom'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Custom</div>
					<div class="text-[10px] opacity-60 mt-0.5">•••</div>
				</button>
			</div>
			
			{#if maxWidthMode === 'custom'}
				<input
					id="maxWidth"
					type="number"
					bind:value={maxWidth}
					min="320"
					max="1200"
					class="input-ios"
					placeholder="Enter custom width"
				/>
			{/if}
			<p class="text-xs text-gray-500 mt-1.5">Maximum width of the page content</p>
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
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
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
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
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
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
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
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Page Padding
			</label>
			<div class="grid grid-cols-6 gap-2 mb-3">
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('none')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'none'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">None</div>
					<div class="text-[10px] opacity-60 mt-0.5">0px</div>
				</button>
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('tight')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'tight'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Tight</div>
					<div class="text-[10px] opacity-60 mt-0.5">8px</div>
				</button>
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('default')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'default'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Default</div>
					<div class="text-[10px] opacity-60 mt-0.5">16px</div>
				</button>
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('comfortable')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'comfortable'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Comfort</div>
					<div class="text-[10px] opacity-60 mt-0.5">24px</div>
				</button>
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('spacious')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'spacious'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Spacious</div>
					<div class="text-[10px] opacity-60 mt-0.5">32px</div>
				</button>
				<button
					type="button"
					on:click={() => selectPagePaddingPreset('custom')}
					class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {pagePaddingMode === 'custom'
						? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="font-semibold">Custom</div>
					<div class="text-[10px] opacity-60 mt-0.5">•••</div>
				</button>
			</div>
			
			{#if pagePaddingMode === 'custom'}
				<input
					id="pagePadding"
					type="number"
					bind:value={pagePadding}
					min="0"
					max="64"
					class="input-ios"
					placeholder="Enter custom padding"
				/>
			{/if}
			<p class="text-xs text-gray-500 mt-1.5">Padding around the page content</p>
		</div>
	</div>
</section>
