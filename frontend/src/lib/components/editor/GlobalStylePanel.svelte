<script lang="ts">
	import { theme, DEFAULT_THEME } from '$lib/stores/page';
	import ColorPicker from '../ui/ColorPicker.svelte';
	import FontSelector from '../ui/FontSelector.svelte';
	import Slider from '../ui/Slider.svelte';

	// Use current theme or default
	$: currentTheme = $theme || DEFAULT_THEME;

	function updateTheme(field: string, value: any) {
		theme.update(t => t ? { ...t, [field]: value } : { ...DEFAULT_THEME, [field]: value });
	}
</script>

<div class="space-y-6">
	<h3 class="font-semibold">Global Styles</h3>
	<p class="text-sm text-gray-500">Customize colors, fonts and spacing</p>
	
	<ColorPicker 
		label="Background Color" 
		value={currentTheme.backgroundColor}
		on:change={(e) => updateTheme('backgroundColor', e.detail)}
	/>
	
	<ColorPicker 
		label="Text Color" 
		value={currentTheme.textColor}
		on:change={(e) => updateTheme('textColor', e.detail)}
	/>
	
	<ColorPicker 
		label="Primary Color" 
		value={currentTheme.primaryColor}
		on:change={(e) => updateTheme('primaryColor', e.detail)}
	/>
	
	<FontSelector 
		value={currentTheme.fontFamily}
		on:change={(e) => updateTheme('fontFamily', e.detail)}
	/>
	
	<Slider 
		label="Border Radius" 
		value={currentTheme.borderRadius}
		min={0}
		max={50}
		unit="px"
		on:change={(e) => updateTheme('borderRadius', e.detail)}
	/>
	
	<Slider 
		label="Spacing" 
		value={currentTheme.spacing}
		min={0}
		max={100}
		unit="px"
		on:change={(e) => updateTheme('spacing', e.detail)}
	/>
</div>
