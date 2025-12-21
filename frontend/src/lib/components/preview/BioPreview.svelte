<script lang="ts">
	import ThemeWrapper from './ThemeWrapper.svelte';
	import HeaderPreview from './HeaderPreview.svelte';
	import LinksPreview from './LinksPreview.svelte';
</script>

<ThemeWrapper>
	<div class="min-h-screen py-12">
		<HeaderPreview />
		<div class="mt-8">
			<LinksPreview />
		</div>
	</div>
</ThemeWrapper>
