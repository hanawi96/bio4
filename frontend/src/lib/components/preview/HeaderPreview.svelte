<script lang="ts">
	import { page } from '$lib/stores/page';
	import { HEADER_PRESETS } from '$lib/appearance/presets';
	import type { HeaderPreset } from '$lib/appearance/types';
	
	// Social platform configs
	const socialPlatforms = {
		twitter: { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', url: 'https://twitter.com/', color: '#1DA1F2' },
		instagram: { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', url: 'https://instagram.com/', color: '#E4405F' },
		facebook: { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', url: 'https://facebook.com/', color: '#1877F2' },
		linkedin: { icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', url: 'https://linkedin.com/in/', color: '#0A66C2' },
		youtube: { icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', url: 'https://youtube.com/@', color: '#FF0000' },
		tiktok: { icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z', url: 'https://tiktok.com/@', color: '#000000' }
	};
	
	$: activeSocialLinks = $page?.social_links ? 
		Object.entries($page.social_links)
			.filter(([_, value]) => value && value.trim())
			.map(([platform, username]) => ({
				platform,
				username,
				...socialPlatforms[platform as keyof typeof socialPlatforms]
			})) : [];
	
	// Get header preset from appearance state
	$: headerPreset = (() => {
		console.log('[HeaderPreview] Computing headerPreset...');
		console.log('[HeaderPreview] $page:', $page);
		console.log('[HeaderPreview] draft_appearance:', $page?.draft_appearance);
		
		try {
			if ($page?.draft_appearance) {
				const appearance = JSON.parse($page.draft_appearance);
				console.log('[HeaderPreview] Parsed appearance:', appearance);
				
				const presetId = appearance.headerStyle?.presetId || 'no-cover';
				console.log('[HeaderPreview] presetId:', presetId);
				
				const preset = HEADER_PRESETS[presetId];
				console.log('[HeaderPreview] preset from HEADER_PRESETS:', preset);
				
				const overrides = appearance.headerStyle?.overrides || {};
				console.log('[HeaderPreview] overrides:', overrides);
				
				// Merge preset with overrides
				const merged = {
					...preset,
					...overrides
				};
				console.log('[HeaderPreview] Merged headerPreset:', merged);
				
				return merged;
			}
		} catch (e) {
			console.error('[HeaderPreview] Failed to parse header preset:', e);
		}
		
		// Fallback to default
		console.log('[HeaderPreview] Using fallback preset: no-cover');
		return HEADER_PRESETS['no-cover'];
	})();
	
	// Map avatarSize to Tailwind classes
	function getAvatarSizeClasses(size: 'sm' | 'md' | 'lg' | 'xl' = 'lg') {
		const sizeMap = {
			sm: 'w-16 h-16',
			md: 'w-20 h-20',
			lg: 'w-24 h-24',
			xl: 'w-32 h-40' // Oval: wider width, taller height
		};
		const result = sizeMap[size] || sizeMap.lg;
		console.log('[HeaderPreview] getAvatarSizeClasses:', { size, result });
		return result;
	}
	
	// Map avatarShape to Tailwind classes
	function getAvatarShapeClasses(shape: 'circle' | 'rounded' | 'square' | 'oval' = 'circle') {
		const shapeMap = {
			circle: 'rounded-full',
			rounded: 'rounded-2xl',
			square: 'rounded-none',
			oval: 'rounded-[50%]' // Oval shape
		};
		const result = shapeMap[shape] || shapeMap.circle;
		console.log('[HeaderPreview] getAvatarShapeClasses:', { shape, result });
		return result;
	}
	
	$: {
		console.log('[HeaderPreview] Computing avatarClasses...');
		console.log('[HeaderPreview] headerPreset:', headerPreset);
		console.log('[HeaderPreview] avatarSize:', headerPreset?.avatarSize);
		console.log('[HeaderPreview] avatarShape:', headerPreset?.avatarShape);
	}
	
	$: avatarClasses = `${getAvatarSizeClasses(headerPreset?.avatarSize)} ${getAvatarShapeClasses(headerPreset?.avatarShape)} object-cover`;
	
	$: console.log('[HeaderPreview] Final avatarClasses:', avatarClasses);
</script>

<div class="flex flex-col items-center gap-4 p-8">
	{#if $page?.avatar_url}
		<img 
			src={$page.avatar_url} 
			alt={$page.title || 'Avatar'}
			class={avatarClasses}
		/>
	{:else}
		<div class="{avatarClasses} bg-gray-200 flex items-center justify-center">
			<span class="text-2xl text-gray-400">👤</span>
		</div>
	{/if}
	
	<h1 class="text-2xl font-bold">{$page?.title || 'Your Name'}</h1>
	
	{#if $page?.bio}
		<p class="text-center max-w-md opacity-80">{$page.bio}</p>
	{/if}
	
	<!-- Social Icons -->
	{#if $page?.show_social_icons && activeSocialLinks.length > 0}
		<div class="flex items-center gap-3 mt-2">
			{#each activeSocialLinks as social}
				<a 
					href="{social.url}{social.username}"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-all hover:scale-110 opacity-70 hover:opacity-100"
					title={social.platform}
				>
					<svg class="w-6 h-6" fill={social.color} viewBox="0 0 24 24">
						<path d={social.icon}/>
					</svg>
				</a>
			{/each}
		</div>
	{/if}
</div>
