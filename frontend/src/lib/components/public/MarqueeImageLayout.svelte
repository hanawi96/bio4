<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	
	const speedMap = { slow: 20, medium: 40, fast: 60 };
	const GAP_WIDTH = 16;
	
	let speed = speedMap[content.config.speed || 'medium'];
	let direction = content.config.direction || 'left';
	let pauseOnHover = content.config.pauseOnHover ?? true;
	let imageHeight = content.config.imageHeight || 120;
	let imageWidth = imageHeight * 1.5;
	let oneSetWidth = (imageWidth + GAP_WIDTH) * content.images.length;
	
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
		imageWidth = imageHeight * 1.5;
		oneSetWidth = (imageWidth + GAP_WIDTH) * content.images.length;
		
		if (directionChanged && trackElement) {
			currentPosition = direction === 'right' ? -oneSetWidth : 0;
			trackElement.style.transform = `translateX(${currentPosition}px)`;
		}
	}
	
	$: if (content.config) updateFromConfig();
	
	onMount(() => {
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
			}
			
			animationFrameId = requestAnimationFrame(animate);
		};
		
		if (direction === 'right') currentPosition = -oneSetWidth;
		animationFrameId = requestAnimationFrame(animate);
		
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	});
	
	onDestroy(() => {
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
	});
</script>

<div class="flex flex-col gap-3">
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
			{#each Array(2) as _}
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
