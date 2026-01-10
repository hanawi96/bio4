<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	
	let currentIndex = 0;
	let autoplayInterval: number | null = null;
	
	function nextSlide() {
		currentIndex = (currentIndex + 1) % content.images.length;
	}
	
	function prevSlide() {
		currentIndex = (currentIndex - 1 + content.images.length) % content.images.length;
	}
	
	function goToSlide(index: number) {
		currentIndex = index;
	}
	
	onMount(() => {
		if (content.config.autoplay && content.images.length > 1) {
			autoplayInterval = window.setInterval(() => {
				nextSlide();
			}, (content.config.interval || 3) * 1000); // Convert seconds to milliseconds
		}
	});
	
	onDestroy(() => {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
		}
	});
</script>

<div class="flex flex-col" style="gap: 12px;">
	<!-- Title & Subtitle -->
	{#if content.title || content.subtitle}
		<div class="text-center px-2">
			{#if content.title}
				<h3 class="text-lg font-bold text-gray-900 mb-1">{content.title}</h3>
			{/if}
			{#if content.subtitle}
				<p class="text-sm text-gray-600">{content.subtitle}</p>
			{/if}
		</div>
	{/if}
	
	<!-- Carousel -->
	<div class="relative overflow-hidden" style="border-radius: {blockBorderRadius};">
		<!-- Images -->
		<div class="relative" style="aspect-ratio: 16/9;">
			{#each content.images as image, index}
				<div 
					class="absolute inset-0 transition-opacity duration-500"
					style="opacity: {index === currentIndex ? 1 : 0};"
				>
					{#if image.link}
						<a href={image.link} target="_blank" rel="noopener noreferrer" class="block w-full h-full">
							<img 
								src={image.url} 
								alt={image.caption || ''} 
								class="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
							/>
						</a>
					{:else}
						<img 
							src={image.url} 
							alt={image.caption || ''} 
							class="w-full h-full object-cover"
						/>
					{/if}
				</div>
			{/each}
		</div>
		
		<!-- Caption -->
		{#if content.images[currentIndex]?.caption}
			<div 
				class="px-3 py-2 text-sm"
				style="
					background: {blockStyle?.fill || 'rgba(0,0,0,0.7)'};
					color: {blockStyle?.text || '#ffffff'};
				"
			>
				{content.images[currentIndex].caption}
			</div>
		{/if}
		
		<!-- Navigation Arrows -->
		{#if content.config.showArrows && content.images.length > 1}
			<button
				on:click={prevSlide}
				class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
				aria-label="Previous"
			>
				<svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button
				on:click={nextSlide}
				class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
				aria-label="Next"
			>
				<svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}
		
		<!-- Dots -->
		{#if content.config.showDots && content.images.length > 1}
			<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
				{#each content.images as _, index}
					<button
						on:click={() => goToSlide(index)}
						class="w-2 h-2 rounded-full transition-all"
						style="background: {index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)'};"
						aria-label="Go to slide {index + 1}"
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
