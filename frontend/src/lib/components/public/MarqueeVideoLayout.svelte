<script lang="ts">
	import { onMount } from 'svelte';
	import type { VideoBlockContent } from '$lib/types';
	import { getVideoEmbedUrl } from '$lib/utils/videoUtils';
	
	export let content: VideoBlockContent;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
	
	const speedMap = { slow: 20, medium: 40, fast: 60 };
	const GAP_WIDTH = 16;
	
	let speed = speedMap[content.config.speed || 'medium'];
	let direction = content.config.direction || 'left';
	let pauseOnHover = content.config.pauseOnHover ?? true;
	let videoHeight = content.config.videoHeight || 300;
	let aspectRatio = content.config.aspectRatio || '16/9';
	
	// Calculate width based on aspect ratio
	let videoWidth = videoHeight * (aspectRatio === '16/9' ? 16/9 : aspectRatio === '9/16' ? 9/16 : aspectRatio === '4/3' ? 4/3 : 1);
	let oneSetWidth = (videoWidth + GAP_WIDTH) * content.videos.length;
	
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
		videoHeight = content.config.videoHeight || 300;
		aspectRatio = content.config.aspectRatio || '16/9';
		videoWidth = videoHeight * (aspectRatio === '16/9' ? 16/9 : aspectRatio === '9/16' ? 9/16 : aspectRatio === '4/3' ? 4/3 : 1);
		oneSetWidth = (videoWidth + GAP_WIDTH) * content.videos.length;
		
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
			} else if (isPaused) {
				lastTime = currentTime;
			}
			
			animationFrameId = requestAnimationFrame(animate);
		};
		
		if (direction === 'right') currentPosition = -oneSetWidth;
		animationFrameId = requestAnimationFrame(animate);
		
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
		class="overflow-hidden relative rounded-xl"
		on:mouseenter={() => { if (pauseOnHover) isPaused = true; }}
		on:mouseleave={() => { if (pauseOnHover) isPaused = false; }}
	>
		<div 
			bind:this={trackElement}
			class="flex gap-4 py-3"
			style="will-change: transform;"
		>
			{#each Array(2) as _}
				{#each content.videos as video}
					<div 
						class="flex-shrink-0 overflow-hidden rounded-xl"
						style="height: {videoHeight}px; width: {videoWidth}px;"
					>
						<iframe
							src={getVideoEmbedUrl(video.platform, video.videoId)}
							title={video.title || 'Video'}
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
							class="w-full h-full"
						></iframe>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>
