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
	import ThemeLayout from './components/ThemeLayout.svelte';
	import ThemeBaseSelector from './components/ThemeBaseSelector.svelte';
	import ThemeJsonEditor from './components/ThemeJsonEditor.svelte';
	import HeaderStyleManager from './components/HeaderStyleManager.svelte';
	import ThemeBlockStyle from './components/ThemeBlockStyle.svelte';
	import ThemeLinkGroupLayout from './components/ThemeLinkGroupLayout.svelte';
	import ThemePageSettings from './components/ThemePageSettings.svelte';
	import { previewAppearance, previewAppearanceState, previewPage, buildPreviewAppearance } from '$lib/stores/themePreview';
	import { groups } from '$lib/stores/page';
	import type { ThemePreset } from '$lib/types';
	import { RADIUS_TOKENS } from '$lib/appearance/spacingTokens';

	// Debug mode toggle
	let showDebug = false;

	let themes: ThemePreset[] = [];
	let headerPresets: any[] = [];
	let loading = true;
	let saving = false;
	let error = '';

	let baseThemeKey = ''; // Empty initially, will be set when themes load
	let name = '';
	let description = '';
	let category = 'minimal';
	let tier = 'free';
	let configJson = '';
	let baseConfig: any = null; // Store full base config
	
	// Quick edit fields
	let selectedHeaderPreset = 'no-cover';
	let avatarBorderColor = '#ffffff';
	let avatarBorderWidth = 4;
	let selectedBlockStyle: 'solid' | 'outline' | 'glass' | 'neon' | 'brutal' | 'gradient' = 'solid';
	let selectedShadowStyle: 'none' | 'soft' | 'medium' | 'hard' | 'brutal' = 'none';
	let blockOpacity: number = 100;
	let shadowCustom = {
		offsetX: 0,
		offsetY: 4,
		blur: 8,
		spread: 0,
		opacity: 0.1
	};
	let selectedLinkIconShape: 'square' | 'rounded' | 'circle' = 'rounded';
	let selectedLinkGroupLayout: 'list' | 'grid' | 'cards' = 'list';
	let socialIconPosition: 'header' | 'footer' = 'header';
	let socialIconColor = '#000000';
	let selectedGradientPreset: 'diagonal-dark' | 'vertical-fade' | 'horizontal-flow' | 'sunset-glow' | 'ocean-deep' | 'forest-path' | 'royal-luxury' | 'fire-blaze' | 'spotlight' | 'cosmic-burst' | 'aurora' | 'nebula' | 'spin' | 'vortex' | 'prism' | 'kaleidoscope' = 'diagonal-dark';
	let fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
	let headingFontFamily = 'Inter, system-ui, -apple-system, sans-serif'; // Font riêng cho heading
	let maxWidth = 480;
	let pagePadding = 16;
	let blockGap = 14;
	let blockPaddingX = 16;
	let blockPaddingY = 12;
	let textAlign: 'left' | 'center' | 'right' = 'center';
	let blockBorderRadiusType: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
	
	// Link Group Layout Config
	let gridConfig: import('$lib/types').GridLayoutConfig = {
		columns: 2,
		aspectRatio: 'square',
		showLabels: true,
		imagePadding: false
	};
	let cardConfig: import('$lib/types').CardLayoutConfig = {
		imagePosition: 'left',
		imageSize: 50,
		imageAspect: 'square',
		showSubtitle: true,
		imagePadding: false
	};
	let listConfig: import('$lib/types').ListLayoutConfig = {
		iconPosition: 'left',
		textAlign: 'center',
		showSubtitle: true
	};
	
	// Color fields
	let primaryColor = '#3b82f6';
	let textColor = '#18181b';
	let borderColor = '#e4e4e7';
	let borderWidth = 1;
	let mutedTextColor = '#71717a';
	let blockTextColor = '#ffffff';
	let shadowColor = '#000000';
	let pageBgColor = '#fafafa';
	
	// Typography fields
	let headingFontSize: 'lg' | 'xl' | '2xl' = '2xl';
	let linkFontSize: 'xs' | 'sm' | 'base' | 'lg' = 'sm';
	let bioFontSize: 'xs' | 'sm' | 'base' = 'sm';
	let subtitleFontSize: 'xs' | 'sm' = 'xs';
	
	// Background fields
	let bgType: 'solid' | 'gradient' | 'image' = 'solid';
	let bgSolidColor = '#ffffff';
	let bgGradientType: 'linear' | 'radial' = 'linear';
	let bgGradientFrom = '#667eea';
	let bgGradientTo = '#764ba2';
	let bgGradientMiddle = '#a855f7';
	let bgGradientMiddleEnabled = false;
	let bgGradientDirection = '135deg';
	let bgRadialShape: 'circle' = 'circle';
	let bgRadialPosition = 'center';
	let bgImageUrl = '';
	let bgBlur = 0;
	let bgBrightness = 100;
	let bgGrayscale = 0;
	
	// Cover image field
	let coverImageUrl = '';
	
	// Page settings
	let showShareButton = true;
	let showSubscribeButton = true;
	
	// Image upload state
	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';
	let uploadTarget: 'background' | 'cover' = 'background';

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
			
			// Set baseThemeKey to first theme and load it
			if (themes.length > 0) {
				baseThemeKey = themes[0].key;
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
		avatarBorderColor = theme.config.page?.defaults?.avatarBorderColor || '#ffffff';
		avatarBorderWidth = theme.config.page?.defaults?.avatarBorderWidth || 4;
		selectedBlockStyle = theme.config.page?.defaults?.blockStylePreset || 'solid';
		selectedShadowStyle = theme.config.page?.defaults?.shadowStyle || 'none';
		blockOpacity = theme.config.page?.defaults?.blockOpacity || 100;
		
		// Load shadow custom values if exists
		if (theme.config.page?.defaults?.shadowCustom) {
			shadowCustom = { ...shadowCustom, ...theme.config.page.defaults.shadowCustom };
		}
		selectedLinkIconShape = theme.config.page?.defaults?.linkIconShape || 'rounded';
		selectedLinkGroupLayout = theme.config.page?.defaults?.linkGroupLayout || 'list';
		
		// Load link group config
		const linkGroupConfig = theme.config.page?.defaults?.linkGroupConfig;
		if (linkGroupConfig) {
			if (linkGroupConfig.grid) {
				gridConfig = { ...gridConfig, ...linkGroupConfig.grid };
			}
			if (linkGroupConfig.cards) {
				cardConfig = { ...cardConfig, ...linkGroupConfig.cards };
			}
			if (linkGroupConfig.list) {
				listConfig = { ...listConfig, ...linkGroupConfig.list };
			}
		}
		
		socialIconPosition = theme.config.page?.defaults?.socialIconPosition || 'header';
		socialIconColor = theme.config.page?.defaults?.socialIconColor || textColor;
		selectedGradientPreset = theme.config.page?.defaults?.gradientPreset || 'diagonal-dark';
		showShareButton = theme.config.page?.defaults?.showShareButton ?? true;
		showSubscribeButton = theme.config.page?.defaults?.showSubscribeButton ?? true;
		fontFamily = theme.config.tokens?.typography?.fontFamily?.sans || 'Inter, system-ui, -apple-system, sans-serif';
		headingFontFamily = theme.config.page?.defaults?.headingFontFamily || fontFamily;
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
		borderWidth = theme.config.page?.defaults?.borderWidth || 1;
		
		// Extract typography - font sizes
		// Helper to extract key from ref string or convert pixel to key
		const fontSizeToKey = (value: any, validKeys: string[]): string => {
			// If it's a ref string like "ref:tokens.typography.fontSize.sm"
			if (typeof value === 'string' && value.startsWith('ref:tokens.typography.fontSize.')) {
				const key = value.replace('ref:tokens.typography.fontSize.', '');
				return validKeys.includes(key) ? key : validKeys[0];
			}
			// If it's a number (pixel value), map to key
			if (typeof value === 'number') {
				const map: Record<number, string> = {
					12: 'xs', 13: '13', 14: 'sm', 15: '15', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl'
				};
				const key = map[value];
				return (key && validKeys.includes(key)) ? key : validKeys[0];
			}
			// Fallback to first valid key
			return validKeys[0];
		};
		
		const headingSize = resolveRef(theme.config.semantic?.typography?.heading?.fontSize);
		headingFontSize = fontSizeToKey(headingSize, ['lg', 'xl', '2xl']) as typeof headingFontSize;
		
		const linkSize = resolveRef(theme.config.semantic?.typography?.link?.fontSize);
		linkFontSize = fontSizeToKey(linkSize, ['xs', '13', 'sm', '15', 'base', 'lg', 'xl']) as typeof linkFontSize;
		
		const bioSize = resolveRef(theme.config.semantic?.typography?.bio?.fontSize);
		bioFontSize = fontSizeToKey(bioSize, ['xs', '13', 'sm', '15', 'base']) as typeof bioFontSize;
		
		const subtitleSize = resolveRef(theme.config.semantic?.typography?.subtitle?.fontSize);
		subtitleFontSize = fontSizeToKey(subtitleSize, ['xs', '13', 'sm', '15', 'base']) as typeof subtitleFontSize;
		
		// Extract more colors
		mutedTextColor = resolveRef(theme.config.semantic?.color?.text?.muted) || '#71717a';
		blockTextColor = resolveRef(theme.config.semantic?.color?.block?.text) || '#ffffff';
		shadowColor = resolveRef(theme.config.tokens?.color?.shadowColor) || '#000000';
		pageBgColor = resolveRef(theme.config.semantic?.color?.surface?.page) || '#fafafa';
		
		// Extract background effects
		bgBlur = theme.config.background?.effects?.blur || 0;
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
				
				// Detect gradient type
				if (bgValue.startsWith('radial-gradient')) {
					bgGradientType = 'radial';
					
					// Always use circle for radial gradients
					bgRadialShape = 'circle';
					
					// Extract position
					const posMatch = bgValue.match(/at\s+([^,]+)/);
					if (posMatch) {
						bgRadialPosition = posMatch[1].trim();
					}
				} else {
					bgGradientType = 'linear';
					
					// Extract angle for linear
					const angleMatch = bgValue.match(/(\d+)deg/);
					if (angleMatch) bgGradientDirection = angleMatch[1] + 'deg';
				}
				
				// Extract colors
				const colorMatches = bgValue.match(/#[0-9a-fA-F]{6}/g);
				if (colorMatches?.length >= 2) {
					bgGradientFrom = colorMatches[0];
					bgGradientTo = colorMatches[colorMatches.length - 1];
					if (colorMatches.length >= 3) {
						bgGradientMiddle = colorMatches[1];
						bgGradientMiddleEnabled = true;
					} else {
						bgGradientMiddleEnabled = false;
					}
				}
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
			
			// Rebuild defaults object in correct order
			if (!config.page) config.page = {};
			const oldDefaults = config.page.defaults || {};
			config.page.defaults = {};
			
			// Set properties in desired order
			config.page.defaults.headerPresetId = selectedHeaderPreset;
			config.page.defaults.blockStylePreset = selectedBlockStyle;
			if (oldDefaults.linkStyle !== undefined) config.page.defaults.linkStyle = oldDefaults.linkStyle;
			config.page.defaults.linkGroupLayout = selectedLinkGroupLayout;
			config.page.defaults.linkIconShape = selectedLinkIconShape;
			config.page.defaults.socialIconPosition = socialIconPosition;
			config.page.defaults.socialIconColor = socialIconColor;
			config.page.defaults.gradientPreset = selectedGradientPreset;
			config.page.defaults.avatarBorderColor = avatarBorderColor;
			config.page.defaults.avatarBorderWidth = avatarBorderWidth;
			config.page.defaults.shadowStyle = selectedShadowStyle;
			config.page.defaults.blockOpacity = blockOpacity;
			config.page.defaults.borderWidth = borderWidth;
			
			// Conditional fields
			if (selectedShadowStyle === 'custom') {
				config.page.defaults.shadowCustom = shadowCustom;
			}
			if (headingFontFamily && headingFontFamily !== fontFamily) {
				config.page.defaults.headingFontFamily = headingFontFamily;
			}
			
			// Link group config
			config.page.defaults.linkGroupConfig = {
				list: { ...listConfig },
				grid: { ...gridConfig },
				cards: { ...cardConfig }
			};
			
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
			
			// Ensure fontSize tokens exist (required for refs to work)
			if (!config.tokens.typography.fontSize) {
				config.tokens.typography.fontSize = {
					xs: 12,
					'13': 13,
					sm: 14,
					'15': 15,
					base: 16,
					lg: 18,
					xl: 20,
					'2xl': 24
				};
			}
			
			// Ensure fontWeight tokens exist
			if (!config.tokens.typography.fontWeight) {
				config.tokens.typography.fontWeight = {
					normal: 400,
					medium: 500,
					semibold: 600,
					bold: 700
				};
			}
			
			// Ensure lineHeight tokens exist
			if (!config.tokens.typography.lineHeight) {
				config.tokens.typography.lineHeight = {
					tight: 1.25,
					normal: 1.5,
					relaxed: 1.75
				};
			}
			
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
			
			// Update block text color
			if (!config.semantic.color.block) config.semantic.color.block = {};
			config.semantic.color.block.text = `ref:tokens.color.blockText`;
			if (!config.tokens.color) config.tokens.color = {};
			config.tokens.color.blockText = blockTextColor;
			config.tokens.color.shadowColor = shadowColor;
			
			// Update typography
			if (!config.semantic.typography) config.semantic.typography = {};
			if (!config.semantic.typography.body) config.semantic.typography.body = {};
			if (!config.semantic.typography.heading) config.semantic.typography.heading = {};
			
			// Set default values for body (since we removed the controls)
			config.semantic.typography.body.fontSize = `ref:tokens.typography.fontSize.base`;
			config.semantic.typography.body.fontWeight = `ref:tokens.typography.fontWeight.normal`;
			config.semantic.typography.body.lineHeight = `ref:tokens.typography.lineHeight.normal`;
			
			// Set heading values from controls
			config.semantic.typography.heading.fontSize = `ref:tokens.typography.fontSize.${headingFontSize}`;
			config.semantic.typography.heading.fontWeight = `ref:tokens.typography.fontWeight.bold`;
			config.semantic.typography.heading.lineHeight = `ref:tokens.typography.lineHeight.tight`;
			config.semantic.typography.heading.fontFamily = `ref:tokens.typography.fontFamily.sans`;
			
			// Update link typography
			if (!config.semantic.typography.link) config.semantic.typography.link = {};
			config.semantic.typography.link.fontSize = `ref:tokens.typography.fontSize.${linkFontSize}`;
			
			// Update bio typography
			if (!config.semantic.typography.bio) config.semantic.typography.bio = {};
			config.semantic.typography.bio.fontSize = `ref:tokens.typography.fontSize.${bioFontSize}`;
			
			// Update subtitle typography
			if (!config.semantic.typography.subtitle) config.semantic.typography.subtitle = {};
			config.semantic.typography.subtitle.fontSize = `ref:tokens.typography.fontSize.${subtitleFontSize}`;
			
			// Update more colors
			config.semantic.color.text.muted = mutedTextColor;
			
			// Update background effects
			if (!config.background) config.background = {};
			if (!config.background.effects) config.background.effects = {};
			config.background.effects.blur = bgBlur;
			config.background.effects.brightness = bgBrightness;
			config.background.effects.grayscale = bgGrayscale;
			config.background.effects.overlayColor = 'ref:tokens.color.overlay.10';
			
			// Update background
			let bgValue = '';
			if (bgType === 'solid') {
				bgValue = bgSolidColor;
			} else if (bgType === 'gradient') {
				if (bgGradientType === 'linear') {
					if (bgGradientMiddleEnabled) {
						bgValue = `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientMiddle} 50%, ${bgGradientTo} 100%)`;
					} else {
						bgValue = `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`;
					}
				} else {
					// Radial gradient - always use circle
					const shape = 'circle';
					const position = bgRadialPosition;
					if (bgGradientMiddleEnabled) {
						bgValue = `radial-gradient(${shape} farthest-corner at ${position}, ${bgGradientFrom} 0%, ${bgGradientMiddle} 50%, ${bgGradientTo} 100%)`;
					} else {
						bgValue = `radial-gradient(${shape} farthest-corner at ${position}, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`;
					}
				}
			} else if (bgType === 'image') {
				bgValue = bgImageUrl ? `url('${bgImageUrl}')` : '#ffffff';
			}
			config.semantic.color.surface.page = bgValue;
			
			// Clean up deprecated fields
			if (config.page?.layout?.baseFontSize) {
				delete config.page.layout.baseFontSize;
			}
			
			configJson = JSON.stringify(config, null, 2);
		} catch (e) {
			console.error('Failed to update config:', e);
		}
	}

	$: if (selectedHeaderPreset || avatarBorderColor || avatarBorderWidth || selectedBlockStyle || selectedShadowStyle || blockOpacity || shadowCustom || selectedLinkIconShape || selectedLinkGroupLayout || gridConfig || cardConfig || listConfig || socialIconPosition || socialIconColor || selectedGradientPreset || fontFamily || headingFontFamily || maxWidth || pagePadding || blockGap || blockPaddingX || blockPaddingY || textAlign || blockBorderRadiusType || primaryColor || textColor || borderColor || borderWidth || mutedTextColor || blockTextColor || shadowColor || pageBgColor || headingFontSize || linkFontSize || bioFontSize || subtitleFontSize || cardElevation || bgType || bgSolidColor || bgGradientType || bgGradientFrom || bgGradientTo || bgGradientMiddle || bgGradientMiddleEnabled || bgGradientDirection || bgRadialShape || bgRadialPosition || bgImageUrl || bgBlur || bgDim || bgBrightness || bgGrayscale || coverImageUrl || showShareButton || showSubscribeButton) {
		updateConfig();
	}

	// Update preview stores - optimized for fast opacity changes
	$: if (configJson && selectedBlockStyle && selectedShadowStyle !== undefined && blockOpacity !== undefined && selectedGradientPreset && bgType && bgGradientType && bgRadialShape && bgRadialPosition) {
		try {
			const config = JSON.parse(configJson);
			previewAppearance.set(buildPreviewAppearance(config, selectedBlockStyle, selectedShadowStyle, blockOpacity, shadowCustom, selectedGradientPreset));
			
			// Resolve blockBorderRadius from centralized tokens
			const radiusValue = RADIUS_TOKENS[blockBorderRadiusType] ?? 12;
			
			// Convert headingFontSize to pixel value for titleFontSize
			const headingSizeMap: Record<typeof headingFontSize, number> = {
				lg: 18, xl: 20, '2xl': 24
			};
			const titleFontSizePx = headingSizeMap[headingFontSize] || 20;
			
			const backgroundValue = bgType === 'solid' ? bgSolidColor : bgType === 'gradient' ? (
				bgGradientType === 'linear' 
					? (bgGradientMiddleEnabled ? `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientMiddle}, ${bgGradientTo})` : `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientTo})`)
					: (bgGradientMiddleEnabled ? `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom}, ${bgGradientMiddle}, ${bgGradientTo})` : `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom}, ${bgGradientTo})`)
			) : bgImageUrl ? `url('${bgImageUrl}')` : '#ffffff';
			
			previewAppearanceState.set({
				headerPresetId: selectedHeaderPreset,
				overrides: {
					'page.blockGap': blockGap,
					'page.titleFontSize': titleFontSizePx,
					'page.linkFontSize': linkFontSize,
					'page.bioFontSize': bioFontSize,
					'page.subtitleFontSize': subtitleFontSize,
					'page.maxWidth': maxWidth,
					'page.textAlign': textAlign,
					'page.pagePadding': pagePadding,
					'page.blockPaddingX': blockPaddingX,
					'page.blockPaddingY': blockPaddingY,
					'block.borderRadius': radiusValue,
					'header.titleFontFamily': headingFontFamily || fontFamily,
					'header.coverValue': coverImageUrl || undefined,
					'header.avatarBorderColor': avatarBorderColor,
					'header.avatarBorderWidth': avatarBorderWidth,
					'backgroundColor': backgroundValue,
					'backgroundBlur': bgBlur,
					'backgroundBrightness': bgBrightness,
					'backgroundGrayscale': bgGrayscale,
					'page.linkIconShape': selectedLinkIconShape,
					'page.linkGroupLayout': selectedLinkGroupLayout,
					'page.linkGroupConfig.grid': gridConfig,
					'page.linkGroupConfig.cards': cardConfig,
					'page.linkGroupConfig.list': listConfig,
					'page.socialIconPosition': socialIconPosition,
					'page.socialIconColor': socialIconColor,
					'page.gradientPreset': selectedGradientPreset,
					'page.showShareButton': showShareButton,
					'page.showSubscribeButton': showSubscribeButton
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

		// Clean up deprecated fields
		if (config.page?.layout?.baseFontSize) {
			delete config.page.layout.baseFontSize;
		}

		// Update meta fields
		const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		config.meta = {
			...config.meta,
			id: `preset.${key}`,
			name,
			description,
			category,
			tier,
			contract: {
				controls: [
					{
						keyPath: 'page.layout.textAlign',
						type: 'select',
						label: 'Text Alignment',
						options: ['left', 'center', 'right'],
						default: config.page?.layout?.textAlign || 'center'
					},
					{
						keyPath: 'page.layout.pagePadding',
						type: 'slider',
						label: 'Page Padding',
						min: 8,
						max: 32,
						step: 4,
						default: config.page?.layout?.pagePadding || 16,
						unit: 'px'
					},
					{
						keyPath: 'page.layout.blockGap',
						type: 'slider',
						label: 'Block Spacing',
						min: 8,
						max: 32,
						step: 2,
						default: config.page?.layout?.blockGap || 14,
						unit: 'px'
					}
				]
			}
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
	function handleImageUpload(event: Event, target: 'background' | 'cover' = 'background') {
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

		uploadTarget = target;
		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
		input.value = '';
	}

	async function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		uploading = true;

		try {
			const croppedFile = new File([croppedBlob], uploadTarget === 'cover' ? 'cover.jpg' : 'background.jpg', {
				type: 'image/jpeg'
			});

			const result = await api.uploadBackground('demo', croppedFile);
			
			if (uploadTarget === 'cover') {
				coverImageUrl = result.url;
			} else {
				bgImageUrl = result.url;
			}

			showCropModal = false;
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		} catch (e) {
			console.error('Failed to upload image:', e);
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
		<!-- Left: JSON Viewer (Sticky) -->
		<div class="w-[400px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
			<div class="sticky top-0 p-4">
				<h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					Theme Configuration
				</h3>
				<div class="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
					<pre class="text-xs p-4 overflow-x-auto max-h-[calc(100vh-120px)] font-mono leading-relaxed text-gray-800">{configJson}</pre>
				</div>
			</div>
		</div>

		<!-- Main Content + Preview -->
		<div class="flex-1 overflow-y-auto">
			<div class="flex gap-8 p-8 justify-center">
				<!-- Center: Content Area -->
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
					bind:blockTextColor
					bind:shadowColor
				/>

				<!-- Page Background -->
				<ThemeBackground
					bind:bgType
					bind:bgSolidColor
					bind:bgGradientType
					bind:bgGradientFrom
					bind:bgGradientTo
					bind:bgGradientMiddle
					bind:bgGradientMiddleEnabled
					bind:bgGradientDirection
					bind:bgRadialShape
					bind:bgRadialPosition
					bind:bgImageUrl
					bind:bgBlur
					bind:bgBrightness
					bind:bgGrayscale
					{uploading}
					on:imageUpload={(e) => handleImageUpload(e.detail.originalEvent)}
				/>

				<!-- Header Style -->
				<HeaderStyleManager
					bind:selectedHeaderPreset
					bind:coverImageUrl
					bind:avatarBorderColor
					bind:avatarBorderWidth
					bind:socialIconPosition
					bind:socialIconColor
					bind:headerPresets
					{uploading}
					on:coverUpload={(e) => handleImageUpload(e.detail.originalEvent, 'cover')}
				/>

				<!-- Block Style -->
				<ThemeBlockStyle
					bind:selectedBlockStyle
					bind:selectedShadowStyle
					bind:blockOpacity
					bind:shadowCustom
					bind:selectedLinkIconShape
					bind:selectedGradientPreset
					{primaryColor}
					{textColor}
					{borderColor}
					{borderWidth}
					{blockTextColor}
					{shadowColor}
					{bgType}
					{bgSolidColor}
					{bgGradientFrom}
					{bgGradientTo}
					{bgGradientDirection}
					{bgImageUrl}
				/>

				<!-- Typography -->
				<ThemeTypography
					bind:fontFamily
					bind:headingFontFamily
					bind:headingFontSize
					bind:linkFontSize
					bind:bioFontSize
					bind:subtitleFontSize
				/>

				<!-- Link Group Layout -->
				<ThemeLinkGroupLayout
					bind:selectedLinkGroupLayout
					bind:gridConfig
					bind:cardConfig
					bind:listConfig
				/>

				<!-- Layout -->
				<ThemeLayout
					bind:maxWidth
					bind:textAlign
					bind:pagePadding
					bind:blockGap
					bind:blockPaddingX
					bind:blockPaddingY
					bind:blockBorderRadiusType
					selectedLinkGroupLayout={selectedLinkGroupLayout}
				/>

				<!-- Page Settings -->
				<ThemePageSettings
					bind:showShareButton
					bind:showSubscribeButton
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
					{selectedShadowStyle}
					{blockBorderRadiusType}
					{textAlign}
					{maxWidth}
					{pagePadding}
					{blockGap}
					{blockPaddingX}
					{blockPaddingY}
					{fontFamily}
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
		aspectRatio={uploadTarget === 'cover' ? 3 : 0.483}
		outputWidth={uploadTarget === 'cover' ? 1200 : 1080}
		outputHeight={uploadTarget === 'cover' ? 400 : 2236}
		on:accept={handleCropAccept}
		on:cancel={handleCropCancel}
	/>
{/if}
