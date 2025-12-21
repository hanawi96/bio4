<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let value: string = 'Inter';
	
	const dispatch = createEventDispatcher();
	
	const fonts = [
		'Inter', 'Poppins', 'Roboto', 'Open Sans', 
		'Montserrat', 'Lato', 'Playfair Display'
	];
	
	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		dispatch('change', target.value);
	}
</script>

<div class="flex flex-col gap-2">
	<label class="text-sm font-medium" for="font-selector">Font Family</label>
	<select 
		id="font-selector"
		{value} 
		on:change={handleChange}
		class="px-3 py-2 border rounded"
	>
		{#each fonts as font}
			<option value={font}>{font}</option>
		{/each}
	</select>
</div>
