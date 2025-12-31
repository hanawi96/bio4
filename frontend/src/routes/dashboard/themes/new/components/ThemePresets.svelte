<script lang="ts">
	export let selectedHeaderPreset: string;
	export let selectedBlockStyle: 'solid' | 'soft' | 'outline' | 'glass' | 'neon' | 'brutal';
	export let selectedLinkIconShape: 'square' | 'rounded' | 'circle';
	export let selectedLinkGroupLayout: 'list' | 'grid' | 'cards';
	export let headerPresets: any[];
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Default Presets</h2>
	<div class="space-y-4">
		<div>
			<label for="headerPreset" class="block text-sm font-medium text-gray-700 mb-2">
				Header Preset
			</label>
			<select id="headerPreset" bind:value={selectedHeaderPreset} class="input-ios">
				{#each headerPresets as preset}
					<option value={preset.key}>{preset.name}</option>
				{/each}
			</select>
			<p class="text-xs text-gray-500 mt-1">
				Default header style for this theme
			</p>
		</div>
		<div>
			<label for="blockStyle" class="block text-sm font-medium text-gray-700 mb-2">
				Block Style
			</label>
			<select id="blockStyle" bind:value={selectedBlockStyle} class="input-ios">
				<option value="solid">Solid - Full color with contrast text</option>
				<option value="soft">Soft - Subtle tint with border</option>
				<option value="outline">Outline - Transparent with border</option>
				<option value="glass">Glass - Frosted glass effect</option>
				<option value="neon">Neon - Solid with glow</option>
				<option value="brutal">Brutal - Hard shadow brutalism</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">
				Button color and visual effect style
			</p>
		</div>
		<div>
			<label for="linkIconShape" class="block text-sm font-medium text-gray-700 mb-2">
				Link Icon Shape
			</label>
			<select id="linkIconShape" bind:value={selectedLinkIconShape} class="input-ios">
				<option value="square">Square - Sharp corners</option>
				<option value="rounded">Rounded - Soft corners</option>
				<option value="circle">Circle - Fully rounded</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">
				Default shape for link thumbnails/icons
			</p>
		</div>
		<div>
			<label for="linkGroupLayout" class="block text-sm font-medium text-gray-700 mb-2">
				Link Group Layout
			</label>
			<select id="linkGroupLayout" bind:value={selectedLinkGroupLayout} class="input-ios">
				<option value="list">List - Vertical stacked links</option>
				<option value="grid">Grid - 2 column grid layout</option>
				<option value="cards">Cards - Card style with images</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">
				Default layout style for link groups
			</p>
		</div>
	</div>
</section>
