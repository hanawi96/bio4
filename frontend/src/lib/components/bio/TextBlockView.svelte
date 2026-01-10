<script lang="ts">
	import type { TextBlockContent } from '$lib/types';

	export let content: TextBlockContent;
	export let theme: any = null;

	$: textColor = theme?.semantic?.color?.text?.default || theme?.tokens?.text || '#000000';
</script>

<div class="text-block-view">
	{#if content.subtype === 'heading'}
		<h2 class="text-3xl font-bold tracking-tight" style="color: {textColor};">
			{content.text}
		</h2>
	{:else if content.subtype === 'quote'}
		<blockquote class="border-l-4 pl-4 italic text-lg" style="color: {textColor}; border-color: {theme?.semantic?.color?.primary || theme?.tokens?.primary || '#f97316'};">
			"{content.text}"
		</blockquote>
	{:else}
		<p class="text-base leading-relaxed whitespace-pre-wrap" style="color: {textColor};">
			{content.text}
		</p>
	{/if}
</div>

<style>
	.text-block-view {
		width: 100%;
	}
</style>
