<script lang="ts">
	import { page, groups } from '$lib/stores/page';
	import { publicAppearance } from '$lib/stores/publicAppearance';
	import { getIconUrl, getIconClasses } from '$lib/utils/iconUtils';
	import { resolvePagePadding, resolveAvatarBorderWidth, resolveSocialIconSize } from '$lib/appearance/spacingTokens';
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	import { resolveBlur, resolveBrightness, resolveGrayscale } from '$lib/appearance/effectsTokens';
	import ParticlesLayer from '$lib/components/effects/ParticlesLayer.svelte';

	// Get resolved appearance
	$: tokens = $publicAppearance?.tokens || {};
	$: header = $publicAppearance?.header || {};
	$: blockStyle = $publicAppearance?.blockStyle || {};
	$: blockConfig = $publicAppearance?.block || {};
	
	// Background
	$: bgType = $publicAppearance?.theme?.config?.background?.type;
	$: bgValue = $publicAppearance?.theme?.config?.background?.value;
	$: bgAnimation = $publicAppearance?.theme?.config?.background?.animation;
	$: particles = $publicAppearance?.theme?.config?.background?.particles;
	
	$: resolvedBackground = (() => {
		if (bgType && bgValue) {
			if (bgType === 'solid') return bgValue;
			if (bgType === 'gradient') return bgValue;
			if (bgType === 'pattern') return bgValue;
			if (bgType === 'image') return `url('${bgValue}')`;
			if (bgType === 'video') return '#000000';
		}
		return tokens?.backgroundColor || '#ffffff';
	})();

	// Background filters - match PhoneMockup format
	$: backgroundFilters = (() => {
		const themeConfig = $publicAppearance?.theme?.config;
		const blur = resolveBlur(themeConfig?.background?.blur);
		const brightness = resolveBrightness(themeConfig?.background?.brightness);
		const grayscale = resolveGrayscale(themeConfig?.background?.grayscale);
		return `blur(${blur}px) brightness(${brightness / 100}) grayscale(${grayscale / 100})`;
	})();

	// Animation class for gradient
	$: bgGradientDirection = (() => {
		const themeConfig = $publicAppearance?.theme?.config;
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

	// Typography
	$: titleFontSize = (() => {
		const value = $publicAppearance?.theme?.config?.semantic?.typography?.heading?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 20;
		}
		return 20;
	})();
	
	$: bioFontSizePx = (() => {
		const value = $publicAppearance?.theme?.config?.semantic?.typography?.bio?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: linkFontSizePx = (() => {
		const value = $publicAppearance?.theme?.config?.semantic?.typography?.link?.fontSize;
		if (value?.startsWith?.('ref:tokens.typography.fontSize.')) {
			const key = value.replace('ref:tokens.typography.fontSize.', '');
			return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS] || 14;
		}
		return 14;
	})();
	
	$: titleFontFamily = (() => {
		const themeConfig = $publicAppearance?.theme?.config;
		const fontFamily = themeConfig?.semantic?.typography?.heading?.fontFamily 
			|| themeConfig?.tokens?.typography?.fontFamily?.sans 
			|| tokens?.fontFamily
			|| 'Inter, sans-serif';
		
		// Ensure font family has fallback
		return fontFamily.includes(',') ? fontFamily : `${fontFamily}, sans-serif`;
	})();
	
	// Spacing
	$: pagePadding = resolvePagePadding(tokens?.pagePadding);
	$: maxWidth = $publicAppearance?.page?.maxWidth || 480;
	$: textAlign = $publicAppearance?.page?.textAlign || 'center';
	$: avatarBorderWidth = resolveAvatarBorderWidth(header?.avatarBorderWidth);
	$: socialIconSizePx = resolveSocialIconSize(header?.socialIconSize);
	
	// Avatar - use same sizes as PhoneMockup
	$: avatarSize = (() => {
		const sizes = { xs: 80, sm: 96, md: 112, lg: 128, xl: 144, '2xl': 160, '3xl': 176 };
		return sizes[header?.avatarSize || 'md'] || 112;
	})();
	
	// Avatar dimensions - handle oval shape
	$: avatarWidth = (() => {
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.067);
		return avatarSize;
	})();
	$: avatarHeight = (() => {
		if (header?.avatarShape === 'oval') return Math.round(avatarSize * 1.333);
		return avatarSize;
	})();
	
	// Avatar border radius - match PhoneMockup
	$: getAvatarBorderRadius = (shape: string | undefined): string => {
		if (shape === 'circle' || shape === 'oval') return '50%';
		if (shape === 'rounded') return '12%';  // Percentage, not pixels
		return '0';
	};

	// Cover
	$: coverImageUrl = header?.coverImageUrl;
	$: coverHeight = header?.coverHeight || 120;
	$: isAvatarCover = header?.preset === 'avatar-cover';
	$: avatarOverlapOffset = avatarSize / 2;
	
	$: coverStyle = (() => {
		if (!coverImageUrl) {
			return `background: linear-gradient(135deg, ${tokens?.primaryColor || '#3b82f6'} 0%, ${tokens?.primaryColor || '#3b82f6'}dd 100%);`;
		}
		return `background: url('${coverImageUrl}') center/cover no-repeat;`;
	})();

	// Social icons
	$: socialIconsEnabled = header?.socialIconsEnabled ?? true;
	$: socialIconPosition = header?.socialIconPosition || 'header';
	$: socialIconColor = header?.socialIconColor || tokens?.mutedTextColor || '#71717a';
	
	// Glow effects
	$: titleGlow = header?.titleGlowEnabled 
		? `0 0 20px ${header?.titleGlowColor || tokens?.primaryColor || '#3b82f6'}80`
		: 'none';
	$: avatarGlow = header?.avatarGlowEnabled
		? `0 0 30px ${header?.avatarGlowColor || tokens?.primaryColor || '#3b82f6'}80`
		: 'none';

	// Icon thumbnail color
	$: iconThumbnailColor = (() => {
		const themeConfig = $publicAppearance?.theme?.config;
		return themeConfig?.semantic?.color?.icon?.thumbnail || tokens?.textColor || '#000000';
	})();

	// Icon shape
	$: linkIconShape = $publicAppearance?.page?.linkIconShape || 'rounded';
	$: iconShapeClass = linkIconShape === 'circle' ? 'rounded-full' : linkIconShape === 'rounded' ? 'rounded-lg' : '';

	// Visible groups and links
	$: visibleGroups = $groups.filter(g => (g.is_visible ?? 1) === 1);
	
	// Extract font name for Google Fonts
	$: fontName = (() => {
		const firstFont = titleFontFamily.split(',')[0].trim().replace(/['"]/g, '');
		// Skip web-safe fonts
		const webSafeFonts = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'sans-serif', 'serif', 'monospace'];
		return webSafeFonts.includes(firstFont) ? null : firstFont;
	})();
	
	// Google Fonts URL
	$: googleFontsUrl = fontName ? `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap` : null;

</script>

<svelte:head>
	<title>{$page?.title || 'Bio Page'}</title>
	{#if googleFontsUrl}
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
		<link href={googleFontsUrl} rel="stylesheet" />
	{/if}
</svelte:head>

<div 
	class="min-h-screen relative overflow-hidden"
	style="
		font-family: {tokens?.fontFamily || 'Inter'}, sans-serif;
		color: {tokens?.textColor || '#000000'};
		{(() => {
			const isImage = bgType === 'image';
			const isAnimatedGradient = bgType === 'gradient' && bgAnimation?.enabled;
			const isPattern = bgType === 'pattern';
			
			// Solid, static gradient render directly on container
			if (!isImage && !isAnimatedGradient && !isPattern) {
				return `background: ${resolvedBackground};`;
			}
			return '';
		})()}
	"
>
	<!-- Background Layer (for image, animated gradient, pattern) -->
	{#if bgType === 'image' && bgValue}
		<div 
			class="fixed inset-0 z-0"
			style="
				background: url('{bgValue}') center/cover no-repeat;
				filter: {backgroundFilters};
			"
		></div>
	{:else if bgType === 'gradient' && bgAnimation?.enabled}
		<div 
			class="fixed inset-0 z-0 {animationClass}"
			style="background-image: {resolvedBackground}; background-size: 200% 200%;"
		></div>
	{:else if bgType === 'pattern'}
		<div 
			class="fixed inset-0 z-0"
			style="{resolvedBackground}"
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
	<div class="relative z-10 mx-auto" style="max-width: {maxWidth}px; padding: {pagePadding}px; text-align: {textAlign};">
		<!-- Header with Cover -->
		{#if header?.hasCover}
			<div class="relative -mx-4 mb-6">
				<!-- Cover Image/Gradient -->
				<div 
					class="w-full relative"
					style="{coverStyle} height: {coverHeight}px; border-radius: 0;"
				>
					<!-- Text overlay for avatar-cover -->
					{#if isAvatarCover}
						<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.5) 100%);"></div>
						<div class="absolute bottom-4 left-0 right-0 text-center px-4">
							<h1 class="font-bold text-white drop-shadow-lg" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">
								{$page?.title || 'Your Name'}
							</h1>
							{#if header.showBio && $page?.bio}
								<p 
									class="text-white/90 mt-2 drop-shadow-md"
									style="font-size: {bioFontSizePx}px; line-height: 1.5;"
								>
									{$page.bio}
								</p>
							{/if}
						</div>
					{/if}
				</div>
				
				<!-- Avatar (Overlapping) -->
				{#if header.avatarPosition === 'overlap' && !isAvatarCover}
					<div class="absolute left-1/2 -translate-x-1/2" style="bottom: -{avatarOverlapOffset}px;">
						{#if $page?.avatar_url}
							<img 
								src={$page.avatar_url} 
								alt="Avatar" 
								class="object-cover"
								style="
									width: {avatarWidth}px;
									height: {avatarHeight}px;
									border: {avatarBorderWidth}px solid {header.avatarBorderColor || '#ffffff'};
									border-radius: {getAvatarBorderRadius(header.avatarShape)};
									box-shadow: {avatarGlow};
								"
							/>
						{:else}
							<div 
								class="flex items-center justify-center text-white font-bold"
								style="
									width: {avatarWidth}px;
									height: {avatarHeight}px;
									background: {tokens?.primaryColor || '#3b82f6'};
									border: {avatarBorderWidth}px solid {header.avatarBorderColor || '#ffffff'};
									border-radius: {getAvatarBorderRadius(header.avatarShape)};
									font-size: {avatarSize / 2.5}px;
									box-shadow: {avatarGlow};
								"
							>
								{($page?.title || 'U').charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
				{/if}
			</div>
			
			<!-- Content below cover -->
			{#if !isAvatarCover}
				<div class="text-center" style="margin-top: {header.avatarPosition === 'overlap' ? avatarOverlapOffset + 8 : 0}px;">
					<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">
						{$page?.title || 'Your Name'}
					</h1>
					{#if header.showBio && $page?.bio}
						<p 
							class="mt-1"
							style="
								color: {tokens?.mutedTextColor || '#71717a'};
								font-size: {bioFontSizePx}px;
								line-height: 1.5;
							"
						>
							{$page.bio}
						</p>
					{/if}
				</div>
			{/if}
		{:else}
			<!-- No Cover - Center Layout -->
			<div class="text-center">
				{#if $page?.avatar_url}
					<img 
						src={$page.avatar_url} 
						alt="Avatar" 
						class="object-cover mx-auto mb-2"
						style="
							width: {avatarWidth}px;
							height: {avatarHeight}px;
							border: {avatarBorderWidth}px solid {header?.avatarBorderColor || '#ffffff'};
							border-radius: {getAvatarBorderRadius(header?.avatarShape)};
							box-shadow: {avatarGlow};
						"
					/>
				{:else}
					<div 
						class="flex items-center justify-center text-white font-bold mx-auto mb-2"
						style="
							width: {avatarWidth}px;
							height: {avatarHeight}px;
							background: {tokens?.primaryColor || '#3b82f6'};
							border: {avatarBorderWidth}px solid {header?.avatarBorderColor || '#ffffff'};
							border-radius: {getAvatarBorderRadius(header?.avatarShape)};
							font-size: {avatarSize / 2.5}px;
							box-shadow: {avatarGlow};
						"
					>
						{($page?.title || 'U').charAt(0).toUpperCase()}
					</div>
				{/if}
				<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow};">
					{$page?.title || 'Your Name'}
				</h1>
				{#if header?.showBio && $page?.bio}
					<p 
						class="mt-1"
						style="
							color: {tokens?.mutedTextColor || '#71717a'};
							font-size: {bioFontSizePx}px;
							line-height: 1.5;
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
				<div class="flex items-center gap-3 justify-center mt-1.5 mb-6">
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

		<!-- Links -->
		<div class="flex flex-col" style="gap: {$publicAppearance?.page?.blockGap || 16}px; margin-top: 24px;">
			{#each visibleGroups as group}
				{#each group.links.filter(l => l.is_active === 1) as link}
					{@const iconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || link.icon_url || null, link.icon_color || iconThumbnailColor)}
					{@const iconClasses = getIconClasses(link.icon_type || 'none', 'list-left', `w-8 h-8 flex-shrink-0 ${iconShapeClass}`)}
					{@const paddingX = blockConfig?.padding?.x ?? 16}
					{@const paddingY = blockConfig?.padding?.y ?? 12}
					{@const borderRadius = blockConfig?.borderRadius ?? 12}
					{@const justifyContent = textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start'}
					<a
						href={link.url}
						target={link.open_in_new_tab ? '_blank' : '_self'}
						rel="noopener noreferrer"
						class="block transition-all hover:scale-[1.02] hover:opacity-90"
						style="
							background: {blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
							color: {blockStyle?.text || '#ffffff'};
							padding: {paddingY}px {paddingX}px;
							border-radius: {borderRadius}px;
							border: {blockStyle?.border || 'none'};
							box-shadow: {blockStyle?.shadow || 'none'};
							{blockStyle?.blur ? `backdrop-filter: blur(${blockStyle.blur}px); -webkit-backdrop-filter: blur(${blockStyle.blur}px);` : ''}
							text-align: {textAlign};
						"
					>
						<div class="flex items-center gap-3" style="justify-content: {justifyContent};">
							{#if iconUrl}
								<img src={iconUrl} alt="" class="{iconClasses}" />
							{/if}
							<span class="font-semibold flex-1" style="font-size: {linkFontSizePx}px; text-align: {textAlign};">{link.title}</span>
						</div>
					</a>
				{/each}
			{/each}
		</div>

		<!-- Social Icons (Footer Position) -->
		{#if socialIconsEnabled && $page?.show_social_icons && $page?.social_links && socialIconPosition === 'footer'}
			{@const socialLinks = $page.social_links}
			{@const hasSocialLinks = Object.values(socialLinks).some(link => link && link.trim())}
			
			{#if hasSocialLinks}
				<div class="flex items-center gap-3 justify-center mt-6">
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
</div>

<style>
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
