<script lang="ts">
	import type { VideoBlockContent } from '$lib/types';
	
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
		<div class="overflow-hidden rounded-xl">
			<div style="aspect-ratio: {aspectRatio};">
				<iframe
					src={video.embedUrl}
					title={video.title || 'Video'}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					class="w-full h-full"
				></iframe>
			</div>
			{#if video.title}
				<div class="px-3 py-2 text-sm bg-gray-50" style="color: {textColor};">
					{video.title}
				</div>
			{/if}
		</div>
	{/each}
</div>
