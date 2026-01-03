<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AVATAR_BORDER_WIDTH_PRESETS, type AvatarBorderWidthKey } from '$lib/appearance/spacingTokens';

	export let headerPresets: any[];
	export let selectedHeaderPreset: string;
	export let coverImageUrl: string;
	export let uploading: boolean;
	export let avatarBorderColor: string;
	export let avatarBorderWidth: AvatarBorderWidthKey | number;
	export let socialIconPosition: 'header' | 'footer';
	export let socialIconColor: string;
	export let previewPage: any = null; // Preview page data with avatar_url

	const dispatch = createEventDispatcher();

	// Group presets by category
	$: groupedPresets = headerPresets.reduce((acc, preset) => {
		const category = preset.category || 'basic';
		if (!acc[category]) acc[category] = [];
		acc[category].push(preset);
		return acc;
	}, {} as Record<string, any[]>);

	$: categories = Object.keys(groupedPresets).sort();

	// Check if selected preset has cover
	$: selectedPreset = headerPresets.find((p) => p.key === selectedHeaderPreset);
	$: hasCover = selectedHeaderPreset === 'with-cover' || selectedHeaderPreset === 'avatar-cover';
	$: isAvatarCover = selectedHeaderPreset === 'avatar-cover';
	$: hasAvatarBorder = selectedPreset?.config?.avatarBorder === true || hasCover;

	function handleCoverUpload(event: Event) {
		dispatch('coverUpload', { originalEvent: event });
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Header Style</h2>

	<div class="space-y-6">
		<!-- Preset Selection Grid -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Choose Header Preset
			</label>
			
			{#each categories as category}
				<div class="mb-4">
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
						{category}
					</h3>
					<div class="grid grid-cols-2 gap-3">
						{#each groupedPresets[category] as preset}
							<button
								type="button"
								on:click={() => selectedHeaderPreset = preset.key}
								class="relative group text-left rounded-xl border-2 transition-all overflow-hidden {selectedHeaderPreset === preset.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
							>
								<!-- Preview Thumbnail -->
								<div class="aspect-[3/2] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
									{#if preset.config?.hasCover}
										<div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500"></div>
										<div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-white shadow-lg"></div>
									{:else if preset.config?.avatarSize === 'xl'}
										<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
									{:else}
										<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
									{/if}
									
									<!-- Selected Indicator -->
									{#if selectedHeaderPreset === preset.key}
										<div class="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
											<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
											</svg>
										</div>
									{/if}
								</div>
								
								<!-- Info -->
								<div class="p-3">
									<div class="font-medium text-sm text-gray-900">{preset.name}</div>
									<div class="text-xs text-gray-500 mt-0.5 line-clamp-2">{preset.description || ''}</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Cover Image Upload (only show if preset has cover) -->
		{#if hasCover}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					{isAvatarCover ? 'Avatar Preview' : 'Cover Image'}
				</label>
				
				{#if isAvatarCover}
					<!-- Avatar Cover: Show current avatar -->
					{#if previewPage?.avatar_url}
						<div class="rounded-xl overflow-hidden border-2 border-gray-200">
							<img
								src={previewPage.avatar_url}
								alt="Avatar"
								class="w-full h-32 object-cover"
							/>
						</div>
						<p class="text-xs text-gray-500 mt-2">
							This avatar will be used as your cover background. 
							<a href="/dashboard/profile" class="text-blue-600 hover:text-blue-700 font-medium">Change avatar</a>
						</p>
					{:else}
						<div class="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
							<div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
								<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<div class="text-center">
								<p class="text-sm font-medium text-gray-900">No Avatar Set</p>
								<p class="text-xs text-gray-500 mt-1">
									<a href="/dashboard/profile" class="text-blue-600 hover:text-blue-700 font-medium">Upload an avatar</a> to use as cover
								</p>
							</div>
						</div>
					{/if}
				{:else}
					<!-- Regular Cover: Show upload form -->
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
				{/if}
			</div>
		{/if}

		<!-- Avatar Border Settings (only show if preset has avatar border) -->
		{#if hasAvatarBorder}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Avatar Border Color</label>
					<div class="flex items-center gap-3">
						<div class="relative flex-shrink-0">
							<input
								type="color"
								bind:value={avatarBorderColor}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div 
								class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
								style="background-color: {avatarBorderColor};"
							></div>
						</div>
						<input
							type="text"
							bind:value={avatarBorderColor}
							class="flex-1 input-ios font-mono text-sm"
							placeholder="#ffffff"
						/>
					</div>
					<p class="text-xs text-gray-500 mt-1">Border color for avatar (default: white)</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Avatar Border Width
					</label>
					<div class="grid grid-cols-5 gap-2">
						<button
							type="button"
							on:click={() => avatarBorderWidth = 'none'}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'none' || avatarBorderWidth === 0 ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold">None</div>
							<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.none}px</div>
						</button>
						<button
							type="button"
							on:click={() => avatarBorderWidth = 'thin'}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'thin' ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold">Thin</div>
							<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.thin}px</div>
						</button>
						<button
							type="button"
							on:click={() => avatarBorderWidth = 'default'}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'default' || avatarBorderWidth === 4 ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold">Default</div>
							<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.default}px</div>
						</button>
						<button
							type="button"
							on:click={() => avatarBorderWidth = 'thick'}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'thick' ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold">Thick</div>
							<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.thick}px</div>
						</button>
						<button
							type="button"
							on:click={() => avatarBorderWidth = 'bold'}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'bold' ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold">Bold</div>
							<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.bold}px</div>
						</button>
					</div>
					<p class="text-xs text-gray-500 mt-1.5">Border thickness around avatar</p>
				</div>
			</div>
		{/if}

		<!-- Social Icons Position -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Social Icons Position</label>
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					on:click={() => socialIconPosition = 'header'}
					class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all {socialIconPosition === 'header' ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					Below Bio
				</button>
				<button
					type="button"
					on:click={() => socialIconPosition = 'footer'}
					class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all {socialIconPosition === 'footer' ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					Below Links
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-1.5">Where to display social media icons</p>
		</div>

		<!-- Social Icons Color -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Social Icons Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={socialIconColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {socialIconColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={socialIconColor}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#000000"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">Color for social media icons</p>
		</div>
	</div>
</section>
