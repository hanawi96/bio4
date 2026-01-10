<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	
	console.log('[Marquee] Component mounted, content:', content);
	
	// Speed mapping (pixels per second)
	const speedMap = {
		slow: 20,
		medium: 40,
		fast: 60
	};
	
	// Extract config values - NOT reactive, we'll handle updates manually
	let speed = speedMap[content.config.speed || 'medium'];
	let direction = content.config.direction || 'left';
	let pauseOnHover = content.config.pauseOnHover ?? true;
	let imageHeight = content.config.imageHeight || 120;
	
	console.log('[Marquee] Initial config:', { speed, direction, pauseOnHover, imageHeight });
	
	// Calculated values - NOT reactive
	let imageWidth = imageHeight * 1.5;
	let gapWidth = 16; // gap-4 = 16px
	let singleImageWidth = imageWidth + gapWidth;
	let oneSetWidth = singleImageWidth * content.images.length;
	
	console.log('[Marquee] Initial calculated:', { imageWidth, oneSetWidth, numImages: content.images.length });
	
	// Animation state
	let trackElement: HTMLDivElement;
	let currentPosition = 0;
	let animationFrameId: number;
	let isPaused = false;
	let showDebug = false;
	let lastTime = 0;
	
	// Function to recalculate values when config changes
	function updateFromConfig() {
		console.log('[Marquee] updateFromConfig called');
		
		// Update values from config
		const newSpeed = speedMap[content.config.speed || 'medium'];
		const newDirection = content.config.direction || 'left';
		const newPauseOnHover = content.config.pauseOnHover ?? true;
		const newImageHeight = content.config.imageHeight || 120;
		
		console.log('[Marquee] New config:', { newSpeed, newDirection, newPauseOnHover, newImageHeight });
		
		// Check if direction changed - need to reset position
		const directionChanged = newDirection !== direction;
		
		// Update all values
		speed = newSpeed;
		direction = newDirection;
		pauseOnHover = newPauseOnHover;
		imageHeight = newImageHeight;
		
		// Recalculate dimensions
		imageWidth = imageHeight * 1.5;
		singleImageWidth = imageWidth + gapWidth;
		oneSetWidth = singleImageWidth * content.images.length;
		
		console.log('[Marquee] Recalculated:', { imageWidth, oneSetWidth });
		
		// Reset position if direction changed
		if (directionChanged && trackElement) {
			console.log('[Marquee] Direction changed, resetting position');
			currentPosition = direction === 'right' ? -oneSetWidth : 0;
			if (trackElement) {
				trackElement.style.transform = `translateX(${currentPosition}px)`;
			}
		}
	}
	
	// Watch for config changes - use reactive statement to trigger update
	$: if (content.config) {
		console.log('[Marquee] Config changed, updating...');
		updateFromConfig();
	}
	
	onMount(() => {
		console.log('[Marquee] onMount called');
		console.log('[Marquee] trackElement:', trackElement);
		console.log('[Marquee] Initial values:', { speed, direction, oneSetWidth });
		
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === 'd' || e.key === 'D') {
				showDebug = !showDebug;
				console.log('[Marquee] Debug toggled:', showDebug);
			}
		};
		window.addEventListener('keypress', handleKeyPress);
		
		// Start animation loop
		lastTime = performance.now();
		let frameCount = 0;
		
		const animate = (currentTime: number) => {
			if (!isPaused && trackElement) {
				const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
				lastTime = currentTime;
				
				// Update position based on speed and direction
				const movement = speed * deltaTime;
				
				if (direction === 'left') {
					currentPosition -= movement;
					// When we've moved one full set, reset position
					if (currentPosition <= -oneSetWidth) {
						console.log('[Marquee] Reset position (left):', currentPosition, '→', currentPosition + oneSetWidth);
						currentPosition += oneSetWidth;
					}
				} else {
					currentPosition += movement;
					// When we've moved one full set, reset position
					if (currentPosition >= 0) {
						console.log('[Marquee] Reset position (right):', currentPosition, '→', currentPosition - oneSetWidth);
						currentPosition -= oneSetWidth;
					}
				}
				
				if (trackElement) {
					trackElement.style.transform = `translateX(${currentPosition}px)`;
				}
				
				// Log every 60 frames (roughly 1 second)
				frameCount++;
				if (frameCount % 60 === 0) {
					console.log('[Marquee] Animation running:', { currentPosition, speed, direction, isPaused });
				}
			} else {
				if (frameCount % 60 === 0) {
					console.log('[Marquee] Animation paused or no trackElement:', { isPaused, hasTrackElement: !!trackElement });
				}
				frameCount++;
			}
			
			animationFrameId = requestAnimationFrame(animate);
		};
		
		// Initialize position for right direction
		if (direction === 'right') {
			currentPosition = -oneSetWidth;
			console.log('[Marquee] Initial position for right direction:', currentPosition);
		}
		
		console.log('[Marquee] Starting animation loop');
		animationFrameId = requestAnimationFrame(animate);
		
		return () => {
			console.log('[Marquee] Cleanup onMount');
			window.removeEventListener('keypress', handleKeyPress);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});
	
	onDestroy(() => {
		console.log('[Marquee] Component destroyed');
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	});
	
	function handleMouseEnter() {
		if (pauseOnHover) {
			console.log('[Marquee] Mouse enter - pausing');
			isPaused = true;
		}
	}
	
	function handleMouseLeave() {
		if (pauseOnHover) {
			console.log('[Marquee] Mouse leave - resuming');
			isPaused = false;
		}
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
	
	<!-- Debug Info -->
	{#if showDebug}
		<div class="bg-black/80 text-white text-xs p-3 rounded font-mono space-y-1">
			<div class="text-yellow-300 font-bold">MARQUEE DEBUG (JS Animation)</div>
			<div>Images: {content.images.length}</div>
			<div>Image Width: {imageWidth}px</div>
			<div>Gap: {gapWidth}px</div>
			<div>One Set Width: {oneSetWidth}px</div>
			<div>Speed: {speed}px/s</div>
			<div class="text-green-300">Position: {currentPosition.toFixed(2)}px</div>
			<div class="text-red-300">Reset at: {direction === 'left' ? -oneSetWidth : 0}px</div>
			<div>Paused: {isPaused ? 'Yes' : 'No'}</div>
			<div class="mt-2 text-yellow-300">Press 'D' to hide</div>
		</div>
	{/if}
	
	<!-- Marquee Container -->
	<div 
		class="overflow-hidden relative"
		style="border-radius: {blockBorderRadius};"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
	>
		<div 
			bind:this={trackElement}
			class="flex gap-4 py-3"
			style="will-change: transform;"
		>
			<!-- Render 2 copies (enough for seamless loop with JS) -->
			{#each Array(2) as _, copyIdx}
				{#each content.images as image, imgIdx}
					<div 
						class="flex-shrink-0 overflow-hidden relative"
						style="
							height: {imageHeight}px;
							width: {imageWidth}px;
							border-radius: {blockBorderRadius};
						"
					>
						{#if showDebug}
							<div class="absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded z-10 font-bold shadow"
								style="background: {['#ef4444', '#3b82f6'][copyIdx]};"
							>
								{['A', 'B'][copyIdx]}{imgIdx + 1}
							</div>
						{/if}
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
		
		{#if showDebug}
			<!-- Visual markers -->
			<div class="absolute top-0 left-0 w-1 h-full bg-green-500 z-20 opacity-50"></div>
			<div class="absolute top-0 right-0 w-1 h-full bg-red-500 z-20 opacity-50"></div>
		{/if}
	</div>
</div>
