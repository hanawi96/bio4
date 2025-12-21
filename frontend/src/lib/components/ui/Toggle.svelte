<script lang="ts">
	export let checked: boolean = false;
	export let label: string = '';
</script>

<label class="flex items-center gap-3 cursor-pointer">
	<input type="checkbox" bind:checked class="sr-only peer" />
	<div class="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer transition-colors relative">
		<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
	</div>
	<span class="text-sm font-medium">{label}</span>
</label>
