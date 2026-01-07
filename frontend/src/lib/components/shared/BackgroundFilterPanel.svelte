<script lang="ts">
	import {
		BLUR_PRESETS,
		BRIGHTNESS_PRESETS,
		GRAYSCALE_PRESETS,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';

	export let filterType: 'blur' | 'brightness' | 'grayscale';
	export let currentValue: BlurKey | BrightnessKey | GrayscaleKey | number;
	export let onChange: (value: string | number) => void;

	// Get presets based on filter type
	$: presets =
		filterType === 'blur'
			? BLUR_PRESETS
			: filterType === 'brightness'
				? BRIGHTNESS_PRESETS
				: GRAYSCALE_PRESETS;

	// Get preset entries as array
	$: presetEntries = Object.entries(presets) as Array<[string, number]>;

	// Get display label for preset
	function getLabel(key: string): string {
		return key.charAt(0).toUpperCase() + key.slice(1);
	}

	// Get unit suffix
	$: unit = filterType === 'blur' ? 'px' : '%';
	
	// Reactive check if a preset is active - this ensures Svelte tracks currentValue changes
	$: isActive = (presetKey: string, presetValue: number): boolean => {
		// String key comparison
		if (typeof currentValue === 'string') {
			return currentValue === presetKey;
		}
		// Number value comparison
		return currentValue === presetValue;
	};
</script>

<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
	<div class="grid grid-cols-5 gap-2">
		{#each presetEntries as [key, value] (key)}
			<button
				type="button"
				on:click={() => onChange(key)}
				class="p-3 rounded-lg border-2 transition-all hover:scale-105 {isActive(key, value)
					? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]'
					: 'border-gray-200 hover:border-gray-300 bg-white'}"
			>
				<div
					class="text-xs font-semibold {isActive(key, value)
						? 'text-[#00aa4f]'
						: 'text-gray-900'}"
				>
					{getLabel(key)}
				</div>
				<div class="text-[10px] text-gray-500 mt-0.5">{value}{unit}</div>
			</button>
		{/each}
	</div>
</div>
