<script lang="ts">
	export let fontFamily: string;
	export let baseFontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
	export let headingFontSize: 'lg' | 'xl' | '2xl';
	export let bodyFontWeight: 'normal' | 'medium';
	export let headingFontWeight: 'medium' | 'semibold' | 'bold';
	export let bodyLineHeight: 'tight' | 'normal' | 'relaxed';
	export let headingLineHeight: 'tight' | 'normal' | 'relaxed';
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
	<div class="space-y-4">
		<div>
			<label for="fontFamily" class="block text-sm font-medium text-gray-700 mb-2">
				Font Family
			</label>
			<input
				id="fontFamily"
				type="text"
				bind:value={fontFamily}
				class="input-ios"
				placeholder="Inter, system-ui, sans-serif"
			/>
			<p class="text-xs text-gray-500 mt-1">CSS font-family value</p>
		</div>
		<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="baseFontSize" class="block text-sm font-medium text-gray-700 mb-2">
				Base Font Size
			</label>
			<select id="baseFontSize" bind:value={baseFontSize} class="input-ios">
				<option value="xs">Extra Small (12px)</option>
				<option value="sm">Small (14px)</option>
				<option value="base">Base (16px)</option>
				<option value="lg">Large (18px)</option>
				<option value="xl">Extra Large (20px)</option>
				<option value="2xl">2X Large (24px)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Body text size</p>
		</div>
		<div>
			<label for="headingFontSize" class="block text-sm font-medium text-gray-700 mb-2">
				Heading Font Size
			</label>
			<select id="headingFontSize" bind:value={headingFontSize} class="input-ios">
				<option value="lg">Large (18px)</option>
				<option value="xl">Extra Large (20px)</option>
				<option value="2xl">2X Large (24px)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Name/title size</p>
		</div>
		<div>
			<label for="bodyFontWeight" class="block text-sm font-medium text-gray-700 mb-2">
				Body Font Weight
			</label>
			<select id="bodyFontWeight" bind:value={bodyFontWeight} class="input-ios">
				<option value="normal">Normal (400)</option>
				<option value="medium">Medium (500)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Body text weight</p>
		</div>
		<div>
			<label for="headingFontWeight" class="block text-sm font-medium text-gray-700 mb-2">
				Heading Font Weight
			</label>
			<select id="headingFontWeight" bind:value={headingFontWeight} class="input-ios">
				<option value="medium">Medium (500)</option>
				<option value="semibold">Semibold (600)</option>
				<option value="bold">Bold (700)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Name/title weight</p>
		</div>
		<div>
			<label for="bodyLineHeight" class="block text-sm font-medium text-gray-700 mb-2">
				Body Line Height
			</label>
			<select id="bodyLineHeight" bind:value={bodyLineHeight} class="input-ios">
				<option value="tight">Tight (1.25)</option>
				<option value="normal">Normal (1.5)</option>
				<option value="relaxed">Relaxed (1.75)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Body text spacing</p>
		</div>
		<div>
			<label for="headingLineHeight" class="block text-sm font-medium text-gray-700 mb-2">
				Heading Line Height
			</label>
			<select id="headingLineHeight" bind:value={headingLineHeight} class="input-ios">
				<option value="tight">Tight (1.25)</option>
				<option value="normal">Normal (1.5)</option>
				<option value="relaxed">Relaxed (1.75)</option>
			</select>
			<p class="text-xs text-gray-500 mt-1">Heading text spacing</p>
		</div>
	</div>
	</div>
</section>
