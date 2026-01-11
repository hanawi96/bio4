<script lang="ts">
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import { validateAndNormalizeHexColor } from '$lib/utils/colorUtils';

	// Get text color from overrides or theme default
	$: textColor = $appearanceState.overrides?.['typography.headingColor'] 
		?? $appearance?.theme?.config?.semantic?.color?.text?.default 
		?? '#18181b';

	// Block colors
	$: blockColor = $appearanceState.overrides?.['block.color'] 
		?? $appearance?.theme?.config?.semantic?.color?.primary 
		?? '#00aa4f';
	
	$: blockTextColor = $appearanceState.overrides?.['block.textColor'] 
		?? $appearance?.theme?.config?.semantic?.color?.block?.text 
		?? '#ffffff';

	function updateTextColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('typography.headingColor', value);
	}

	function updateBlockColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('block.color', value);
	}

	function updateBlockTextColor(event: Event) {
		const value = validateAndNormalizeHexColor(event);
		if (value) updateAppearance('block.textColor', value);
	}
</script>

<section class="card-ios">
	<div class="section-header-ios">
		<h2 class="section-title-ios">Colors</h2>
		<p class="text-sm text-gray-500 mt-1">Customize text and block colors</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Text Color -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Text Color
			</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						value={textColor}
						on:input={updateTextColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {textColor};"
					></div>
				</div>
				<div class="flex-1">
					<input
						type="text"
						value={textColor}
						on:input={updateTextColor}
						class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="#18181b"
					/>
				</div>
			</div>
			<p class="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
				<svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>Color for name/title and headings. Muted text (bio, subtitles) will automatically use this color with 60% opacity.</span>
			</p>
		</div>

		<!-- Block Colors -->
		<div>
			<h3 class="text-base font-semibold text-gray-900 mb-3">Block Colors</h3>
			
			<div class="grid grid-cols-2 gap-4">
				<!-- Block Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Block Color
					</label>
					<div class="flex items-center gap-3">
						<div class="relative flex-shrink-0">
							<input
								type="color"
								value={blockColor}
								on:input={updateBlockColor}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div 
								class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
								style="background-color: {blockColor};"
							></div>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={blockColor}
								on:input={updateBlockColor}
								class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="#00aa4f"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500 mt-1.5">
						Main accent color for buttons and links
					</p>
				</div>

				<!-- Block Text Color -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Block Text Color
					</label>
					<div class="flex items-center gap-3">
						<div class="relative flex-shrink-0">
							<input
								type="color"
								value={blockTextColor}
								on:input={updateBlockTextColor}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div 
								class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
								style="background-color: {blockTextColor};"
							></div>
						</div>
						<div class="flex-1">
							<input
								type="text"
								value={blockTextColor}
								on:input={updateBlockTextColor}
								class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="#ffffff"
							/>
						</div>
					</div>
					<p class="text-xs text-gray-500 mt-1.5">
						Text color inside buttons and links
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
