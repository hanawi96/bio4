<script lang="ts">
	import { page, groups } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';

	// Subscribe to derived store - auto updates on any change!
	$: tokens = $appearance?.tokens;
	$: header = $appearance?.header;
	
	// Loading state - true when page data is not yet loaded
	$: isLoading = !$page || !tokens;
	
	// Check for video background
	$: backgroundVideo = (() => {
		if (!$page?.draft_appearance) return null;
		try {
			const appearance = JSON.parse($page.draft_appearance);
			const videoUrl = appearance.customTheme?.backgroundVideo;
			return videoUrl && videoUrl.trim() ? videoUrl : null;
		} catch {
			return null;
		}
	})();
	
	$: {
		console.log('[PhoneMockup] appearance changed:', $appearance);
		console.log('[PhoneMockup] tokens:', tokens);
		console.log('[PhoneMockup] tokens.backgroundColor:', tokens?.backgroundColor);
		console.log('[PhoneMockup] backgroundVideo:', backgroundVideo);
		
		// Check if backgroundColor is a pattern
		if (tokens?.backgroundColor) {
			const isPattern = tokens.backgroundColor.includes('background:');
			console.log('[PhoneMockup] Is pattern?', isPattern);
			if (isPattern) {
				console.log('[PhoneMockup] Pattern detected! Full value:', tokens.backgroundColor);
			}
		}
	}

	// Avatar size mapping
	const avatarSizes = { sm: 64, md: 80, lg: 96, xl: 120 };
	$: avatarSize = header ? avatarSizes[header.avatarSize] : 80;

	// Cover height mapping
	const coverHeights = { sm: 120, md: 160, lg: 200 };
	$: coverHeight = header?.coverHeight ? coverHeights[header.coverHeight] : 160;

	// Get cover background style
	$: coverStyle = (() => {
		if (!header?.hasCover) return '';
		
		const overrides = $appearance?.header;
		const coverValue = overrides?.coverValue;
		
		if (!coverValue) {
			return 'background: linear-gradient(135deg, #667eea, #764ba2);';
		}
		
		if (coverValue.startsWith('http')) {
			return `background: url('${coverValue}') center/cover;`;
		}
		
		return `background: ${coverValue};`;
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

			<!-- Background Video (if exists) -->
			{#if backgroundVideo}
				<video 
					src={backgroundVideo} 
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
					{!backgroundVideo && tokens?.backgroundColor 
						? (tokens.backgroundColor.includes('background:') 
							? tokens.backgroundColor 
							: tokens.backgroundColor.includes('url(')
								? `background: ${tokens.backgroundColor} center/cover no-repeat;`
								: `background: ${tokens.backgroundColor};`)
						: !backgroundVideo ? 'background: #ffffff;' : 'background: transparent;'}
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
							<!-- Cover Image/Gradient -->
							<div 
								class="w-full"
								style="{coverStyle} height: {coverHeight}px;"
							></div>
							
							<!-- Avatar (Overlapping) -->
							{#if header.avatarPosition === 'overlap'}
								<div class="absolute left-1/2 -translate-x-1/2" style="bottom: -{avatarSize / 2}px;">
									{#if $page?.avatar_url}
										<img 
											src={$page.avatar_url} 
											alt="Avatar" 
											class="header-avatar rounded-full object-cover {header.avatarBorder !== false ? 'border-4' : ''}"
											style="
												width: {avatarSize}px;
												height: {avatarSize}px;
												{header.avatarBorder !== false ? `border-color: ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {header.avatarShape === 'circle' ? '50%' : header.avatarShape === 'rounded' ? '20%' : '0'};
											"
										/>
									{:else}
										<div 
											class="header-avatar flex items-center justify-center text-white font-bold {header.avatarBorder !== false ? 'border-4' : ''}"
											style="
												width: {avatarSize}px;
												height: {avatarSize}px;
												background: {tokens?.primaryColor || '#3b82f6'};
												{header.avatarBorder !== false ? `border-color: ${header.avatarBorderColor || '#ffffff'};` : ''}
												border-radius: {header.avatarShape === 'circle' ? '50%' : header.avatarShape === 'rounded' ? '20%' : '0'};
												font-size: {avatarSize / 2.5}px;
											"
										>
											{($page?.title || 'U').charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>
							{/if}
						</div>
						
						<!-- Content below cover -->
						<div class="header-content" style="margin-top: {header.avatarPosition === 'overlap' ? avatarSize / 2 + 16 : 0}px; text-align: {header.contentAlign};">
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
					{:else}
						<!-- No Cover - Simple Header -->
						<div class="header-content mb-6" style="display: flex; flex-direction: column; align-items: {header?.contentAlign === 'left' ? 'flex-start' : 'center'}; text-align: {header?.contentAlign || 'center'};">
							{#if $page?.avatar_url}
								<img 
									src={$page.avatar_url} 
									alt="Avatar" 
									class="header-avatar object-cover mb-3 {header?.avatarBorder !== false ? 'border-4' : ''}"
									style="
										width: {avatarSize}px;
										height: {avatarSize}px;
										{header?.avatarBorder !== false ? `border-color: ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {header?.avatarShape === 'circle' ? '50%' : header?.avatarShape === 'rounded' ? '20%' : '0'};
									"
								/>
							{:else}
								<div 
									class="header-avatar mb-3 flex items-center justify-center text-white font-bold {header?.avatarBorder !== false ? 'border-4' : ''}"
									style="
										width: {avatarSize}px;
										height: {avatarSize}px;
										background: {tokens?.primaryColor || '#3b82f6'};
										{header?.avatarBorder !== false ? `border-color: ${header?.avatarBorderColor || '#ffffff'};` : ''}
										border-radius: {header?.avatarShape === 'circle' ? '50%' : header?.avatarShape === 'rounded' ? '20%' : '0'};
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

					<!-- Links -->
					<div class="space-y-3 mt-6">
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
