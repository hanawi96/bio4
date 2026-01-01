<script lang="ts">
	export let maxWidth: number;
	export let textAlign: 'left' | 'center' | 'right';
	export let pagePadding: number;
	export let blockGap: number;
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
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Layout</h2>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
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
			<div>
				<label for="textAlign" class="block text-sm font-medium text-gray-700 mb-2">
					Text Align
				</label>
				<select id="textAlign" bind:value={textAlign} class="input-ios">
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</div>
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
			<div>
				<label for="blockGap" class="block text-sm font-medium text-gray-700 mb-2">
					Block Gap (px)
				</label>
				<input
					id="blockGap"
					type="number"
					bind:value={blockGap}
					min="8"
					max="48"
					class="input-ios"
				/>
			</div>
			<div>
				<label for="blockPaddingX" class="block text-sm font-medium text-gray-700 mb-2">
					Block Padding X (px)
				</label>
				<input
					id="blockPaddingX"
					type="number"
					bind:value={blockPaddingX}
					min="4"
					max="32"
					class="input-ios"
				/>
				<p class="text-xs text-gray-500 mt-1">Horizontal padding inside blocks</p>
			</div>
			<div>
				<label for="blockPaddingY" class="block text-sm font-medium text-gray-700 mb-2">
					Block Padding Y (px)
				</label>
				<input
					id="blockPaddingY"
					type="number"
					bind:value={blockPaddingY}
					min="4"
					max="32"
					class="input-ios"
				/>
				<p class="text-xs text-gray-500 mt-1">Vertical padding inside blocks</p>
			</div>
		</div>
		
		<!-- Block Border Radius - Button Preset (Full Width) -->
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
			<p class="text-xs text-gray-500 mt-1">
				{#if isFullDisabled}
					<span class="text-orange-600">Full radius disabled for Grid/Card layouts</span>
				{:else}
					Border radius style for blocks/links
				{/if}
			</p>
		</div>
	</div>
</section>
