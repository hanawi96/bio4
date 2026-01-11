<script lang="ts">
	import type { VideoBlockContent, VideoBlockItem } from '$lib/types';
	import { getVideoThumbnail } from '$lib/utils/videoUtils';
	
	export let content: VideoBlockContent;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
	
	const spacingMap = {
		compact: 8,
		comfortable: 16,
		spacious: 24
	};
	
	$: spacing = spacingMap[content.config.spacing || 'comfortable'];
	$: aspectRatio = content.config.aspectRatio || '16/9';
	
	// Track which videos are playing
	let playingVideos = new Set<string>();
	
	function toggleVideo(videoId: string) {
		if (playingVideos.has(videoId)) {
			playingVideos.delete(videoId);
		} else {
			playingVideos.add(videoId);
		}
		playingVideos = playingVideos; // Trigger reactivity
	}
</script>

<div class="flex flex-col" style="gap: {spacing}px;">
	<!-- Title & Subtitle -->
	{#if content.title || content.subtitle}
		<div class="text-center px-2">
			{#if content.title}
				<h3 class="text-lg font-bold mb-1" style="color: {textColor};">{content.title}</h3>
			{/if}
			{#if content.subtitle}
				<p class="text-sm" style="color: {mutedTextColor};">{content.subtitle}</p>
			{/if}
		</div>
	{/if}
	
	<!-- Videos -->
	{#each content.videos as video}
		<div class="overflow-hidden rounded-xl relative">
			<div style="aspect-ratio: {aspectRatio};">
				{#if playingVideos.has(video.id)}
					<!-- Show iframe when playing -->
					<iframe
						src={video.embedUrl}
						title={video.title || 'Video'}
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
						class="w-full h-full"
					></iframe>
				{:else}
					<!-- Show thumbnail when not playing -->
					<button 
						type="button"
						on:click={() => toggleVideo(video.id)}
						class="block w-full h-full relative group cursor-pointer"
					>
						{#if video.thumbnail}
							<img 
								src={video.thumbnail} 
								alt={video.title || 'Video'} 
								class="w-full h-full object-cover"
							/>
						{:else}
							<div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
								<svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z"/>
								</svg>
							</div>
						{/if}
						
						<!-- Play button overlay -->
						<div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
							<div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
								<svg class="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z"/>
								</svg>
							</div>
						</div>
					</button>
				{/if}
			</div>
		</div>
	{/each}
</div>
