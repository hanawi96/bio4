<script lang="ts">
	import { theme } from '$lib/stores/page';
	import { DEFAULT_THEME } from '$lib/stores/appearance';

	$: currentTheme = $theme || DEFAULT_THEME;

	const presetColors = [
		{ name: 'Blue', primary: '#3b82f6', accent: '#60a5fa' },
		{ name: 'Purple', primary: '#8b5cf6', accent: '#a78bfa' },
		{ name: 'Pink', primary: '#ec4899', accent: '#f472b6' },
		{ name: 'Green', primary: '#10b981', accent: '#34d399' },
		{ name: 'Orange', primary: '#f97316', accent: '#fb923c' },
		{ name: 'Red', primary: '#ef4444', accent: '#f87171' },
		{ name: 'Teal', primary: '#14b8a6', accent: '#2dd4bf' },
		{ name: 'Indigo', primary: '#6366f1', accent: '#818cf8' }
	];

	function updateColor(field: 'primaryColor' | 'textColor', value: string) {
		theme.update(t => t ? { ...t, [field]: value } : { ...DEFAULT_THEME, [field]: value });
	}

	function selectPresetColor(preset: typeof presetColors[0]) {
		theme.update(t => t ? { ...t, primaryColor: preset.primary } : { ...DEFAULT_THEME, primaryColor: preset.primary });
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Colors</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your color palette</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Primary Color Presets -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">Primary / Accent Color</label>
			<div class="grid grid-cols-8 gap-2">
				{#each presetColors as color}
					<button
						on:click={() => selectPresetColor(color)}
						class="group relative aspect-square rounded-lg transition-all hover:scale-110 {currentTheme.primaryColor === color.primary ? 'ring-2 ring-offset-2 ring-blue-500' : ''}"
						style="background: {color.primary};"
						title={color.name}
					>
						{#if currentTheme.primaryColor === color.primary}
							<svg class="absolute inset-0 m-auto w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Custom Color Picker -->
		<div class="flex items-center gap-4">
			<div class="flex-1">
				<label class="block text-sm font-medium text-gray-700 mb-2">Custom Color</label>
				<div class="flex items-center gap-3">
					<input 
						type="color" 
						value={currentTheme.primaryColor}
						on:input={(e) => updateColor('primaryColor', e.currentTarget.value)}
						class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
					/>
					<input 
						type="text"
						value={currentTheme.primaryColor}
						on:input={(e) => updateColor('primaryColor', e.currentTarget.value)}
						class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
						placeholder="#3b82f6"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
