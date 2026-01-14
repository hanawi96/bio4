<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentBgColor: string;

	const dispatch = createEventDispatcher<{ update: string }>();

	function handleCustomColorInput(e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		dispatch('update', value);
	}
</script>

<div class="flex items-center gap-3">
	<div class="relative">
		<input 
			type="color" 
			value={currentBgColor}
			on:input={handleCustomColorInput}
			class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
		/>
		<div 
			class="w-14 h-14 rounded-xl border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
			style="background-color: {currentBgColor};"
		></div>
	</div>
	<div class="flex-1">
		<label class="block text-xs font-medium text-gray-600 mb-1.5">Color Value</label>
		<input 
			type="text"
			value={currentBgColor}
			on:input={handleCustomColorInput}
			class="input-ios font-mono"
			placeholder="#ffffff"
		/>
	</div>
</div>
