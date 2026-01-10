<script lang="ts">
	import type { ImageBlockContent } from '$lib/types';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
	
	const spacingMap = {
		compact: 8,
		comfortable: 16,
		spacious: 24
	};
	
	const aspectMap = {
		square: '1/1',
		portrait: '3/4',
		landscape: '16/9'
	};
	
	$: spacing = spacingMap[content.config.spacing || 'comfortable'];
	$: aspectRatio = aspectMap[content.config.imageAspect || 'square'];
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
	
	<!-- Images -->
	{#each content.images as image}
		<div class="overflow-hidden" style="border-radius: {blockBorderRadius};">
			{#if image.link}
				<a href={image.link} target="_blank" rel="noopener noreferrer" class="block">
					<img 
						src={image.url} 
						alt={image.caption || ''} 
						class="w-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
						style="aspect-ratio: {aspectRatio};"
					/>
				</a>
			{:else}
				<img 
					src={image.url} 
					alt={image.caption || ''} 
					class="w-full object-cover"
					style="aspect-ratio: {aspectRatio};"
				/>
			{/if}
			{#if image.caption}
				<div 
					class="px-3 py-2 text-sm"
					style="
						background: {blockStyle?.fill || 'rgba(0,0,0,0.05)'};
						color: {blockStyle?.text || '#000000'};
					"
				>
					{image.caption}
				</div>
			{/if}
		</div>
	{/each}
</div>
