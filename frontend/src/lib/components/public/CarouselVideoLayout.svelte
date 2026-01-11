<script lang="ts">
	import { onMount } from 'svelte';
	import type { VideoBlockContent, VideoBlockItem } from '$lib/types';
	
	export let content: VideoBlockContent;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
	
	$: aspectRatio = content.config.aspectRatio || '16/9';
	
	let currentIndex = 0;
	let autoplayInterval: number | null = null;
	let isPlaying = false;
	
	function navigate(index: number) {
		currentIndex = index;
		isPlaying = false; // Reset to thumbnail when changing slides
	}
	
	function nextSlide() {
		navigate((currentIndex + 1) % content.videos.length);
	}
	
	function prevSlide() {
		navigate((currentIndex - 1 + content.videos.length) % content.videos.length);
	}
	
	function playVideo() {
		isPlaying = true;
		// Stop autoplay when user manually plays video
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
			autoplayInterval = null;
		}
	}
	
	onMount(() => {
		if (content.config.autoplay && content.videos.length > 1) {
			autoplayInterval = window.setInterval(nextSlide, (content.config.interval || 3) * 1000);
		}
		
		return () => {
			if (autoplayInterval) clearInterval(autoplayInterval);
		};
	});
</script>

<div class="flex flex-col" style="gap: 12px;">
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
	
	<!-- Carousel -->
	<div class="relative overflow-hidden rounded-xl">
		<!-- Videos -->
		<div class="relative" style="aspect-ratio: {aspectRatio};">
			{#each content.videos as video, index}
				<div 
					class="absolute inset-0 transition-opacity duration-500"
					style="opacity: {index === currentIndex ? 1 : 0}; pointer-events: {index === currentIndex ? 'auto' : 'none'};"
				>
					{#if isPlaying && index === currentIndex}
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
						<!-- Show thumbnail -->
						<button 
							type="button"
							on:click={playVideo}
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
			{/each}
		</div>
		
		<!-- Navigation Arrows -->
		{#if content.config.showArrows && content.videos.length > 1}
			<button
				type="button"
				on:click={prevSlide}
				class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors z-10"
				aria-label="Previous"
			>
				<svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button
				type="button"
				on:click={nextSlide}
				class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors z-10"
				aria-label="Next"
			>
				<svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}
		
		{#if content.config.showDots && content.videos.length > 1}
			<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
				{#each content.videos as _, index}
					<button
						type="button"
						on:click={() => navigate(index)}
						class="w-2 h-2 rounded-full transition-all"
						style="background: {index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)'};"
						aria-label="Go to slide {index + 1}"
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
