<script lang="ts">
	import Slider from '../ui/Slider.svelte';

	export let sectionId: string = 'header';
	
	// For MVP, section overrides are simplified
	let spacing = 16;
	let padding = 8;
</script>

<div class="space-y-6">
	<h3 class="font-semibold">Section: {sectionId}</h3>
	<p class="text-sm text-gray-500">Override layout and spacing for this section</p>
	
	<Slider 
		label="Section Spacing" 
		value={spacing}
		min={0}
		max={100}
		unit="px"
		on:change={(e) => spacing = e.detail}
	/>
	
	<Slider 
		label="Section Padding" 
		value={padding}
		min={0}
		max={50}
		unit="px"
		on:change={(e) => padding = e.detail}
	/>
	
	<p class="text-xs text-gray-400 mt-4">
		Note: Section overrides will be available in a future update.
	</p>
</div>
