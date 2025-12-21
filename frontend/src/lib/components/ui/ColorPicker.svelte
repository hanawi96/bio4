<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let value: string = '#000000';
	export let label: string = 'Color';
	
	const dispatch = createEventDispatcher();
	
	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		dispatch('change', target.value);
	}
</script>

<div class="flex flex-col gap-2">
	<label class="text-sm font-medium" for={label}>{label}</label>
	<div class="flex gap-2 items-center">
		<input 
			type="color" 
			id={label}
			{value}
			on:input={handleChange}
			class="w-12 h-12 rounded cursor-pointer border-0"
		/>
		<input 
			type="text" 
			{value}
			on:input={handleChange}
			class="flex-1 px-3 py-2 border rounded"
			placeholder="#000000"
		/>
	</div>
</div>
