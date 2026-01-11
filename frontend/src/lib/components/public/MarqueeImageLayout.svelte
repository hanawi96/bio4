<script lang="ts">
	import { onMount } from 'svelte';
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
	
	const speedMap = { slow: 20, medium: 40, fast: 60 };
	const GAP_WIDTH = 16;
	
	// Aspect ratio mapping
	const aspectMap = {
		square: 1,      // 1:1
		portrait: 0.75, // 3:4
		landscape: 1.5  // 16:9 ≈ 1.78, but we use 1.5 for better fit
	};
	
	let speed = speedMap[content.config.speed || 'medium'];
	let direction = content.config.direction || 'left';
	let pauseOnHover = content.config.pauseOnHover ?? true;
	let imageHeight = content.config.imageHeight || 120;
	let aspectRatio = aspectMap[content.config.imageAspect || 'landscape'];
	let imageWidth = imageHeight * aspectRatio;
	let oneSetWidth = (imageWidth + GAP_WIDTH) * content.images.length;
	
	// Calculate how many copies we need for seamless loop
	// We need enough copies to fill the viewport + 1 extra set for smooth transition
	let numCopies = 3; // Default minimum
	let containerWidth = 800; // Default estimate
	
	$: {
		// Recalculate when dimensions change
		if (oneSetWidth > 0) {
			numCopies = Math.max(3, Math.ceil(containerWidth / oneSetWidth) + 2);
		}
	}
	
	let trackElement: HTMLDivElement;
	let currentPosition = 0;
	let animationFrameId: number;
	let isPaused = false;
	let lastTime = 0;
	
	function updateFromConfig() {
		const newSpeed = speedMap[content.config.speed || 'medium'];
		const newDirection = content.config.direction || 'left';
		const directionChanged = newDirection !== direction;
		
		speed = newSpeed;
		direction = newDirection;
		pauseOnHover = content.config.pauseOnHover ?? true;
		imageHeight = content.config.imageHeight || 120;
		aspectRatio = aspectMap[content.config.imageAspect || 'landscape'];
		imageWidth = imageHeight * aspectRatio;
		oneSetWidth = (imageWidth + GAP_WIDTH) * content.images.length;
		
		if (directionChanged && trackElement) {
			currentPosition = direction === 'right' ? -oneSetWidth : 0;
			trackElement.style.transform = `translateX(${currentPosition}px)`;
		}
	}
	
	$: if (content.config) updateFromConfig();
	
	onMount(() => {
		// Get container width
		if (trackElement?.parentElement) {
			containerWidth = trackElement.parentElement.clientWidth;
			numCopies = Math.max(3, Math.ceil(containerWidth / oneSetWidth) + 2);
		}
		
		lastTime = performance.now();
		
		const animate = (currentTime: number) => {
			if (!isPaused && trackElement) {
				const deltaTime = (currentTime - lastTime) / 1000;
				lastTime = currentTime;
				const movement = speed * deltaTime;
				
				if (direction === 'left') {
					currentPosition -= movement;
					if (currentPosition <= -oneSetWidth) currentPosition += oneSetWidth;
				} else {
					currentPosition += movement;
					if (currentPosition >= 0) currentPosition -= oneSetWidth;
				}
				
				trackElement.style.transform = `translateX(${currentPosition}px)`;
			} else if (isPaused) {
				// Update lastTime while paused to prevent jump when resumed
				lastTime = currentTime;
			}
			
			animationFrameId = requestAnimationFrame(animate);
		};
		
		if (direction === 'right') currentPosition = -oneSetWidth;
		animationFrameId = requestAnimationFrame(animate);
		
		// Handle window resize
		const handleResize = () => {
			if (trackElement?.parentElement) {
				containerWidth = trackElement.parentElement.clientWidth;
			}
		};
		window.addEventListener('resize', handleResize);
		
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="flex flex-col gap-3">
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
	
	<div 
		class="overflow-hidden relative"
		style="border-radius: {blockBorderRadius};"
		on:mouseenter={() => { if (pauseOnHover) isPaused = true; }}
		on:mouseleave={() => { if (pauseOnHover) isPaused = false; }}
	>
		<div 
			bind:this={trackElement}
			class="flex gap-4 py-3"
			style="will-change: transform;"
		>
			{#each Array(numCopies) as _}
				{#each content.images as image}
					<div 
						class="flex-shrink-0 overflow-hidden"
						style="height: {imageHeight}px; width: {imageWidth}px; border-radius: {blockBorderRadius};"
					>
						{#if image.link}
							<a href={image.link} target="_blank" rel="noopener noreferrer" class="block w-full h-full">
								<img 
									src={image.url} 
									alt={image.caption || ''} 
									class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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
			{/each}
		</div>
	</div>
</div>
