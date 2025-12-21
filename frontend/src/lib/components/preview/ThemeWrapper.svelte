<script lang="ts">
	import { cssVarsString } from '$lib/stores/appearance';
</script>

<div class="theme-wrapper min-h-screen" style={$cssVarsString}>
	<slot />
</div>

<style>
	.theme-wrapper {
		background: var(--bg-color);
		color: var(--text-color);
		font-family: var(--font-family);
	}
</style>
