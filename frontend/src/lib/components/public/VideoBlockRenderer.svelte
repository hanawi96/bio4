<script lang="ts">
	import type { VideoBlockContent } from '$lib/types';
	import ColumnVideoLayout from './ColumnVideoLayout.svelte';
	import CarouselVideoLayout from './CarouselVideoLayout.svelte';
	import MarqueeVideoLayout from './MarqueeVideoLayout.svelte';
	
	export let content: VideoBlockContent;
	export let textColor: string = '#18181b';
	export let mutedTextColor: string = '#71717a';
</script>

{#if content.layout === 'column'}
	<ColumnVideoLayout {content} {textColor} {mutedTextColor} />
{:else if content.layout === 'carousel'}
	<CarouselVideoLayout {content} {textColor} {mutedTextColor} />
{:else if content.layout === 'marquee'}
	<MarqueeVideoLayout {content} {textColor} {mutedTextColor} />
{/if}
