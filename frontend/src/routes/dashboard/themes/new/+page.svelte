<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import ThemePreviewMockup from '$lib/components/editor/ThemePreviewMockup.svelte';
	import ThemeDebugPanel from './components/ThemeDebugPanel.svelte';
	import ThemeBackground from './components/ThemeBackground.svelte';
	import ThemeBasicInfo from './components/ThemeBasicInfo.svelte';
	import ThemeColorPicker from './components/ThemeColorPicker.svelte';
	import ThemeTypography from './components/ThemeTypography.svelte';
	import ThemePresets from './components/ThemePresets.svelte';
	import ThemeLayout from './components/ThemeLayout.svelte';
	import ThemeBaseSelector from './components/ThemeBaseSelector.svelte';
	import ThemeJsonEditor from './components/ThemeJsonEditor.svelte';
	import { previewAppearance, previewAppearanceState, previewPage, buildPreviewAppearance } from '$lib/stores/themePreview';
	import { groups } from '$lib/stores/page';
	import type { ThemePreset } from '$lib/types';

	// Debug mode toggle
	let showDebug = false;

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
	let selectedLinkIconShape: 'square' | 'rounded' | 'circle' = 'rounded';
	let selectedLinkGroupLayout: 'list' | 'grid' | 'cards' = 'list';
	let fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
	let maxWidth = 480;
	let pagePadding = 16;
	let blockGap = 14;
	let blockPaddingX = 16;
	let blockPaddingY = 12;
	let textAlign: 'left' | 'center' | 'right' = 'center';
	let blockBorderRadiusType: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
	
	// Color fields
	let primaryColor = '#3b82f6';
	let textColor = '#18181b';
	let borderColor = '#e4e4e7';
	let borderWidth = 1;
	let mutedTextColor = '#71717a';
	let pageBgColor = '#fafafa';
	
	// Typography fields
	let baseFontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base';
	let headingFontSize: 'lg' | 'xl' | '2xl' = '2xl';
	let bodyFontWeight: 'normal' | 'medium' = 'normal';
	let headingFontWeight: 'medium' | 'semibold' | 'bold' = 'bold';
	let bodyLineHeight: 'tight' | 'normal' | 'relaxed' = 'normal';
	let headingLineHeight: 'tight' | 'normal' | 'relaxed' = 'tight';
	
	// Layout fields
	let cardElevation: 'none' | 'xs' | 'sm' | 'md' | 'lg' = 'sm';
	
	// Background fields
	let bgType: 'solid' | 'gradient' | 'image' = 'solid';
	let bgSolidColor = '#ffffff';
	let bgGradientFrom = '#667eea';
	let bgGradientTo = '#764ba2';
	let bgGradientDirection = '135deg';
	let bgImageUrl = '';
	let bgBlur = 0;
	let bgDim = 0;
	let bgBrightness = 100;
	let bgGrayscale = 0;
	
	// Image upload state
	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';

	onMount(async () => {
		try {
			const [themesResult, headerResult, editorData] = await Promise.all([
				api.getThemes(),
				api.getHeaderPresets(),
				api.getEditorData('demo') // Load user's real data
			]);
			themes = themesResult.themes;
			headerPresets = headerResult.presets;
			
			// Set real page data for preview
			if (editorData?.page) {
				previewPage.set(editorData.page);
				
				// Load groups/links
				if (editorData.groups) {
					groups.set(editorData.groups);
				}
			}
			
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
		selectedLinkIconShape = theme.config.page?.defaults?.linkIconShape || 'rounded';
		selectedLinkGroupLayout = theme.config.page?.defaults?.linkGroupLayout || 'list';
		fontFamily = theme.config.tokens?.typography?.fontFamily?.sans || 'Inter, system-ui, -apple-system, sans-serif';
		maxWidth = theme.config.page?.layout?.maxWidth || 480;
		pagePadding = theme.config.page?.layout?.pagePadding || 16;
		blockGap = theme.config.page?.layout?.blockGap || 14;
		blockPaddingX = theme.config.page?.layout?.blockPadding?.x || 16;
		blockPaddingY = theme.config.page?.layout?.blockPadding?.y || 12;
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
		borderColor = resolveRef(theme.config.semantic?.color?.border?.default) || '#e4e4e7';
		borderWidth = resolveRef(theme.config.tokens?.border?.width?.default) || 1;
		
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
		
		// Extract typography - line heights
		const lineHeightMap: Record<number, typeof bodyLineHeight> = {
			1.25: 'tight', 1.5: 'normal', 1.75: 'relaxed'
		};
		const bodyLH = resolveRef(theme.config.semantic?.typography?.body?.lineHeight);
		bodyLineHeight = (typeof bodyLH === 'number' && lineHeightMap[bodyLH]) || 'normal';
		
		const headingLH = resolveRef(theme.config.semantic?.typography?.heading?.lineHeight);
		headingLineHeight = (typeof headingLH === 'number' && lineHeightMap[headingLH]) || 'tight';
		
		// Extract more colors
		mutedTextColor = resolveRef(theme.config.semantic?.color?.text?.muted) || '#71717a';
		pageBgColor = resolveRef(theme.config.semantic?.color?.surface?.page) || '#fafafa';
		
		// Extract elevation
		const elevationRef = theme.config.recipes?.link?.base?.elevation;
		if (elevationRef && typeof elevationRef === 'string' && elevationRef.startsWith('ref:tokens.elevation.')) {
			cardElevation = elevationRef.replace('ref:tokens.elevation.', '') as any;
		} else {
			cardElevation = 'sm';
		}
		
		// Extract background effects
		bgBlur = theme.config.background?.effects?.blur || 0;
		bgDim = theme.config.background?.effects?.dim || 0;
		bgBrightness = theme.config.background?.effects?.brightness || 100;
		bgGrayscale = theme.config.background?.effects?.grayscale || 0;
		
		// Extract background
		const bgValue = resolveRef(theme.config.semantic?.color?.surface?.page);
		if (typeof bgValue === 'string') {
			if (bgValue.match(/^#[0-9a-fA-F]{6}$/)) {
				bgType = 'solid';
				bgSolidColor = bgValue;
				pageBgColor = bgValue;
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
			config.page.defaults.linkIconShape = selectedLinkIconShape;
			config.page.defaults.linkGroupLayout = selectedLinkGroupLayout;
			
			// Update layout
			if (!config.page.layout) config.page.layout = {};
			config.page.layout.maxWidth = maxWidth;
			config.page.layout.pagePadding = pagePadding;
			config.page.layout.blockGap = blockGap;
			config.page.layout.textAlign = textAlign;
			
			// Update block padding
			if (!config.page.layout.blockPadding) config.page.layout.blockPadding = {};
			config.page.layout.blockPadding.x = blockPaddingX;
			config.page.layout.blockPadding.y = blockPaddingY;
			
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
			config.semantic.color.border.default = borderColor;
			
			// Update border width in tokens
			if (!config.tokens) config.tokens = {};
			if (!config.tokens.border) config.tokens.border = {};
			if (!config.tokens.border.width) config.tokens.border.width = {};
			config.tokens.border.width.default = borderWidth;
			
			// Update typography
			if (!config.semantic.typography) config.semantic.typography = {};
			if (!config.semantic.typography.body) config.semantic.typography.body = {};
			if (!config.semantic.typography.heading) config.semantic.typography.heading = {};
			
			config.semantic.typography.body.fontSize = `ref:tokens.typography.fontSize.${baseFontSize}`;
			config.semantic.typography.body.fontWeight = `ref:tokens.typography.fontWeight.${bodyFontWeight}`;
			config.semantic.typography.body.lineHeight = `ref:tokens.typography.lineHeight.${bodyLineHeight}`;
			config.semantic.typography.heading.fontSize = `ref:tokens.typography.fontSize.${headingFontSize}`;
			config.semantic.typography.heading.fontWeight = `ref:tokens.typography.fontWeight.${headingFontWeight}`;
			config.semantic.typography.heading.lineHeight = `ref:tokens.typography.lineHeight.${headingLineHeight}`;
			
			// Update more colors
			config.semantic.color.text.muted = mutedTextColor;
			
			// Update elevation in recipes
			config.recipes.link.base.elevation = `ref:tokens.elevation.${cardElevation}`;
			
			// Update background effects
			if (!config.background) config.background = {};
			if (!config.background.effects) config.background.effects = {};
			config.background.effects.blur = bgBlur;
			config.background.effects.dim = bgDim;
			config.background.effects.brightness = bgBrightness;
			config.background.effects.grayscale = bgGrayscale;
			config.background.effects.overlayColor = 'ref:tokens.color.overlay.10';
			
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

	$: if (selectedHeaderPreset || selectedBlockStyle || selectedLinkIconShape || selectedLinkGroupLayout || fontFamily || maxWidth || pagePadding || blockGap || blockPaddingX || blockPaddingY || textAlign || blockBorderRadiusType || primaryColor || textColor || borderColor || borderWidth || mutedTextColor || pageBgColor || baseFontSize || headingFontSize || bodyFontWeight || headingFontWeight || bodyLineHeight || headingLineHeight || cardElevation || bgType || bgSolidColor || bgGradientFrom || bgGradientTo || bgGradientDirection || bgImageUrl || bgBlur || bgDim || bgBrightness || bgGrayscale) {
		updateConfig();
	}

	// Update preview stores when config changes
	$: if (configJson) {
		try {
			const config = JSON.parse(configJson);
			previewAppearance.set(buildPreviewAppearance(config, selectedBlockStyle));
			
			// Resolve blockBorderRadius from type
			const radiusMap: Record<string, number> = {
				none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999
			};
			
			const backgroundValue = bgType === 'solid' ? bgSolidColor : bgType === 'gradient' ? `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientTo})` : bgImageUrl ? `url('${bgImageUrl}')` : '#ffffff';
			
			previewAppearanceState.set({
				headerPresetId: selectedHeaderPreset,
				overrides: {
					'page.blockGap': blockGap,
					'page.titleFontSize': 20,
					'page.maxWidth': maxWidth,
					'page.textAlign': textAlign,
					'page.pagePadding': pagePadding,
					'page.blockPaddingX': blockPaddingX,
					'page.blockPaddingY': blockPaddingY,
					'block.borderRadius': radiusMap[blockBorderRadiusType] || 12,
					'header.titleFontFamily': fontFamily,
					'backgroundColor': backgroundValue,
					'backgroundBlur': bgBlur,
					'backgroundBrightness': bgBrightness,
					'backgroundGrayscale': bgGrayscale,
					'page.linkIconShape': selectedLinkIconShape,
					'page.linkGroupLayout': selectedLinkGroupLayout
				}
			});
			// Don't override previewPage - keep real user data
		} catch (e) {
			// Invalid JSON, skip preview update
		}
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

<div class="min-h-screen" style="background-color: #f6f1eb;">
	<div class="flex h-[calc(100vh-64px)]">
		<!-- Main Content + Preview -->
		<div class="flex-1 overflow-y-auto">
			<div class="flex gap-8 p-8 justify-center">
				<!-- Left: Content Area -->
				<div class="flex-1 max-w-2xl">
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
				<ThemeBaseSelector
					bind:baseThemeKey
					{themes}
				/>

				<!-- Basic Info -->
				<ThemeBasicInfo
					bind:name
					bind:description
					bind:category
					bind:tier
				/>

				<!-- Theme Colors -->
				<ThemeColorPicker
					bind:primaryColor
					bind:textColor
					bind:borderColor
					bind:borderWidth
					bind:mutedTextColor
				/>

				<!-- Typography -->
				<ThemeTypography
					bind:baseFontSize
					bind:headingFontSize
					bind:bodyFontWeight
					bind:headingFontWeight
					bind:bodyLineHeight
					bind:headingLineHeight
				/>

				<!-- Quick Edit: Presets -->
				<ThemePresets
					bind:selectedHeaderPreset
					bind:selectedBlockStyle
					bind:selectedLinkIconShape
					bind:selectedLinkGroupLayout
					{headerPresets}
				/>

				<!-- Layout & Typography -->
				<ThemeLayout
					bind:fontFamily
					bind:maxWidth
					bind:textAlign
					bind:pagePadding
					bind:blockGap
					bind:blockPaddingX
					bind:blockPaddingY
					bind:blockBorderRadiusType
					bind:cardElevation
				/>

				<!-- Page Background -->
				<ThemeBackground
					bind:bgType
					bind:bgSolidColor
					bind:bgGradientFrom
					bind:bgGradientTo
					bind:bgGradientDirection
					bind:bgImageUrl
					bind:bgBlur
					bind:bgDim
					bind:bgBrightness
					bind:bgGrayscale
					{uploading}
					on:imageUpload={(e) => handleImageUpload(e.detail.originalEvent)}
				/>

				<!-- Theme Configuration -->
				<ThemeJsonEditor bind:configJson />

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

			<!-- Bottom Spacer -->
			<div class="h-20"></div>
		{/if}
	</div>

	<!-- Right: Preview -->
	<div class="w-[520px] flex-shrink-0 -mr-8 pr-8">
		<div class="sticky top-8">
			<!-- Debug Toggle -->
			<div class="mb-4 flex items-center justify-between">
				<button
					on:click={() => showDebug = !showDebug}
					class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors {showDebug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					{showDebug ? '✓ Debug Mode' : 'Debug Mode'}
				</button>
			</div>

			<!-- Debug Panel -->
			{#if showDebug}
				<ThemeDebugPanel
					{selectedHeaderPreset}
					{selectedBlockStyle}
					{blockBorderRadiusType}
					{textAlign}
					{maxWidth}
					{pagePadding}
					{blockGap}
					{blockPaddingX}
					{blockPaddingY}
					{fontFamily}
					{baseFontSize}
					{headingFontSize}
					{primaryColor}
					{textColor}
					{borderColor}
					{borderWidth}
					{bgType}
					{bgSolidColor}
					{bgGradientFrom}
					{bgGradientTo}
					{bgGradientDirection}
					{bgImageUrl}
					{configJson}
				/>
			{/if}

			<div class="pt-16 pb-8">
				<div class="flex items-center justify-center">
					<ThemePreviewMockup />
				</div>
			</div>
		</div>
	</div>
</div>
		</div>
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
