<script lang="ts">
	import { theme } from '$lib/stores/page';
	import { DEFAULT_THEME } from '$lib/stores/appearance';

	const bgTypes = [
		{ id: 'solid', name: 'Solid Color', description: 'Single color' },
		{ id: 'gradient', name: 'Gradient', description: 'Color blend' },
		{ id: 'image', name: 'Image', description: 'Custom photo' },
		{ id: 'pattern', name: 'Pattern', description: 'Repeating design' }
	];

	const solidColors = [
		{ name: 'White', color: '#ffffff' },
		{ name: 'Light Gray', color: '#f3f4f6' },
		{ name: 'Dark Gray', color: '#1f2937' },
		{ name: 'Black', color: '#000000' },
		{ name: 'Blue', color: '#3b82f6' },
		{ name: 'Purple', color: '#8b5cf6' },
		{ name: 'Pink', color: '#ec4899' },
		{ name: 'Green', color: '#10b981' }
	];

	const gradients = [
		{ name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
		{ name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)' },
		{ name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
		{ name: 'Fire', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
		{ name: 'Sky', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
		{ name: 'Peach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
		{ name: 'Night', gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' },
		{ name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
	];

	let selectedType = 'solid';
	$: currentTheme = $theme || DEFAULT_THEME;

	function selectType(type: string) {
		selectedType = type;
	}

	function updateBgColor(color: string) {
		theme.update(t => t ? { ...t, backgroundColor: color } : { ...DEFAULT_THEME, backgroundColor: color });
	}

	function updateBgGradient(gradient: string) {
		theme.update(t => t ? { ...t, backgroundColor: gradient } : { ...DEFAULT_THEME, backgroundColor: gradient });
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Background</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your page background</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Background Type Selector -->
		<div class="grid grid-cols-4 gap-3">
			{#each bgTypes as type}
				<button
					on:click={() => selectType(type.id)}
					class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedType === type.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
				>
					<!-- Icon -->
					<div class="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center {selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'}">
						{#if type.id === 'solid'}
							<!-- Palette Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
							</svg>
						{:else if type.id === 'gradient'}
							<!-- Sparkles Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
							</svg>
						{:else if type.id === 'image'}
							<!-- Image Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						{:else}
							<!-- Grid Pattern Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
							</svg>
						{/if}
					</div>
					<p class="text-sm font-semibold text-gray-900">{type.name}</p>
					<p class="text-xs text-gray-500 mt-1">{type.description}</p>
				</button>
			{/each}
		</div>

		<!-- Solid Color Options -->
		{#if selectedType === 'solid'}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-3">Preset Colors</label>
					<div class="grid grid-cols-8 gap-2">
						{#each solidColors as color}
							<button
								on:click={() => updateBgColor(color.color)}
								class="group relative aspect-square rounded-lg transition-all hover:scale-110 border-2 {currentTheme.backgroundColor === color.color ? 'border-blue-500 ring-2 ring-offset-2 ring-blue-200' : 'border-gray-200'}"
								style="background: {color.color};"
								title={color.name}
							>
								{#if currentTheme.backgroundColor === color.color}
									<svg class="absolute inset-0 m-auto w-5 h-5 {color.color === '#ffffff' || color.color === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Custom Color</label>
					<div class="flex items-center gap-3">
						<input 
							type="color" 
							value={currentTheme.backgroundColor}
							on:input={(e) => updateBgColor(e.currentTarget.value)}
							class="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200"
						/>
						<input 
							type="text"
							value={currentTheme.backgroundColor}
							on:input={(e) => updateBgColor(e.currentTarget.value)}
							class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono"
							placeholder="#ffffff"
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Gradient Options -->
		{#if selectedType === 'gradient'}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-3">Gradient Presets</label>
				<div class="grid grid-cols-4 gap-3">
					{#each gradients as grad}
						<button
							on:click={() => updateBgGradient(grad.gradient)}
							class="group relative aspect-square rounded-xl transition-all hover:scale-105 border-2 {currentTheme.backgroundColor === grad.gradient ? 'border-blue-500 ring-2 ring-offset-2 ring-blue-200' : 'border-gray-200'}"
							style="background: {grad.gradient};"
							title={grad.name}
						>
							{#if currentTheme.backgroundColor === grad.gradient}
								<svg class="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							{/if}
							<div class="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition">
								{grad.name}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Image Upload -->
		{#if selectedType === 'image'}
			<div class="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition">
				<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<p class="text-sm font-medium text-gray-900 mb-1">Upload Background Image</p>
				<p class="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</p>
				<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
					Choose File
				</button>
			</div>
		{/if}

		<!-- Pattern (Coming Soon) -->
		{#if selectedType === 'pattern'}
			<div class="text-center py-12 bg-gray-50 rounded-xl">
				<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
					</svg>
				</div>
				<p class="text-sm font-medium text-gray-900 mb-1">Pattern Backgrounds</p>
				<p class="text-xs text-gray-500">Coming soon</p>
			</div>
		{/if}
	</div>
</section>
