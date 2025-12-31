<script lang="ts">
	import type { ThemePreset } from '$lib/types';

	export let baseThemeKey: string;
	export let themes: ThemePreset[];
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Base Theme</h2>
	<div>
		<label for="baseTheme" class="block text-sm font-medium text-gray-700 mb-2">
			Start from existing theme
		</label>
		<select
			id="baseTheme"
			bind:value={baseThemeKey}
			class="input-ios"
		>
			{#each themes as theme}
				<option value={theme.key}>{theme.name}</option>
			{/each}
		</select>
		<p class="text-xs text-gray-500 mt-2">
			The configuration will be loaded and you can edit it below
		</p>
	</div>
</section>
