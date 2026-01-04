<script lang="ts">
	import { previewPage, previewAppearance, previewAppearanceState } from '$lib/stores/themePreview';
	import { groups } from '$lib/stores/page';
	import { HEADER_PRESETS } from '$lib/appearance/presets';
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	import { resolveMaxWidth, resolvePagePadding, resolveBlockGap, resolveAvatarBorderWidth } from '$lib/appearance/spacingTokens';
	import { resolveBlur, resolveBrightness, resolveGrayscale } from '$lib/appearance/effectsTokens';
	import ParticlesLayer from '$lib/components/effects/ParticlesLayer.svelte';
	import { createVideoFadeHandler } from '$lib/utils/videoFadeLoop';

	// Create video fade handler
	const handleVideoTimeUpdate = createVideoFadeHandler();
	// Use preview stores instead of main stores
	$: tokens = $previewAppearance?.tokens;
	$: headerPresetId = $previewAppearanceState.headerPresetId || 'no-cover';
	$: baseHeaderPreset = HEADER_PRESETS[headerPresetId];
	
	// Parse background value from NEW structure
	$: backgroundValue = (() => {
		// Priority 1: Check overrides
		const override = $previewAppearanceState.overrides?.['backgroundColor'];
		if (override) return override;
		
		// Priority 2: Check theme config (NEW structure)
		const themeConfig = $previewAppearance?.theme?.config;
		const bgType = themeConfig?.background?.type;
		const bgValue = themeConfig?.background?.value;
		
		if (bgType && bgValue) {
			if (bgType === 'solid') {
				return bgValue; // hex color
			} else if (bgType === 'gradient') {
				return bgValue; // gradient CSS
			} else if (bgType === 'image') {
				return `url('${bgValue}')`; // wrap image URL
			} else if (bgType === 'video') {
				return '#000000'; // fallback for video
			}
		}
		
		// Fallback
		return tokens?.backgroundColor || '#ffffff';
	})();
	
	$: backgroundVideoUrl = (() => {
		// Priority 1: Check overrides (user customization in theme editor)
		const override = $previewAppearanceState.overrides?.['backgroundVideo'] as string | undefined;
		if (override) return override;
		
		// Priority 2: Check theme config (NEW structure: background.type + background.value)
		const themeConfig = $previewAppearance?.theme?.config;
		if (themeConfig?.background?.type === 'video' && themeConfig?.background?.value) {
			return themeConfig.background.value;
		}
		
		return undefined;
	})();
	
	// Get animation settings and build class
	$: bgAnimation = (() => {
		const themeConfig = $previewAppearance?.theme?.config;
		return themeConfig?.background?.animation;
	})();
	
	$: bgType = $previewAppearance?.theme?.config?.background?.type;
	
	$: bgGradientDirection = (() => {
		const themeConfig = $previewAppearance?.theme?.config;
		const bgValue = themeConfig?.background?.value;
		if (bgType === 'gradient' && bgValue) {
			const match = bgValue.match(/(\d+)deg/);
			return match ? match[1] : '135';
		}
		return '135';
	})();
	
	$: animationClass = (() => {
		if (bgType !== 'gradient' || !bgAnimation?.enabled) return '';
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
		const themeConfig = $previewAppearance?.theme?.config;
		return themeConfig?.background?.particles;
	})();
	
	$: isBackgroundImage = backgroundValue.startsWith('url(');
	$: backgroundImageUrl = isBackgroundImage ? backgroundValue.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || '' : '';
	
	// Get background filters from overrides
	$: bgBlur = resolveBlur(
		$previewAppearanceState.overrides?.['backgroundBlur'] 
		?? $previewAppearance?.theme?.config?.background?.effects?.blur
	);
	$: bgBrightness = resolveBrightness(
		$previewAppearanceState.overrides?.['backgroundBrightness'] 
		?? $previewAppearance?.theme?.config?.background?.effects?.brightness
	);
	$: bgGrayscale = resolveGrayscale(
		$previewAppearanceState.overrides?.['backgroundGrayscale'] 
		?? $previewAppearance?.theme?.config?.background?.effects?.grayscale
	);
	
	// Merge preset with overrides
	$: header = (() => {
		const overrides = $previewAppearanceState.overrides || {};
		const merged: any = { ...baseHeaderPreset };
		Object.entries(overrides).forEach(([key, value]) => {
			if (key.startsWith('header.')) {
				const field = key.replace('header.', '');
				merged[field] = value;
			}
		});
		return merged;
	})();
	
	// Resolve avatar border width from preset or number
	$: avatarBorderWidth = resolveAvatarBorderWidth(header?.avatarBorderWidth);

	// Avatar size mapping
	const avatarSizes = { xs: 48, sm: 64, md: 80, lg: 96, xl: 120, full: 0 };
	$: avatarSize = header ? avatarSizes[header.avatarSize] : 80;
	$: isFullSizeAvatar = header?.avatarSize === 'full';
	
	// Smart aspect ratio calculation for full size avatars
	$: fullSizeAspectRatio = (() => {
		if (!isFullSizeAvatar) return null;
		const shape = header?.avatarShape;
		if (shape === 'circle') return '1/1'; // Square for perfect circle
		if (shape === 'oval') return '4/5'; // Slightly taller oval (more rounded)
		if (shape === 'portrait') return '3/4'; // Portrait rectangle
		if (shape === 'landscape') return '4/3'; // Landscape rectangle
		if (shape === 'rounded') return '1/1'; // Square with rounded corners
		if (shape === 'square') return '1/1'; // Perfect square
		return '1/1'; // Default to square
	})();
	
	$: avatarWidth = (() => {
		if (isFullSizeAvatar) return '100%';
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.067);
		if (header?.avatarShape === 'portrait') return Math.round(avatarSize * 0.75);
		if (header?.avatarShape === 'landscape') return Math.round(avatarSize * 1.333);
		return avatarSize;
	})();
	$: avatarHeight = (() => {
		if (isFullSizeAvatar) return 'auto';
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.333);
		if (header?.avatarShape === 'portrait') return Math.round(avatarSize * 1.333);
		if (header?.avatarShape === 'landscape') return Math.round(avatarSize * 0.75);
		return avatarSize;
	})();

	// Smart overlap position calculation for full size avatars
	$: avatarOverlapOffset = (() => {
		if (!isFullSizeAvatar || header?.avatarPosition !== 'overlap') return avatarHeight / 2;
		
		// For full size avatars, calculate offset based on aspect ratio
		// We want about 35% of the avatar to overlap below the cover
		const containerWidth = maxWidth; // Avatar width = 100% of container
		const aspectRatio = fullSizeAspectRatio?.split('/').map(Number) || [1, 1];
		const avatarHeightPx = containerWidth * (aspectRatio[1] / aspectRatio[0]);
		
		// Return 35% of avatar height for nice overlap effect
		return Math.round(avatarHeightPx * 0.35);
	})();
	
	// Cover height mapping
	const coverHeights = { sm: 120, md: 160, lg: 200 };
	$: coverHeight = header?.coverHeight ? coverHeights[header.coverHeight] : 160;
	
	function getAvatarBorderRadius(shape: string | undefined): string {
		if (shape === 'circle') return '50%';
		if (shape === 'rounded') return '20%';
		if (shape === 'oval') return '50%';
		if (shape === 'portrait') return '8%';
		if (shape === 'landscape') return '8%';
		return '0';
	}

	$: coverStyle = (() => {
		if (!header?.hasCover) return '';
		if (headerPresetId === 'avatar-cover' && $previewPage?.avatar_url) {
			return `background: url('${$previewPage.avatar_url}') center/cover;`;
		}
		const coverValue = header?.coverValue;
		if (!coverValue) return 'background: linear-gradient(135deg, #667eea, #764ba2);';
		if (coverValue.startsWith('http') || coverValue.startsWith('/')) {
			return `background: url('${coverValue}') center/cover;`;
		}
		return `background: ${coverValue};`;
	})();
	
	$: isAvatarCover = headerPresetId === 'avatar-cover';
	$: blockGap = resolveBlockGap(
		$previewAppearanceState.overrides?.['page.blockGap'] 
		?? $previewAppearance?.theme?.config?.page?.layout?.blockGap
	);
	$: blockPaddingX = $previewAppearanceState.overrides?.['page.blockPaddingX'] || 16;
	$: blockPaddingY = $previewAppearanceState.overrides?.['page.blockPaddingY'] || 12;
	$: titleFontSize = (() => {
		// Try override first
		const override = $previewAppearanceState.overrides?.['page.titleFontSize'] as number;
		if (override) return override;
		
		// Fallback to theme config
		const themeConfig = $previewAppearance?.theme?.config;
		const headingFontSizeRef = themeConfig?.semantic?.typography?.heading?.fontSize;
		if (headingFontSizeRef && typeof headingFontSizeRef === 'string' && headingFontSizeRef.startsWith('ref:tokens.typography.fontSize.')) {
			const key = headingFontSizeRef.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 20;
		}
		
		// Final fallback
		return 20;
	})();
	$: titleFontFamily = (() => {
		const override = $previewAppearanceState.overrides?.['header.titleFontFamily'] as string;
		if (override) return override;
		// Fallback to theme semantic.typography.heading.fontFamily or body font
		const themeConfig = $previewAppearance?.theme?.config;
		return themeConfig?.semantic?.typography?.heading?.fontFamily 
			|| themeConfig?.tokens?.typography?.fontFamily?.sans 
			|| 'Inter, sans-serif';
	})();
	
	// Title glow effect
	$: titleGlow = (() => {
		const themeConfig = $previewAppearance?.theme?.config;
		const glowConfig = themeConfig?.page?.defaults?.titleGlow;
		if (glowConfig?.enabled) {
			const color = glowConfig.color || tokens?.primaryColor || '#3b82f6';
			return `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`;
		}
		return 'none';
	})();
	
	// Avatar glow effect
	$: avatarGlow = (() => {
		const themeConfig = $previewAppearance?.theme?.config;
		const glowConfig = themeConfig?.page?.defaults?.avatarGlow;
		if (glowConfig?.enabled) {
			const color = glowConfig.color || tokens?.primaryColor || '#3b82f6';
			return `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`;
		}
		return 'none';
	})();
	
	$: maxWidth = resolveMaxWidth(
		$previewAppearanceState.overrides?.['page.maxWidth'] 
		?? $previewAppearance?.theme?.config?.page?.layout?.maxWidth
	);
	$: textAlign = $previewAppearanceState.overrides?.['page.textAlign'] || 'center';
	$: pagePadding = resolvePagePadding(
		$previewAppearanceState.overrides?.['page.pagePadding'] 
		?? $previewAppearance?.theme?.config?.page?.layout?.pagePadding
	);
	
	// Get font sizes with reactive tracking - inline for proper Svelte reactivity
	$: linkFontSizePx = (() => {
		const override = $previewAppearanceState.overrides?.['page.linkFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		const value = $previewAppearance?.theme?.config?.semantic?.typography?.link?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: bioFontSizePx = (() => {
		const override = $previewAppearanceState.overrides?.['page.bioFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		const value = $previewAppearance?.theme?.config?.semantic?.typography?.bio?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: subtitleFontSizePx = (() => {
		const override = $previewAppearanceState.overrides?.['page.subtitleFontSize'];
		if (override) {
			return typeof override === 'number' ? override : FONT_SIZE_TOKENS[override as keyof typeof FONT_SIZE_TOKENS] || 12;
		}
		const value = $previewAppearance?.theme?.config?.semantic?.typography?.subtitle?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 12;
		}
		return 12;
	})();
	
	$: overlayGradientColor = (() => {
		if (!isAvatarCover) return 'rgba(0, 0, 0, 0.7)';
		const bgColor = $previewAppearanceState.overrides?.['backgroundColor'];
		if (!bgColor) return 'rgba(0, 0, 0, 0.7)';
		if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			const r = parseInt(bgColor.slice(1, 3), 16);
			const g = parseInt(bgColor.slice(3, 5), 16);
			const b = parseInt(bgColor.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, 0.95)`;
		}
		return 'rgba(0, 0, 0, 0.7)';
	})();

	// Get blockBorderRadius from overrides
	$: blockBorderRadius = $previewAppearanceState.overrides?.['block.borderRadius'] 
		? `${$previewAppearanceState.overrides['block.borderRadius']}px` 
		: '12px';

	// Get linkIconShape from overrides or default
	$: linkIconShape = $previewAppearanceState.overrides?.['page.linkIconShape'] || 'rounded';
	
	// Get linkGroupLayout from overrides or default
	$: linkGroupLayout = $previewAppearanceState.overrides?.['page.linkGroupLayout'] || 'list';
	
	// Get link group configs from overrides or defaults
	$: gridConfig = (() => {
		const override = $previewAppearanceState.overrides?.['page.linkGroupConfig.grid'];
		if (override) return override;
		// Fallback to theme default or hardcoded
		return {
			columns: 2,
			aspectRatio: 'square',
			showLabels: true,
			imagePadding: false
		};
	})();
	
	$: cardConfig = (() => {
		const override = $previewAppearanceState.overrides?.['page.linkGroupConfig.cards'];
		if (override) return override;
		return {
			imagePosition: 'left',
			imageSize: 50,
			imageAspect: 'square',
			showSubtitle: true,
			imagePadding: false
		};
	})();
	
	$: listConfig = (() => {
		const override = $previewAppearanceState.overrides?.['page.linkGroupConfig.list'];
		if (override) return override;
		return {
			iconPosition: 'left',
			textAlign: textAlign,  // Fallback to global textAlign
			iconShape: linkIconShape,  // Fallback to global iconShape
			showSubtitle: true  // Default to show subtitle
		};
	})();
	
	// Get effective textAlign for list layout (list-specific or global)
	$: listTextAlign = listConfig.textAlign || textAlign;
	
	// Get socialIconPosition from overrides or default
	$: socialIconPosition = $previewAppearanceState.overrides?.['page.socialIconPosition'] || 'header';
	
	// Get socialIconColor from overrides or default
	$: socialIconColor = $previewAppearanceState.overrides?.['page.socialIconColor'] || tokens?.textColor || '#000000';
	
	// Get page settings from overrides or default
	$: showShareButton = ($previewAppearanceState.overrides?.['page.showShareButton'] as boolean) ?? true;
	$: showSubscribeButton = ($previewAppearanceState.overrides?.['page.showSubscribeButton'] as boolean) ?? true;
	
	// Calculate icon shape CSS class (use list-specific or global)
	$: iconShapeClass = linkIconShape === 'circle' ? 'rounded-full' : linkIconShape === 'rounded' ? 'rounded-lg' : '';

	// Get real links from groups (only visible groups with active links)
	$: realLinks = $groups
		.filter(g => (g.is_visible ?? 1) === 1)
		.flatMap(g => g.links.filter(l => l.is_active === 1))
		.slice(0, 5); // Limit to 5 links for preview

</script>

<!-- Phone Frame -->
<div class="relative scale-125">
	<div class="w-[280px] h-[580px] bg-gray-900 rounded-[40px] p-2 shadow-2xl">
		<div class="w-full h-full rounded-[36px] overflow-hidden relative">
			<!-- Background Layer (with filters) -->
			{#key backgroundValue}
				{#if backgroundVideoUrl}
					<!-- Video Background -->
					<video 
						src={backgroundVideoUrl}
						class="absolute inset-0 z-0 w-full h-full object-cover"
						autoplay
						loop
						muted
						playsinline
						on:timeupdate={handleVideoTimeUpdate}
						style="filter: blur({bgBlur}px) brightness({bgBrightness / 100}) grayscale({bgGrayscale / 100});"
					></video>
				{:else}
					<!-- Image or Color Background -->
					<div 
						class="absolute inset-0 z-0 {animationClass}"
						style="{isBackgroundImage 
							? `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; filter: blur(${bgBlur}px) brightness(${bgBrightness / 100}) grayscale(${bgGrayscale / 100});`
							: bgType === 'gradient' && bgAnimation?.enabled
								? `background-image: ${backgroundValue}; background-size: 200% 200%;`
								: `background: ${backgroundValue};`
						}"
					></div>
				{/if}
			{/key}
			
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
				class="w-full h-full overflow-y-auto scrollbar-hide phone-content relative z-10 {animationClass}"
				style="
					color: {tokens?.textColor || '#000000'};
					font-family: {tokens?.fontFamily || 'Inter'}, sans-serif;
					max-width: {maxWidth}px;
					margin: 0 auto;
				"
			>
				<!-- Share & Subscribe Buttons -->
				{#if showShareButton || showSubscribeButton}
					<div class="absolute top-2 left-0 right-0 z-20 flex items-center justify-between px-2">
						<!-- Subscribe Button (Left) -->
						{#if showSubscribeButton}
							<button
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

				<div class="pt-10 pb-8" style="padding-left: {pagePadding}px; padding-right: {pagePadding}px; text-align: {textAlign};">
					<!-- Header with Cover -->
					{#if header?.hasCover}
						<div class="relative -mx-4 -mt-10 mb-3 header-cover">
							<div 
								class="w-full relative"
								style="{coverStyle} height: {coverHeight}px;"
							>
								{#if isAvatarCover}
									<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 0%, transparent 30%, {overlayGradientColor} 100%);"></div>
									<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);"></div>
									<div class="absolute bottom-6 left-0 right-0 z-20 text-center px-4">
										<h1 class="font-bold text-white drop-shadow-lg" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$previewPage?.title || 'Your Name'}</h1>
										{#if header.showBio && $previewPage?.bio}
											<p class="bio-text text-white/90 mt-2 drop-shadow-md" style="font-size: {bioFontSizePx}px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: {header.bioMaxLines}; -webkit-box-orient: vertical; overflow: hidden;">
												{$previewPage.bio}
											</p>
										{/if}
									</div>
								{/if}
							</div>
							
							{#if header.avatarPosition === 'overlap' && !isAvatarCover}
								<div class="absolute left-1/2 -translate-x-1/2" style="bottom: -{avatarOverlapOffset}px;">
									{#if $previewPage?.avatar_url}
										<img 
											src={$previewPage.avatar_url} 
											alt="Avatar" 
											class="header-avatar object-cover {isFullSizeAvatar ? 'w-full' : ''}"
											style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} {header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header.avatarShape)}; box-shadow: {avatarGlow};"
										/>
									{:else}
										<div 
											class="header-avatar flex items-center justify-center text-white font-bold {isFullSizeAvatar ? 'w-full' : ''}"
											style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} background: {tokens?.primaryColor || '#3b82f6'}; {header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header.avatarShape)}; font-size: {isFullSizeAvatar ? '48px' : `${avatarSize / 2.5}px`}; box-shadow: {avatarGlow};"
										>
											{($previewPage?.title || 'U').charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
							{/if}
						</div>
						
						{#if !isAvatarCover}
							<div class="header-content" style="margin-top: {header.avatarPosition === 'overlap' ? avatarOverlapOffset + 8 : 0}px; text-align: {header.contentAlign};">
								<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$previewPage?.title || 'Your Name'}</h1>
								{#if header.showBio && $previewPage?.bio}
									<p class="bio-text mt-1" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {bioFontSizePx}px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: {header.bioMaxLines}; -webkit-box-orient: vertical; overflow: hidden;">
										{$previewPage.bio}
									</p>
								{/if}
							</div>
						{/if}
					{:else}
						<!-- No Cover -->
						{#if header?.avatarPosition === 'split-left'}
							<!-- Split Screen Layout -->
							<div class="flex gap-4" style="text-align: left;">
								<!-- Avatar Section (40% width) -->
								<div class="flex-shrink-0" style="width: 40%;">
									<div class="w-full aspect-square">
										{#if $previewPage?.avatar_url}
											<img 
												src={$previewPage.avatar_url} 
												alt="Avatar" 
												class="w-full h-full object-cover"
												style="{header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: 20%; box-shadow: {avatarGlow};"
											/>
										{:else}
											<div 
												class="w-full h-full flex items-center justify-center text-white font-bold"
												style="background: {tokens?.primaryColor || '#3b82f6'}; {header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: 20%; font-size: {avatarSize / 2}px; box-shadow: {avatarGlow};"
											>
												{($previewPage?.title || 'U').charAt(0).toUpperCase()}
											</div>
										{/if}
									</div>
								</div>
								
								<!-- Content Section (60% width) -->
								<div class="flex-1 flex flex-col justify-center min-w-0">
									<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow}; text-align: left;">{$previewPage?.title || 'Your Name'}</h1>
									{#if header.showBio && $previewPage?.bio}
										<p class="bio-text mt-1" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {bioFontSizePx}px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: {header.bioMaxLines}; -webkit-box-orient: vertical; overflow: hidden; text-align: left;">
											{$previewPage.bio}
										</p>
									{/if}
								</div>
							</div>
						{:else if header?.avatarPosition === 'inline-left'}
							<!-- Minimal Compact Layout -->
							<div class="flex items-start gap-2" style="text-align: left; {isFullSizeAvatar ? 'flex-direction: column;' : ''}">
								<!-- Avatar -->
								<div class="{isFullSizeAvatar ? 'w-full' : 'flex-shrink-0'}">
									{#if $previewPage?.avatar_url}
										<img 
											src={$previewPage.avatar_url} 
											alt="Avatar" 
											class="header-avatar object-cover {isFullSizeAvatar ? 'w-full' : ''}"
											style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} {header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header.avatarShape)}; box-shadow: {avatarGlow};"
										/>
									{:else}
										<div 
											class="header-avatar flex items-center justify-center text-white font-bold {isFullSizeAvatar ? 'w-full' : ''}"
											style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} background: {tokens?.primaryColor || '#3b82f6'}; {header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header.avatarShape)}; font-size: {isFullSizeAvatar ? '48px' : `${avatarSize / 2.5}px`}; box-shadow: {avatarGlow};"
										>
											{($previewPage?.title || 'U').charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
								
								<!-- Text Content -->
								<div class="flex-1 min-w-0">
									<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow}; text-align: left;">{$previewPage?.title || 'Your Name'}</h1>
									{#if header.showBio && $previewPage?.bio}
										<p class="bio-text mt-0.5" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {bioFontSizePx}px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: {header.bioMaxLines}; -webkit-box-orient: vertical; overflow: hidden; text-align: left;">
											{$previewPage.bio}
										</p>
									{/if}
								</div>
							</div>
						{:else}
							<!-- Center Layout -->
							<div class="header-content" style="display: flex; flex-direction: column; align-items: {header?.contentAlign === 'left' ? 'flex-start' : 'center'}; text-align: {header?.contentAlign || 'center'};">
								{#if $previewPage?.avatar_url}
									<img 
										src={$previewPage.avatar_url} 
										alt="Avatar" 
										class="header-avatar object-cover mb-2 {isFullSizeAvatar ? 'w-full' : ''}"
										style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} {header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header?.avatarShape)}; box-shadow: {avatarGlow};"
									/>
								{:else}
									<div 
										class="header-avatar mb-2 flex items-center justify-center text-white font-bold {isFullSizeAvatar ? 'w-full' : ''}"
										style="{isFullSizeAvatar ? `width: 100%; aspect-ratio: ${fullSizeAspectRatio};` : `width: ${avatarWidth}px; height: ${avatarHeight}px;`} background: {tokens?.primaryColor || '#3b82f6'}; {header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''} border-radius: {getAvatarBorderRadius(header?.avatarShape)}; font-size: {isFullSizeAvatar ? '48px' : `${avatarSize / 2.5}px`}; box-shadow: {avatarGlow};"
									>
										{($previewPage?.title || 'U').charAt(0).toUpperCase()}
									</div>
								{/if}
								<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">{$previewPage?.title || 'Your Name'}</h1>
								{#if header?.showBio && $previewPage?.bio}
									<p class="bio-text mt-1" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {bioFontSizePx}px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: {header.bioMaxLines}; -webkit-box-orient: vertical; overflow: hidden;">
										{$previewPage.bio}
									</p>
								{/if}
							</div>
						{/if}
					{/if}

					<!-- Social Icons (Header Position) -->
					{#if $previewPage?.show_social_icons && $previewPage?.social_links && socialIconPosition === 'header'}
						<div class="flex items-center gap-3 mt-1.5" style="justify-content: {header?.avatarPosition === 'inline-left' || header?.avatarPosition === 'split-left' ? 'flex-start' : 'center'};">
							{#if $previewPage.social_links.instagram}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
										<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
										<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
									</svg>
								</div>
							{/if}
							{#if $previewPage.social_links.twitter}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
									</svg>
								</div>
							{/if}
							{#if $previewPage.social_links.linkedin}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Links - với negative margin và gradient mask cho avatar-cover -->
					<div 
						class="relative"
						style="display: flex; flex-direction: column; gap: {blockGap}px; {isAvatarCover ? `margin-top: -60px; padding-top: 80px;` : 'margin-top: 24px;'}"
					>
						<!-- Gradient mask - nối liền với overlay trên avatar -->
						{#if isAvatarCover}
							<div 
								class="absolute pointer-events-none z-10 -mx-4"
								style="left: 0; right: 0; top: -24px; height: 60px; background: linear-gradient(to bottom, transparent 0%, {backgroundValue || '#ffffff'} 100%);"
							></div>
						{/if}
						
						{#if linkGroupLayout === 'grid'}
							<!-- Grid Layout -->
							{@const gridPadding = 4}
							{@const gridGap = gridConfig.columns >= 3 ? 2 : blockGap}
							
							<!-- Responsive font size calculation -->
							{@const fontSize = gridConfig.columns === 1 ? `${linkFontSizePx}px` 
								: gridConfig.columns === 2 ? `${linkFontSizePx * 0.7}px`
								: gridConfig.columns === 3 ? `${linkFontSizePx * 0.5}px`
								: `${linkFontSizePx * 0.4}px`}
							
							<!-- Responsive border radius -->
							{@const borderRadius = gridConfig.columns >= 3 ? '6px' : blockBorderRadius}
							{@const blockRadiusNum = parseInt(borderRadius)}
							{@const imageBorderRadius = gridConfig.imagePadding ? borderRadius : `${Math.max(0, blockRadiusNum - 4)}px`}
							<div style="display: grid; grid-template-columns: repeat({gridConfig.columns}, 1fr); gap: {gridGap}px;">
								{#each realLinks as link}
									{@const headline = link.title.split(' - ')[0]}
									{@const hasImage = !!link.icon_url}
									{@const showImageOnly = hasImage && !gridConfig.imagePadding && !gridConfig.showLabels}
									{@const imageRadius = gridConfig.imagePadding 
										? imageBorderRadius 
										: gridConfig.showLabels 
											? `${borderRadius} ${borderRadius} 0 0` 
											: borderRadius}
									{@const aspectClass = gridConfig.aspectRatio === 'portrait' ? 'aspect-[3/4]' : gridConfig.aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-square'}
									
									<div
										class="link-button font-medium transition-transform hover:scale-[1.02] {gridConfig.imagePadding || gridConfig.showLabels ? 'flex flex-col items-center justify-center' : 'overflow-hidden'}"
										style="
											background: {showImageOnly ? 'transparent' : ($previewAppearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6')};
											color: {$previewAppearance?.blockStyle?.text || 'white'};
											border: {$previewAppearance?.blockStyle?.border || 'none'};
											box-shadow: {$previewAppearance?.blockStyle?.glow ? `0 0 20px ${$previewAppearance.blockStyle.glow}` : ($previewAppearance?.blockStyle?.shadow || 'none')};
											backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											-webkit-backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											border-radius: {borderRadius};
											padding: {gridConfig.imagePadding ? `${gridPadding}px` : '0'};
											font-size: {fontSize};
											line-height: 1.2;
										"
									>
										{#if hasImage}
											<img 
												src={link.icon_url} 
												alt="" 
												class="w-full object-cover {iconShapeClass} {aspectClass} {showImageOnly ? 'h-full' : ''}"
												style="border-radius: {imageRadius};"
											/>
										{/if}
										{#if gridConfig.showLabels}
											<div class="font-semibold leading-tight truncate w-full text-center" style="margin-top: 4px; padding: {gridConfig.imagePadding ? '0' : '0 4px 4px 4px'};">{headline}</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else if linkGroupLayout === 'cards'}
							<!-- Card Layout -->
							{@const cardPadding = 4}
							{@const blockRadiusNum = parseInt(blockBorderRadius)}
							{@const imageBorderRadius = cardConfig.imagePadding ? blockBorderRadius : `${Math.max(0, blockRadiusNum - cardPadding)}px`}
							<div style="display: flex; flex-direction: column; gap: {blockGap}px;">
								{#each realLinks as link, index}
									{@const parts = link.title.split(' - ')}
									{@const headline = parts[0]}
									{@const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : null}
									{@const position = cardConfig.imagePosition === 'alternate' 
										? (index % 2 === 0 ? 'left' : 'right')
										: cardConfig.imagePosition}
									{@const imageRadius = cardConfig.imagePadding 
										? imageBorderRadius 
										: position === 'right'
											? `0 ${blockBorderRadius} ${blockBorderRadius} 0`
											: `${blockBorderRadius} 0 0 ${blockBorderRadius}`}
									
									<div
										class="link-button block font-medium transition-transform hover:scale-[1.02] {cardConfig.imagePadding ? '' : 'overflow-hidden'}"
										style="
											background: {$previewAppearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
											color: {$previewAppearance?.blockStyle?.text || 'white'};
											border: {$previewAppearance?.blockStyle?.border || 'none'};
											box-shadow: {$previewAppearance?.blockStyle?.glow ? `0 0 20px ${$previewAppearance.blockStyle.glow}` : ($previewAppearance?.blockStyle?.shadow || 'none')};
											backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											-webkit-backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											border-radius: {blockBorderRadius};
											padding: {cardConfig.imagePadding ? `${cardPadding}px` : '0'};
											display: flex;
											align-items: center;
											gap: {cardConfig.imagePadding ? `${cardPadding}px` : '0'};
											flex-direction: {position === 'right' ? 'row-reverse' : 'row'};
											font-size: {linkFontSizePx}px;
										"
									>
										{#if link.icon_url}
											<img 
												src={link.icon_url} 
												alt="" 
												class="object-cover flex-shrink-0 {iconShapeClass}"
												style="
													width: {cardConfig.imageSize}%;
													aspect-ratio: {cardConfig.imageAspect === 'square' ? '1' : cardConfig.imageAspect === 'portrait' ? '3/4' : '4/3'};
													border-radius: {imageRadius};
												"
											/>
										{/if}
										<div class="flex-1 min-w-0" style="padding: {cardConfig.imagePadding ? '0' : `${blockPaddingY}px ${blockPaddingX}px`};">
											<div class="font-semibold leading-tight truncate" style="font-size: {linkFontSizePx}px;">{headline}</div>
											{#if subtitle && cardConfig.showSubtitle}
												<div class="mt-0.5 opacity-70 truncate" style="font-size: {subtitleFontSizePx}px;">{subtitle}</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<!-- List Layout (default) -->
							{@const listIconShapeClass = (listConfig.iconShape || linkIconShape) === 'circle' ? 'rounded-full' : (listConfig.iconShape || linkIconShape) === 'rounded' ? 'rounded-lg' : ''}
							{@const showIcon = listConfig.iconPosition !== 'none'}
							{@const iconOnTop = listConfig.iconPosition === 'top'}
							
							<div style="display: flex; flex-direction: column; gap: {blockGap}px;">
								{#each realLinks as link}
									{@const parts = link.title.split(' - ')}
									{@const headline = parts[0]}
									{@const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : null}
									
									<div
										class="link-button block text-sm font-medium transition-transform hover:scale-[1.02]"
										style="
											background: {$previewAppearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
											color: {$previewAppearance?.blockStyle?.text || 'white'};
											border: {$previewAppearance?.blockStyle?.border || 'none'};
											box-shadow: {$previewAppearance?.blockStyle?.glow ? `0 0 20px ${$previewAppearance.blockStyle.glow}` : ($previewAppearance?.blockStyle?.shadow || 'none')};
											backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											-webkit-backdrop-filter: {$previewAppearance?.blockStyle?.blur ? `blur(${$previewAppearance.blockStyle.blur}px)` : 'none'};
											border-radius: {blockBorderRadius};
											padding: {blockPaddingY}px {blockPaddingX}px;
											text-align: {listTextAlign};
											font-size: {linkFontSizePx}px;
										"
									>
										{#if showIcon && link.icon_url && iconOnTop}
											<!-- Icon on top -->
											<div class="flex flex-col items-center gap-2">
												<img 
													src={link.icon_url} 
													alt="" 
													class="w-10 h-10 object-cover {listIconShapeClass}"
												/>
												<div>
													<div class="font-semibold">{headline}</div>
													{#if subtitle && listConfig.showSubtitle}
														<div class="text-xs mt-0.5" style="color: {tokens?.mutedTextColor || '#71717a'};">{subtitle}</div>
													{/if}
												</div>
											</div>
										{:else if showIcon && link.icon_url}
											<!-- Icon on left -->
											<div class="flex items-center gap-3" style="justify-content: {listTextAlign === 'right' ? 'flex-end' : listTextAlign === 'center' ? 'center' : 'flex-start'};">
												<img 
													src={link.icon_url} 
													alt="" 
													class="w-8 h-8 object-cover flex-shrink-0 {listIconShapeClass}"
												/>
												<div class="flex-1" style="text-align: {listTextAlign};">
													<div class="font-semibold">{headline}</div>
													{#if subtitle && listConfig.showSubtitle}
														<div class="mt-0.5" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {subtitleFontSizePx}px;">{subtitle}</div>
													{/if}
												</div>
											</div>
										{:else}
											<!-- No icon or icon hidden -->
											<div style="text-align: {listTextAlign};">
												<div class="font-semibold">{headline}</div>
												{#if subtitle && listConfig.showSubtitle}
													<div class="mt-0.5" style="color: {tokens?.mutedTextColor || '#71717a'}; font-size: {subtitleFontSizePx}px;">{subtitle}</div>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Social Icons (Footer Position) -->
					{#if $previewPage?.show_social_icons && $previewPage?.social_links && socialIconPosition === 'footer'}
						<div class="flex items-center justify-center gap-3 mt-6">
							{#if $previewPage.social_links.instagram}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
										<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
										<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
									</svg>
								</div>
							{/if}
							{#if $previewPage.social_links.twitter}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
									</svg>
								</div>
							{/if}
							{#if $previewPage.social_links.linkedin}
								<div class="hover:scale-110 transition-transform" style="color: {socialIconColor};">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Footer -->
					<div class="mt-8 mb-6 text-center">
						<p class="text-xs" style="color: {tokens?.mutedTextColor || '#71717a'};">Made with Bio Link</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

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

	/* Animation Classes */
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
