<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';

	$: currentTextColor = ($appearanceState.overrides?.['tokens.text'] as string)
		|| $appearance?.tokens?.text
		|| '#000000';
	
	$: currentPrimaryColor = ($appearanceState.overrides?.['tokens.primary'] as string)
		|| $appearance?.tokens?.primary
		|| '#3b82f6';

	const presetColors = [
		{ name: 'Blue', primary: '#3b82f6' },
		{ name: 'Purple', primary: '#8b5cf6' },
		{ name: 'Pink', primary: '#ec4899' },
		{ name: 'Green', primary: '#10b981' },
		{ name: 'Orange', primary: '#f97316' },
		{ name: 'Red', primary: '#ef4444' },
		{ name: 'Teal', primary: '#14b8a6' },
		{ name: 'Indigo', primary: '#6366f1' }
	];

	function selectPresetColor(color: typeof presetColors[0]) {
		updateAppearance('tokens.primary', color.primary);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Colors</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your color palette</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Text Color -->
		<div>
			<label class="block text-sm font-medium text-gray-900 mb-3">Text Color</label>
			<div class="flex items-center justify-between py-2">
				<span class="text-sm text-gray-600">Text</span>
				<div class="relative">
					<input
						type="color"
						value={currentTextColor}
						on:input={(e) => updateAppearance('tokens.text', e.currentTarget.value)}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
						style="background-color: {currentTextColor};"
					></div>
				</div>
			</div>
			<div class="mt-2 flex items-start gap-2 text-xs text-gray-500">
				<svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>Ensure good contrast with background for readability</span>
			</div>
		</div>

		<!-- Divider -->
		<div class="border-t border-gray-200"></div>

		<!-- Primary Color Presets -->
		<div>
			<label class="block text-sm font-medium text-gray-900 mb-3">Primary / Accent Color</label>
			<div class="grid grid-cols-8 gap-2">
				{#each presetColors as color}
					<button
						on:click={() => selectPresetColor(color)}
						class="group relative aspect-square rounded-lg transition-all hover:scale-110 {currentPrimaryColor === color.primary ? 'ring-2 ring-offset-2 ring-blue-500' : ''}"
						style="background: {color.primary};"
						title={color.name}
					>
						{#if currentPrimaryColor === color.primary}
							<svg class="absolute inset-0 m-auto w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Custom Primary Color -->
		<div>
			<label class="block text-sm font-medium text-gray-900 mb-2">Custom Color</label>
			<div class="flex items-center gap-3">
				<div class="relative">
					<input 
						type="color" 
						value={currentPrimaryColor}
						on:input={(e) => updateAppearance('tokens.primary', e.currentTarget.value)}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors"
						style="background-color: {currentPrimaryColor};"
					></div>
				</div>
				<input 
					type="text"
					value={currentPrimaryColor}
					on:input={(e) => updateAppearance('tokens.primary', e.currentTarget.value)}
					class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="#3b82f6"
				/>
			</div>
		</div>
	</div>
</section>
