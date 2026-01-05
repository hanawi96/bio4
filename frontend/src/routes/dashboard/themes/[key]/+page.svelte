<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.client';
	import { themeEditor } from '$lib/stores/themeEditor';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import ThemePreviewMockup from '$lib/components/editor/ThemePreviewMockup.svelte';
	import ThemeBackground from '../new/components/ThemeBackground.svelte';
	import ThemeBasicInfo from '../new/components/ThemeBasicInfo.svelte';
	import ThemeColorPicker from '../new/components/ThemeColorPicker.svelte';
	import ThemeTypography from '../new/components/ThemeTypography.svelte';
	import ThemeLayout from '../new/components/ThemeLayout.svelte';
	import ThemeJsonEditor from '../new/components/ThemeJsonEditor.svelte';
	import HeaderStyleManager from '../new/components/HeaderStyleManager.svelte';
	import ThemeBlockStyle from '../new/components/ThemeBlockStyle.svelte';
	import ThemeLinkGroupLayout from '../new/components/ThemeLinkGroupLayout.svelte';
	import ThemePageSettings from '../new/components/ThemePageSettings.svelte';
	import { previewAppearance, previewAppearanceState, previewPage, buildPreviewAppearance } from '$lib/stores/themePreview';
	import { groups } from '$lib/stores/page';
	import type { ThemePreset } from '$lib/types';
	import { RADIUS_TOKENS, BLOCK_GAP_PRESETS, type BlockGapPreset, type MaxWidthKey, type PagePaddingKey, type AvatarBorderWidthKey, type BorderWidthKey } from '$lib/appearance/spacingTokens';
	import { type BlurKey, type BrightnessKey, type GrayscaleKey } from '$lib/appearance/effectsTokens';

	// SvelteKit props
	export let params: Record<string, string> = {};

	let themeKey = '';
	let headerPresets: any[] = [];
	let loading = true;
	let saving = false;
	let error = '';

	let name = '';
	let description = '';
	let category = 'minimal';
	let tier = 'free';
	let configJson = '';
	let baseConfig: any = null;
	
	let selectedHeaderPreset = 'no-cover';
	let avatarSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	let avatarShape: 'circle' | 'rounded' | 'square' | 'oval' | 'portrait' | 'landscape' = 'circle';
	let showBio: boolean = true;
	let avatarBorderColor = '#ffffff';
	let avatarBorderWidth: AvatarBorderWidthKey | number = 'default';
	let selectedBlockStyle: 'solid' | 'outline' | 'glass' | 'neon' | 'brutal' | 'gradient' = 'solid';
	let selectedShadowStyle: 'none' | 'soft' | 'medium' | 'hard' | 'brutal' = 'none';
	let blockOpacity: number = 100;
	let shadowCustom = { offsetX: 0, offsetY: 4, blur: 8, spread: 0, opacity: 0.1 };
	let selectedLinkIconShape: 'square' | 'rounded' | 'circle' = 'rounded';
	let selectedLinkGroupLayout: 'list' | 'grid' | 'cards' = 'list';
	let socialIconPosition: 'header' | 'footer' = 'header';
	let socialIconColor = '#000000';
	let selectedGradientPreset: 'diagonal-dark' | 'vertical-fade' | 'horizontal-flow' | 'sunset-glow' | 'ocean-deep' | 'forest-path' | 'royal-luxury' | 'fire-blaze' | 'spotlight' | 'cosmic-burst' | 'aurora' | 'nebula' | 'spin' | 'vortex' | 'prism' | 'kaleidoscope' = 'diagonal-dark';
	let fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
	let headingFontFamily = 'Inter, system-ui, -apple-system, sans-serif';
	let maxWidth: MaxWidthKey | number = 'sm';
	let pagePadding: PagePaddingKey | number = 'default';
	let blockGapPreset: BlockGapPreset = 'default';
	let blockPaddingX = 16;
	let blockPaddingY = 12;
	let textAlign: 'left' | 'center' | 'right' = 'center';
	let blockBorderRadiusType: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
	
	let gridConfig: import('$lib/types').GridLayoutConfig = { columns: 2, aspectRatio: 'square', showLabels: true, imagePadding: false };
	let cardConfig: import('$lib/types').CardLayoutConfig = { imagePosition: 'left', imageSize: 50, imageAspect: 'square', showSubtitle: true, imagePadding: false };
	let listConfig: import('$lib/types').ListLayoutConfig = { iconPosition: 'left', textAlign: 'center', showSubtitle: true };
	
	let primaryColor = '#3b82f6';
	let textColor = '#18181b';
	let borderColor = '#e4e4e7';
	let borderWidth: BorderWidthKey | number = 'default';
	let mutedTextColor = '#71717a';
	let blockTextColor = '#ffffff';
	let shadowColor = '#000000';
	let pageBgColor = '#fafafa';
	
	let headingFontSize: 'lg' | 'xl' | '2xl' = '2xl';
	let linkFontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' = 'sm';
	let bioFontSize: 'xs' | 'sm' | 'base' | 'lg' = 'sm';
	let subtitleFontSize: 'xs' | 'sm' | 'base' | 'lg' = 'xs';
	let titleGlowEnabled = false;
	let titleGlowColor = '#3b82f6';
	let avatarGlowEnabled = false;
	let avatarGlowColor = '#3b82f6';
	
	let bgType: 'solid' | 'gradient' | 'image' | 'video' = 'solid';
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
	let bgVideoUrl = '';
	let bgBlur: BlurKey | number = 'none';
	let bgBrightness: BrightnessKey | number = 'normal';
	let bgGrayscale: GrayscaleKey | number = 'none';
	
	// Animated gradient fields
	let bgAnimationEnabled = false;
	let bgAnimationVariant: 'flowing' | 'rotating' | 'pulsing' = 'rotating';
	let bgAnimationSpeed: 'slow' | 'medium' | 'fast' = 'medium';
	
	// Floating particles fields
	let particlesEnabled = false;
	let particlesCount = 20;
	let particlesSize: 'small' | 'medium' | 'large' = 'medium';
	let particlesColor = '#ffffff';
	let particlesSpeed: 'slow' | 'medium' | 'fast' = 'medium';
	let particlesVariant: 'floating' | 'rain' | 'snow' | 'bubbles' | 'stars' | 'fireflies' | 'aurora' | 'sparkles' | 'confetti' | 'lightning' = 'floating';
	let particlesBlur: 'none' | 'light' | 'medium' | 'heavy' = 'medium';
	let particlesOpacity = 60;
	
	let coverImageUrl = '';
	let showShareButton = true;
	let showSubscribeButton = true;
	
	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';
	let uploadTarget: 'background' | 'cover' = 'background';
	
	let originalTheme: any = null;

	onMount(async () => {
		themeKey = $page.params.key;
		try {
			const [themeResult, headerResult, editorData] = await Promise.all([
				api.getTheme(themeKey),
				api.getHeaderPresets(),
				api.getEditorData('demo')
			]);
			
			headerPresets = headerResult.presets;
			
			if (editorData?.page) {
				previewPage.set(editorData.page);
				if (editorData.groups) groups.set(editorData.groups);
			}
			
			originalTheme = themeResult.theme;
			loadTheme(themeResult.theme);
			
			themeEditor.activate('edit', themeResult.theme.name, handleSubmit, () => goto('/dashboard/themes'), handleReset);
		} catch (e) {
			console.error('Failed to load theme:', e);
			error = 'Failed to load theme';
		} finally {
			loading = false;
		}
	});
	
	onDestroy(() => {
		themeEditor.deactivate();
	});

	function handleReset() {
		if (!originalTheme) return;
		loadTheme(originalTheme);
	}

	function loadTheme(theme: any) {
		baseConfig = JSON.parse(JSON.stringify(theme.config));
		configJson = JSON.stringify(baseConfig, null, 2);
		
		name = theme.name;
		description = theme.config.meta?.description || '';
		
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
		
		category = theme.config.meta?.category || 'minimal';
		tier = theme.config.meta?.tier || 'free';
		selectedHeaderPreset = theme.config.page?.defaults?.headerPresetId || 'no-cover';
		avatarSize = theme.config.page?.defaults?.avatarSize || 'md';
		avatarShape = theme.config.page?.defaults?.avatarShape || 'circle';
		avatarBorderColor = theme.config.page?.defaults?.avatarBorderColor || '#ffffff';
		avatarBorderWidth = theme.config.page?.defaults?.avatarBorderWidth || 4;
		selectedBlockStyle = theme.config.page?.defaults?.blockStylePreset || 'solid';
		selectedShadowStyle = theme.config.page?.defaults?.shadowStyle || 'none';
		blockOpacity = theme.config.page?.defaults?.blockOpacity || 100;
		
		if (theme.config.page?.defaults?.shadowCustom) {
			shadowCustom = { ...shadowCustom, ...theme.config.page.defaults.shadowCustom };
		}
		selectedLinkIconShape = theme.config.page?.defaults?.linkIconShape || 'rounded';
		selectedLinkGroupLayout = theme.config.page?.defaults?.linkGroupLayout || 'list';
		
		const linkGroupConfig = theme.config.page?.defaults?.linkGroupConfig;
		if (linkGroupConfig) {
			if (linkGroupConfig.grid) gridConfig = { ...gridConfig, ...linkGroupConfig.grid };
			if (linkGroupConfig.cards) cardConfig = { ...cardConfig, ...linkGroupConfig.cards };
			if (linkGroupConfig.list) listConfig = { ...listConfig, ...linkGroupConfig.list };
		}
		
		socialIconPosition = theme.config.page?.defaults?.socialIconPosition || 'header';
		socialIconColor = theme.config.page?.defaults?.socialIconColor || textColor;
		selectedGradientPreset = theme.config.page?.defaults?.gradientPreset || 'diagonal-dark';
		showShareButton = theme.config.page?.defaults?.showShareButton ?? true;
		showSubscribeButton = theme.config.page?.defaults?.showSubscribeButton ?? true;
		fontFamily = theme.config.tokens?.typography?.fontFamily?.sans || 'Inter, system-ui, -apple-system, sans-serif';
		headingFontFamily = resolveRef(theme.config.semantic?.typography?.heading?.fontFamily) || fontFamily;
		maxWidth = theme.config.page?.layout?.maxWidth || 'sm';
		pagePadding = theme.config.page?.layout?.pagePadding || 'default';
		
		const blockGapValue = theme.config.page?.layout?.blockGap;
		if (typeof blockGapValue === 'string') {
			blockGapPreset = blockGapValue as BlockGapPreset;
		} else if (typeof blockGapValue === 'number') {
			if (blockGapValue <= 10) blockGapPreset = 'compact';
			else if (blockGapValue >= 20) blockGapPreset = 'spacious';
			else blockGapPreset = 'default';
		} else {
			blockGapPreset = 'default';
		}
		
		const blockPaddingValue = theme.config.page?.layout?.blockPadding;
		if (typeof blockPaddingValue === 'string') {
			const presets = { tight: {x: 12, y: 8}, default: {x: 16, y: 12}, spacious: {x: 24, y: 16} };
			const preset = presets[blockPaddingValue as keyof typeof presets] || presets.default;
			blockPaddingX = preset.x;
			blockPaddingY = preset.y;
		} else if (blockPaddingValue && typeof blockPaddingValue === 'object') {
			blockPaddingX = blockPaddingValue.x || 16;
			blockPaddingY = blockPaddingValue.y || 12;
		} else {
			blockPaddingX = 16;
			blockPaddingY = 12;
		}
		
		textAlign = theme.config.page?.layout?.textAlign || 'center';
		
		const borderRadiusValue = theme.config.page?.defaults?.borderRadius;
		if (typeof borderRadiusValue === 'string') {
			blockBorderRadiusType = borderRadiusValue as typeof blockBorderRadiusType;
		} else {
			blockBorderRadiusType = 'lg';
		}
		
		const borderWidthValue = theme.config.page?.defaults?.borderWidth;
		if (typeof borderWidthValue === 'string') {
			borderWidth = borderWidthValue as BorderWidthKey;
		} else if (typeof borderWidthValue === 'number') {
			borderWidth = borderWidthValue;
		} else {
			borderWidth = 'default';
		}
		
		primaryColor = resolveRef(theme.config.semantic?.color?.primary) || '#3b82f6';
		textColor = resolveRef(theme.config.semantic?.color?.text?.default) || '#18181b';
		borderColor = resolveRef(theme.config.semantic?.color?.border?.default) || '#e4e4e7';
		
		const fontSizeToKey = (value: any, validKeys: string[]): string => {
			if (typeof value === 'string' && value.startsWith('ref:tokens.typography.fontSize.')) {
				const key = value.replace('ref:tokens.typography.fontSize.', '');
				return validKeys.includes(key) ? key : validKeys[0];
			}
			if (typeof value === 'number') {
				const map: Record<number, string> = { 12: 'xs', 13: '13', 14: 'sm', 15: '15', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl' };
				const key = map[value];
				return (key && validKeys.includes(key)) ? key : validKeys[0];
			}
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
		
		mutedTextColor = resolveRef(theme.config.semantic?.color?.text?.muted) || '#71717a';
		blockTextColor = resolveRef(theme.config.semantic?.color?.block?.text) || '#ffffff';
		shadowColor = resolveRef(theme.config.semantic?.color?.shadow?.default) || '#000000';
		pageBgColor = resolveRef(theme.config.semantic?.color?.surface?.page) || '#fafafa';
		
		// Load title glow settings (after primaryColor is loaded)
		titleGlowEnabled = theme.config.page?.defaults?.titleGlow?.enabled || false;
		titleGlowColor = theme.config.page?.defaults?.titleGlow?.color || primaryColor;
		
		// Load avatar glow settings (after primaryColor is loaded)
		avatarGlowEnabled = theme.config.page?.defaults?.avatarGlow?.enabled || false;
		avatarGlowColor = theme.config.page?.defaults?.avatarGlow?.color || primaryColor;
		
		bgBlur = theme.config.background?.effects?.blur || 0;
		bgBrightness = theme.config.background?.effects?.brightness || 100;
		bgGrayscale = theme.config.background?.effects?.grayscale || 0;
		
		// Load animation settings
		bgAnimationEnabled = theme.config.background?.animation?.enabled || false;
		bgAnimationVariant = theme.config.background?.animation?.variant || 'rotating';
		bgAnimationSpeed = theme.config.background?.animation?.speed || 'medium';
		
		// Load particles settings
		particlesEnabled = theme.config.background?.particles?.enabled || false;
		particlesCount = theme.config.background?.particles?.count || 20;
		particlesSize = theme.config.background?.particles?.size || 'medium';
		particlesColor = theme.config.background?.particles?.color || '#ffffff';
		particlesSpeed = theme.config.background?.particles?.speed || 'medium';
		particlesVariant = theme.config.background?.particles?.variant || 'floating';
		particlesBlur = theme.config.background?.particles?.blur || 'medium';
		particlesOpacity = theme.config.background?.particles?.opacity || 60;
		
		const bgTypeFromConfig = theme.config.background?.type;
		const bgValueFromConfig = theme.config.background?.value;
		
		if (bgTypeFromConfig && bgValueFromConfig) {
			bgType = bgTypeFromConfig;
			
			if (bgType === 'solid') {
				bgSolidColor = bgValueFromConfig;
				pageBgColor = bgValueFromConfig;
			} else if (bgType === 'gradient') {
				const gradientValue = bgValueFromConfig;
				
				if (gradientValue.startsWith('radial-gradient')) {
					bgGradientType = 'radial';
					bgRadialShape = 'circle';
					const posMatch = gradientValue.match(/at\s+([^,]+)/);
					if (posMatch) bgRadialPosition = posMatch[1].trim();
				} else {
					bgGradientType = 'linear';
					const angleMatch = gradientValue.match(/(\d+)deg/);
					if (angleMatch) bgGradientDirection = angleMatch[1] + 'deg';
				}
				
				const colorMatches = gradientValue.match(/#[0-9a-fA-F]{6}/g);
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
			} else if (bgType === 'image') {
				bgImageUrl = bgValueFromConfig;
			} else if (bgType === 'video') {
				bgVideoUrl = bgValueFromConfig;
			}
		} else {
			bgType = 'solid';
			bgSolidColor = '#000000';
			pageBgColor = '#000000';
		}
	}

	// Auto-set default background image when switching to image type
	$: if (bgType === 'image' && bgImageUrl === '') {
		bgImageUrl = '/presets/images/preset-img.jpg';
	}

	// Auto-set default background video when switching to video type
	$: if (bgType === 'video' && bgVideoUrl === '') {
		bgVideoUrl = 'https://pub-8dcc050a5a504e70a6d4626c63886201.r2.dev/background-vide-preset/14950008_1080_1920_60fps.mp4';
	}

	// Force solid black background when avatar-cover is selected
	$: if (selectedHeaderPreset === 'avatar-cover') {
		bgType = 'solid';
		bgSolidColor = '#000000';
		pageBgColor = '#000000';
	}

	function updateConfig() {
		if (!baseConfig) return;
		
		try {
			const config = JSON.parse(JSON.stringify(baseConfig));
			
			if (!config.page) config.page = {};
			const oldDefaults = config.page.defaults || {};
			config.page.defaults = {};
			
			config.page.defaults.headerPresetId = selectedHeaderPreset;
			config.page.defaults.avatarSize = avatarSize;
			config.page.defaults.avatarShape = avatarShape;
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
			config.page.defaults.borderRadius = blockBorderRadiusType;
			config.page.defaults.borderWidth = borderWidth;
			
			if (selectedShadowStyle === 'custom') {
				config.page.defaults.shadowCustom = shadowCustom;
			}
			
			// Title glow effect
			config.page.defaults.titleGlow = {
				enabled: titleGlowEnabled,
				color: titleGlowColor
			};
			
			// Avatar glow effect
			config.page.defaults.avatarGlow = {
				enabled: avatarGlowEnabled,
				color: avatarGlowColor
			};
			
			config.page.defaults.linkGroupConfig = {
				list: { ...listConfig },
				grid: { ...gridConfig },
				cards: { ...cardConfig }
			};
			
			if (!config.page.layout) config.page.layout = {};
			config.page.layout.maxWidth = maxWidth;
			config.page.layout.pagePadding = pagePadding;
			config.page.layout.blockGap = blockGapPreset;
			config.page.layout.textAlign = textAlign;
			
			const paddingPreset = 
				blockPaddingX <= 12 && blockPaddingY <= 8 ? 'tight' :
				blockPaddingX <= 16 && blockPaddingY <= 12 ? 'default' :
				'spacious';
			config.page.layout.blockPadding = paddingPreset;
			
			if (!config.tokens) config.tokens = {};
			if (!config.tokens.typography) config.tokens.typography = {};
			if (!config.tokens.typography.fontFamily) config.tokens.typography.fontFamily = {};
			config.tokens.typography.fontFamily.sans = fontFamily;
			
			if (!config.semantic) config.semantic = {};
			if (!config.semantic.color) config.semantic.color = {};
			if (!config.semantic.color.text) config.semantic.color.text = {};
			if (!config.semantic.color.border) config.semantic.color.border = {};
			if (!config.semantic.color.surface) config.semantic.color.surface = {};
			
			config.semantic.color.primary = primaryColor;
			config.semantic.color.text.default = textColor;
			config.semantic.color.border.default = borderColor;
			
			if (!config.semantic.color.block) config.semantic.color.block = {};
			config.semantic.color.block.text = blockTextColor;
			
			if (!config.semantic.color.shadow) config.semantic.color.shadow = {};
			config.semantic.color.shadow.default = shadowColor;
			
			if (!config.semantic.typography) config.semantic.typography = {};
			if (!config.semantic.typography.heading) config.semantic.typography.heading = {};
			config.semantic.typography.heading.fontFamily = headingFontFamily || fontFamily;
			config.semantic.typography.heading.fontSize = `ref:tokens.typography.fontSize.${headingFontSize}`;
			
			if (!config.semantic.typography.link) config.semantic.typography.link = {};
			config.semantic.typography.link.fontSize = `ref:tokens.typography.fontSize.${linkFontSize}`;
			
			if (!config.semantic.typography.bio) config.semantic.typography.bio = {};
			config.semantic.typography.bio.fontSize = `ref:tokens.typography.fontSize.${bioFontSize}`;
			
			if (!config.semantic.typography.subtitle) config.semantic.typography.subtitle = {};
			config.semantic.typography.subtitle.fontSize = `ref:tokens.typography.fontSize.${subtitleFontSize}`;
			
			config.semantic.color.text.muted = mutedTextColor;
			
			if (!config.background) config.background = {};
			
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
					const shape = 'circle';
					const position = bgRadialPosition;
					if (bgGradientMiddleEnabled) {
						bgValue = `radial-gradient(${shape} farthest-corner at ${position}, ${bgGradientFrom} 0%, ${bgGradientMiddle} 50%, ${bgGradientTo} 100%)`;
					} else {
						bgValue = `radial-gradient(${shape} farthest-corner at ${position}, ${bgGradientFrom} 0%, ${bgGradientTo} 100%)`;
					}
				}
			} else if (bgType === 'image') {
				bgValue = bgImageUrl || '';
			} else if (bgType === 'video') {
				bgValue = bgVideoUrl || '';
			}
			
			config.background.type = bgType;
			config.background.value = bgValue;
			
			if (!config.background.effects) config.background.effects = {};
			config.background.effects.blur = bgBlur;
			config.background.effects.brightness = bgBrightness;
			config.background.effects.grayscale = bgGrayscale;
			config.background.effects.overlayColor = 'ref:tokens.color.overlay.10';
			
			// Set animation settings
			if (!config.background.animation) config.background.animation = {};
			config.background.animation.enabled = bgAnimationEnabled;
			config.background.animation.variant = bgAnimationVariant;
			config.background.animation.speed = bgAnimationSpeed;
			
			// Set particles settings
			if (!config.background.particles) config.background.particles = {};
			config.background.particles.enabled = particlesEnabled;
			config.background.particles.count = particlesCount;
			config.background.particles.size = particlesSize;
			config.background.particles.color = particlesColor;
			config.background.particles.speed = particlesSpeed;
			config.background.particles.variant = particlesVariant;
			config.background.particles.blur = particlesBlur;
			config.background.particles.opacity = particlesOpacity;
			
			config.semantic.color.surface.page = bgType === 'solid' ? bgSolidColor : '#000000';
			
			if (config.page?.layout?.baseFontSize) delete config.page.layout.baseFontSize;
			if (config.tokens?.space) delete config.tokens.space;
			if (config.tokens?.radius) delete config.tokens.radius;
			if (config.tokens?.elevation) delete config.tokens.elevation;
			if (config.tokens?.meta) delete config.tokens.meta;
			if (config.recipes) delete config.recipes;
			
			configJson = JSON.stringify(config, null, 2);
		} catch (e) {
			console.error('Failed to update config:', e);
		}
	}

	$: if (selectedHeaderPreset || avatarSize || avatarShape || showBio || avatarBorderColor || avatarBorderWidth || selectedBlockStyle || selectedShadowStyle || blockOpacity || shadowCustom || selectedLinkIconShape || selectedLinkGroupLayout || gridConfig || cardConfig || listConfig || socialIconPosition || socialIconColor || selectedGradientPreset || fontFamily || headingFontFamily || maxWidth || pagePadding || blockGapPreset || blockPaddingX || blockPaddingY || textAlign || blockBorderRadiusType || primaryColor || textColor || borderColor || borderWidth || mutedTextColor || blockTextColor || shadowColor || pageBgColor || headingFontSize || linkFontSize || bioFontSize || subtitleFontSize || bgType || bgSolidColor || bgGradientType || bgGradientFrom || bgGradientTo || bgGradientMiddle || bgGradientMiddleEnabled || bgGradientDirection || bgRadialShape || bgRadialPosition || bgImageUrl || bgVideoUrl || bgBlur || bgBrightness || bgGrayscale || coverImageUrl || showShareButton || showSubscribeButton || titleGlowEnabled || titleGlowColor || avatarGlowEnabled || avatarGlowColor || bgAnimationEnabled || bgAnimationVariant || bgAnimationSpeed || particlesEnabled || particlesCount || particlesSize || particlesColor || particlesSpeed || particlesVariant || particlesBlur || particlesOpacity) {
		updateConfig();
	}

	$: if (configJson && selectedBlockStyle && selectedShadowStyle !== undefined && blockOpacity !== undefined && selectedGradientPreset && bgType && bgGradientType && bgRadialShape && bgRadialPosition && linkFontSize && bioFontSize && subtitleFontSize) {
		try {
			const config = JSON.parse(configJson);
			previewAppearance.set(buildPreviewAppearance(config, selectedBlockStyle, selectedShadowStyle, blockOpacity, shadowCustom, selectedGradientPreset));
			
			const radiusValue = RADIUS_TOKENS[blockBorderRadiusType] ?? 12;
			const headingSizeMap: Record<typeof headingFontSize, number> = { lg: 18, xl: 20, '2xl': 24 };
			const titleFontSizePx = headingSizeMap[headingFontSize] || 20;
			
			const backgroundValue = bgType === 'solid' ? bgSolidColor : bgType === 'gradient' ? (
				bgGradientType === 'linear' 
					? (bgGradientMiddleEnabled ? `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientMiddle}, ${bgGradientTo})` : `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientTo})`)
					: (bgGradientMiddleEnabled ? `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom}, ${bgGradientMiddle}, ${bgGradientTo})` : `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom}, ${bgGradientTo})`)
			) : bgType === 'video' ? '#000000' : bgImageUrl ? `url('${bgImageUrl}')` : '#ffffff';
			
			previewAppearanceState.set({
				headerPresetId: selectedHeaderPreset,
				overrides: {
					'page.blockGap': BLOCK_GAP_PRESETS[blockGapPreset],
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
					...(coverImageUrl ? { 'header.coverValue': coverImageUrl } : {}),
					'header.avatarSize': avatarSize,
					'header.avatarShape': avatarShape,
					'header.showBio': showBio,
					'header.avatarBorderColor': avatarBorderColor,
					'header.avatarBorderWidth': avatarBorderWidth,
					'backgroundColor': backgroundValue,
					'backgroundVideo': bgType === 'video' && bgVideoUrl ? bgVideoUrl : undefined,
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
		} catch (e) {}
	}

	async function handleSubmit() {
		if (!name.trim()) {
			error = 'Theme name is required';
			return;
		}

		let config;
		try {
			config = JSON.parse(configJson);
		} catch (e) {
			error = 'Invalid JSON format';
			return;
		}

		if (config.page?.layout?.baseFontSize) delete config.page.layout.baseFontSize;

		config.meta = {
			...config.meta,
			id: `preset.${themeKey}`,
			name,
			description,
			category,
			tier
		};

		saving = true;
		themeEditor.setSaving(true);
		error = '';

		try {
			await api.updateTheme(themeKey, { name, config, description, category, tier });
			goto('/dashboard/themes');
		} catch (e: any) {
			error = e.message || 'Failed to update theme';
		} finally {
			saving = false;
			themeEditor.setSaving(false);
		}
	}
	
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
			const croppedFile = new File([croppedBlob], uploadTarget === 'cover' ? 'cover.jpg' : 'background.jpg', { type: 'image/jpeg' });
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
	
	async function handleVideoUpload(event: CustomEvent<{ file: File }>) {
		const file = event.detail.file;
		uploading = true;

		try {
			const result = await api.uploadBackgroundVideo('demo', file);
			bgVideoUrl = result.url;
		} catch (e) {
			console.error('Failed to upload video:', e);
			alert('Failed to upload video. Please try again.');
		} finally {
			uploading = false;
		}
	}
	
	async function handleVideoRemove() {
		if (!confirm('Remove background video?')) return;
		
		uploading = true;
		try {
			await api.removeBackgroundVideo('demo');
			bgVideoUrl = '';
		} catch (e) {
			console.error('Failed to remove video:', e);
			alert('Failed to remove video');
		} finally {
			uploading = false;
		}
	}
</script>

<div class="min-h-screen" style="background-color: #f6f1eb;">
	<div class="flex h-[calc(100vh-64px)]">
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

		<div class="flex-1 overflow-y-auto">
			<div class="flex gap-8 p-8 justify-center">
				<div class="flex-1 max-w-2xl">
					<div class="mb-6">
						<a href="/dashboard/themes" class="text-sm text-gray-600 hover:text-gray-900 mb-3 inline-flex items-center gap-1">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							Back to Themes
						</a>
						<h1 class="text-3xl font-bold text-gray-900">Edit Theme: {name}</h1>
						<p class="text-gray-600 mt-1">Customize theme settings and configuration</p>
					</div>

					{#if error}
						<div class="card-ios bg-red-50 border-red-200 text-red-700 px-4 py-3 mb-6">
							{error}
						</div>
					{/if}

					{#if loading}
						<div class="card-ios p-8 text-center">
							<div class="inline-block w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
							<p class="text-gray-600 mt-3">Loading theme...</p>
						</div>
					{:else}
						<form on:submit|preventDefault={handleSubmit} class="space-y-6">
							<ThemeBasicInfo bind:name bind:description bind:category bind:tier />
							<ThemeColorPicker bind:primaryColor bind:textColor bind:borderColor bind:mutedTextColor bind:blockTextColor bind:shadowColor />
							<HeaderStyleManager bind:selectedHeaderPreset bind:avatarSize bind:avatarShape bind:coverImageUrl bind:showBio bind:avatarBorderColor bind:avatarBorderWidth bind:socialIconPosition bind:socialIconColor bind:avatarGlowEnabled bind:avatarGlowColor bind:headerPresets previewPage={$previewPage} {uploading} {primaryColor} on:coverUpload={(e) => handleImageUpload(e.detail.originalEvent, 'cover')} />
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
								bind:bgVideoUrl 
								bind:bgBlur 
								bind:bgBrightness 
								bind:bgGrayscale 
								bind:bgAnimationEnabled 
								bind:bgAnimationVariant 
								bind:bgAnimationSpeed 
								bind:particlesEnabled 
								bind:particlesCount 
								bind:particlesSize 
								bind:particlesColor 
								bind:particlesSpeed 
								bind:particlesVariant 
								bind:particlesBlur 
								bind:particlesOpacity 
								{uploading} 
								{selectedHeaderPreset}
								on:imageUpload={(e) => handleImageUpload(e.detail.originalEvent)} 
								on:videoUpload={handleVideoUpload} 
								on:videoRemove={handleVideoRemove} 
							/>
							<ThemeBlockStyle 
								bind:selectedBlockStyle 
								bind:selectedShadowStyle 
								bind:blockOpacity 
								bind:shadowCustom 
								bind:selectedLinkIconShape 
								bind:selectedGradientPreset 
								bind:borderWidth 
								bind:blockGapPreset
								bind:blockPaddingX
								bind:blockPaddingY
								bind:blockBorderRadiusType
								bind:selectedLinkGroupLayout
								{primaryColor} 
								{textColor} 
								{borderColor} 
								{blockTextColor} 
								{shadowColor} 
								{bgType} 
								{bgSolidColor} 
								{bgGradientFrom} 
								{bgGradientTo} 
								{bgGradientDirection} 
								{bgImageUrl} 
							/>
							<ThemeLinkGroupLayout bind:selectedLinkGroupLayout bind:gridConfig bind:cardConfig bind:listConfig />
							<ThemeTypography bind:fontFamily bind:headingFontFamily bind:headingFontSize bind:linkFontSize bind:bioFontSize bind:subtitleFontSize bind:titleGlowEnabled bind:titleGlowColor {primaryColor} />
							<ThemeLayout 
								bind:maxWidth 
								bind:textAlign 
								bind:pagePadding 
							/>
							<ThemePageSettings bind:showShareButton bind:showSubscribeButton />
							<ThemeJsonEditor bind:configJson />
						</form>

						<div class="h-20"></div>
					{/if}
				</div>

				<div class="w-[520px] flex-shrink-0 -mr-8 pr-8">
					<div class="sticky top-8">
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

{#if showCropModal}
	<ImageCropModal imageUrl={tempImageUrl} aspectRatio={uploadTarget === 'cover' ? 3 : 0.483} outputWidth={uploadTarget === 'cover' ? 1200 : 1080} outputHeight={uploadTarget === 'cover' ? 400 : 2236} on:accept={handleCropAccept} on:cancel={handleCropCancel} />
{/if}
