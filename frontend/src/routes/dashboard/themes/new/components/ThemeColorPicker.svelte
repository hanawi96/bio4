<script lang="ts">
	export let primaryColor: string;
	export let textColor: string;
	export let borderColor: string;
	export let borderWidth: number;
	export let mutedTextColor: string;
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Theme Colors</h2>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					bind:value={primaryColor}
					class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
				/>
				<input
					type="text"
					bind:value={primaryColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#3b82f6"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Main accent color for buttons and links</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					bind:value={textColor}
					class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
				/>
				<input
					type="text"
					bind:value={textColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#18181b"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Primary text color</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Muted Text</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					bind:value={mutedTextColor}
					class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
				/>
				<input
					type="text"
					bind:value={mutedTextColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#71717a"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Secondary/muted text color</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					bind:value={borderColor}
					class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
				/>
				<input
					type="text"
					bind:value={borderColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#e4e4e7"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Border and divider color</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
			<input type="number" bind:value={borderWidth} min="1" max="5" class="input-ios" />
			<p class="text-xs text-gray-500 mt-1">Border thickness (1-5px)</p>
		</div>
	</div>
</section>
