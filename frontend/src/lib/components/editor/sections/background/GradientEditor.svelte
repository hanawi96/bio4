<script lang="ts">
	import { gradients } from '$lib/utils/background/backgroundConstants';
	import { normalizeGradient } from '$lib/utils/background/backgroundUtils';
	import { createEventDispatcher } from 'svelte';

	export let currentBgColor: string;
	export let gradientFromColor: string = '#667eea';
	export let gradientToColor: string = '#764ba2';
	export let gradientDirection: string = '135deg';
	export let gradientType: 'linear' | 'radial' = 'linear';

	const dispatch = createEventDispatcher<{
		update: { gradient: string; from?: string; to?: string; direction?: string; type?: 'linear' | 'radial' };
	}>();

	let showCustomGradient = false;

	// Check if current gradient is custom (not in presets)
	$: isCustomGradient = (() => {
		if (currentBgColor && currentBgColor.includes('gradient')) {
			const normalized = normalizeGradient(currentBgColor);
			return !gradients.some(g => normalizeGradient(g.gradient) === normalized);
		}
		return false;
	})();

	function handleGradientSelect(grad: typeof gradients[0]) {
		dispatch('update', { 
			gradient: grad.gradient, 
			from: grad.from, 
			to: grad.to, 
			direction: grad.direction, 
			type: 'linear' 
		});
	}

	function handleCustomGradientUpdate() {
		const gradient = gradientType === 'radial' 
			? `radial-gradient(circle, ${gradientFromColor} 0%, ${gradientToColor} 100%)`
			: `linear-gradient(${gradientDirection}, ${gradientFromColor} 0%, ${gradientToColor} 100%)`;
		dispatch('update', { gradient });
	}

	function handleTypeChange(type: 'linear' | 'radial') {
		gradientType = type;
		handleCustomGradientUpdate();
	}

	function handleDirectionChange(direction: string) {
		gradientDirection = direction;
		handleCustomGradientUpdate();
	}
</script>

<div class="space-y-4">
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
		<div class="grid grid-cols-8 gap-2">
			{#each gradients as grad}
				<button
					on:click={() => handleGradientSelect(grad)}
					class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 {normalizeGradient(currentBgColor) === normalizeGradient(grad.gradient) ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}"
					style="background: {grad.gradient};"
					title={grad.name}
				>
					{#if normalizeGradient(currentBgColor) === normalizeGradient(grad.gradient)}
						<svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					{/if}
				</button>
			{/each}
			
			<!-- Custom Gradient Button -->
			<button
				on:click={() => showCustomGradient = !showCustomGradient}
				class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 {isCustomGradient ? 'border-blue-500 ring-2 ring-blue-100' : showCustomGradient ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
				style="{isCustomGradient ? `background: ${currentBgColor};` : ''}"
				title="Custom Gradient"
			>
				{#if isCustomGradient}
					<!-- Hiển thị checkmark nếu đang dùng custom gradient -->
					<svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
				{:else}
					<!-- Hiển thị icon + nếu không dùng custom gradient -->
					<svg class="absolute inset-0 m-auto w-5 h-5 {showCustomGradient ? 'text-blue-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Custom Gradient Panel -->
	{#if showCustomGradient}
		<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-4">
			<div class="flex items-center justify-between">
				<h4 class="text-sm font-semibold text-gray-900">Custom Gradient</h4>
				<button
					on:click={() => showCustomGradient = false}
					class="p-1 hover:bg-white/50 rounded transition"
				>
					<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<!-- Color Pickers -->
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">From Color</label>
					<div class="relative">
						<input
							type="color"
							bind:value={gradientFromColor}
							on:input={handleCustomGradientUpdate}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
							<div class="w-8 h-8 rounded border-2 border-white shadow-sm" style="background-color: {gradientFromColor};"></div>
							<p class="text-xs font-mono text-gray-900">{gradientFromColor}</p>
						</div>
					</div>
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">To Color</label>
					<div class="relative">
						<input
							type="color"
							bind:value={gradientToColor}
							on:input={handleCustomGradientUpdate}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
							<div class="w-8 h-8 rounded border-2 border-white shadow-sm" style="background-color: {gradientToColor};"></div>
							<p class="text-xs font-mono text-gray-900">{gradientToColor}</p>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Gradient Type -->
			<div>
				<label class="block text-xs font-medium text-gray-700 mb-2">Type</label>
				<div class="grid grid-cols-2 gap-2">
					<button
						on:click={() => handleTypeChange('linear')}
						class="px-3 py-2 rounded-lg text-xs font-medium transition {gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						Linear
					</button>
					<button
						on:click={() => handleTypeChange('radial')}
						class="px-3 py-2 rounded-lg text-xs font-medium transition {gradientType === 'radial' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						Radial
					</button>
				</div>
			</div>
			
			<!-- Direction (only for linear) -->
			{#if gradientType === 'linear'}
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Direction</label>
					<div class="grid grid-cols-4 gap-2">
						<button
							on:click={() => handleDirectionChange('0deg')}
							class="p-2 rounded-lg transition {gradientDirection === '0deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
							title="Top to Bottom"
						>
							<svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
							</svg>
						</button>
						<button
							on:click={() => handleDirectionChange('90deg')}
							class="p-2 rounded-lg transition {gradientDirection === '90deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
							title="Left to Right"
						>
							<svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
							</svg>
						</button>
						<button
							on:click={() => handleDirectionChange('135deg')}
							class="p-2 rounded-lg transition {gradientDirection === '135deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
							title="Diagonal"
						>
							<svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 19L5 5m14 0v14" />
							</svg>
						</button>
						<button
							on:click={() => handleDirectionChange('180deg')}
							class="p-2 rounded-lg transition {gradientDirection === '180deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
							title="Bottom to Top"
						>
							<svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
