<script lang="ts">
	import type { ImageBlockContent } from '$lib/types';
	import ColumnImageLayout from './ColumnImageLayout.svelte';
	import CarouselImageLayout from './CarouselImageLayout.svelte';
	
	export let content: ImageBlockContent;
	export let blockStyle: any;
	export let blockBorderRadius: string;
</script>

{#if content.layout === 'column'}
	<ColumnImageLayout {content} {blockStyle} {blockBorderRadius} />
{:else if content.layout === 'carousel'}
	<CarouselImageLayout {content} {blockStyle} {blockBorderRadius} />
{/if}
