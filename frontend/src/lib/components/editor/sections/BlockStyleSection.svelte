<script lang="ts">
	import { theme } from '$lib/stores/page';
	import { DEFAULT_THEME } from '$lib/stores/appearance';

	const blockStyles = [
		{ 
			id: 'solid', 
			name: 'Solid',
			preview: 'solid'
		},
		{ 
			id: 'outline', 
			name: 'Outline',
			preview: 'outline'
		},
		{ 
			id: 'shadow', 
			name: 'Shadow',
			preview: 'shadow'
		},
		{ 
			id: 'soft', 
			name: 'Soft',
			preview: 'soft'
		},
		{ 
			id: 'gradient', 
			name: 'Gradient',
			preview: 'gradient'
		},
		{ 
			id: 'glass', 
			name: 'Glass',
			preview: 'glass'
		},
		{ 
			id: 'neon', 
			name: 'Neon',
			preview: 'neon'
		},
		{ 
			id: 'minimal', 
			name: 'Minimal',
			preview: 'minimal'
		}
	];

	$: currentTheme = $theme || DEFAULT_THEME;
	let selectedStyle = 'solid';
</script>

<style>
	/* Custom Slider Styles */
	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
		transition: all 0.2s;
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
		transition: all 0.2s;
	}

	.slider::-moz-range-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
	}

	.slider::-webkit-slider-runnable-track {
		background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value), #e5e7eb var(--value), #e5e7eb 100%);
		height: 8px;
		border-radius: 4px;
	}

	.slider::-moz-range-track {
		background: #e5e7eb;
		height: 8px;
		border-radius: 4px;
	}

	.slider::-moz-range-progress {
		background: #3b82f6;
		height: 8px;
		border-radius: 4px;
	}
