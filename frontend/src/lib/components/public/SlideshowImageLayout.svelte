<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	
	let currentIndex = 0;
	let autoplayInterval: number | null = null;
	let isTransitioning = false;
	
	// Transition classes
	const transitionMap = {
		fade: 'transition-opacity duration-700',
		slide: 'transition-transform duration-700',
		zoom: 'transition-all duration-700'
	};
	
	const transition = content.config.transition || 'fade';
	
	function nextSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentIndex = (currentIndex + 1) % content.images.length;
		setTimeout(() => isTransitioning = false, 700);
	}
	
	function prevSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentIndex = (currentIndex - 1 + content.images.length) % content.images.length;
		setTimeout(() => isTransitioning = false, 700);
	}
	
	function goToSlide(index: number) {
		if (isTransitioning || index === currentIndex) return;
		isTransitioning = true;
		currentIndex = index;
		setTimeout(() => isTransitioning = false, 700);
	}
	
	onMount(() => {
		if (content.config.autoplay && content.images.length > 1) {
			autoplayInterval = window.setInterval(() => {
				nextSlide();
			}, (content.config.interval || 3) * 1000);
		}
	});
	
	onDestroy(() => {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
		}
	});
	
	// Get transition style for current image
	function getImageStyle(index: number) {
		if (transition === 'fade') {
			return index === currentIndex ? 'opacity-100' : 'opacity-0';
		} else if (transition === 'slide') {
			if (index === currentIndex) return 'translate-x-0';
			return index < currentIndex ? '-translate-x-full' : 'translate-x-full';
		} else if (transition === 'zoom') {
			if (index === currentIndex) return 'scale-100 opacity-100';
			return 'scale-110 opacity-0';
		}
		return '';
	}
</script>

<div class="flex flex-col gap-3">
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
	
	<!-- Main Slideshow Container -->
	<div class="flex gap-3" class:flex-col={content.config.thumbnailPosition === 'bottom'}>
		<!-- Main Image Area -->
		<div class="flex-1 relative overflow-hidden" style="border-radius: {blockBorderRadius};">
			<!-- Images -->
			<div class="relative w-full" style="aspect-ratio: 16/9;">
				{#each content.images as image, index}
					<div 
						class="absolute inset-0 {transitionMap[transition]} {getImageStyle(index)}"
					>
						{#if image.link}
							<a href={image.link} target="_blank" rel="noopener noreferrer" class="block w-full h-full">
								<img 
									src={image.url} 
									alt={image.caption || ''} 
									class="w-full h-full object-cover"
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
			
			<!-- Caption Overlay -->
			{#if content.images[currentIndex]?.caption}
				<div 
					class="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm"
					style="
						background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
						color: #ffffff;
					"
				>
					{content.images[currentIndex].caption}
				</div>
			{/if}
			
			<!-- Navigation Arrows -->
			{#if content.config.showArrows && content.images.length > 1}
				<button
					on:click={prevSlide}
					disabled={isTransitioning}
					class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg disabled:opacity-50"
					aria-label="Previous"
				>
					<svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<button
					on:click={nextSlide}
					disabled={isTransitioning}
					class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg disabled:opacity-50"
					aria-label="Next"
				>
					<svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			{/if}
			
			<!-- Dots Indicator -->
			{#if content.config.showDots && content.images.length > 1}
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
					{#each content.images as _, index}
						<button
							on:click={() => goToSlide(index)}
							disabled={isTransitioning}
							class="w-2.5 h-2.5 rounded-full transition-all disabled:opacity-50"
							style="background: {index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)'}; {index === currentIndex ? 'width: 20px;' : ''}"
							aria-label="Go to slide {index + 1}"
						/>
					{/each}
				</div>
			{/if}
			
			<!-- Image Counter -->
			<div class="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium">
				{currentIndex + 1} / {content.images.length}
			</div>
		</div>
		
		<!-- Thumbnails -->
		{#if content.config.showThumbnails && content.images.length > 1}
			<div 
				class="flex gap-2 overflow-x-auto"
				class:flex-row={content.config.thumbnailPosition === 'bottom'}
				class:flex-col={content.config.thumbnailPosition === 'right'}
				class:w-24={content.config.thumbnailPosition === 'right'}
			>
				{#each content.images as image, index}
					<button
						on:click={() => goToSlide(index)}
						disabled={isTransitioning}
						class="flex-shrink-0 overflow-hidden transition-all disabled:opacity-50"
						class:ring-2={index === currentIndex}
						class:ring-white={index === currentIndex}
						class:opacity-60={index !== currentIndex}
						style="
							border-radius: {blockBorderRadius};
							{content.config.thumbnailPosition === 'bottom' ? 'width: 80px; height: 60px;' : 'width: 100%; aspect-ratio: 4/3;'}
						"
					>
						<img 
							src={image.url} 
							alt={image.caption || ''} 
							class="w-full h-full object-cover"
						/>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
