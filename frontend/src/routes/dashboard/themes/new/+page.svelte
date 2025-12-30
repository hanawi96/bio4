<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import type { ThemePreset } from '$lib/types';

	let themes: ThemePreset[] = [];
	let headerPresets: any[] = [];
	let loading = true;
	let saving = false;
	let error = '';

	let baseThemeKey = 'minimal';
	let name = '';
	let description = '';
	let category = 'minimal';
	let tier = 'free';
	let configJson = '';
	let baseConfig: any = null; // Store full base config
	
	// Quick edit fields
	let selectedHeaderPreset = 'no-cover';
	let selectedBlockStyle: 'solid' | 'soft' | 'outline' | 'glass' | 'neon' | 'brutal' = 'solid';
	let fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
	let maxWidth = 480;
	let pagePadding = 16;
	let blockGap = 14;
	let textAlign: 'left' | 'center' | 'right' = 'center';
	let blockBorderRadiusType: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
	
	// Color fields
	let primaryColor = '#3b82f6';
	let textColor = '#18181b';
	let mutedTextColor = '#71717a';
	let borderColor = '#e4e4e7';
	let cardBgColor = '#ffffff';
	
	// Typography fields
	let baseFontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base';
	let headingFontSize: 'lg' | 'xl' | '2xl' = '2xl';
	let bodyFontWeight: 'normal' | 'medium' = 'normal';
	let headingFontWeight: 'medium' | 'semibold' | 'bold' = 'bold';
	
	// Background fields
	let bgType: 'solid' | 'gradient' | 'image' = 'solid';
	let bgSolidColor = '#ffffff';
	let bgGradientFrom = '#667eea';
	let bgGradientTo = '#764ba2';
	let bgGradientDirection = '135deg';
	let bgImageUrl = '';
	
	// Image upload state
	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';

	onMount(async () => {
		try {
			const [themesResult, headerResult] = await Promise.all([
				api.getThemes(),
				api.getHeaderPresets()
			]);
			themes = themesResult.themes;
			headerPresets = headerResult.presets;
			
			if (themes.length > 0) {
				loadBaseTheme(themes[0].key);
			}
		} catch (e) {
			console.error('Failed to load data:', e);
		} finally {
			loading = false;
		}
	});

	function loadBaseTheme(key: string) {
		const theme = themes.find(t => t.key === key);
		if (!theme) return;
		
		// Store full base config
		baseConfig = JSON.parse(JSON.stringify(theme.config)); // Deep clone
		configJson = JSON.stringify(baseConfig, null, 2);
		
		// Helper to resolve ref
		const resolveRef = (value: any): any => {
			if (typeof value === 'string' && value.startsWith('ref:')) {
				const path = value.replace('ref:', '').split('.');
				let resolved: any = theme.config;
				for (const k of path) {
					resolved = resolved?.[k];
					if (!resolved) break;
				}
				return resolved || value;
			}
			return value;
		};
		
		// Extract basic fields
		category = theme.config.meta?.category || 'minimal';
		tier = theme.config.meta?.tier || 'free';
		selectedHeaderPreset = theme.config.page?.defaults?.headerPresetId || 'no-cover';
		selectedBlockStyle = theme.config.page?.defaults?.blockStylePreset || 'solid';
		fontFamily = theme.config.tokens?.typography?.fontFamily?.sans || 'Inter, system-ui, -apple-system, sans-serif';
		maxWidth = theme.config.page?.layout?.maxWidth || 480;
		pagePadding = theme.config.page?.layout?.pagePadding || 16;
		blockGap = theme.config.page?.layout?.blockGap || 14;
		textAlign = theme.config.page?.layout?.textAlign || 'center';
		
		// Extract radius
		const radiusRef = theme.config.recipes?.link?.base?.radius;
		if (radiusRef && typeof radiusRef === 'string' && radiusRef.startsWith('ref:tokens.radius.')) {
			blockBorderRadiusType = radiusRef.replace('ref:tokens.radius.', '') as any;
		} else {
			blockBorderRadiusType = 'lg';
		}
		
		// Extract colors
		primaryColor = resolveRef(theme.config.semantic?.color?.primary) || '#3b82f6';
		textColor = resolveRef(theme.config.semantic?.color?.text?.default) || '#18181b';
		mutedTextColor = resolveRef(theme.config.semantic?.color?.text?.muted) || '#71717a';
		borderColor = resolveRef(theme.config.semantic?.color?.border?.default) || '#e4e4e7';
		cardBgColor = resolveRef(theme.config.semantic?.color?.surface?.card) || '#ffffff';
		
		// Extract typography - font sizes
		const sizeMap: Record<number, typeof baseFontSize> = {
			12: 'xs', 14: 'sm', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl'
		};
		const headingSizeMap: Record<number, typeof headingFontSize> = {
			18: 'lg', 20: 'xl', 24: '2xl'
		};
		
		const bodySize = resolveRef(theme.config.semantic?.typography?.body?.fontSize);
		baseFontSize = (typeof bodySize === 'number' && sizeMap[bodySize]) || 'base';
		
		const headingSize = resolveRef(theme.config.semantic?.typography?.heading?.fontSize);
		headingFontSize = (typeof headingSize === 'number' && headingSizeMap[headingSize]) || '2xl';
		
		// Extract typography - font weights
		const bodyWeight = resolveRef(theme.config.semantic?.typography?.body?.fontWeight);
		bodyFontWeight = bodyWeight === 500 ? 'medium' : 'normal';
		
		const headingWeight = resolveRef(theme.config.semantic?.typography?.heading?.fontWeight);
		headingFontWeight = headingWeight === 600 ? 'semibold' : headingWeight === 500 ? 'medium' : 'bold';
		
		// Extract background
		const bgValue = resolveRef(theme.config.semantic?.color?.surface?.page);
		if (typeof bgValue === 'string') {
			if (bgValue.match(/^#[0-9a-fA-F]{6}$/)) {
				bgType = 'solid';
				bgSolidColor = bgValue;
			} else if (bgValue.includes('gradient')) {
				bgType = 'gradient';
				const colorMatches = bgValue.match(/#[0-9a-fA-F]{6}/g);
				if (colorMatches?.length >= 2) {
					bgGradientFrom = colorMatches[0];
					bgGradientTo = colorMatches[1];
				}
				const angleMatch = bgValue.match(/(\d+)deg/);
				if (angleMatch) bgGradientDirection = angleMatch[1] + 'deg';
			} else if (bgValue.startsWith('url(')) {
				bgType = 'image';
				const urlMatch = bgValue.match(/url\(['"]?([^'"]+)['"]?\)/);
				if (urlMatch) bgImageUrl = urlMatch[1];
			}
		}
	}

	$: if (baseThemeKey && themes.length > 0) {
		loadBaseTheme(baseThemeKey);
	}

	// Update JSON when fields change
	function updateConfig() {
		if (!baseConfig) return; // Wait for base config to load
		
		try {
			// Always start from full base config (deep clone)
			const config = JSON.parse(JSON.stringify(baseConfig));
			
			// Update presets
			if (!config.page) config.page = {};
			if (!config.page.defaults) config.page.defaults = {};
			config.page.defaults.headerPresetId = selectedHeaderPreset;
			config.page.defaults.blockStylePreset = selectedBlockStyle;
			
			// Update layout
			if (!config.page.layout) config.page.layout = {};
			config.page.layout.maxWidth = maxWidth;
			config.page.layout.pagePadding = pagePadding;
			config.page.layout.blockGap = blockGap;
			config.page.layout.textAlign = textAlign;
			
			// Update typography
			if (!config.tokens) config.tokens = {};
			if (!config.tokens.typography) config.tokens.typography = {};
			if (!config.tokens.typography.fontFamily) config.tokens.typography.fontFamily = {};
			config.tokens.typography.fontFamily.sans = fontFamily;
			
			// Update border radius in recipes
			if (!config.recipes) config.recipes = {};
			if (!config.recipes.link) config.recipes.link = {};
			if (!config.recipes.link.base) config.recipes.link.base = {};
			config.recipes.link.base.radius = `ref:tokens.radius.${blockBorderRadiusType}`;
			
			// Update colors
			if (!config.semantic) config.semantic = {};
			if (!config.semantic.color) config.semantic.color = {};
			if (!config.semantic.color.text) config.semantic.color.text = {};
			if (!config.semantic.color.border) config.semantic.color.border = {};
			if (!config.semantic.color.surface) config.semantic.color.surface = {};
			
			config.semantic.color.primary = primaryColor;
			config.semantic.color.text.default = textColor;
			config.semantic.color.text.muted = mutedTextColor;
			config.semantic.color.border.default = borderColor;
			config.semantic.color.surface.card = cardBgColor;
			
			// Update typography
			if (!config.semantic.typography) config.semantic.typography = {};
			if (!config.semantic.typography.body) config.semantic.typography.body = {};
			if (!config.semantic.typography.heading) config.semantic.typography.heading = {};
			
			config.semantic.typography.body.fontSize = `ref:tokens.typography.fontSize.${baseFontSize}`;
			config.semantic.typography.body.fontWeight = `ref:tokens.typography.fontWeight.${bodyFontWeight}`;
			config.semantic.typography.heading.fontSize = `ref:tokens.typography.fontSize.${headingFontSize}`;
			config.semantic.typography.heading.fontWeight = `ref:tokens.typography.fontWeight.${headingFontWeight}`;
			
			// Update background
			let bgValue = '';
			if (bgType === 'solid') {
				bgValue = bgSolidColor;
			} else if (bgType === 'gradient') {
				bgValue = `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`;
			} else if (bgType === 'image') {
				bgValue = bgImageUrl ? `url('${bgImageUrl}')` : '#ffffff';
			}
			config.semantic.color.surface.page = bgValue;
			
			configJson = JSON.stringify(config, null, 2);
		} catch (e) {
			console.error('Failed to update config:', e);
		}
	}

	$: if (selectedHeaderPreset || selectedBlockStyle || fontFamily || maxWidth || pagePadding || blockGap || textAlign || blockBorderRadiusType || primaryColor || textColor || mutedTextColor || borderColor || cardBgColor || baseFontSize || headingFontSize || bodyFontWeight || headingFontWeight || bgType || bgSolidColor || bgGradientFrom || bgGradientTo || bgGradientDirection || bgImageUrl) {
		updateConfig();
	}

	async function handleSubmit() {
		if (!name.trim()) {
			error = 'Theme name is required';
			return;
		}

		// Validate JSON
		let config;
		try {
			config = JSON.parse(configJson);
		} catch (e) {
			error = 'Invalid JSON format';
			return;
		}

		// Update meta fields
		const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		config.meta = {
			...config.meta,
			id: `preset.${key}`,
			name,
			description,
			category,
			tier
		};

		saving = true;
		error = '';

		try {
			await api.createTheme({ key, name, config, description, category, tier });
			goto('/dashboard/themes');
		} catch (e: any) {
			error = e.message || 'Failed to create theme';
		} finally {
			saving = false;
		}
	}
	
	// Image upload handlers
	function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Please upload an image file (JPG, PNG, WebP)');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image must be less than 5MB');
			return;
		}

		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
		input.value = '';
	}

	async function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		uploading = true;

		try {
			const croppedFile = new File([croppedBlob], 'background.jpg', {
				type: 'image/jpeg'
			});

			const result = await api.uploadBackground('demo', croppedFile);
			bgImageUrl = result.url;

			showCropModal = false;
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		} catch (e) {
			console.error('Failed to upload background:', e);
			alert('Failed to upload image. Please try again.');
		} finally {
			uploading = false;
		}
	}

	function handleCropCancel() {
		showCropModal = false;
		URL.revokeObjectURL(tempImageUrl);
		tempImageUrl = '';
	}
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="max-w-5xl mx-auto">
		<!-- Header -->
		<div class="mb-6">
			<a href="/dashboard/themes" class="text-sm text-gray-600 hover:text-gray-900 mb-3 inline-flex items-center gap-1">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Themes
			</a>
			<h1 class="text-3xl font-bold text-gray-900">Create New Theme</h1>
			<p class="text-gray-600 mt-1">Duplicate an existing theme and customize it</p>
		</div>

		{#if error}
			<div class="card-ios bg-red-50 border-red-200 text-red-700 px-4 py-3 mb-6">
				{error}
			</div>
		{/if}

		{#if loading}
			<div class="card-ios p-8 text-center">
				<div class="inline-block w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
				<p class="text-gray-600 mt-3">Loading themes...</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Base Theme Selection -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Base Theme</h2>
					<div>
						<label for="baseTheme" class="block text-sm font-medium text-gray-700 mb-2">
							Start from existing theme
						</label>
						<select
							id="baseTheme"
							bind:value={baseThemeKey}
							class="input-ios"
						>
							{#each themes as theme}
								<option value={theme.key}>{theme.name}</option>
							{/each}
						</select>
						<p class="text-xs text-gray-500 mt-2">
							The configuration will be loaded and you can edit it below
						</p>
					</div>
				</section>

				<!-- Basic Info -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
								Theme Name *
							</label>
							<input
								id="name"
								type="text"
								bind:value={name}
								required
								class="input-ios"
								placeholder="My Custom Theme"
							/>
						</div>
						<div>
							<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
								Description
							</label>
							<textarea
								id="description"
								bind:value={description}
								rows="2"
								class="input-ios"
								placeholder="A beautiful theme with..."
							></textarea>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
									Category
								</label>
								<select id="category" bind:value={category} class="input-ios">
									<option value="minimal">Minimal</option>
									<option value="dark">Dark</option>
									<option value="gradient">Gradient</option>
									<option value="colorful">Colorful</option>
								</select>
							</div>
							<div>
								<label for="tier" class="block text-sm font-medium text-gray-700 mb-2">
									Tier
								</label>
								<select id="tier" bind:value={tier} class="input-ios">
									<option value="free">Free</option>
									<option value="pro">Pro</option>
								</select>
							</div>
						</div>
					</div>
				</section>

				<!-- Theme Colors -->
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
							<label class="block text-sm font-medium text-gray-700 mb-2">Muted Text Color</label>
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
							<label class="block text-sm font-medium text-gray-700 mb-2">Card Background</label>
							<div class="flex items-center gap-3">
								<input
									type="color"
									bind:value={cardBgColor}
									class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
								/>
								<input
									type="text"
									bind:value={cardBgColor}
									class="flex-1 input-ios font-mono text-sm"
									placeholder="#ffffff"
								/>
							</div>
							<p class="text-xs text-gray-500 mt-1">Background color for cards/blocks</p>
						</div>
					</div>
				</section>

				<!-- Typography -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="baseFontSize" class="block text-sm font-medium text-gray-700 mb-2">
								Base Font Size
							</label>
							<select id="baseFontSize" bind:value={baseFontSize} class="input-ios">
								<option value="xs">Extra Small (12px)</option>
								<option value="sm">Small (14px)</option>
								<option value="base">Base (16px)</option>
								<option value="lg">Large (18px)</option>
								<option value="xl">Extra Large (20px)</option>
								<option value="2xl">2X Large (24px)</option>
							</select>
							<p class="text-xs text-gray-500 mt-1">Body text size</p>
						</div>
						<div>
							<label for="headingFontSize" class="block text-sm font-medium text-gray-700 mb-2">
								Heading Font Size
							</label>
							<select id="headingFontSize" bind:value={headingFontSize} class="input-ios">
								<option value="lg">Large (18px)</option>
								<option value="xl">Extra Large (20px)</option>
								<option value="2xl">2X Large (24px)</option>
							</select>
							<p class="text-xs text-gray-500 mt-1">Name/title size</p>
						</div>
						<div>
							<label for="bodyFontWeight" class="block text-sm font-medium text-gray-700 mb-2">
								Body Font Weight
							</label>
							<select id="bodyFontWeight" bind:value={bodyFontWeight} class="input-ios">
								<option value="normal">Normal (400)</option>
								<option value="medium">Medium (500)</option>
							</select>
							<p class="text-xs text-gray-500 mt-1">Body text weight</p>
						</div>
						<div>
							<label for="headingFontWeight" class="block text-sm font-medium text-gray-700 mb-2">
								Heading Font Weight
							</label>
							<select id="headingFontWeight" bind:value={headingFontWeight} class="input-ios">
								<option value="medium">Medium (500)</option>
								<option value="semibold">Semibold (600)</option>
								<option value="bold">Bold (700)</option>
							</select>
							<p class="text-xs text-gray-500 mt-1">Name/title weight</p>
						</div>
					</div>
				</section>

				<!-- Quick Edit: Presets -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Default Presets</h2>
					<div class="space-y-4">
						<div>
							<label for="headerPreset" class="block text-sm font-medium text-gray-700 mb-2">
								Header Preset
							</label>
							<select id="headerPreset" bind:value={selectedHeaderPreset} class="input-ios">
								{#each headerPresets as preset}
									<option value={preset.key}>{preset.name}</option>
								{/each}
							</select>
							<p class="text-xs text-gray-500 mt-1">
								Default header style for this theme
							</p>
						</div>
						<div>
							<label for="blockStyle" class="block text-sm font-medium text-gray-700 mb-2">
								Block Style
							</label>
							<select id="blockStyle" bind:value={selectedBlockStyle} class="input-ios">
								<option value="solid">Solid - Full color with contrast text</option>
								<option value="soft">Soft - Subtle tint with border</option>
								<option value="outline">Outline - Transparent with border</option>
								<option value="glass">Glass - Frosted glass effect</option>
								<option value="neon">Neon - Solid with glow</option>
								<option value="brutal">Brutal - Hard shadow brutalism</option>
							</select>
							<p class="text-xs text-gray-500 mt-1">
								Button color and visual effect style
							</p>
						</div>
					</div>
				</section>

				<!-- Layout & Typography -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Layout & Typography</h2>
					<div class="space-y-4">
						<div>
							<label for="fontFamily" class="block text-sm font-medium text-gray-700 mb-2">
								Font Family
							</label>
							<input
								id="fontFamily"
								type="text"
								bind:value={fontFamily}
								class="input-ios"
								placeholder="Inter, system-ui, sans-serif"
							/>
							<p class="text-xs text-gray-500 mt-1">
								CSS font-family value
							</p>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="maxWidth" class="block text-sm font-medium text-gray-700 mb-2">
									Max Width (px)
								</label>
								<input
									id="maxWidth"
									type="number"
									bind:value={maxWidth}
									min="320"
									max="1200"
									class="input-ios"
								/>
							</div>
							<div>
								<label for="textAlign" class="block text-sm font-medium text-gray-700 mb-2">
									Text Align
								</label>
								<select id="textAlign" bind:value={textAlign} class="input-ios">
									<option value="left">Left</option>
									<option value="center">Center</option>
									<option value="right">Right</option>
								</select>
							</div>
							<div>
								<label for="pagePadding" class="block text-sm font-medium text-gray-700 mb-2">
									Page Padding (px)
								</label>
								<input
									id="pagePadding"
									type="number"
									bind:value={pagePadding}
									min="8"
									max="48"
									class="input-ios"
								/>
							</div>
							<div>
								<label for="blockGap" class="block text-sm font-medium text-gray-700 mb-2">
									Block Gap (px)
								</label>
								<input
									id="blockGap"
									type="number"
									bind:value={blockGap}
									min="8"
									max="48"
									class="input-ios"
								/>
							</div>
							<div>
								<label for="blockBorderRadius" class="block text-sm font-medium text-gray-700 mb-2">
									Block Border Radius
								</label>
								<select id="blockBorderRadius" bind:value={blockBorderRadiusType} class="input-ios">
									<option value="none">None (0px - Square)</option>
									<option value="sm">Small (4px)</option>
									<option value="md">Medium (8px)</option>
									<option value="lg">Large (12px)</option>
									<option value="xl">Extra Large (16px)</option>
									<option value="full">Full (Pill/Rounded)</option>
								</select>
								<p class="text-xs text-gray-500 mt-1">
									Border radius style for blocks/links
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Page Background -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
					
					<!-- Background Type Tabs -->
					<div class="grid grid-cols-3 gap-2 mb-4">
						<button
							type="button"
							on:click={() => bgType = 'solid'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'solid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							Solid Color
						</button>
						<button
							type="button"
							on:click={() => bgType = 'gradient'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'gradient' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							Gradient
						</button>
						<button
							type="button"
							on:click={() => bgType = 'image'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'image' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							Image
						</button>
					</div>

					<!-- Solid Color -->
					{#if bgType === 'solid'}
						<div class="space-y-3">
							<label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
							<div class="flex items-center gap-3">
								<input
									type="color"
									bind:value={bgSolidColor}
									class="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
								/>
								<input
									type="text"
									bind:value={bgSolidColor}
									class="flex-1 input-ios font-mono"
									placeholder="#ffffff"
								/>
							</div>
						</div>
					{/if}

					<!-- Gradient -->
					{#if bgType === 'gradient'}
						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2">From Color</label>
									<div class="flex items-center gap-2">
										<input
											type="color"
											bind:value={bgGradientFrom}
											class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
										/>
										<input
											type="text"
											bind:value={bgGradientFrom}
											class="flex-1 input-ios font-mono text-sm"
											placeholder="#667eea"
										/>
									</div>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2">To Color</label>
									<div class="flex items-center gap-2">
										<input
											type="color"
											bind:value={bgGradientTo}
											class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
										/>
										<input
											type="text"
											bind:value={bgGradientTo}
											class="flex-1 input-ios font-mono text-sm"
											placeholder="#764ba2"
										/>
									</div>
								</div>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Direction</label>
								<select bind:value={bgGradientDirection} class="input-ios">
									<option value="0deg">Top to Bottom (0°)</option>
									<option value="90deg">Left to Right (90°)</option>
									<option value="135deg">Diagonal (135°)</option>
									<option value="180deg">Bottom to Top (180°)</option>
									<option value="270deg">Right to Left (270°)</option>
								</select>
							</div>
							<!-- Preview -->
							<div class="mt-3">
								<p class="text-xs text-gray-500 mb-2">Preview:</p>
								<div
									class="h-20 rounded-lg border-2 border-gray-200"
									style="background: linear-gradient({bgGradientDirection}, {bgGradientFrom} 0%, {bgGradientTo} 100%);"
								></div>
							</div>
						</div>
					{/if}

					<!-- Image Upload -->
					{#if bgType === 'image'}
						<div class="space-y-3">
							{#if bgImageUrl}
								<!-- Preview with uploaded image -->
								<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
									<img 
										src={bgImageUrl} 
										alt="Background" 
										class="w-full h-48 object-cover" 
									/>
									<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
										<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
											<input
												type="file"
												accept="image/*"
												on:change={handleImageUpload}
												disabled={uploading}
												class="hidden"
											/>
											<div class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
												</svg>
												Change Image
											</div>
										</label>
									</div>
									{#if uploading}
										<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
											<div class="flex items-center gap-3 text-white">
												<div class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
												<span class="font-medium">Uploading...</span>
											</div>
										</div>
									{/if}
								</div>
							{:else}
								<!-- Upload button -->
								<label class="block cursor-pointer">
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										on:change={handleImageUpload}
										disabled={uploading}
										class="hidden"
									/>
									<div class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
										<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
											<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										</div>
										<div class="text-center">
											<p class="text-sm font-medium text-gray-900">Upload Background Image</p>
											<p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</p>
										</div>
										<div class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
											Choose File
										</div>
									</div>
								</label>
							{/if}
						</div>
					{/if}
				</section>

				<!-- Theme Configuration -->
				<section class="card-ios p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Advanced Configuration (JSON)</h2>
					<div>
						<label for="config" class="block text-sm font-medium text-gray-700 mb-2">
							Full theme configuration
						</label>
						<textarea
							id="config"
							bind:value={configJson}
							rows="20"
							class="input-ios font-mono text-xs"
							placeholder=""
						></textarea>
						<p class="text-xs text-gray-500 mt-2">
							Edit colors, typography, layout, tokens, semantic mappings, and all advanced settings. Changes to presets above will update this JSON automatically.
						</p>
					</div>
				</section>

				<!-- Actions -->
				<div class="flex gap-3 justify-end">
					<a href="/dashboard/themes" class="btn-ios-secondary">
						Cancel
					</a>
					<button type="submit" disabled={saving} class="btn-ios-primary disabled:opacity-50 disabled:cursor-not-allowed">
						{saving ? 'Creating...' : 'Create Theme'}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>

<!-- Image Crop Modal -->
{#if showCropModal}
	<ImageCropModal
		imageUrl={tempImageUrl}
		aspectRatio={0.483}
		outputWidth={1080}
		outputHeight={2236}
		on:accept={handleCropAccept}
		on:cancel={handleCropCancel}
	/>
{/if}
