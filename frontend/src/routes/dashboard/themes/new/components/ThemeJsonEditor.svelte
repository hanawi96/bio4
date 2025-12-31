<script lang="ts">
	export let configJson: string;
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Advanced Configuration (JSON)</h2>
	<div>
		<label for="config" class="block text-sm font-medium text-gray-700 mb-2">
			Full theme configuration
		</label>
		<textarea
			id="config"
			bind:value={configJson}
			rows="20"
			class="input-ios font-mono text-xs"
			placeholder=""
		></textarea>
		<p class="text-xs text-gray-500 mt-2">
			Edit colors, typography, layout, tokens, semantic mappings, and all advanced settings. Changes to presets above will update this JSON automatically.
		</p>
	</div>
</section>
