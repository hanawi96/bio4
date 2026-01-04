<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AVATAR_BORDER_WIDTH_PRESETS, type AvatarBorderWidthKey } from '$lib/appearance/spacingTokens';
	import { HEADER_PRESETS, DEFAULT_COVER_IMAGE } from '$lib/appearance/presets';

	export let headerPresets: any[];
	export let selectedHeaderPreset: string;
	export let coverImageUrl: string;
	export let uploading: boolean;
	export let avatarSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let avatarShape: 'circle' | 'rounded' | 'square' | 'oval' | 'portrait' | 'landscape' = 'circle';
	export let contentAlign: 'left' | 'center' | 'right' = 'center';
	export let bioMaxLines: number = 3;
	export let headerSpacing: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
	export let avatarBorderColor: string;
	export let avatarBorderWidth: AvatarBorderWidthKey | number;
	export let socialIconPosition: 'header' | 'footer';
	export let socialIconColor: string;
	export let avatarGlowEnabled: boolean = false;
	export let avatarGlowColor: string = '#3b82f6';
	export let primaryColor: string = '#3b82f6';
	export let previewPage: any = null; // Preview page data with avatar_url

	const dispatch = createEventDispatcher();
	
	// Auto-reset avatar size when switching to/from with-cover preset
	$: if (selectedHeaderPreset === 'with-cover' && avatarSize === 'full') {
		avatarSize = 'lg'; // Reset to large size
	}

	// Merge frontend presets with API presets
	$: allPresets = (() => {
		const frontendPresets = Object.values(HEADER_PRESETS).map(preset => ({
			key: preset.id,
			name: preset.name,
			description: preset.description,
			category: 'basic',
			config: preset
		}));
		
		// Remove duplicates (prefer API presets)
		const apiKeys = new Set(headerPresets.map(p => p.key));
		const uniqueFrontendPresets = frontendPresets.filter(p => !apiKeys.has(p.key));
		
		return [...headerPresets, ...uniqueFrontendPresets];
	})();

	// Group presets by category
	$: groupedPresets = allPresets.reduce((acc, preset) => {
		const category = preset.category || 'basic';
		if (!acc[category]) acc[category] = [];
		acc[category].push(preset);
		return acc;
	}, {} as Record<string, any[]>);

	$: categories = Object.keys(groupedPresets).sort();

	// Check if selected preset has cover
	$: selectedPreset = allPresets.find((p) => p.key === selectedHeaderPreset);
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
									{:else if preset.config?.avatarPosition === 'split-left'}
										<!-- Split Screen Preview -->
										<div class="absolute inset-0 flex items-center gap-2 px-3">
											<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md"></div>
											<div class="flex-1 space-y-1">
												<div class="w-full h-1.5 bg-gray-400 rounded"></div>
												<div class="w-3/4 h-1 bg-gray-300 rounded"></div>
												<div class="w-full h-1 bg-gray-300 rounded"></div>
											</div>
										</div>
									{:else if preset.config?.avatarPosition === 'inline-left'}
										<!-- Minimal Compact Preview -->
										<div class="absolute top-1/2 left-3 -translate-y-1/2 flex items-center gap-1.5">
											<div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
											<div class="space-y-0.5">
												<div class="w-12 h-1.5 bg-gray-400 rounded"></div>
												<div class="w-16 h-1 bg-gray-300 rounded"></div>
											</div>
										</div>
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

		<!-- Cover Image Upload (show first when with-cover is selected) -->
		{#if hasCover && !isAvatarCover}
			{@const displayCoverUrl = coverImageUrl || selectedPreset?.config?.coverValue || DEFAULT_COVER_IMAGE}
			
			<div class="border-t border-gray-200 pt-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
				
				{#if displayCoverUrl}
					<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
						<img src={displayCoverUrl} alt="Cover" class="w-full h-32 object-cover" />
						<div
							class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center"
						>
							<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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
									{coverImageUrl ? 'Change' : 'Replace'} Cover
								</div>
							</label>
						</div>
						{#if uploading}
							<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
								<div class="flex items-center gap-3 text-white">
									<div
										class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"
									></div>
									<span class="font-medium">Uploading...</span>
								</div>
							</div>
						{/if}
					</div>
					{#if !coverImageUrl}
						<p class="text-xs text-amber-600 mt-1.5 flex items-center">
							<svg class="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
							Using demo cover image. Upload your own to customize.
						</p>
					{:else}
						<p class="text-xs text-gray-500 mt-1">Cover image for header background</p>
					{/if}
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
					<p class="text-xs text-gray-500 mt-1">Cover image for header background</p>
				{/if}
			</div>
		{:else if isAvatarCover}
			<div class="border-t border-gray-200 pt-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">Avatar Preview</label>
				{#if previewPage?.avatar_url}
					<div class="rounded-xl overflow-hidden border-2 border-gray-200">
						<img src={previewPage.avatar_url} alt="Avatar" class="w-full h-32 object-cover" />
					</div>
					<p class="text-xs text-gray-500 mt-2">
						This avatar will be used as your cover background.
						<a href="/dashboard/profile" class="text-blue-600 hover:text-blue-700 font-medium"
							>Change avatar</a
						>
					</p>
				{:else}
					<div
						class="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
					>
						<div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
							<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<div class="text-center">
							<p class="text-sm font-medium text-gray-900">No Avatar Set</p>
							<p class="text-xs text-gray-500 mt-1">
								<a href="/dashboard/profile" class="text-blue-600 hover:text-blue-700 font-medium"
									>Upload an avatar</a
								> to use as cover
							</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Avatar Settings -->
		<div class="border-t border-gray-200 pt-4">
			<h3 class="text-sm font-medium text-gray-700 mb-3">Avatar Customization</h3>
			
			<!-- Avatar Size -->
			<div class="mb-4">
				<label class="block text-xs font-medium text-gray-600 mb-2">Size</label>
				<div class="grid grid-cols-6 gap-2">
					<button
						type="button"
						on:click={() => (avatarSize = 'xs')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'xs'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XS</div>
						<div class="text-[10px] opacity-60 mt-0.5">48px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'sm')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'sm'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">SM</div>
						<div class="text-[10px] opacity-60 mt-0.5">64px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'md')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'md'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">MD</div>
						<div class="text-[10px] opacity-60 mt-0.5">80px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'lg')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'lg'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">LG</div>
						<div class="text-[10px] opacity-60 mt-0.5">96px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'xl')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'xl'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XL</div>
						<div class="text-[10px] opacity-60 mt-0.5">120px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'full')}
						disabled={selectedHeaderPreset === 'with-cover'}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'full'
							? 'border-blue-600 bg-blue-50 text-blue-900'
							: selectedHeaderPreset === 'with-cover'
								? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
								: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						title={selectedHeaderPreset === 'with-cover' ? 'Full size not available with cover' : ''}
					>
						<div class="font-semibold">FULL</div>
						<div class="text-[10px] opacity-60 mt-0.5">100%</div>
					</button>
				</div>
				{#if selectedHeaderPreset === 'with-cover'}
					<p class="text-xs text-amber-600 mt-1.5 flex items-center">
						<svg class="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						Full size is not available with cover preset
					</p>
				{/if}
			</div>

			<!-- Avatar Shape -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Shape</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => avatarShape = 'circle'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'circle' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 rounded-full bg-current opacity-20"></div>
						<div class="font-semibold">Circle</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'rounded'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'rounded' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 rounded-md bg-current opacity-20"></div>
						<div class="font-semibold">Rounded</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'square'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'square' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 bg-current opacity-20"></div>
						<div class="font-semibold">Square</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'oval'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'oval' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-6 h-8 rounded-full bg-current opacity-20"></div>
						<div class="font-semibold">Oval</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'portrait'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'portrait' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-6 h-8 rounded-sm bg-current opacity-20"></div>
						<div class="font-semibold">Portrait</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'landscape'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'landscape' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-6 rounded-sm bg-current opacity-20"></div>
						<div class="font-semibold">Landscape</div>
					</button>
				</div>
			</div>
		</div>

		<!-- Content Settings -->
		<div class="border-t border-gray-200 pt-4">
			<h3 class="text-sm font-medium text-gray-700 mb-3">Content Settings</h3>
			
			<!-- Text Align -->
			<div class="mb-4">
				<label class="block text-xs font-medium text-gray-600 mb-2">Text Alignment</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => contentAlign = 'left'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {contentAlign === 'left' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14" />
						</svg>
						<span>Left</span>
					</button>
					<button
						type="button"
						on:click={() => contentAlign = 'center'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {contentAlign === 'center' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14" />
						</svg>
						<span>Center</span>
					</button>
					<button
						type="button"
						on:click={() => contentAlign = 'right'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 {contentAlign === 'right' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14" />
						</svg>
						<span>Right</span>
					</button>
				</div>
			</div>

			<!-- Bio Max Lines -->
			<div class="mb-4">
				<label class="block text-xs font-medium text-gray-600 mb-2">Bio Max Lines</label>
				<div class="grid grid-cols-5 gap-2">
					{#each [1, 2, 3, 4, 5] as lines}
						<button
							type="button"
							on:click={() => bioMaxLines = lines}
							class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {bioMaxLines === lines ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							<div class="font-semibold text-lg">{lines}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Spacing -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Spacing</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => headerSpacing = 'compact'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all {headerSpacing === 'compact' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Compact</div>
						<div class="text-[10px] opacity-60 mt-0.5">Tight</div>
					</button>
					<button
						type="button"
						on:click={() => headerSpacing = 'comfortable'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all {headerSpacing === 'comfortable' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Comfortable</div>
						<div class="text-[10px] opacity-60 mt-0.5">Default</div>
					</button>
					<button
						type="button"
						on:click={() => headerSpacing = 'spacious'}
						class="py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all {headerSpacing === 'spacious' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">Spacious</div>
						<div class="text-[10px] opacity-60 mt-0.5">Loose</div>
					</button>
				</div>
			</div>
		</div>

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
		
		<!-- Avatar Glow Effect -->
		<div class="border-t border-gray-200 pt-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Avatar Glow Effect</label>
					<p class="text-xs text-gray-500 mt-0.5">Add glowing effect to avatar</p>
				</div>
				<button
					type="button"
					on:click={() => {
						avatarGlowEnabled = !avatarGlowEnabled;
						if (avatarGlowEnabled && !avatarGlowColor) {
							avatarGlowColor = primaryColor;
						}
					}}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {avatarGlowEnabled ? 'bg-green-600' : 'bg-gray-200'}"
				>
					<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {avatarGlowEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
				</button>
			</div>
			
			{#if avatarGlowEnabled}
				<div class="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div>
						<label class="block text-xs font-medium text-gray-600 mb-2">Glow Color</label>
						<div class="flex gap-2">
							<input
								type="color"
								bind:value={avatarGlowColor}
								class="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
							/>
							<input
								type="text"
								bind:value={avatarGlowColor}
								placeholder="#3b82f6"
								class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
							/>
							<button
								type="button"
								on:click={() => avatarGlowColor = primaryColor}
								class="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
								title="Use primary color"
							>
								Primary
							</button>
						</div>
					</div>
					
					<!-- Preview -->
					<div class="p-4 bg-gray-900 rounded-lg flex justify-center">
						{#if previewPage?.avatar_url}
							<img 
								src={previewPage.avatar_url} 
								alt="Avatar Preview" 
								class="w-20 h-20 rounded-full object-cover"
								style="box-shadow: 0 0 20px {avatarGlowColor}, 0 0 40px {avatarGlowColor}, 0 0 60px {avatarGlowColor};"
							/>
						{:else}
							<div 
								class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
								style="background: {primaryColor}; box-shadow: 0 0 20px {avatarGlowColor}, 0 0 40px {avatarGlowColor}, 0 0 60px {avatarGlowColor};"
							>
								{(previewPage?.title || 'U').charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

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
