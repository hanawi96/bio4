<script lang="ts">
	import { page, groups } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { appearanceState } from '$lib/stores/appearanceManager';
	import { HEADER_PRESETS } from '$lib/appearance/presets';

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
					autoplay 
					loop 
					muted 
					playsinline
				></video>
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
									? `background: ${tokens.backgroundColor} center/cover no-repeat;`
									: `background: ${tokens.backgroundColor};`)
						: !hasVideoInDraft ? 'background: #ffffff;' : 'background: transparent;'}
					color: {tokens?.textColor || '#000000'};
					font-family: {tokens?.fontFamily || 'Inter'}, sans-serif;
				"
			>
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
									<div class="absolute bottom-6 left-0 right-0 z-20 text-center px-6">
										<h1 class="text-lg font-bold text-white drop-shadow-lg">{$page?.title || 'Your Name'}</h1>
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
								<h1 class="text-lg font-bold">{$page?.title || 'Your Name'}</h1>
								{#if header.showBio && $page?.bio}
									<p 
										class="bio-text text-sm opacity-70 mt-1 px-4"
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
							<h1 class="text-lg font-bold">{$page?.title || 'Your Name'}</h1>
							{#if header?.showBio && $page?.bio}
								<p 
									class="bio-text text-sm opacity-70 mt-1 px-4"
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

					<!-- Links - với negative margin và gradient mask cho avatar-cover -->
					<div 
						class="space-y-3 relative"
						style="{isAvatarCover ? `margin-top: -60px; padding-top: 80px;` : 'margin-top: 24px;'}"
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
									background: {tokens?.primaryColor || '#3b82f6'};
									color: white;
									border-radius: {tokens?.borderRadius || 8}px;
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

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
