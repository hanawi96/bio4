<script lang="ts">
	export let selectedLinkGroupLayout: 'list' | 'grid' | 'cards';
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Link Group Layout</h2>
	<div class="space-y-4">
		<div>
			<label for="linkGroupLayout" class="block text-sm font-medium text-gray-700 mb-2">
				Default Layout
			</label>
			<select id="linkGroupLayout" bind:value={selectedLinkGroupLayout} class="input-ios">
				<option value="list">List - Vertical stacked links</option>
				<option value="grid">Grid - 2 column grid layout</option>
				<option value="cards">Cards - Card style with images</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Default layout style for link groups</p>
		</div>
	</div>
</section>