</style>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Block Style</h2>
		<p class="text-sm text-gray-500 mt-1">Choose how your link buttons look</p>
	</div>
	
	<div class="p-6">
		<!-- Block Styles Grid -->
		<div class="grid grid-cols-4 gap-4">
			{#each blockStyles as style}
				<button
					on:click={() => selectedStyle = style.id}
					class="group rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {selectedStyle === style.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
				>
					<!-- Preview -->
					<div class="aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col items-center justify-center gap-2">
						{#if style.preview === 'solid'}
							<!-- Solid -->
							<div class="w-full h-6 bg-blue-600 rounded-lg"></div>
							<div class="w-full h-6 bg-blue-600 rounded-lg"></div>
							<div class="w-full h-6 bg-blue-600 rounded-lg"></div>
						{:else if style.preview === 'outline'}
							<!-- Outline -->
							<div class="w-full h-6 border-2 border-blue-600 rounded-lg"></div>
							<div class="w-full h-6 border-2 border-blue-600 rounded-lg"></div>
							<div class="w-full h-6 border-2 border-blue-600 rounded-lg"></div>
						{:else if style.preview === 'shadow'}
							<!-- Shadow -->
							<div class="w-full h-6 bg-white rounded-lg shadow-lg"></div>
							<div class="w-full h-6 bg-white rounded-lg shadow-lg"></div>
							<div class="w-full h-6 bg-white rounded-lg shadow-lg"></div>
						{:else if style.preview === 'soft'}
							<!-- Soft -->
							<div class="w-full h-6 bg-blue-100 rounded-2xl"></div>
							<div class="w-full h-6 bg-blue-100 rounded-2xl"></div>
							<div class="w-full h-6 bg-blue-100 rounded-2xl"></div>
						{:else if style.preview === 'gradient'}
							<!-- Gradient -->
							<div class="w-full h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
							<div class="w-full h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
							<div class="w-full h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
						{:else if style.preview === 'glass'}
							<!-- Glass -->
							<div class="w-full h-6 bg-white/40 backdrop-blur rounded-lg border border-white/60"></div>
							<div class="w-full h-6 bg-white/40 backdrop-blur rounded-lg border border-white/60"></div>
							<div class="w-full h-6 bg-white/40 backdrop-blur rounded-lg border border-white/60"></div>
						{:else if style.preview === 'neon'}
							<!-- Neon -->
							<div class="w-full h-6 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
							<div class="w-full h-6 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
							<div class="w-full h-6 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
						{:else}
							<!-- Minimal -->
							<div class="w-full h-6 bg-transparent border-b-2 border-gray-300"></div>
							<div class="w-full h-6 bg-transparent border-b-2 border-gray-300"></div>
							<div class="w-full h-6 bg-transparent border-b-2 border-gray-300"></div>
						{/if}
					</div>
					
					<!-- Name -->
					<div class="py-2 px-3 bg-white border-t border-gray-100">
						<p class="text-xs font-medium text-gray-900 truncate text-center">{style.name}</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- Border Radius Slider -->
		<div class="mt-6 pt-6 border-t border-gray-100">
			<div class="flex items-center justify-between mb-4">
				<div>
					<p class="text-sm font-medium text-gray-900">Border Radius</p>
					<p class="text-xs text-gray-500">Adjust corner roundness</p>
				</div>
				<div class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
					<span class="text-sm font-bold text-blue-700">{currentTheme.borderRadius}px</span>
				</div>
			</div>
			
			<!-- Slider -->
			<div class="space-y-4">
				<div class="relative">
					<input
						type="range"
						min="0"
						max="32"
						step="2"
						value={currentTheme.borderRadius}
						on:input={(e) => theme.update(t => t ? { ...t, borderRadius: parseInt(e.currentTarget.value) } : { ...DEFAULT_THEME, borderRadius: parseInt(e.currentTarget.value) })}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
					/>
				</div>

				<!-- Preview Box -->
				<div class="flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
					<div 
						class="w-32 h-12 bg-blue-600 shadow-lg transition-all duration-300"
						style="border-radius: {currentTheme.borderRadius}px;"
					></div>
				</div>

				<!-- Quick Presets -->
				<div class="flex items-center gap-2">
					<button
						on:click={() => theme.update(t => t ? { ...t, borderRadius: 0 } : { ...DEFAULT_THEME, borderRadius: 0 })}
						class="flex-1 py-2 px-3 text-xs font-medium border-2 rounded-lg transition-all {currentTheme.borderRadius === 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						None (0px)
					</button>
					<button
						on:click={() => theme.update(t => t ? { ...t, borderRadius: 8 } : { ...DEFAULT_THEME, borderRadius: 8 })}
						class="flex-1 py-2 px-3 text-xs font-medium border-2 rounded-lg transition-all {currentTheme.borderRadius === 8 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						Small (8px)
					</button>
					<button
						on:click={() => theme.update(t => t ? { ...t, borderRadius: 16 } : { ...DEFAULT_THEME, borderRadius: 16 })}
						class="flex-1 py-2 px-3 text-xs font-medium border-2 rounded-lg transition-all {currentTheme.borderRadius === 16 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						Medium (16px)
					</button>
					<button
						on:click={() => theme.update(t => t ? { ...t, borderRadius: 32 } : { ...DEFAULT_THEME, borderRadius: 32 })}
						class="flex-1 py-2 px-3 text-xs font-medium border-2 rounded-lg transition-all {currentTheme.borderRadius === 32 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						Full (32px)
					</button>
				</div>
			</div>
		</div>

		<!-- Block Background Color -->
		<div class="mt-6 pt-6 border-t border-gray-100">
			<div class="flex items-center justify-between mb-3">
				<div>
					<p class="text-sm font-medium text-gray-900">Block Background</p>
					<p class="text-xs text-gray-500">Choose button background color</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex-1">
					<div class="relative">
						<input
							type="color"
							value={currentTheme.primaryColor}
							on:input={(e) => theme.update(t => t ? { ...t, primaryColor: e.currentTarget.value } : { ...DEFAULT_THEME, primaryColor: e.currentTarget.value })}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
							<div 
								class="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
								style="background-color: {currentTheme.primaryColor};"
							></div>
							<div class="flex-1">
								<p class="text-xs font-medium text-gray-500 uppercase">Block Color</p>
								<p class="text-sm font-bold text-gray-900 font-mono">{currentTheme.primaryColor}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
