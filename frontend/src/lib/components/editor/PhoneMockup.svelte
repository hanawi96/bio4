<script lang="ts">
	import { page, groups } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { appearanceState } from '$lib/stores/appearanceManager';
	import { HEADER_PRESETS } from '$lib/appearance/presets';
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	import { resolvePagePadding, resolveAvatarBorderWidth, resolveSocialIconSize } from '$lib/appearance/spacingTokens';
	import { resolveBlur, resolveBrightness, resolveGrayscale } from '$lib/appearance/effectsTokens';
	import SubscribeModal from '$lib/components/modals/SubscribeModal.svelte';
	import ParticlesLayer from '$lib/components/effects/ParticlesLayer.svelte';
	import { createVideoFadeHandler } from '$lib/utils/videoFadeLoop';
	import { getIconUrl, getIconClasses } from '$lib/utils/iconUtils';
	import { onMount } from 'svelte';

	// Preload default video on mount
	const DEFAULT_VIDEO = '/presets/videos/14950008_1080_1920_60fps.mp4';

	onMount(() => {
		const video = document.createElement('video');
		video.preload = 'auto';
		video.src = DEFAULT_VIDEO;
	});

	// Create video fade handler
	const handleVideoTimeUpdate = createVideoFadeHandler();
	
	// Get background with override priority (NEW structure)
	$: resolvedBackground = (() => {
		// Check override first for immediate update
		const override = $appearanceState.overrides?.['backgroundColor'];
		if (override) {
			return override;
		}
		
		// Fallback to theme config (NEW structure)
		const themeConfig = $appearance?.theme?.config;
		const bgType = themeConfig?.background?.type;
		const bgValue = themeConfig?.background?.value;
		
		if (bgType && bgValue) {
			if (bgType === 'solid') {
				return bgValue;
			} else if (bgType === 'gradient') {
				return bgValue;
			} else if (bgType === 'pattern') {
				return bgValue; // pattern CSS string
			} else if (bgType === 'image') {
				return `url('${bgValue}')`;
			} else if (bgType === 'video') {
				return '#000000'; // fallback for video
			}
		}
		
		// Final fallback
		return tokens?.backgroundColor || '#ffffff';
	})();
	
	// Get animation settings and build class
	$: bgAnimation = (() => {
		const themeConfig = $appearance?.theme?.config;
		const animation = themeConfig?.background?.animation;
		return animation;
	})();
	
	$: bgType = $appearance?.theme?.config?.background?.type;
	
	$: bgGradientDirection = (() => {
		const themeConfig = $appearance?.theme?.config;
		const bgValue = themeConfig?.background?.value;
		if (bgType === 'gradient' && bgValue) {
			const match = bgValue.match(/(\d+)deg/);
			return match ? match[1] : '135';
		}
		return '135';
	})();
	
	$: animationClass = (() => {
		if (bgType !== 'gradient' || !bgAnimation?.enabled) {
			return '';
		}
		const variant = bgAnimation.variant || 'rotating';
		const speed = bgAnimation.speed || 'medium';
		
		// For flowing variant, choose animation based on direction
		if (variant === 'flowing') {
			const deg = parseInt(bgGradientDirection);
			const flowingVariant = 
				(deg === 90 || deg === 270) ? 'horizontal' :
				(deg === 0 || deg === 180) ? 'vertical' : 'diagonal';
			return `gradient-flowing-${flowingVariant} gradient-speed-${speed}`;
		}
		
		return `gradient-${variant} gradient-speed-${speed}`;
	})();
	
	// Get particles settings
	$: particles = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.background?.particles;
	})();
	
	// Get global iconShape from appearance (resolved from theme config)
	$: globalIconShape = $appearance?.page?.linkIconShape || 'rounded';
	
	// Get global textAlign from appearance (resolved from theme config)
	$: globalTextAlign = $appearance?.page?.textAlign || 'center';
	
	// Get default linkGroupLayout from theme config
	$: defaultLinkGroupLayout = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.linkGroupLayout || 'list';
	})();
	
	// Get default linkGroupConfig from theme config
	$: defaultGridConfig = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.linkGroupConfig?.grid || { columns: 2, aspectRatio: 'square', showLabels: true, imagePadding: false };
	})();
	
	$: defaultCardConfig = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.linkGroupConfig?.cards || { imagePosition: 'left', imageSize: 50, imageAspect: 'square', showSubtitle: true, imagePadding: false };
	})();
	
	$: defaultListConfig = (() => {
		const themeConfig = $appearance?.theme?.config;
		const textAlign = globalTextAlign;
		const themeListConfig = themeConfig?.page?.defaults?.linkGroupConfig?.list;
		
		// If theme has list config, use it but ensure textAlign falls back to globalTextAlign if not specified
		if (themeListConfig) {
			return {
				...themeListConfig,
				textAlign: themeListConfig.textAlign || textAlign,
				iconShape: themeListConfig.iconShape || globalIconShape
			};
		}
		
		// Otherwise use default with globalTextAlign
		return { iconPosition: 'left', textAlign, iconShape: globalIconShape };
	})();
	
	// Get header preset ID with proper fallback chain
	$: headerPresetId = (() => {
		// Priority 1: Override from appearanceState
		if ($appearanceState.headerPresetId) {
			return $appearanceState.headerPresetId;
		}
		
		// Priority 2: Default from theme config
		const themeConfig = $appearance?.theme?.config;
		const themeDefault = themeConfig?.page?.defaults?.headerPresetId;
		if (themeDefault) {
			return themeDefault;
		}
		
		// Priority 3: Theme's defaultHeaderPresetId
		if ($appearance?.theme?.defaultHeaderPresetId) {
			return $appearance.theme.defaultHeaderPresetId;
		}
		
		// Final fallback
		return 'no-cover';
	})();
	
	$: baseHeaderPreset = HEADER_PRESETS[headerPresetId];
	
	// Merge preset with overrides (flat format)
	$: header = (() => {
		const overrides = $appearanceState.overrides || {};
		const themeConfig = $appearance?.theme?.config;
		const merged: any = { ...baseHeaderPreset };
		
		// Apply defaults from theme config first (lower priority)
		const defaults = themeConfig?.page?.defaults;
		if (defaults) {
			if (defaults.showBio !== undefined) merged.showBio = defaults.showBio;
			if (defaults.avatarSize !== undefined) merged.avatarSize = defaults.avatarSize;
			if (defaults.avatarShape !== undefined) merged.avatarShape = defaults.avatarShape;
		}
		
		// Apply overrides last (higher priority)
		Object.entries(overrides).forEach(([key, value]) => {
			if (key.startsWith('header.')) {
				const field = key.replace('header.', '');
				merged[field] = value;
			}
		});
		
		return merged;
	})();
	
	// Loading state - true when page data is not yet loaded
	$: isLoading = !$page || !tokens;
	
	// Debug toggle state
	let showDebug = false;
	
	// Check for video background
	$: backgroundVideo = (() => {
		// Priority 1: Check draft_appearance overrides (user customization)
		if ($page?.draft_appearance) {
			try {
				const appearance = JSON.parse($page.draft_appearance);
				const videoUrl = appearance.customTheme?.backgroundVideo || appearance.overrides?.backgroundVideo;
				if (videoUrl && videoUrl.trim()) return videoUrl;
			} catch {
				// Continue to check theme config
			}
		}
		
		// Priority 2: Check theme config (NEW structure: background.type + background.value)
		const themeConfig = $appearance?.theme?.config;
		if (themeConfig?.background?.type === 'video' && themeConfig?.background?.value) {
			return themeConfig.background.value;
		}
		
		return null;
	})();
	
	// Check if video exists (derived from backgroundVideo)
	$: hasVideoInDraft = !!backgroundVideo;

	// Subscribe to derived store - auto updates on any change!
	$: tokens = $appearance?.tokens;

	// Avatar size mapping - standard sizes (same as PublicBioPage)
	const avatarSizes = { xs: 80, sm: 96, md: 112, lg: 128, xl: 144, '2xl': 160, '3xl': 176, full: 0 };
	$: avatarSize = header ? avatarSizes[header.avatarSize] : 112;
	$: isFullSizeAvatar = header?.avatarSize === 'full';
	
	// Smart aspect ratio calculation for full size avatars
	$: fullSizeAspectRatio = (() => {
		if (!isFullSizeAvatar) return null;
		const shape = header?.avatarShape;
		// Most shapes use 1/1 (square)
		if (shape === 'circle' || shape === 'rounded' || shape === 'square') return '1/1';
		// Oval and portrait use taller ratio
		if (shape === 'oval' || shape === 'portrait') return '4/5';
		// Landscape uses wider ratio
		if (shape === 'landscape') return '4/3';
		return '1/1'; // Default to square
	})();
	
	$: avatarWidth = (() => {
		if (isFullSizeAvatar) return '100%';
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.067);
		if (header?.avatarShape === 'portrait') return Math.round(avatarSize * 0.8);
		if (header?.avatarShape === 'landscape') return Math.round(avatarSize * 1.333);
		return avatarSize;
	})();
	$: avatarHeight = (() => {
		if (isFullSizeAvatar) return 'auto';
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.333);
		if (header?.avatarShape === 'portrait') return Math.round(avatarSize * 1.0);
		if (header?.avatarShape === 'landscape') return Math.round(avatarSize * 0.75);
		return avatarSize;
	})();
	
	// Smart overlap position calculation for full size avatars
	$: avatarOverlapOffset = (() => {
		if (!isFullSizeAvatar || header?.avatarPosition !== 'overlap') return avatarHeight / 2;
		
		// For full size avatars, calculate offset based on aspect ratio
		// We want about 35% of the avatar to overlap below the cover
		const containerWidth = 280 - (pagePadding * 2); // Phone width minus padding
		const aspectRatio = fullSizeAspectRatio?.split('/').map(Number) || [1, 1];
		const avatarHeightPx = containerWidth * (aspectRatio[1] / aspectRatio[0]);
		
		// Return 35% of avatar height for nice overlap effect
		return Math.round(avatarHeightPx * 0.35);
	})();

	// Cover height mapping
	const coverHeights = { sm: 120, md: 160, lg: 200 };
	$: coverHeight = (() => {
		// For avatar-cover, use 350px (phone width) to maintain 1:1 aspect ratio
		if (isAvatarCover) {
			return 350;
		}
		return header?.coverHeight ? coverHeights[header.coverHeight] : 160;
	})();
	
	// Helper: Get border radius for avatar shape
	function getAvatarBorderRadius(shape: string | undefined): string {
		if (shape === 'circle' || shape === 'oval') return '50%';
		if (shape === 'rounded') return '12%';
		if (shape === 'portrait' || shape === 'landscape') return '8%';
		return '0';
	}

	// Get cover background style from header preset + overrides
	$: coverStyle = (() => {
		if (!header?.hasCover) return '';
		
		// If avatar-cover preset, use avatar as cover
		if (headerPresetId === 'avatar-cover' && $page?.avatar_url) {
			return `background: url('${$page.avatar_url}') center/cover;`;
		}
		
		// Get coverValue from header (already merged with overrides)
		const coverValue = header?.coverValue;
		
		if (!coverValue) {
			return 'background: linear-gradient(135deg, #667eea, #764ba2);';
		}
		
		if (coverValue.startsWith('http') || coverValue.startsWith('/')) {
			return `background: url('${coverValue}') center/cover;`;
		}
		
		return `background: ${coverValue};`;
	})();
	
	// Check if avatar-cover preset (hide avatar, show text overlay)
	$: isAvatarCover = headerPresetId === 'avatar-cover';
	
	// Get block gap from appearance
	$: blockGap = $appearance?.page?.blockGap ?? 16;
	
	// Get page padding from appearance with resolver
	$: pagePadding = resolvePagePadding($appearance?.page?.pagePadding);
	
	// Get avatar border width from theme config with resolver
	$: avatarBorderWidth = (() => {
		// Priority 1: Check override from appearanceState (for live preview)
		const override = $appearanceState.overrides?.['header.avatarBorderWidth'];
		if (override !== undefined) {
			return resolveAvatarBorderWidth(override);
		}
		
		// Priority 2: Check theme config
		const themeConfig = $appearance?.theme?.config;
		const borderWidth = themeConfig?.page?.defaults?.avatarBorderWidth;
		return resolveAvatarBorderWidth(borderWidth);
	})();
	
	// Get font sizes with reactive tracking - inline for proper Svelte reactivity
	$: titleFontSize = (() => {
		const override = $appearanceState.overrides?.['page.titleFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 20;
		}
		const value = $appearance?.theme?.config?.semantic?.typography?.heading?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 20;
		}
		return 20;
	})();
	
	$: bioFontSizePx = (() => {
		const override = $appearanceState.overrides?.['page.bioFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		const value = $appearance?.theme?.config?.semantic?.typography?.bio?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: linkFontSizePx = (() => {
		const override = $appearanceState.overrides?.['page.linkFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		const value = $appearance?.theme?.config?.semantic?.typography?.link?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: subtitleFontSizePx = (() => {
		const override = $appearanceState.overrides?.['page.subtitleFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 12;
		}
		const value = $appearance?.theme?.config?.semantic?.typography?.subtitle?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 12;
		}
		return 12;
	})();
	
	// Get title font family (separate from body font)
	$: titleFontFamily = (() => {
		const override = $appearanceState.overrides?.['header.titleFontFamily'] as string;
		if (override) return override;
		// Fallback to theme semantic.typography.heading.fontFamily or body font
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.semantic?.typography?.heading?.fontFamily 
			|| themeConfig?.tokens?.typography?.fontFamily?.sans 
			|| 'Inter, sans-serif';
	})();
	
	// Title glow effect
	$: titleGlow = (() => {
		const themeConfig = $appearance?.theme?.config;
		const glowConfig = themeConfig?.page?.defaults?.titleGlow;
		if (glowConfig?.enabled) {
			const color = glowConfig.color || tokens?.primaryColor || '#3b82f6';
			return `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`;
		}
		return 'none';
	})();
	
	// Avatar glow effect
	$: avatarGlow = (() => {
		const themeConfig = $appearance?.theme?.config;
		const glowConfig = themeConfig?.page?.defaults?.avatarGlow;
		if (glowConfig?.enabled) {
			const color = glowConfig.color || tokens?.primaryColor || '#3b82f6';
			return `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`;
		}
		return 'none';
	})();
	
	// Convert background color to rgba gradient colors for mask (for avatar-cover)
	$: maskGradientColors = (() => {
		if (!isAvatarCover) return { solid: 'rgba(0,0,0,1)', dark: 'rgba(0,0,0,0.8)', medium: 'rgba(0,0,0,0.4)' };
		
		// Read directly from overrides
		const bgColor = $appearanceState.overrides['backgroundColor'];
		
		let r = 0, g = 0, b = 0;
		
		// Parse hex color (#RRGGBB)
		if (bgColor && bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			r = parseInt(bgColor.slice(1, 3), 16);
			g = parseInt(bgColor.slice(3, 5), 16);
			b = parseInt(bgColor.slice(5, 7), 16);
		}
		// Parse rgb/rgba
		else if (bgColor && bgColor.startsWith('rgb')) {
			const match = bgColor.match(/\d+/g);
			if (match && match.length >= 3) {
				r = parseInt(match[0]);
				g = parseInt(match[1]);
				b = parseInt(match[2]);
			}
		}
		// Fallback to black if can't parse
		
		return {
			solid: `rgba(${r}, ${g}, ${b}, 1)`,
			dark: `rgba(${r}, ${g}, ${b}, 0.8)`,
			medium: `rgba(${r}, ${g}, ${b}, 0.4)`
		};
	})();

	// Get socialIconPosition from theme config
	$: socialIconPosition = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.socialIconPosition || 'header';
	})();

	// Get socialIconColor from theme config
	$: socialIconColor = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.socialIconColor || tokens?.textColor || '#000000';
	})();

	// Get iconThumbnailColor from theme config
	$: iconThumbnailColor = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.semantic?.color?.icon?.thumbnail || tokens?.textColor || '#000000';
	})();

	// Get socialIconSize from theme config with resolver
	$: socialIconSizePx = (() => {
		// Priority 1: Check override from appearanceState (for live preview)
		const override = $appearanceState.overrides?.['page.socialIconSize'];
		if (override !== undefined) {
			return resolveSocialIconSize(override);
		}
		
		// Priority 2: Check theme config
		const themeConfig = $appearance?.theme?.config;
		const sizeValue = themeConfig?.page?.defaults?.socialIconSize;
		return resolveSocialIconSize(sizeValue);
	})();

	// Get socialIconsEnabled from theme config
	$: socialIconsEnabled = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.socialIconsEnabled ?? true;
	})();

	// Get block border-radius from appearance
	$: blockBorderRadius = `${$appearance?.block?.borderRadius ?? 12}px`;
	
	// Get block padding from appearance
	$: blockPaddingX = $appearance?.block?.padding?.x ?? 16;
	$: blockPaddingY = $appearance?.block?.padding?.y ?? 12;
	
	// Get border width from appearance
	$: borderWidth = $appearance?.block?.borderWidth ?? 1;
	
	// Resolve shadow with shadowColor token
	$: resolvedBlockShadow = (() => {
		// If current recipe has glow (Neon), don't use shadow
		if ($appearance?.blockStyle?.glow) {
			return 'none';
		}
		
		const shadow = $appearance?.blockStyle?.shadow;
		if (!shadow || shadow === 'none') return 'none';
		
		// If it's a hard shadow pattern (4px 4px 0px), ensure shadowColor is applied
		if (shadow.includes('4px 4px 0px')) {
			return `4px 4px 0px ${tokens?.shadowColor || '#000000'}`;
		}
		
		return shadow;
	})();

	// Helper function: Resolve layout shadow (DRY - used by grid, list, card)
	function resolveLayoutShadow(
		shadowEnabled: boolean | undefined,
		resolvedBlockShadow: string,
		glow: string | undefined
	): string {
		// If recipe has glow (Neon), always show glow regardless of shadowEnabled
		if (glow) {
			return `0 0 20px ${glow}`;
		}
		
		// For non-glow recipes, handle shadow normally
		if (shadowEnabled === false) return 'none';
		if (resolvedBlockShadow !== 'none') return resolvedBlockShadow;
		if (shadowEnabled === true) return '0 2px 8px rgba(0,0,0,0.1)'; // Force ON
		return 'none';
	}

	// Helper function: Resolve layout border (DRY - used by grid, list, card)
	function resolveLayoutBorder(
		borderEnabled: boolean | undefined,
		themeBorder: string | undefined,
		blockBase: string
	): string {
		if (borderEnabled === false) return 'none';
		if (themeBorder && themeBorder !== 'none') {
			// Check if themeBorder is already a full border string (e.g., "1px solid #e4e4e7")
			if (themeBorder.includes('px') && themeBorder.includes('solid')) {
				return themeBorder;
			}
			// Otherwise, it's just a color, format it
			return `${borderWidth}px solid ${themeBorder}`;
		}
		if (borderEnabled === true) return `${borderWidth}px solid ${blockBase}`;
		return 'none';
	}

	// Page settings - read from appearanceState.overrides
	$: showShareButton = ($appearanceState.overrides?.['page.showShareButton'] as boolean) ?? true;
	$: showSubscribeButton = ($appearanceState.overrides?.['page.showSubscribeButton'] as boolean) ?? true;
	$: bioUrl = `https://biolink.com/${$page?.username || 'demo'}`;

	// Background filters - for both image and video backgrounds
	$: backgroundFilters = (() => {
		const blur = resolveBlur($appearanceState.overrides['backgroundBlur'] ?? $appearance?.theme?.config?.background?.effects?.blur);
		const brightness = resolveBrightness($appearanceState.overrides['backgroundBrightness'] ?? $appearance?.theme?.config?.background?.effects?.brightness);
		const grayscale = resolveGrayscale($appearanceState.overrides['backgroundGrayscale'] ?? $appearance?.theme?.config?.background?.effects?.grayscale);
		return `blur(${blur}px) brightness(${brightness / 100}) grayscale(${grayscale / 100})`;
	})();

	// Subscribe modal
	let showSubscribeModal = false;
	let subscribing = false;

	async function handleShare() {
		try {
			await navigator.clipboard.writeText(bioUrl);
		} catch (e) {
			const input = document.createElement('input');
			input.value = bioUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
		}
	}

	async function handleSubscribe(event: CustomEvent<string>) {
		subscribing = true;
		try {
			// TODO: Call API to subscribe
			console.log('Subscribe email:', event.detail);
			await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
			showSubscribeModal = false;
		} catch (e) {
			console.error('Subscribe failed:', e);
		} finally {
			subscribing = false;
		}
	}
