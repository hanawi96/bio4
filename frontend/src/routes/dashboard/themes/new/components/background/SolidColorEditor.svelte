<script lang="ts">
	export let bgSolidColor: string;
</script>

<div class="space-y-3">
	<label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
	<div class="flex items-center gap-3">
		<div class="relative flex-shrink-0">
			<input
				type="color"
				bind:value={bgSolidColor}
				class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			/>
			<div
				class="w-16 h-16 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
				style="background-color: {bgSolidColor};"
			></div>
		</div>
		<input
			type="text"
			bind:value={bgSolidColor}
			class="flex-1 input-ios font-mono"
			placeholder="#ffffff"
		/>
	</div>
</div>
