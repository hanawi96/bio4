<script lang="ts">
	import { solidColors } from '$lib/utils/background/backgroundConstants';
	import { createEventDispatcher } from 'svelte';

	export let currentBgColor: string;

	const dispatch = createEventDispatcher<{ update: string }>();

	let showCustomColor = false;

	// Check if current color is custom (not in presets)
	$: isCustomSolidColor = (() => {
		if (currentBgColor && currentBgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			return !solidColors.some(c => c.color.toLowerCase() === currentBgColor.toLowerCase());
		}
		return false;
	})();

	function handleColorSelect(color: string) {
		dispatch('update', color);
	}

	function handleCustomColorInput(e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		dispatch('update', value);
	}
</script>

<div class="space-y-4">
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Preset Colors</label>
		<div class="grid grid-cols-9 gap-1.5">
			{#each solidColors as color}
				<button
					on:click={() => handleColorSelect(color.color)}
					class="group relative aspect-square rounded-md transition-all hover:scale-105 border {currentBgColor === color.color ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}"
					style="background: {color.color};"
					title={color.name}
				>
					{#if currentBgColor === color.color}
						<svg class="absolute inset-0 m-auto w-3 h-3 {color.color === '#ffffff' || color.color === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					{/if}
				</button>
			{/each}
			
			<!-- Custom Color Button -->
			<button
				on:click={() => showCustomColor = !showCustomColor}
				class="relative aspect-square rounded-md transition-all hover:scale-105 border {isCustomSolidColor ? 'border-blue-500 ring-1 ring-blue-100' : showCustomColor ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
				style="{isCustomSolidColor ? `background: ${currentBgColor};` : ''}"
				title="Custom Color"
			>
				{#if isCustomSolidColor}
					<!-- Hiển thị checkmark nếu đang dùng custom color -->
					<svg class="absolute inset-0 m-auto w-3 h-3 {currentBgColor === '#ffffff' || currentBgColor === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
				{:else}
					<!-- Hiển thị icon + nếu không dùng custom color -->
					<svg class="absolute inset-0 m-auto w-4 h-4 {showCustomColor ? 'text-blue-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Custom Color Panel -->
	{#if showCustomColor}
		<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="text-sm font-semibold text-gray-900">Custom Color</h4>
				<button
					on:click={() => showCustomColor = false}
					class="p-1 hover:bg-white/50 rounded transition"
				>
					<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="flex items-center gap-3">
				<div class="relative">
					<input 
						type="color" 
						value={currentBgColor}
						on:input={handleCustomColorInput}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-lg border-2 border-white shadow-sm cursor-pointer"
						style="background-color: {currentBgColor};"
					></div>
				</div>
				<input 
					type="text"
					value={currentBgColor}
					on:input={handleCustomColorInput}
					class="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-mono bg-white"
					placeholder="#ffffff"
				/>
			</div>
		</div>
	{/if}
</div>
