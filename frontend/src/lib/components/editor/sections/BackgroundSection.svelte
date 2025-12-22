<script lang="ts">
	import { page } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { api } from '$lib/api.client';

	const username = 'demo';

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
		{ name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', from: '#667eea', to: '#764ba2', direction: '135deg' },
		{ name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)', from: '#667eea', to: '#00d4ff', direction: '135deg' },
		{ name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', from: '#0ba360', to: '#3cba92', direction: '135deg' },
		{ name: 'Fire', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', from: '#f093fb', to: '#f5576c', direction: '135deg' },
		{ name: 'Sky', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', from: '#4facfe', to: '#00f2fe', direction: '135deg' },
		{ name: 'Peach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', from: '#fa709a', to: '#fee140', direction: '135deg' },
		{ name: 'Night', gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)', from: '#2c3e50', to: '#000000', direction: '135deg' },
		{ name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', from: '#a8edea', to: '#fed6e3', direction: '135deg' }
	];

	let selectedType = 'solid';
	let currentBgColor = '#ffffff';
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let isUserUpdate = false;
	let lastSyncedThemeKey = '';
	
	// Custom gradient state
	let showCustomGradient = false;
	let gradientFromColor = '#667eea';
	let gradientToColor = '#764ba2';
	let gradientDirection = '135deg'; // Default diagonal
	let gradientType = 'linear'; // 'linear' or 'radial'
	
	// Custom solid color state
	let showCustomColor = false;

	// Reactive: Sync with appearance tokens (only when theme changes)
	$: if ($appearance?.tokens?.backgroundColor && !isUserUpdate) {
		const bgColor = $appearance.tokens.backgroundColor;
		const currentThemeKey = $page?.theme_preset_key || '';
		
		// Only auto-detect type when theme changes (not on every appearance update)
		const isThemeChange = currentThemeKey !== lastSyncedThemeKey;
		
		if (isThemeChange) {
			console.log('[BackgroundSection] Theme changed, syncing with tokens.backgroundColor:', bgColor);
			
			currentBgColor = bgColor;
			lastSyncedThemeKey = currentThemeKey;
			
			// Auto-detect type only on theme change
			if (bgColor.includes('gradient')) {
				selectedType = 'gradient';
			} else if (bgColor.startsWith('http') || bgColor.startsWith('url(')) {
				selectedType = 'image';
			} else {
				selectedType = 'solid';
			}
			
			console.log('[BackgroundSection] Auto-detected type:', selectedType);
		} else {
			// Just sync color, don't change type
			currentBgColor = bgColor;
		}
	}

	function selectType(type: string) {
		selectedType = type;
		console.log('[BackgroundSection] User manually selected type:', type);
		
		// Reset to appropriate default color when switching types
		if (type === 'solid' && currentBgColor.includes('gradient')) {
			// If switching to solid from gradient, use white as default
			updateBgColor('#ffffff');
		} else if (type === 'gradient' && !currentBgColor.includes('gradient')) {
			// If switching to gradient from solid, use default gradient
			updateBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '#667eea', '#764ba2', '135deg');
		}
	}

	async function updateBgColor(color: string) {
		console.log('[BackgroundSection] updateBgColor called with:', color);
		isUserUpdate = true;
		currentBgColor = color;

		// Update page store immediately (optimistic)
		page.update(p => {
			if (!p) {
				console.log('[BackgroundSection] No page in store');
				return p;
			}

			console.log('[BackgroundSection] Current draft_appearance:', p.draft_appearance);
			const appearance = JSON.parse(p.draft_appearance || '{}');

			// Update customTheme
			if (!appearance.customTheme) {
				appearance.customTheme = {
					backgroundColor: color,
					textColor: '#000000',
					primaryColor: '#3b82f6',
					fontFamily: 'Inter',
					borderRadius: 12,
					spacing: 16
				};
				console.log('[BackgroundSection] Created new customTheme:', appearance.customTheme);
			} else {
				appearance.customTheme.backgroundColor = color;
				console.log('[BackgroundSection] Updated customTheme.backgroundColor:', color);
			}

			const newDraftAppearance = JSON.stringify(appearance);
			console.log('[BackgroundSection] New draft_appearance:', newDraftAppearance);

			return {
				...p,
				draft_appearance: newDraftAppearance
			};
		});

		// Debounce save to API
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			try {
				const currentPage = $page;
				if (!currentPage) return;

				console.log('[BackgroundSection] Saving to API...');
				await api.saveDraft(username, {
					draft_appearance: currentPage.draft_appearance
				});
				console.log('[BackgroundSection] Saved successfully');
			} catch (e) {
				console.error('[BackgroundSection] Failed to save background:', e);
			} finally {
				isUserUpdate = false;
			}
		}, 300);
	}

	function updateBgGradient(gradient: string, fromColor?: string, toColor?: string, direction?: string) {
		// Sync gradient colors and type if provided
		if (fromColor) gradientFromColor = fromColor;
		if (toColor) gradientToColor = toColor;
		if (direction) gradientDirection = direction;
		
		// Set gradient type to linear since all presets are linear
		gradientType = 'linear';
		
		updateBgColor(gradient);
	}
	
	function toggleCustomGradient() {
		showCustomGradient = !showCustomGradient;
	}
	
	function toggleCustomColor() {
		showCustomColor = !showCustomColor;
	}
	
	function updateCustomGradient() {
		let customGradient;
		if (gradientType === 'radial') {
			customGradient = `radial-gradient(circle, ${gradientFromColor}, ${gradientToColor})`;
		} else {
			customGradient = `linear-gradient(${gradientDirection}, ${gradientFromColor}, ${gradientToColor})`;
		}
		updateBgColor(customGradient);
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
					<label class="block text-sm font-medium text-gray-700 mb-2">Preset Colors</label>
					<div class="grid grid-cols-9 gap-1.5">
						{#each solidColors as color}
							<button
								on:click={() => updateBgColor(color.color)}
								class="group relative aspect-square rounded-md transition-all hover:scale-105 border {currentBgColor === color.color ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}"
								style="background: {color.color};"
								title={color.name}
							>
								{#if currentBgColor === color.color}
									<svg class="absolute inset-0 m-auto w-3 h-3 {color.color === '#ffffff' || color.color === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
						
						<!-- Custom Color Button -->
						<button
							on:click={toggleCustomColor}
							class="group relative aspect-square rounded-md transition-all hover:scale-105 border {showCustomColor ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
							title="Custom Color"
						>
							<div class="absolute inset-0 flex items-center justify-center">
								<svg class="w-4 h-4 {showCustomColor ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</div>
						</button>
					</div>
				</div>

				<!-- Custom Color Controls -->
				{#if showCustomColor}
					<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-3">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-semibold text-gray-900">Custom Color</h4>
							<button
								on:click={toggleCustomColor}
								class="p-1 hover:bg-white/50 rounded transition"
								title="Close"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div class="flex items-center gap-3">
							<div class="relative">
								<input 
									type="color" 
									value={currentBgColor}
									on:input={(e) => updateBgColor(e.currentTarget.value)}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div 
									class="w-12 h-12 rounded-lg border-2 border-white shadow-sm cursor-pointer"
									style="background-color: {currentBgColor};"
								></div>
							</div>
							<input 
								type="text"
								value={currentBgColor}
								on:input={(e) => updateBgColor(e.currentTarget.value)}
								class="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-mono bg-white"
								placeholder="#ffffff"
							/>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Gradient Options -->
		{#if selectedType === 'gradient'}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
					<div class="grid grid-cols-9 gap-1.5">
						{#each gradients as grad}
							<button
								on:click={() => updateBgGradient(grad.gradient, grad.from, grad.to, grad.direction)}
								class="group relative aspect-square rounded-md transition-all hover:scale-105 border {currentBgColor === grad.gradient ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}"
								style="background: {grad.gradient};"
								title={grad.name}
							>
								{#if currentBgColor === grad.gradient}
									<svg class="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
						
						<!-- Custom Gradient Button -->
						<button
							on:click={toggleCustomGradient}
							class="group relative aspect-square rounded-md transition-all hover:scale-105 border {showCustomGradient ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
							title="Custom Gradient"
						>
							<div class="absolute inset-0 flex items-center justify-center">
								<svg class="w-4 h-4 {showCustomGradient ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</div>
						</button>
					</div>
				</div>

				<!-- Custom Gradient Controls -->
				{#if showCustomGradient}
					<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-4">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-sm font-semibold text-gray-900">Custom Gradient</h4>
							<button
								on:click={toggleCustomGradient}
								class="p-1 hover:bg-white/50 rounded transition"
								title="Close"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<!-- Color Pickers -->
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">From Color</label>
								<div class="relative">
									<input
										type="color"
										bind:value={gradientFromColor}
										on:input={updateCustomGradient}
										class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
									<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
										<div 
											class="w-8 h-8 rounded border-2 border-white shadow-sm"
											style="background-color: {gradientFromColor};"
										></div>
										<p class="text-xs font-mono text-gray-900">{gradientFromColor}</p>
									</div>
								</div>
							</div>
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">To Color</label>
								<div class="relative">
									<input
										type="color"
										bind:value={gradientToColor}
										on:input={updateCustomGradient}
										class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
									<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
										<div 
											class="w-8 h-8 rounded border-2 border-white shadow-sm"
											style="background-color: {gradientToColor};"
										></div>
										<p class="text-xs font-mono text-gray-900">{gradientToColor}</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Gradient Type Selector -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Gradient Type</label>
							<div class="grid grid-cols-2 gap-2">
								<button
									on:click={() => { gradientType = 'linear'; updateCustomGradient(); }}
									class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition {gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
									<span class="text-xs font-medium">Linear</span>
								</button>
								<button
									on:click={() => { gradientType = 'radial'; updateCustomGradient(); }}
									class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition {gradientType === 'radial' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="10" stroke-width="2"/>
										<circle cx="12" cy="12" r="6" stroke-width="2"/>
										<circle cx="12" cy="12" r="2" stroke-width="2"/>
									</svg>
									<span class="text-xs font-medium">Radial</span>
								</button>
							</div>
						</div>

						<!-- Direction Selector (only for linear) -->
						{#if gradientType === 'linear'}
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">Direction</label>
								<div class="grid grid-cols-4 gap-2">
									<!-- Top to Bottom -->
									<button
										on:click={() => { gradientDirection = '0deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '0deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Top to Bottom"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
										</svg>
									</button>
									
									<!-- Left to Right -->
									<button
										on:click={() => { gradientDirection = '90deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '90deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Left to Right"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
										</svg>
									</button>
									
									<!-- Diagonal (Top-Left to Bottom-Right) -->
									<button
										on:click={() => { gradientDirection = '135deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '135deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Diagonal"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 19L5 5m14 0v14" />
										</svg>
									</button>
									
									<!-- Bottom to Top -->
									<button
										on:click={() => { gradientDirection = '180deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '180deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Bottom to Top"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
										</svg>
									</button>
								</div>
							</div>
						{/if}

						<!-- Preview -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Preview</label>
							<div 
								class="h-20 rounded-lg border-2 border-white shadow-sm"
								style="background: {gradientType === 'radial' ? `radial-gradient(circle, ${gradientFromColor}, ${gradientToColor})` : `linear-gradient(${gradientDirection}, ${gradientFromColor}, ${gradientToColor})`};"
							></div>
						</div>
					</div>
				{/if}
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
