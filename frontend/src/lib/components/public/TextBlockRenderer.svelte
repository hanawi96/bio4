<script lang="ts">
	import type { TextBlockContent } from '$lib/types';
	import { parseMarkdown } from '$lib/utils/textUtils';
	
	export let content: TextBlockContent;
	export let textColor: string = '#18181b';
	
	$: parsedHtml = parseMarkdown(content.text, content.textAlign || 'center');
</script>

<div class="text-block-wrapper" style="color: {textColor};">
	{@html parsedHtml}
</div>

<style>
	.text-block-wrapper :global(a) {
		color: inherit;
		opacity: 0.8;
	}
	
	.text-block-wrapper :global(a:hover) {
		opacity: 1;
	}
	
	.text-block-wrapper :global(mark) {
		color: inherit;
	}
	
	.text-block-wrapper :global(hr) {
		border-color: currentColor;
	}
</style>