</script>

<!-- Phone Frame - Larger size for better visibility -->
<div class="relative">
	<div class="w-[350px] h-[725px] bg-gray-900 rounded-[50px] p-2.5 shadow-2xl">
		<div class="w-full h-full rounded-[45px] overflow-hidden relative">
			<!-- Background Video (always rendered when hasVideoInDraft) -->
			{#if hasVideoInDraft}
				<video 
					src={backgroundVideo || ''} 
					class="absolute inset-0 z-0 w-full h-full object-cover"
					style="filter: {backgroundFilters};"
					autoplay 
					loop 
					muted 
					playsinline
					on:timeupdate={handleVideoTimeUpdate}
				></video>
			{:else if resolvedBackground && resolvedBackground.includes('url(')}
				<!-- Background Image Layer -->
				<div 
					class="absolute inset-0 z-0 w-full h-full"
					style="
						background: {resolvedBackground} center/cover no-repeat;
						filter: {backgroundFilters};
					"
				></div>
			{:else if bgType === 'gradient' && bgAnimation?.enabled}
				<!-- Animated Gradient Background -->
				<div 
					class="absolute inset-0 z-0 {animationClass}"
					style="background-image: {resolvedBackground}; background-size: 200% 200%;"
				></div>
			{:else if resolvedBackground}
				<!-- Solid/Pattern/Static Gradient Background - separate layer for particles to work -->
				<div 
					class="absolute inset-0 z-0"
					style="{bgType === 'pattern' ? resolvedBackground : `background: ${resolvedBackground};`}"
				></div>
			{/if}
			
			<!-- Particles Layer -->
			{#if particles?.enabled}
				<ParticlesLayer
					count={particles.count || 20}
					size={particles.size || 'medium'}
					color={particles.color || '#ffffff'}
					speed={particles.speed || 'medium'}
					variant={particles.variant || 'floating'}
					blur={particles.blur || 'medium'}
					opacity={particles.opacity ?? 60}
				/>
			{/if}

			<!-- Content -->
			<div 
				class="w-full h-full overflow-y-auto scrollbar-hide phone-content relative z-10"
				style="
					background: transparent;
					color: {tokens?.textColor || '#000000'};
					font-family: {tokens?.fontFamily || 'Inter'}, sans-serif;
				"
			>
				<!-- Share & Subscribe Buttons -->
				{#if showShareButton || showSubscribeButton}
					<div class="absolute top-2 left-0 right-0 z-20 flex items-center justify-between px-2">
						<!-- Subscribe Button (Left) -->
						{#if showSubscribeButton}
							<button
								on:click={() => showSubscribeModal = true}
								class="h-6 px-2 rounded-full flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
								style="
									background: rgba(255, 255, 255, 0.9);
									backdrop-filter: blur(12px);
									-webkit-backdrop-filter: blur(12px);
								"
								title="Subscribe"
							>
								<svg class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
								</svg>
								<span class="text-[9px] font-medium text-gray-700">Subscribe</span>
							</button>
						{:else}
							<div></div>
						{/if}

						<!-- Share Button (Right) -->
						{#if showShareButton}
							<button
								on:click={handleShare}
								class="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
								style="
									background: rgba(255, 255, 255, 0.9);
									backdrop-filter: blur(12px);
									-webkit-backdrop-filter: blur(12px);
								"
								title="Share"
							>
								<svg class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
								</svg>
							</button>
						{/if}
					</div>
				{/if}

				{#if isLoading}
					<!-- Loading State -->
					<div class="w-full h-full flex items-center justify-center">
						<div class="flex flex-col items-center gap-3">
							<div class="animate-spin w-8 h-8 border-2 border-gray-300 rounded-full" style="border-top-color: #00aa4f;"></div>
							<p class="text-xs text-gray-500">Loading preview...</p>
						</div>
					</div>
				{:else}
				<div class="pt-10 pb-8" style="padding-left: {pagePadding}px; padding-right: {pagePadding}px;">
					<!-- Header with Cover -->
					{#if header?.hasCover}
						<div class="relative -mx-4 -mt-10 mb-3 header-cover">
							<!-- Cover Image/Gradient with text overlay for avatar-cover -->
							<div 
								class="w-full relative"
								style="{coverStyle} height: {coverHeight}px;"
							>
								<!-- Double gradient overlay for avatar-cover -->
								{#if isAvatarCover}
									<!-- Layer 1: Subtle gradient overlay - lighter for better visibility -->
									<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.5) 100%);"></div>
									<!-- Layer 2: Bottom fade mask - extend 2px below to prevent gap -->
									<div class="absolute left-0 right-0 pointer-events-none" style="bottom: -2px; height: 102px; background: linear-gradient(to top, {maskGradientColors.solid} 0%, {maskGradientColors.dark} 30%, {maskGradientColors.medium} 60%, transparent 100%);"></div>
									
									<!-- Text overlay on avatar cover - z-20 để nổi lên trên gradient mask -->
									<div class="absolute bottom-1 left-0 right-0 z-20 text-center px-4">
										<h1 class="font-bold text-white drop-shadow-lg" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$page?.title || 'Your Name'}</h1>
										{#if header.showBio && $page?.bio}
											<p 
												class="bio-text text-white/90 mt-2 drop-shadow-md"
												style="
													font-size: {bioFontSizePx}px;
													line-height: 1.5;
												"
											>
												{$page.bio}
											</p>
										{/if}
									</div>
								{/if}
							</div>
							
							<!-- Avatar (Overlapping) - Hidden for avatar-cover -->
							{#if header.avatarPosition === 'overlap' && !isAvatarCover}
								<div class="absolute left-1/2 -translate-x-1/2" style="bottom: -{avatarOverlapOffset}px;">
									{#if $page?.avatar_url}
										<img 
											src={$page.avatar_url} 
											alt="Avatar" 
											class="header-avatar object-cover {isFullSizeAvatar ? 'w-full' : ''}"
											style="
												{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`}
												{header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {getAvatarBorderRadius(header.avatarShape)};
												box-shadow: {avatarGlow};
											"
										/>
									{:else}
										<div 
											class="header-avatar flex items-center justify-center text-white font-bold {isFullSizeAvatar ? 'w-full' : ''}"
											style="
												{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`}
												background: {tokens?.primaryColor || '#3b82f6'};
												{header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {getAvatarBorderRadius(header.avatarShape)};
												font-size: {isFullSizeAvatar ? '48px' : `${avatarSize / 2.5}px`};
												box-shadow: {avatarGlow};
											"
										>
											{($page?.title || 'U').charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
							{/if}
						</div>
						
						<!-- Content below cover (only for non-avatar-cover) -->
						{#if !isAvatarCover}
							<div class="header-content" style="margin-top: {header.avatarPosition === 'overlap' ? avatarOverlapOffset + 8 : 0}px; text-align: {header.contentAlign};">
								<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$page?.title || 'Your Name'}</h1>
								{#if header.showBio && $page?.bio}
									<p 
										class="bio-text mt-1"
										style="
											color: {tokens?.mutedTextColor || '#71717a'};
											font-size: {bioFontSizePx}px;
											line-height: 1.5;
											display: -webkit-box;											-webkit-box-orient: vertical;
											overflow: hidden;
										"
									>
										{$page.bio}
									</p>
								{/if}
							</div>
						{/if}
					{:else}
						<!-- No Cover - Center Layout -->
						<div class="header-content" style="display: flex; flex-direction: column; align-items: {header?.contentAlign === 'left' ? 'flex-start' : 'center'}; text-align: {header?.contentAlign || 'center'};">
							{#if $page?.avatar_url}
								<img 
									src={$page.avatar_url} 
									alt="Avatar" 
									class="header-avatar object-cover mb-2 {isFullSizeAvatar ? 'w-full' : ''}"
									style="
										{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`}
										{header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {getAvatarBorderRadius(header?.avatarShape)};
										box-shadow: {avatarGlow};
									"
								/>
							{:else}
								<div 
									class="header-avatar mb-2 flex items-center justify-center text-white font-bold {isFullSizeAvatar ? 'w-full' : ''}"
									style="
										{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`}
										background: {tokens?.primaryColor || '#3b82f6'};
										{header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {getAvatarBorderRadius(header?.avatarShape)};
										font-size: {isFullSizeAvatar ? '48px' : `${avatarSize / 2.5}px`};
										box-shadow: {avatarGlow};
									"
								>
									{($page?.title || 'U').charAt(0).toUpperCase()}
								</div>
							{/if}
							<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$page?.title || 'Your Name'}</h1>
							{#if header?.showBio && $page?.bio}
								<p 
									class="bio-text mt-1"
									style="
										color: {tokens?.mutedTextColor || '#71717a'};
										font-size: {bioFontSizePx}px;
										line-height: 1.5;
										display: -webkit-box;										-webkit-box-orient: vertical;
										overflow: hidden;
									"
								>
									{$page.bio}
								</p>
							{/if}
						</div>
					{/if}

					<!-- Social Icons (Header Position) -->
					{#if socialIconsEnabled && $page?.show_social_icons && $page?.social_links && socialIconPosition === 'header'}
						{@const socialLinks = $page.social_links}
						{@const hasSocialLinks = Object.values(socialLinks).some(link => link && link.trim())}
						
						{#if hasSocialLinks}
							<div class="flex items-center gap-3 mt-1.5" style="justify-content: center;">
								{#if socialLinks.instagram}
									<a href="https://{socialLinks.instagram}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
											<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
											<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
											<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
										</svg>
									</a>
								{/if}
								{#if socialLinks.facebook}
									<a href="https://{socialLinks.facebook}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.twitter}
									<a href="https://{socialLinks.twitter}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.linkedin}
									<a href="https://{socialLinks.linkedin}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.youtube}
									<a href="https://{socialLinks.youtube}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.tiktok}
									<a href="https://{socialLinks.tiktok}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
										</svg>
									</a>
								{/if}
							</div>
						{/if}
					{/if}

					<!-- Links - với negative margin và gradient mask cho avatar-cover -->
					<div 
						class="relative"
						style="display: flex; flex-direction: column; gap: {blockGap}px; {isAvatarCover ? `margin-top: -80px; padding-top: 100px;` : 'margin-top: 24px;'}"
					>
						<!-- Gradient mask - nối liền với overlay trên avatar -->
						{#if isAvatarCover}
							<div 
								class="absolute pointer-events-none z-10 -mx-4"
								style="left: 0; right: 0; top: -24px; height: 60px; background: linear-gradient(to bottom, transparent 0%, {resolvedBackground || '#ffffff'} 100%);"
							></div>
						{/if}
						
						{#each $groups.filter(g => (g.is_visible ?? 1) === 1) as group}
							{@const groupLinks = group.links.filter(l => l.is_active === 1)}
							{@const effectiveLayoutType = group.layout_type || defaultLinkGroupLayout}
							{#if groupLinks.length > 0}
								{#if effectiveLayoutType === 'carousel'}
									<!-- Carousel Layout -->
									<div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
										<div class="flex gap-3" style="width: max-content;">
											{#each groupLinks as link}
												{@const parts = link.title.split(' - ')}
												{@const headline = parts[0]}
												{@const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : null}
												
												<a
													href={link.url}
													target="_blank"
													rel="noopener"
													class="link-button block flex-shrink-0 font-medium transition-transform hover:scale-[1.02]"
													style="
														width: 200px;
														background: {$appearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
														color: {$appearance?.blockStyle?.text || 'white'};
														border: {$appearance?.blockStyle?.border || 'none'};
														box-shadow: {resolvedBlockShadow !== 'none' 
															? resolvedBlockShadow 
															: ($appearance?.blockStyle?.glow ? `0 0 20px ${$appearance.blockStyle.glow}` : 'none')};
														{$appearance?.blockStyle?.blur ? `backdrop-filter: blur(${$appearance.blockStyle.blur}px); -webkit-backdrop-filter: blur(${$appearance.blockStyle.blur}px);` : ''}
														border-radius: {blockBorderRadius};
														padding: {blockPaddingY}px {blockPaddingX}px;
														font-size: {linkFontSizePx}px;
													"
												>
													{#if link.icon_url}
														<img 
															src={link.icon_url} 
															alt="" 
															class="w-full aspect-square rounded-lg object-cover mb-2"
														/>
													{/if}
													<div class="text-center">
														<div class="font-semibold truncate">{headline}</div>
														{#if subtitle}
															<div class="opacity-70 mt-0.5 truncate" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
														{/if}
													</div>
												</a>
											{/each}
										</div>
									</div>
								{:else if effectiveLayoutType === 'grid'}
									<!-- Grid Layout -->
									{@const config = (() => {
										try {
											const parsed = group.layout_config ? JSON.parse(group.layout_config) : null;
											return parsed?.grid || defaultGridConfig;
										} catch {
											return defaultGridConfig;
										}
									})()}
									{@const aspectClass = config.aspectRatio === 'portrait' ? 'aspect-[3/4]' : config.aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-square'}
									{@const gridShadow = resolveLayoutShadow(
										config.shadowEnabled,
										resolvedBlockShadow,
										$appearance?.blockStyle?.glow
									)}
									{@const gridBorder = resolveLayoutBorder(
										config.borderEnabled,
										$appearance?.blockStyle?.border,
										$appearance?.tokens?.blockBase || '#3b82f6'
									)}
									{@const gridPadding = 4}
									{@const blockRadiusNum = parseInt(blockBorderRadius)}
									{@const imageBorderRadius = config.imagePadding ? blockBorderRadius : `${Math.max(0, blockRadiusNum - 4)}px`}
									
									<div class="grid" style="grid-template-columns: repeat({config.columns}, minmax(0, 1fr)); gap: {blockGap}px;">										{#each groupLinks as link}
											{@const headline = link.title.split(' - ')[0]}
											{@const linkIconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || null, link.icon_color || iconThumbnailColor)}
											{@const hasImage = !!linkIconUrl}
											{@const showImageOnly = hasImage && !config.imagePadding && !config.showLabels}
											{@const imageRadius = config.imagePadding 
												? imageBorderRadius 
												: config.showLabels 
													? `${blockBorderRadius} ${blockBorderRadius} 0 0` 
													: blockBorderRadius}
											{@const iconClasses = getIconClasses(link.icon_type || 'none', 'grid', `w-full ${aspectClass}`)}
											
											<a
												href={link.url}
												target="_blank"
												rel="noopener"
												class="link-button block font-medium transition-transform hover:scale-[1.02] {config.imagePadding || config.showLabels ? '' : 'overflow-hidden'}"
												style="
													background: {showImageOnly ? 'transparent' : ($appearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6')};
													color: {$appearance?.blockStyle?.text || 'white'};
													border: {gridBorder};
													box-shadow: {gridShadow};
													{$appearance?.blockStyle?.blur ? `backdrop-filter: blur(${$appearance.blockStyle.blur}px); -webkit-backdrop-filter: blur(${$appearance.blockStyle.blur}px);` : ''}
													border-radius: {blockBorderRadius};
													padding: {config.imagePadding ? `${gridPadding}px` : '0'};
													font-size: {config.columns === 1 ? linkFontSizePx : config.columns === 2 ? linkFontSizePx * 0.7 : config.columns === 3 ? linkFontSizePx * 0.5 : linkFontSizePx * 0.4}px;
												"
											>
												{#if hasImage}
													<img 
														src={linkIconUrl} 
														alt="" 
														class="{iconClasses} {showImageOnly ? 'h-full' : ''}"
														style="border-radius: {imageRadius};"
													/>
												{/if}
												{#if config.showLabels}
													<div class="w-full truncate text-[10px] {config.imagePadding ? 'mt-1' : 'px-2 pb-1'}" style="text-align: {globalTextAlign};">
														{headline}
													</div>
												{/if}
											</a>
										{/each}
									</div>
								{:else if effectiveLayoutType === 'cards'}
									<!-- Card Layout (Horizontal) -->
									{@const config = (() => {
										try {
											const parsed = group.layout_config ? JSON.parse(group.layout_config) : null;
											return parsed?.card || defaultCardConfig;
										} catch {
											return defaultCardConfig;
										}
									})()}
									{@const cardShadow = resolveLayoutShadow(
										config.shadowEnabled,
										resolvedBlockShadow,
										$appearance?.blockStyle?.glow
									)}
									{@const cardBorder = resolveLayoutBorder(
										config.borderEnabled,
										$appearance?.blockStyle?.border,
										$appearance?.tokens?.blockBase || '#3b82f6'
									)}
									{@const aspectClass = config.imageAspect === 'portrait' ? 'aspect-[3/4]' : config.imageAspect === 'landscape' ? 'aspect-video' : 'aspect-square'}
									{@const cardPadding = 4}
									{@const blockRadiusNum = parseInt(blockBorderRadius)}
									{@const imageBorderRadius = config.imagePadding ? blockBorderRadius : `${Math.max(0, blockRadiusNum - cardPadding)}px`}
									
									<div class="flex flex-col" style="gap: {blockGap}px;">
										{#each groupLinks as link, index}
											{@const parts = link.title.split(' - ')}
											{@const headline = parts[0]}
											{@const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : null}
											{@const linkIconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || null, link.icon_color || iconThumbnailColor)}
											{@const iconClasses = getIconClasses(link.icon_type || 'none', 'card', 'flex-shrink-0')}
											{@const position = config.imagePosition === 'alternate' 
												? (index % 2 === 0 ? 'left' : 'right')
												: config.imagePosition}
											{@const imageRadius = config.imagePadding 
												? imageBorderRadius 
												: position === 'right'
													? `0 ${blockBorderRadius} ${blockBorderRadius} 0`
													: `${blockBorderRadius} 0 0 ${blockBorderRadius}`}
											
											<a
												href={link.url}
												target="_blank"
												rel="noopener"
												class="link-button block w-full font-medium transition-transform hover:scale-[1.02] {config.imagePadding ? '' : 'overflow-hidden'}"
												style="
													background: {$appearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
													color: {$appearance?.blockStyle?.text || 'white'};
													border: {cardBorder};
													box-shadow: {cardShadow} !important;
													{$appearance?.blockStyle?.blur ? `backdrop-filter: blur(${$appearance.blockStyle.blur}px); -webkit-backdrop-filter: blur(${$appearance.blockStyle.blur}px);` : ''}
													border-radius: {blockBorderRadius};
													font-size: {linkFontSizePx}px;
													padding: {config.imagePadding ? `${cardPadding}px` : '0'};
													display: flex;
													align-items: center;
													gap: {config.imagePadding ? `${cardPadding}px` : '0'};
													flex-direction: {position === 'right' ? 'row-reverse' : 'row'};
												"
											>
												{#if linkIconUrl}
													<img 
														src={linkIconUrl} 
														alt="" 
														class="{iconClasses}"
														style="
															width: {config.imageSize}%;
															aspect-ratio: {config.imageAspect === 'square' ? '1' : config.imageAspect === 'portrait' ? '3/4' : '4/3'};
															border-radius: {imageRadius};
														"
													/>
												{/if}
												<div class="flex-1 min-w-0" style="padding: {config.imagePadding ? '0' : `${blockPaddingY}px ${blockPaddingX}px`}; text-align: {globalTextAlign};">
													<div class="font-semibold leading-tight truncate">{headline}</div>
													{#if subtitle && config.showSubtitle}
														<div class="mt-1 opacity-70 truncate" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
													{/if}
												</div>
											</a>
										{/each}
									</div>
								{:else}
									<!-- List Layout (Default) -->
									{@const config = (() => {
										try {
											const parsed = group.layout_config ? JSON.parse(group.layout_config) : null;
											return parsed?.list || defaultListConfig;
										} catch {
											return defaultListConfig;
										}
									})()}
									{@const iconShapeClass = (config.iconShape || globalIconShape) === 'circle' ? 'rounded-full' : (config.iconShape || globalIconShape) === 'rounded' ? 'rounded-lg' : ''}
									{@const showIcon = config.iconPosition !== 'none'}
									{@const iconOnTop = config.iconPosition === 'top'}
									{@const listShadow = resolveLayoutShadow(
										config.shadowEnabled,
										resolvedBlockShadow,
										$appearance?.blockStyle?.glow
									)}
									{@const listBorder = resolveLayoutBorder(
										config.borderEnabled,
										$appearance?.blockStyle?.border,
										$appearance?.tokens?.blockBase || '#3b82f6'
									)}
									
									{#each groupLinks as link}
										{@const parts = link.title.split(' - ')}
										{@const headline = parts[0]}
										{@const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : null}
										{@const linkIconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || null, link.icon_color || iconThumbnailColor)}
										{@const iconClassesTop = getIconClasses(link.icon_type || 'none', 'list-top', `w-10 h-10 ${iconShapeClass}`)}
										{@const iconClassesLeft = getIconClasses(link.icon_type || 'none', 'list-left', `w-8 h-8 flex-shrink-0 ${iconShapeClass}`)}
										
										<a
											href={link.url}
											target="_blank"
											rel="noopener"
											class="link-button block w-full font-medium transition-transform hover:scale-[1.02]"
											style="
												background: {$appearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
												color: {$appearance?.blockStyle?.text || 'white'};
												border: {listBorder};
												box-shadow: {listShadow};
												{$appearance?.blockStyle?.blur ? `backdrop-filter: blur(${$appearance.blockStyle.blur}px); -webkit-backdrop-filter: blur(${$appearance.blockStyle.blur}px);` : ''}
												border-radius: {blockBorderRadius};
												text-align: {config.textAlign};
												padding: {blockPaddingY}px {blockPaddingX}px;
												font-size: {linkFontSizePx}px;
											"
										>
											{#if showIcon && linkIconUrl && iconOnTop}
												<!-- Icon on top -->
												<div class="flex flex-col items-center gap-2">
													<img 
														src={linkIconUrl} 
														alt="" 
														class="{iconClassesTop}"
													/>
													<div>
														<div class="font-semibold">{headline}</div>
														{#if subtitle && config.showSubtitle}
															<div class="opacity-70 mt-0.5" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
														{/if}
													</div>
												</div>
											{:else if showIcon && linkIconUrl}
												<!-- Icon on left -->
												<div class="flex items-center gap-3" style="justify-content: {config.textAlign === 'right' ? 'flex-end' : config.textAlign === 'center' ? 'center' : 'flex-start'};">
													<img 
														src={linkIconUrl} 
														alt="" 
														class="{iconClassesLeft}"
													/>
													<div class="flex-1" style="text-align: {config.textAlign};">
														<div class="font-semibold">{headline}</div>
														{#if subtitle && config.showSubtitle}
															<div class="opacity-70 mt-0.5" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
														{/if}
													</div>
												</div>
											{:else}
												<!-- No icon or icon hidden -->
												<div>
													<div class="font-semibold">{headline}</div>
													{#if subtitle && config.showSubtitle}
														<div class="opacity-70 mt-0.5" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
													{/if}
												</div>
											{/if}
										</a>
									{/each}
								{/if}
							{/if}
						{/each}
						
						{#if $groups.filter(g => (g.is_visible ?? 1) === 1).every(g => g.links.filter(l => l.is_active === 1).length === 0)}
							<div class="text-center py-8 opacity-50">
								<p class="text-sm">No links yet</p>
							</div>
						{/if}
					</div>

					<!-- Social Icons (Footer Position) -->
					{#if socialIconsEnabled && $page?.show_social_icons && $page?.social_links && socialIconPosition === 'footer'}
						{@const socialLinks = $page.social_links}
						{@const hasSocialLinks = Object.values(socialLinks).some(link => link && link.trim())}
						
						{#if hasSocialLinks}
							<div class="flex items-center justify-center gap-3 mt-6">
								{#if socialLinks.instagram}
									<a href="https://{socialLinks.instagram}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
											<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
											<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
											<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
										</svg>
									</a>
								{/if}
								{#if socialLinks.facebook}
									<a href="https://{socialLinks.facebook}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.twitter}
									<a href="https://{socialLinks.twitter}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.linkedin}
									<a href="https://{socialLinks.linkedin}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.youtube}
									<a href="https://{socialLinks.youtube}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.tiktok}
									<a href="https://{socialLinks.tiktok}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
										<svg style="width: {socialIconSizePx}px; height: {socialIconSizePx}px;" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
										</svg>
									</a>
								{/if}
							</div>
						{/if}
					{/if}

					<!-- Footer -->
					<div class="mt-8 mb-6 text-center">
						<p class="text-xs" style="color: {tokens?.mutedTextColor || '#71717a'};">Made with Bio Link</p>
					</div>
				</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Home Indicator -->
	<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
</div>

<!-- Subscribe Modal -->
{#if showSubscribeModal}
	<SubscribeModal
		loading={subscribing}
		on:submit={handleSubscribe}
		on:cancel={() => showSubscribeModal = false}
	/>
{/if}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	/* Animated Gradient Keyframes - Multiple directions */
	
	/* Horizontal animations (for 90deg, 270deg) */
	@keyframes gradient-flowing-horizontal {
		0% {
			background-position: -200% 0%;
		}
		100% {
			background-position: 200% 0%;
		}
	}
	
	/* Vertical animations (for 0deg, 180deg) */
	@keyframes gradient-flowing-vertical {
		0% {
			background-position: 0% -200%;
		}
		100% {
			background-position: 0% 200%;
		}
	}
	
	/* Diagonal animations (for 45deg, 135deg, 225deg, 315deg) */
	@keyframes gradient-flowing-diagonal {
		0% {
			background-position: -200% -200%;
		}
		100% {
			background-position: 200% 200%;
		}
	}
	
	/* Rotating animation - works for all directions */
	@keyframes gradient-rotating {
		0% {
			background-position: 0% 0%;
		}
		25% {
			background-position: 100% 0%;
		}
		50% {
			background-position: 100% 100%;
		}
		75% {
			background-position: 0% 100%;
		}
		100% {
			background-position: 0% 0%;
		}
	}

	@keyframes gradient-pulsing {
		0%, 100% {
			filter: brightness(1) saturate(1);
		}
		50% {
			filter: brightness(1.3) saturate(1.5);
		}
	}

	/* Animation Classes - Apply to background layer */
	.gradient-rotating {
		animation: gradient-rotating ease infinite;
	}

	.gradient-flowing-horizontal {
		animation: gradient-flowing-horizontal linear infinite;
	}

	.gradient-flowing-vertical {
		animation: gradient-flowing-vertical linear infinite;
	}

	.gradient-flowing-diagonal {
		animation: gradient-flowing-diagonal linear infinite;
	}

	.gradient-pulsing {
		animation: gradient-pulsing ease-in-out infinite;
	}

	/* Speed Classes */
	.gradient-speed-slow {
		animation-duration: 8s;
	}

	.gradient-speed-medium {
		animation-duration: 4s;
	}

	.gradient-speed-fast {
		animation-duration: 2s;
	}
</style>
