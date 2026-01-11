<script lang="ts">
	export let primaryColor: string;
	export let textColor: string;
	export let borderColor: string;
	export let blockTextColor: string;
	export let shadowColor: string;
	export let iconThumbnailColor: string;
	
	// mutedTextColor is removed - now auto-calculated from textColor with 60% opacity
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Theme Colors</h2>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={primaryColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {primaryColor};"
					></div>
				</div>
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
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={textColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {textColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={textColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#18181b"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Primary text color (muted text auto-calculated at 60% opacity)</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={borderColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {borderColor};"
					></div>
				</div>
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
			<label class="block text-sm font-medium text-gray-700 mb-2">Block Text Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={blockTextColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {blockTextColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={blockTextColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#ffffff"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Text color for all button styles</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Shadow Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={shadowColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {shadowColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={shadowColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#000000"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Shadow color for brutal block style</p>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Icon Thumbnail Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={iconThumbnailColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {iconThumbnailColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={iconThumbnailColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#000000"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Default color for link icon thumbnails</p>
		</div>
	</div>
</section>
