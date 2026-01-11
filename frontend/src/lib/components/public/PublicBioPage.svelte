<script lang="ts">
	import { page, groups, blocks } from '$lib/stores/page';
	import { publicAppearance } from '$lib/stores/publicAppearance';
	import { getIconUrl, getIconClasses } from '$lib/utils/iconUtils';
	import ImageBlockRenderer from './ImageBlockRenderer.svelte';
	import VideoBlockRenderer from './VideoBlockRenderer.svelte';
	import TextBlockRenderer from './TextBlockRenderer.svelte';
	import type { ImageBlockContent, VideoBlockContent } from '$lib/types';
	import { resolvePagePadding, resolveAvatarBorderWidth, resolveSocialIconSize } from '$lib/appearance/spacingTokens';
	import { FONT_SIZE_TOKENS } from '$lib/appearance/typographyTokens';
	import { resolveBlur, resolveBrightness, resolveGrayscale } from '$lib/appearance/effectsTokens';
	import ParticlesLayer from '$lib/components/effects/ParticlesLayer.svelte';
	import LockModal from '$lib/components/modals/LockModal.svelte';
	import SubscribeModal from '$lib/components/modals/SubscribeModal.svelte';
	import { api } from '$lib/api.client';
	import type { Link } from '$lib/types';
	import { isFuture, formatCountdownWithLabels } from '$lib/utils/dateUtils';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';

	// Lock modal state
	let lockModalOpen = false;
	let currentLockedLink: Link | null = null;
	let lockModalRef: LockModal;

	// Session storage for verified links (in-memory for now)
	let verifiedLinks = new Set<number>();

	// Countdown state
	let countdowns: Record<number, string> = {};
	let countdownInterval: number | null = null;
	
	// Track which links are still scheduled (reactive)
	let scheduledLinkIds = new Set<number>();
	
	// Update countdowns every second
	function updateCountdowns() {
		const newCountdowns: Record<number, string> = {};
		const newScheduledIds = new Set<number>();
		
		$groups.forEach(group => {
			group.links.forEach(link => {
				if (link.scheduled_at && isFuture(link.scheduled_at)) {
					const formatted = formatCountdownWithLabels(link.scheduled_at);
					newCountdowns[link.id] = formatted.display;
					newScheduledIds.add(link.id);
				}
			});
		});
		
		countdowns = newCountdowns;
		scheduledLinkIds = newScheduledIds;
	}
	
	// Start countdown interval when component mounts (client-side only)
	onMount(() => {
		if ($groups.length > 0) {
			updateCountdowns();
			countdownInterval = window.setInterval(updateCountdowns, 1000);
		}
		
		// Return cleanup function
		return () => {
			if (countdownInterval) {
				clearInterval(countdownInterval);
				countdownInterval = null;
			}
		};
	});
	
	// Also cleanup on destroy
	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});

	// Handle link click
	function handleLinkClick(e: MouseEvent, link: Link) {
		// Check if link is scheduled and not yet active
		if (link.scheduled_at && isFuture(link.scheduled_at)) {
			e.preventDefault();
			return; // Link is not yet active
		}
		
		// Check if link has lock
		if (link.lock_type && link.lock_type !== 'none' && link.lock_value) {
			// Check if already verified in this session
			if (!verifiedLinks.has(link.id)) {
				e.preventDefault();
				currentLockedLink = link;
				lockModalOpen = true;
				return;
			}
		}
		
		// No lock or already verified - let browser handle navigation
	}

	// Handle lock verification
	async function handleVerifyLock(event: CustomEvent<{ value: string }>) {
		if (!currentLockedLink) return;

		lockModalRef.setVerifying(true);

		try {
			const result = await api.verifyLinkLock(currentLockedLink.id, event.detail.value);
			
			if (result.success && result.url) {
				// Add to verified set
				verifiedLinks.add(currentLockedLink.id);
				
				// Save link info before closing modal
				const shouldOpenInNewTab = currentLockedLink.open_in_new_tab === 1;
				const targetUrl = result.url;
				
				// Close modal
				lockModalOpen = false;
				currentLockedLink = null;
				
				// Redirect to URL
				if (shouldOpenInNewTab) {
					window.open(targetUrl, '_blank', 'noopener,noreferrer');
				} else {
					window.location.href = targetUrl;
				}
			} else {
				// Show error
				lockModalRef.setError(result.error || 'Sai code/password');
			}
		} catch (error: any) {
			lockModalRef.setError(error.message || 'Có lỗi xảy ra');
		}
	}

	function handleCloseLockModal() {
		lockModalOpen = false;
		currentLockedLink = null;
	}

	// Subscribe modal state
	let showSubscribeModal = false;
	let subscribing = false;

	// Share functionality
	$: bioUrl = `https://biolink.com/${$page?.username || ''}`;
	$: showShareButton = ($publicAppearance?.theme?.config?.page?.defaults?.showShareButton as boolean) ?? true;

	async function handleShare() {
		try {
			await navigator.clipboard.writeText(bioUrl);
			toast.success('Link copied to clipboard!');
		} catch (e) {
			const input = document.createElement('input');
			input.value = bioUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			toast.success('Link copied to clipboard!');
		}
	}

	async function handleSubscribe(event: CustomEvent<string>) {
		subscribing = true;
		try {
			const email = event.detail;
			const username = $page?.username || '';
			
			await api.subscribe(username, email);
			
			showSubscribeModal = false;
			toast.success('Successfully subscribed! Thank you!');
		} catch (e: any) {
			console.error('Subscribe failed:', e);
			toast.error(e.message || 'Failed to subscribe. Please try again.');
		} finally {
			subscribing = false;
		}
	}

	// Get resolved appearance
	$: tokens = $publicAppearance?.tokens || {};
	$: header = $publicAppearance?.header || {};
	$: blockStyle = $publicAppearance?.blockStyle || {};
	$: blockConfig = $publicAppearance?.block || {};
	$: typography = $publicAppearance?.typography || { headingColor: '#18181b', mutedColor: '#71717a' };
	
	// Typography colors
	$: headingColor = typography.headingColor;
	$: mutedColor = typography.mutedColor;
	
	// Background
	$: bgType = $publicAppearance?.theme?.config?.background?.type;
	$: bgValue = $publicAppearance?.theme?.config?.background?.value;
	$: bgAnimation = $publicAppearance?.theme?.config?.background?.animation;
	$: particles = $publicAppearance?.theme?.config?.background?.particles;
	
	$: resolvedBackground = (() => {
		if (bgType && bgValue) {
			if (bgType === 'solid') {
				return bgValue;
			}
			if (bgType === 'gradient') return bgValue;
			if (bgType === 'pattern') return bgValue;
			if (bgType === 'image') return `url('${bgValue}')`;
			if (bgType === 'video') return '#000000';
		}
		const fallback = tokens?.backgroundColor || '#ffffff';
		return fallback;
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
		const sizes = { xs: 112, sm: 128, md: 144, lg: 160, xl: 176, '2xl': 192, '3xl': 208 };
		return sizes[header?.avatarSize || 'md'] || 144;
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
	$: coverHeight = (() => {
		// For avatar-cover, use maxWidth to maintain 1:1 aspect ratio (same as PhoneMockup)
		if (isAvatarCover) {
			return maxWidth;
		}
		const heights = { sm: 120, md: 160, lg: 200 };
		return header?.coverHeight ? heights[header.coverHeight] : 160;
	})();
	$: isAvatarCover = header?.preset === 'avatar-cover';
	$: avatarOverlapOffset = avatarSize / 2;
	
	$: coverStyle = (() => {
		if (!header?.hasCover) return '';
		
		// If avatar-cover preset, use avatar as cover
		if (isAvatarCover && $page?.avatar_url) {
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

	// Social icons
	$: socialIconsEnabled = header?.socialIconsEnabled ?? true;
	$: socialIconPosition = header?.socialIconPosition || 'header';
	$: socialIconColor = header?.socialIconColor || tokens?.mutedTextColor || '#71717a';
	
	// Page settings
	$: showSubscribeButton = ($publicAppearance?.theme?.config?.page?.defaults?.showSubscribeButton as boolean) ?? true;
	
	// Glow effects
	$: titleGlow = header?.titleGlowEnabled 
		? `0 0 20px ${header?.titleGlowColor || tokens?.primaryColor || '#3b82f6'}80`
		: 'none';
	$: avatarGlow = header?.avatarGlowEnabled
		? `0 0 30px ${header?.avatarGlowColor || tokens?.primaryColor || '#3b82f6'}80`
		: 'none';

	// Convert background color to rgba gradient colors for mask (for avatar-cover)
	$: maskGradientColors = (() => {
		if (!isAvatarCover) return { solid: 'rgba(0,0,0,1)', dark: 'rgba(0,0,0,0.8)', medium: 'rgba(0,0,0,0.4)' };
		
		// Get background color - try multiple sources in priority order
		let bgColor: string | null = null;
		
		// Priority 1: Check if resolvedBackground is a simple solid color
		if (resolvedBackground && resolvedBackground.match(/^#[0-9a-fA-F]{6}$/)) {
			bgColor = resolvedBackground;
		}
		// Priority 2: Try tokens.backgroundColor
		else if (tokens?.backgroundColor && (tokens.backgroundColor.match(/^#[0-9a-fA-F]{6}$/) || tokens.backgroundColor.startsWith('rgb'))) {
			bgColor = tokens.backgroundColor;
		}
		// Priority 3: Check config.tokens.bg.value (after overrides applied)
		else {
			const bgToken = $publicAppearance?.theme?.config?.tokens?.bg;
			if (bgToken?.value && typeof bgToken.value === 'string') {
				if (bgToken.value.match(/^#[0-9a-fA-F]{6}$/)) {
					bgColor = bgToken.value;
				}
			}
		}
		
		// Fallback to white if still no valid color
		if (!bgColor) {
			bgColor = '#ffffff';
		}
		
		let r = 255, g = 255, b = 255; // Default to white
		
		// Parse hex color (#RRGGBB)
		if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			r = parseInt(bgColor.slice(1, 3), 16);
			g = parseInt(bgColor.slice(3, 5), 16);
			b = parseInt(bgColor.slice(5, 7), 16);
		}
		// Parse rgb/rgba
		else if (bgColor.startsWith('rgb')) {
			const match = bgColor.match(/\d+/g);
			if (match && match.length >= 3) {
				r = parseInt(match[0]);
				g = parseInt(match[1]);
				b = parseInt(match[2]);
			}
		}
		
		const result = {
			solid: `rgba(${r}, ${g}, ${b}, 1)`,
			dark: `rgba(${r}, ${g}, ${b}, 0.8)`,
			medium: `rgba(${r}, ${g}, ${b}, 0.4)`
		};
		
		return result;
	})();

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
	
	// Merge and sort all items (groups + blocks) by sort_order
	$: allItems = [
		...visibleGroups.map(g => ({ type: 'group' as const, data: g, sort_order: g.sort_order })),
		...$blocks.filter(b => b.is_visible === 1).map(b => ({ type: 'block' as const, data: b, sort_order: b.sort_order }))
	].sort((a, b) => a.sort_order - b.sort_order);
	
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
	"
>
	<!-- Background Layer (always separate for particles to work) -->
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
	{:else}
		<!-- Solid/Static Gradient Background - separate layer for particles to work -->
		<div 
			class="fixed inset-0 z-0"
			style="background: {resolvedBackground};"
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
		<!-- Share & Subscribe Buttons (Floating) -->
		{#if showShareButton || showSubscribeButton}
			<div class="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4" style="max-width: {maxWidth}px; margin: 0 auto;">
				<!-- Subscribe Button (Left) -->
				{#if showSubscribeButton}
					<button
						on:click={() => showSubscribeModal = true}
						class="h-8 px-3 rounded-full flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-lg"
						style="
							background: rgba(255, 255, 255, 0.95);
							backdrop-filter: blur(12px);
							-webkit-backdrop-filter: blur(12px);
						"
						title="Subscribe"
					>
						<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<span class="text-xs font-medium text-gray-700">Subscribe</span>
					</button>
				{:else}
					<div></div>
				{/if}

				<!-- Share Button (Right) -->
				{#if showShareButton}
					<button
						on:click={handleShare}
						class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
						style="
							background: rgba(255, 255, 255, 0.95);
							backdrop-filter: blur(12px);
							-webkit-backdrop-filter: blur(12px);
						"
						title="Share"
					>
						<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
					</button>
				{/if}
			</div>
		{/if}

		<!-- Header with Cover -->
		{#if header?.hasCover}
			<div class="relative -mx-4 mb-6">
				<!-- Cover Image/Gradient -->
				<div 
					class="w-full relative"
					style="{coverStyle} height: {coverHeight}px; {isAvatarCover ? '' : 'border-radius: 5px;'}"
				>
					<!-- Text overlay for avatar-cover -->
					{#if isAvatarCover}
						<!-- Layer 1: Subtle gradient overlay - lighter for better visibility -->
						<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.5) 100%);"></div>
						<!-- Layer 2: Bottom fade mask - extend 2px below to prevent gap -->
						<div class="absolute left-0 right-0 pointer-events-none" style="bottom: -2px; height: 102px; background: linear-gradient(to top, {maskGradientColors.solid} 0%, {maskGradientColors.dark} 30%, {maskGradientColors.medium} 60%, transparent 100%);"></div>
						
						<!-- Text overlay on avatar cover - z-20 to float above gradient mask -->
						<div class="absolute bottom-1 left-0 right-0 z-20 text-center px-4">
							<h1 class="font-bold drop-shadow-lg" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow}; color: {headingColor};">
								{$page?.title || 'Your Name'}
							</h1>
							{#if header.showBio && $page?.bio}
								<p 
									class="mt-2 drop-shadow-md"
									style="font-size: {bioFontSizePx}px; line-height: 1.5; color: {mutedColor};"
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
									{header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''}
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
									{header.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header.avatarBorderColor || '#ffffff'};` : ''}
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
				<div style="margin-top: {header.avatarPosition === 'overlap' ? avatarOverlapOffset + 8 : 0}px; text-align: {header.contentAlign || 'center'};">
					<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow}; color: {headingColor};">
						{$page?.title || 'Your Name'}
					</h1>
					{#if header.showBio && $page?.bio}
						<p 
							class="mt-1"
							style="
								color: {mutedColor};
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
			<div style="display: flex; flex-direction: column; align-items: {header?.contentAlign === 'left' ? 'flex-start' : 'center'}; text-align: {header?.contentAlign || 'center'};">
				{#if $page?.avatar_url}
					<img 
						src={$page.avatar_url} 
						alt="Avatar" 
						class="object-cover mb-2"
						style="
							width: {avatarWidth}px;
							height: {avatarHeight}px;
							{header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''}
							border-radius: {getAvatarBorderRadius(header?.avatarShape)};
							box-shadow: {avatarGlow};
						"
					/>
				{:else}
					<div 
						class="flex items-center justify-center text-white font-bold mb-2"
						style="
							width: {avatarWidth}px;
							height: {avatarHeight}px;
							background: {tokens?.primaryColor || '#3b82f6'};
							{header?.avatarBorder !== false ? `border: ${avatarBorderWidth}px solid ${header?.avatarBorderColor || '#ffffff'};` : ''}
							border-radius: {getAvatarBorderRadius(header?.avatarShape)};
							font-size: {avatarSize / 2.5}px;
							box-shadow: {avatarGlow};
						"
					>
						{($page?.title || 'U').charAt(0).toUpperCase()}
					</div>
				{/if}
				<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily}; line-height: 1.2; text-shadow: {titleGlow}; color: {headingColor};">
					{$page?.title || 'Your Name'}
				</h1>
				{#if header?.showBio && $page?.bio}
					<p 
						class="mt-1"
						style="
							color: {mutedColor};
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

		<!-- Links and Blocks (merged and sorted by sort_order) -->
		<div class="flex flex-col" style="gap: {$publicAppearance?.page?.blockGap || 16}px; margin-top: 24px;">
			{#each allItems as item}
			{#if item.type === 'group'}
				{@const group = item.data}
				{#each group.links.filter(l => l.is_active === 1) as link}
					{@const iconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || link.icon_url || null, link.icon_color || iconThumbnailColor)}
					{@const iconClasses = getIconClasses(link.icon_type || 'none', 'list-left', `w-8 h-8 flex-shrink-0 ${iconShapeClass}`)}
					{@const paddingX = blockConfig?.padding?.x ?? 16}
					{@const paddingY = blockConfig?.padding?.y ?? 12}
					{@const borderRadius = blockConfig?.borderRadius ?? 12}
					{@const justifyContent = textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start'}
					{@const animationClass = link.animation && link.animation !== 'none' ? `link-animation-${link.animation}` : ''}
					{@const hasLock = link.lock_type && link.lock_type !== 'none' && link.lock_value}
					{@const isScheduled = scheduledLinkIds.has(link.id)}
					{@const countdown = isScheduled ? countdowns[link.id] : null}
					
					<a
						href={link.url}
						target={link.open_in_new_tab ? '_blank' : '_self'}
						rel="noopener noreferrer"
						on:click={(e) => handleLinkClick(e, link)}
						class="block transition-all {animationClass}"
						class:opacity-60={isScheduled}
						class:cursor-not-allowed={isScheduled}
						class:hover:scale-[1.02]={!isScheduled}
						class:hover:opacity-90={!isScheduled}
						style="
							background: {blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
							color: {blockStyle?.text || '#ffffff'};
							padding: {paddingY}px {paddingX}px;
							border-radius: {borderRadius}px;
							border: {blockStyle?.border || 'none'};
							box-shadow: {blockStyle?.shadow || 'none'};
							{blockStyle?.blur ? `backdrop-filter: blur(${blockStyle.blur}px); -webkit-backdrop-filter: blur(${blockStyle.blur}px);` : ''}
							text-align: {textAlign};
							{isScheduled ? 'pointer-events: none;' : ''}
						"
					>
						{#if isScheduled}
							<!-- Scheduled Link - Show Countdown -->
							<div class="flex flex-col items-center gap-2">
								<div class="flex items-center gap-2 opacity-80">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
									</svg>
									<span class="font-semibold" style="font-size: {linkFontSizePx}px;">{link.title}</span>
								</div>
								<div class="text-sm opacity-90">
									<span class="font-medium">Available in: </span>
									<span class="font-mono font-bold">{countdown || 'Loading...'}</span>
								</div>
							</div>
						{:else}
							<!-- Active Link - Normal Display -->
							<div class="flex items-center gap-3" style="justify-content: {justifyContent};">
								{#if iconUrl}
									<img src={iconUrl} alt="" class="{iconClasses}" />
								{/if}
								<span class="font-semibold flex-1" style="font-size: {linkFontSizePx}px; text-align: {textAlign};">{link.title}</span>
								{#if hasLock}
									<svg class="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
									</svg>
								{/if}
							</div>
						{/if}
					</a>
				{/each}
			{:else if item.type === 'block'}
				{@const block = item.data}
				{@const content = (() => {
					try {
						return typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
					} catch {
						return null;
					}
				})()}
				{#if content}
					{#if block.type === 'image'}
						{@const borderRadius = blockConfig?.borderRadius ?? 12}
						<ImageBlockRenderer 
							{content}
							{blockStyle}
							blockBorderRadius="{borderRadius}px"
							textColor={$publicAppearance?.textColor || '#18181b'}
							mutedTextColor={$publicAppearance?.mutedTextColor || '#71717a'}
						/>
					{:else if block.type === 'video'}
						<VideoBlockRenderer 
							{content}
							textColor={$publicAppearance?.textColor || '#18181b'}
							mutedTextColor={$publicAppearance?.mutedTextColor || '#71717a'}
						/>
					{:else if block.type === 'text'}
						<TextBlockRenderer 
							{content}
							textColor={$publicAppearance?.textColor || '#18181b'}
						/>
					{/if}
				{/if}
			{/if}
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

	/* Link Animation Classes */
	@keyframes link-bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes link-jello {
		0%, 100% {
			transform: skewX(0deg) skewY(0deg);
		}
		30% {
			transform: skewX(25deg) skewY(5deg);
		}
		40% {
			transform: skewX(-15deg) skewY(-5deg);
		}
		50% {
			transform: skewX(15deg) skewY(3deg);
		}
		65% {
			transform: skewX(-5deg) skewY(-3deg);
		}
		75% {
			transform: skewX(5deg) skewY(2deg);
		}
	}

	@keyframes link-wobble {
		0%, 100% {
			transform: translateX(0) rotate(0deg);
		}
		15% {
			transform: translateX(-10px) rotate(-5deg);
		}
		30% {
			transform: translateX(8px) rotate(3deg);
		}
		45% {
			transform: translateX(-8px) rotate(-3deg);
		}
		60% {
			transform: translateX(5px) rotate(2deg);
		}
		75% {
			transform: translateX(-3px) rotate(-1deg);
		}
	}

	@keyframes link-pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	@keyframes link-shake {
		0%, 100% {
			transform: translateX(0);
		}
		10%, 30%, 50%, 70%, 90% {
			transform: translateX(-5px);
		}
		20%, 40%, 60%, 80% {
			transform: translateX(5px);
		}
	}

	@keyframes link-tada {
		0%, 100% {
			transform: scale(1) rotate(0deg);
		}
		10%, 20% {
			transform: scale(0.9) rotate(-3deg);
		}
		30%, 50%, 70%, 90% {
			transform: scale(1.1) rotate(3deg);
		}
		40%, 60%, 80% {
			transform: scale(1.1) rotate(-3deg);
		}
	}

	.link-animation-bounce {
		animation: link-bounce 1s ease-in-out infinite;
	}

	.link-animation-jello {
		animation: link-jello 1s ease-in-out infinite;
	}

	.link-animation-wobble {
		animation: link-wobble 1s ease-in-out infinite;
	}

	.link-animation-pulse {
		animation: link-pulse 1.5s ease-in-out infinite;
	}

	.link-animation-shake {
		animation: link-shake 1.5s ease-in-out infinite;
	}

	.link-animation-tada {
		animation: link-tada 1.5s ease-in-out infinite;
	}
</style>

<!-- Lock Modal -->
<LockModal
	bind:this={lockModalRef}
	bind:isOpen={lockModalOpen}
	lockType={currentLockedLink?.lock_type || 'code'}
	linkTitle={currentLockedLink?.title || ''}
	on:verify={handleVerifyLock}
	on:close={handleCloseLockModal}
/>

<!-- Subscribe Modal -->
{#if showSubscribeModal}
	<SubscribeModal
		loading={subscribing}
		on:submit={handleSubscribe}
		on:cancel={() => showSubscribeModal = false}
	/>
{/if}
