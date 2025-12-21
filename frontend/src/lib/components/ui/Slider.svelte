<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let value: number = 0;
	export let min: number = 0;
	export let max: number = 100;
	export let label: string = '';
	export let unit: string = '';
	
	const dispatch = createEventDispatcher();
	
	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		dispatch('change', parseInt(target.value));
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between text-sm">
		<label class="font-medium" for={label}>{label}</label>
		<span class="text-gray-600">{value}{unit}</span>
	</div>
	<input 
		type="range" 
		id={label}
		{value}
		{min} 
		{max}
		on:input={handleChange}
		class="w-full"
	/>
</div>
