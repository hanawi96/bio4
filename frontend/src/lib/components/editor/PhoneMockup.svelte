<script lang="ts">
	import { page, groups } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { appearanceState } from '$lib/stores/appearanceManager';
	import { HEADER_PRESETS } from '$lib/appearance/presets';
	import { resolveShadow } from '$lib/appearance/tokenResolver';
	import SubscribeModal from '$lib/components/modals/SubscribeModal.svelte';

	// Subscribe to derived store - auto updates on any change!
	$: tokens = $appearance?.tokens;
	
	// Get header from NEW format appearanceState
	$: headerPresetId = $appearanceState.headerPresetId || 'no-cover';
	$: baseHeaderPreset = HEADER_PRESETS[headerPresetId];
	
	// Merge preset with overrides (flat format)
	$: header = (() => {
		const overrides = $appearanceState.overrides || {};
		const merged: any = { ...baseHeaderPreset };
		
		// Apply header.* overrides
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
		if (!$page?.draft_appearance) return null;
		try {
			const appearance = JSON.parse($page.draft_appearance);
			const videoUrl = appearance.customTheme?.backgroundVideo || appearance.overrides?.backgroundVideo;
			return videoUrl && videoUrl.trim() ? videoUrl : null;
		} catch {
			return null;
		}
	})();
	
	// Check if draft_appearance has video (for immediate hide of background)
	$: hasVideoInDraft = (() => {
		if (!$page?.draft_appearance) return false;
		try {
			const appearance = JSON.parse($page.draft_appearance);
			return !!(appearance.customTheme?.backgroundVideo || appearance.overrides?.backgroundVideo);
		} catch {
			return false;
		}
	})();
	
	// Preload default video on mount
	import { onMount } from 'svelte';
	const DEFAULT_VIDEO = '/presets/videos/14950008_1080_1920_60fps.mp4';
	
	onMount(() => {
		// Preload default video in background
		const video = document.createElement('video');
		video.preload = 'auto';
		video.src = DEFAULT_VIDEO;
	});

	// Avatar size mapping
	const avatarSizes = { sm: 64, md: 80, lg: 96, xl: 120 };
	$: avatarSize = header ? avatarSizes[header.avatarSize] : 80;
	
	// Avatar dimensions for oval shape (xl size)
	$: avatarWidth = header?.avatarShape === 'oval' && header?.avatarSize === 'xl' ? 128 : avatarSize;
	$: avatarHeight = header?.avatarShape === 'oval' && header?.avatarSize === 'xl' ? 160 : avatarSize;

	// Cover height mapping
	const coverHeights = { sm: 120, md: 160, lg: 200 };
	$: coverHeight = header?.coverHeight ? coverHeights[header.coverHeight] : 160;
	
	// Helper: Get border radius for avatar shape
	function getAvatarBorderRadius(shape: string | undefined): string {
		if (shape === 'circle') return '50%';
		if (shape === 'rounded') return '20%';
		if (shape === 'oval') return '50%';
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
	$: blockGap = ($appearanceState.overrides?.['page.blockGap'] as number)
		|| $appearance?.theme?.config?.page?.layout?.blockGap
		|| 16;
	
	// Get title font size from appearance
	$: titleFontSize = ($appearanceState.overrides?.['page.titleFontSize'] as number) || 20;
	
	// Get title font family (separate from body font)
	$: titleFontFamily = (() => {
		const override = $appearanceState.overrides?.['header.titleFontFamily'] as string;
		if (override) return override;
		// Fallback to theme default
		return $appearance?.theme?.config?.tokens?.fontFamily || 'Inter, sans-serif';
	})();
	
	// Get background color for gradient overlay (for avatar-cover)
	$: overlayGradientColor = (() => {
		if (!isAvatarCover) return 'rgba(0, 0, 0, 0.7)';
		
		// Read directly from overrides (most up-to-date source)
		const bgColor = $appearanceState.overrides['backgroundColor'];
		
		if (!bgColor) {
			return 'rgba(0, 0, 0, 0.7)';
		}
		
		// If solid color, convert to rgba
		if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			const r = parseInt(bgColor.slice(1, 3), 16);
			const g = parseInt(bgColor.slice(3, 5), 16);
			const b = parseInt(bgColor.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, 0.95)`;
		}
		
		// Fallback
		return 'rgba(0, 0, 0, 0.7)';
	})();

	// Active links
	$: activeLinks = $groups.flatMap(g => g.links.filter(l => l.is_active === 1));

	// Get block border-radius from block preset or override
	$: blockBorderRadius = (() => {
		const overrideBorderRadius = $appearanceState.overrides?.['block.borderRadius'];
		if (overrideBorderRadius !== undefined) {
			return `${overrideBorderRadius}px`;
		}
		
		const presetBorderRadius = $appearance?.block?.borderRadius;
		if (presetBorderRadius !== undefined) {
			return `${presetBorderRadius}px`;
		}
		
		return '12px'; // Default fallback
	})();

	// Get block shadow from override or theme default
	$: blockShadow = $appearanceState.overrides?.['block.shadow'] 
		|| $appearance?.theme?.config?.defaults?.blockShadow 
		|| 'none';
	
	// Resolve shadow with shadowColor token (for hard shadows)
	$: resolvedBlockShadow = resolveShadow(
		$appearance?.blockStyle?.shadow || blockShadow,
		tokens?.shadowColor || '#000000'
	);

	// Page settings - read from appearanceState.overrides
	$: showShareButton = ($appearanceState.overrides?.['page.showShareButton'] as boolean) ?? true;
	$: showSubscribeButton = ($appearanceState.overrides?.['page.showSubscribeButton'] as boolean) ?? true;
	$: bioUrl = `https://biolink.com/${$page?.username || 'demo'}`;

	// Background filters - computed once
	$: backgroundFilters = `blur(${$appearanceState.overrides['backgroundBlur'] ?? 0}px) brightness(${($appearanceState.overrides['backgroundBrightness'] ?? 100) / 100}) grayscale(${($appearanceState.overrides['backgroundGrayscale'] ?? 0) / 100})`;

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

<!-- Phone Frame -->
<div class="relative scale-125">
	<div class="w-[280px] h-[580px] bg-gray-900 rounded-[40px] p-2 shadow-2xl">
		<div class="w-full h-full rounded-[36px] overflow-hidden relative">
			<!-- Notch -->
			<div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

			<!-- Background Video (always rendered when hasVideoInDraft) -->
			{#if hasVideoInDraft}
				<video 
					src={backgroundVideo || ''} 
					class="absolute inset-0 w-full h-full object-cover"
					style="filter: {backgroundFilters};"
					autoplay 
					loop 
					muted 
					playsinline
				></video>
			{/if}

			<!-- Background Image Layer (separate from content) -->
			{#if !hasVideoInDraft && tokens?.backgroundColor && tokens.backgroundColor.includes('url(')}
				<div 
					class="absolute inset-0 w-full h-full"
					style="
						background: {tokens.backgroundColor} center/cover no-repeat;
						filter: {backgroundFilters};
					"
				></div>
			{/if}

			<!-- Content -->
			<div 
				class="w-full h-full overflow-y-auto scrollbar-hide phone-content relative z-10"
				style="
					{!hasVideoInDraft && tokens?.backgroundColor 
						? (tokens.backgroundColor.includes('background:') && tokens.backgroundColor.includes('background-size:')
							? tokens.backgroundColor
							: tokens.backgroundColor.includes('background:') 
								? tokens.backgroundColor 
								: tokens.backgroundColor.includes('url(')
									? 'background: transparent;'
									: `background: ${tokens.backgroundColor};`)
						: !hasVideoInDraft ? 'background: #ffffff;' : 'background: transparent;'}
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
							<div class="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
							<p class="text-xs text-gray-500">Loading preview...</p>
						</div>
					</div>
				{:else}
				<div class="pt-10 pb-8 px-4">
					<!-- Header with Cover -->
					{#if header?.hasCover}
						<div class="relative -mx-4 -mt-10 mb-6 header-cover">
							<!-- Cover Image/Gradient with text overlay for avatar-cover -->
							<div 
								class="w-full relative"
								style="{coverStyle} height: {coverHeight}px;"
							>
								<!-- Double gradient overlay for avatar-cover -->
								{#if isAvatarCover}
									<!-- Gradient 1 - Avatar bottom fade -->
									<div 
										class="absolute inset-0" 
										style="background: linear-gradient(to bottom, transparent 0%, transparent 30%, {overlayGradientColor} 100%);"
									></div>
									
									<!-- Gradient 2 - Darken middle -->
									<div 
										class="absolute inset-0" 
										style="background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);"
									></div>
									
									<!-- Text overlay on avatar cover - z-20 để nổi lên trên gradient mask -->
									<div class="absolute bottom-6 left-0 right-0 z-20 text-center px-4">
										<h1 class="font-bold text-white drop-shadow-lg" style="font-size: {titleFontSize}px; font-family: {titleFontFamily};">{$page?.title || 'Your Name'}</h1>
										{#if header.showBio && $page?.bio}
											<p 
												class="bio-text text-sm text-white/90 mt-2 drop-shadow-md"
												style="
													display: -webkit-box;
													-webkit-line-clamp: {header.bioMaxLines};
													-webkit-box-orient: vertical;
													overflow: hidden;
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
								<div class="absolute left-1/2 -translate-x-1/2" style="bottom: -{avatarHeight / 2}px;">
									{#if $page?.avatar_url}
										<img 
											src={$page.avatar_url} 
											alt="Avatar" 
											class="header-avatar object-cover {header.avatarBorder !== false ? 'border-4' : ''}"
											style="
												width: {avatarWidth}px;
												height: {avatarHeight}px;
												{header.avatarBorder !== false ? `border-color: ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {getAvatarBorderRadius(header.avatarShape)};
											"
										/>
									{:else}
										<div 
											class="header-avatar flex items-center justify-center text-white font-bold {header.avatarBorder !== false ? 'border-4' : ''}"
											style="
												width: {avatarWidth}px;
												height: {avatarHeight}px;
												background: {tokens?.primaryColor || '#3b82f6'};
												{header.avatarBorder !== false ? `border-color: ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {getAvatarBorderRadius(header.avatarShape)};
												font-size: {avatarSize / 2.5}px;
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
							<div class="header-content" style="margin-top: {header.avatarPosition === 'overlap' ? avatarHeight / 2 + 16 : 0}px; text-align: {header.contentAlign};">
								<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily};">{$page?.title || 'Your Name'}</h1>
								{#if header.showBio && $page?.bio}
									<p 
										class="bio-text text-sm opacity-70 mt-1"
										style="
											display: -webkit-box;
											-webkit-line-clamp: {header.bioMaxLines};
											-webkit-box-orient: vertical;
											overflow: hidden;
										"
									>
										{$page.bio}
									</p>
								{/if}
							</div>
						{/if}
					{:else}
						<!-- No Cover - Simple Header -->
						<div class="header-content mb-6" style="display: flex; flex-direction: column; align-items: {header?.contentAlign === 'left' ? 'flex-start' : 'center'}; text-align: {header?.contentAlign || 'center'};">
							{#if $page?.avatar_url}
								<img 
									src={$page.avatar_url} 
									alt="Avatar" 
									class="header-avatar object-cover mb-3 {header?.avatarBorder !== false ? 'border-4' : ''}"
									style="
										width: {avatarWidth}px;
										height: {avatarHeight}px;
										{header?.avatarBorder !== false ? `border-color: ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {getAvatarBorderRadius(header?.avatarShape)};
									"
								/>
							{:else}
								<div 
									class="header-avatar mb-3 flex items-center justify-center text-white font-bold {header?.avatarBorder !== false ? 'border-4' : ''}"
									style="
										width: {avatarWidth}px;
										height: {avatarHeight}px;
										background: {tokens?.primaryColor || '#3b82f6'};
										{header?.avatarBorder !== false ? `border-color: ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {getAvatarBorderRadius(header?.avatarShape)};
										font-size: {avatarSize / 2.5}px;
									"
								>
									{($page?.title || 'U').charAt(0).toUpperCase()}
								</div>
							{/if}
							<h1 class="font-bold" style="font-size: {titleFontSize}px; font-family: {titleFontFamily};">{$page?.title || 'Your Name'}</h1>
							{#if header?.showBio && $page?.bio}
								<p 
									class="bio-text text-sm opacity-70 mt-1"
									style="
										display: -webkit-box;
										-webkit-line-clamp: {header.bioMaxLines};
										-webkit-box-orient: vertical;
										overflow: hidden;
									"
								>
									{$page.bio}
								</p>
							{/if}
						</div>
					{/if}

					<!-- Social Icons -->
					{#if $page?.show_social_icons && $page?.social_links}
						{@const socialLinks = $page.social_links}
						{@const hasSocialLinks = Object.values(socialLinks).some(link => link && link.trim())}
						
						{#if hasSocialLinks}
							<div class="flex items-center justify-center gap-3 mt-3">
								{#if socialLinks.instagram}
									<a href="https://{socialLinks.instagram}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
											<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
											<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
											<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
										</svg>
									</a>
								{/if}
								{#if socialLinks.facebook}
									<a href="https://{socialLinks.facebook}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.twitter}
									<a href="https://{socialLinks.twitter}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.linkedin}
									<a href="https://{socialLinks.linkedin}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.youtube}
									<a href="https://{socialLinks.youtube}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
										</svg>
									</a>
								{/if}
								{#if socialLinks.tiktok}
									<a href="https://{socialLinks.tiktok}" target="_blank" rel="noopener" class="hover:scale-110 transition-transform" style="color: {tokens?.textColor || '#000000'};">
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
						style="display: flex; flex-direction: column; gap: {blockGap}px; {isAvatarCover ? `margin-top: -60px; padding-top: 80px;` : 'margin-top: 24px;'}"
					>
						<!-- Gradient mask - nối liền với overlay trên avatar -->
						{#if isAvatarCover}
							<div 
								class="absolute pointer-events-none z-10 -mx-4"
								style="left: 0; right: 0; top: -24px; height: 60px; background: linear-gradient(to bottom, transparent 0%, {tokens?.backgroundColor || '#ffffff'} 100%);"
							></div>
						{/if}
						
						{#each activeLinks as link}
							<a
								href={link.url}
								target="_blank"
								rel="noopener"
								class="link-button block w-full py-3 px-4 text-center text-sm font-medium transition-transform hover:scale-[1.02]"
								style="
									background-color: {$appearance?.blockStyle?.fill || tokens?.primaryColor || '#3b82f6'};
									color: {$appearance?.blockStyle?.text || 'white'};
									border: {$appearance?.blockStyle?.border ? `1px solid ${$appearance.blockStyle.border}` : 'none'};
									box-shadow: {resolvedBlockShadow !== 'none' 
										? resolvedBlockShadow 
										: ($appearance?.blockStyle?.glow ? `0 0 20px ${$appearance.blockStyle.glow}` : 'none')};
									{$appearance?.blockStyle?.blur ? `backdrop-filter: blur(${$appearance.blockStyle.blur}px); -webkit-backdrop-filter: blur(${$appearance.blockStyle.blur}px);` : ''}
									border-radius: {blockBorderRadius};
								"
							>
								{link.title}
							</a>
						{:else}
							<div class="text-center py-8 opacity-50">
								<p class="text-sm">No links yet</p>
							</div>
						{/each}
					</div>

					<!-- Footer -->
					<div class="mt-8 text-center">
						<p class="text-xs opacity-40">Made with Bio Link</p>
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
</style>
