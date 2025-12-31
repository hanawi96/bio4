<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedHeaderPreset: string;
	export let headerPresets: any[];
	export let coverImageUrl: string;
	export let uploading: boolean;

	const dispatch = createEventDispatcher();

	// Check if selected preset has cover
	$: selectedPreset = headerPresets.find((p) => p.key === selectedHeaderPreset);
	// Hardcode check: with-cover and avatar-cover have cover
	$: hasCover = selectedHeaderPreset === 'with-cover' || selectedHeaderPreset === 'avatar-cover';

	function handleCoverUpload(event: Event) {
		dispatch('coverUpload', { originalEvent: event });
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Header Style</h2>
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
			<p class="text-xs text-gray-500 mt-1">Default header style for this theme</p>
		</div>

		<!-- Cover Image Upload (only show if preset has cover) -->
		{#if hasCover}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
				{#if coverImageUrl}
					<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
						<img
							src={coverImageUrl}
							alt="Cover"
							class="w-full h-32 object-cover"
						/>
						<div
							class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center"
						>
							<label
								class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
							>
								<input
									type="file"
									accept="image/*"
									on:change={handleCoverUpload}
									disabled={uploading}
									class="hidden"
								/>
								<div
									class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
										/>
									</svg>
									Change Cover
								</div>
							</label>
						</div>
						{#if uploading}
							<div
								class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
							>
								<div class="flex items-center gap-3 text-white">
									<div
										class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"
									></div>
									<span class="font-medium">Uploading...</span>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<label class="block cursor-pointer">
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							on:change={handleCoverUpload}
							disabled={uploading}
							class="hidden"
						/>
						<div
							class="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
						>
							<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
								<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div class="text-center">
								<p class="text-sm font-medium text-gray-900">Upload Cover Image</p>
								<p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</p>
							</div>
							<div
								class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
							>
								Choose File
							</div>
						</div>
					</label>
				{/if}
				<p class="text-xs text-gray-500 mt-1">Cover image for header background</p>
			</div>
		{/if}
	</div>
</section>
