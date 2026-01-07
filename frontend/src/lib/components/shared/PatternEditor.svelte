<script lang="ts">
	import { patterns } from '$lib/utils/background/backgroundConstants';
	import { getPatternStyle } from '$lib/utils/background/backgroundUtils';
	import { createEventDispatcher } from 'svelte';

	export let selectedPattern: string;
	export let patternColor: string;
	export let patternBgColor: string;

	const dispatch = createEventDispatcher<{
		update: { patternId: string; inkColor: string; bgColor: string };
	}>();

	function handlePatternSelect(patternId: string) {
		selectedPattern = patternId;
		dispatch('update', { patternId, inkColor: patternColor, bgColor: patternBgColor });
	}

	function handleColorChange() {
		dispatch('update', { patternId: selectedPattern, inkColor: patternColor, bgColor: patternBgColor });
	}
</script>

<div class="space-y-4">
	<!-- Pattern Presets -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Pattern Style</label>
		<div class="grid grid-cols-4 gap-2">
			{#each patterns as pattern}
				<button
					type="button"
					on:click={() => handlePatternSelect(pattern.id)}
					class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 overflow-hidden {selectedPattern === pattern.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}"
					title={pattern.name}
				>
					<div 
						class="w-full h-full"
						style={getPatternStyle(pattern.id, patternColor, patternBgColor)}
					></div>
					{#if selectedPattern === pattern.id}
						<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
							<svg class="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Pattern Customization -->
	<div class="p-4 bg-gray-50 rounded-xl space-y-3">
		<h4 class="text-sm font-semibold text-gray-900">Customize Pattern</h4>
		
		<div class="grid grid-cols-2 gap-3">
			<!-- Pattern Color -->
			<div>
				<label class="block text-xs font-medium text-gray-700 mb-2">Pattern Color</label>
				<div class="relative">
					<input
						type="color"
						bind:value={patternColor}
						on:input={handleColorChange}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
						<div 
							class="w-8 h-8 rounded border-2 border-white shadow-sm"
							style="background-color: {patternColor};"
						></div>
						<p class="text-xs font-mono text-gray-900">{patternColor}</p>
					</div>
				</div>
			</div>

			<!-- Background Color -->
			<div>
				<label class="block text-xs font-medium text-gray-700 mb-2">Background</label>
				<div class="relative">
					<input
						type="color"
						bind:value={patternBgColor}
						on:input={handleColorChange}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
						<div 
							class="w-8 h-8 rounded border-2 border-white shadow-sm"
							style="background-color: {patternBgColor};"
						></div>
						<p class="text-xs font-mono text-gray-900">{patternBgColor}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
