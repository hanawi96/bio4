<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AVATAR_BORDER_WIDTH_PRESETS, SOCIAL_ICON_SIZE_PRESETS, type AvatarBorderWidthKey, type SocialIconSizeKey } from '$lib/appearance/spacingTokens';
	import { HEADER_PRESETS, DEFAULT_COVER_IMAGE } from '$lib/appearance/presets';

	export let headerPresets: any[];
	export let selectedHeaderPreset: string;
	export let coverImageUrl: string;
	export let uploading: boolean;
	export let avatarSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' = 'md';
	export let avatarShape: 'circle' | 'rounded' | 'square' | 'oval' | 'portrait' | 'landscape' = 'circle';
	export let showBio: boolean = true;
	export let avatarBorderColor: string;
	export let avatarBorderWidth: AvatarBorderWidthKey | number;
	export let socialIconPosition: 'header' | 'footer';
	export let socialIconColor: string;
	export let socialIconSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let socialIconsEnabled: boolean = true;
	export let avatarGlowEnabled: boolean = false;
	export let avatarGlowColor: string = '#3b82f6';
	export let titleGlowEnabled: boolean = false;
	export let titleGlowColor: string = '#3b82f6';
	export let primaryColor: string = '#3b82f6';
	export let previewPage: any = null;
	
	// Video cover props
	export let coverVideoUrl: string = '';
	export let coverVideoPoster: string = '';
	
	// Avatar video props
	export let avatarType: 'image' | 'video' = 'image';
	export let avatarVideoUrl: string = '';
	export let avatarVideoPreviewUrl: string = ''; // Local preview URL

	const dispatch = createEventDispatcher();
	
	// Avatar border enabled state (derived from width)
	$: avatarBorderEnabled = avatarBorderWidth !== 'none' && avatarBorderWidth !== 0;
	
	// Toggle avatar border
	function toggleAvatarBorder() {
		if (avatarBorderEnabled) {
			avatarBorderWidth = 'none';
		} else {
			avatarBorderWidth = 'default'; // 4px
		}
	}
	
	// Auto-reset avatar size when switching to/from with-cover preset
	$: if (selectedHeaderPreset === 'with-cover' && avatarSize === 'full') {
		avatarSize = 'lg';
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
		
		const apiKeys = new Set(headerPresets.map(p => p.key));
		const uniqueFrontendPresets = frontendPresets.filter(p => !apiKeys.has(p.key));
		
		return [...headerPresets, ...uniqueFrontendPresets];
	})();

	// Check if selected preset has cover
	$: selectedPreset = allPresets.find((p) => p.key === selectedHeaderPreset);
	$: isAvatarCover = selectedHeaderPreset === 'avatar-cover';
	$: hasCover = selectedHeaderPreset === 'with-cover' || isAvatarCover;
	$: hasAvatarBorder = !isAvatarCover;

	function handleCoverUpload(event: Event) {
		dispatch('coverUpload', { originalEvent: event });
	}
	
	function handleVideoUpload(event: Event) {
		dispatch('videoUpload', { originalEvent: event });
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Header Style</h2>

	<div class="space-y-6">
		<!-- Preset Selection - Grid Layout -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-3">
				Choose Header Style
			</label>
			
			<div class="grid grid-cols-3 gap-4">
				{#each allPresets as preset}
					<button
						type="button"
						on:click={() => selectedHeaderPreset = preset.key}
						class="relative group text-left rounded-xl border-2 transition-all overflow-hidden {selectedHeaderPreset === preset.key ? 'border-[#00aa4f] bg-[#e6f7ed] shadow-lg ring-2 ring-[#00aa4f]/20' : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'}"
					>
						<!-- Simple Header Preview -->
						<div class="aspect-[3/4] bg-white relative overflow-hidden">
							{#if preset.key === 'with-cover'}
								<!-- With Cover: Cover image + overlapping avatar -->
								<div class="absolute inset-0 flex flex-col">
									<!-- Cover Image -->
									<div class="h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-purple-500"></div>
									
									<!-- Avatar overlapping cover -->
									<div class="flex justify-center -mt-8">
										<div class="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
											<div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
										</div>
									</div>
									
									<!-- Content -->
									<div class="flex flex-col items-center px-4 mt-2">
										<div class="w-24 h-2.5 bg-gray-900 rounded-full mb-1.5"></div>
										<div class="w-32 h-1 bg-gray-400 rounded-full mb-0.5"></div>
										<div class="w-28 h-1 bg-gray-400 rounded-full"></div>
									</div>
								</div>
							{:else if preset.key === 'avatar-cover'}
								<!-- Avatar Cover: Full background with text overlay -->
								<div class="absolute inset-0">
									<!-- Full cover background -->
									<div class="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500"></div>
									<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
									
									<!-- Content at bottom -->
									<div class="absolute bottom-8 left-0 right-0 flex flex-col items-center px-4">
										<div class="w-12 h-12 rounded-full bg-white/95 shadow-xl mb-2"></div>
										<div class="w-24 h-2.5 bg-white rounded-full mb-1.5"></div>
										<div class="w-32 h-1 bg-white/90 rounded-full mb-0.5"></div>
										<div class="w-28 h-1 bg-white/80 rounded-full"></div>
									</div>
								</div>
							{:else}
								<!-- No Cover: Simple centered layout -->
								<div class="absolute inset-0 flex flex-col items-center justify-center px-4 bg-white">
									<!-- Avatar -->
									<div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md mb-3"></div>
									
									<!-- Content -->
									<div class="w-28 h-3 bg-gray-900 rounded-full mb-2"></div>
									<div class="w-36 h-1 bg-gray-400 rounded-full mb-0.5"></div>
									<div class="w-32 h-1 bg-gray-400 rounded-full mb-0.5"></div>
									<div class="w-28 h-1 bg-gray-400 rounded-full"></div>
								</div>
							{/if}
							
							<!-- Selected Indicator with animation -->
							{#if selectedHeaderPreset === preset.key}
								<div class="absolute top-2 right-2 w-7 h-7 bg-[#00aa4f] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
									<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
							
							<!-- Hover overlay -->
							<div class="absolute inset-0 bg-[#00aa4f]/0 group-hover:bg-[#00aa4f]/5 transition-colors pointer-events-none"></div>
						</div>
						
						<!-- Info with better typography -->
						<div class="p-3 border-t border-gray-100">
							<div class="font-semibold text-sm text-gray-900 mb-0.5">{preset.name}</div>
							<div class="text-xs text-gray-500 leading-snug line-clamp-2">{preset.description || ''}</div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Video Avatar Toggle -->
		<div class="border-t border-gray-200 pt-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Use Video Avatar</label>
					<p class="text-xs text-gray-500 mt-0.5">Upload video instead of image</p>
				</div>
				<button
					type="button"
					on:click={() => {
						const newType = avatarType === 'video' ? 'image' : 'video';
						avatarType = newType;
						
						// Set demo video when enabling video avatar (if no video exists)
						if (newType === 'video' && !avatarVideoUrl && !avatarVideoPreviewUrl) {
							avatarVideoUrl = 'https://pub-8dcc050a5a504e70a6d4626c63886201.r2.dev/cover-videos/demo-1768147322515.mp4';
						}
					}}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {avatarType === 'video' ? 'bg-[#00aa4f]' : 'bg-gray-200'}"
				>
					<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {avatarType === 'video' ? 'translate-x-6' : 'translate-x-1'}"></span>
				</button>
			</div>
			
			{#if avatarType === 'video'}
				<div class="mt-3">
					{#if avatarVideoPreviewUrl || avatarVideoUrl}
						<!-- Video Preview -->
						<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200 mb-3">
							<video
								src={avatarVideoPreviewUrl || avatarVideoUrl}
								class="w-full h-32 object-cover"
								autoplay
								muted
								loop
								playsinline
							></video>
							<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<button
									type="button"
									on:click={() => {
										avatarVideoUrl = '';
										avatarVideoPreviewUrl = '';
										avatarVideoFile = null;
										avatarType = 'image';
									}}
									class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
								>
									Remove Video
								</button>
							</div>
						</div>
					{:else}
						<!-- Upload Button -->
						<label class="block relative">
							<input
								type="file"
								accept="video/mp4,video/webm"
								class="hidden"
								on:change={(e) => dispatch('avatarVideoUpload', { originalEvent: e })}
								disabled={uploading}
							/>
							<div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#00aa4f] hover:bg-[#f0fdf4] transition-all {uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}">
								{#if uploading}
									<div class="flex flex-col items-center gap-2">
										<div class="animate-spin w-6 h-6 border-2 border-[#00aa4f] border-t-transparent rounded-full"></div>
										<p class="text-sm font-medium text-gray-700">Uploading...</p>
									</div>
								{:else}
									<svg class="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									<p class="text-sm font-medium text-gray-700">Upload Avatar Video</p>
									<p class="text-xs text-gray-500 mt-1">MP4 or WebM (max 10MB)</p>
								{/if}
							</div>
						</label>
					{/if}
				</div>
			{/if}
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
							class="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#00aa4f] hover:bg-[#e6f7ed] transition-all"
						>
							<div class="w-12 h-12 rounded-full bg-[#e6f7ed] flex items-center justify-center">
								<svg class="w-6 h-6 text-[#00aa4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								class="px-4 py-2 bg-[#00aa4f] text-white rounded-lg text-sm font-medium hover:bg-[#008f42] transition"
							>
								Choose File
							</div>
						</div>
					</label>
					<p class="text-xs text-gray-500 mt-1">Cover image for header background</p>
				{/if}
			</div>
		{:else if isAvatarCover}
			<!-- No additional upload needed for avatar-cover - uses avatar from profile -->
		{/if}

		<!-- Avatar Settings (hide for avatar-cover preset) -->
		{#if !isAvatarCover}
			<div class="border-t border-gray-200 pt-4">
				<h3 class="text-sm font-medium text-gray-700 mb-3">Avatar Customization</h3>
			
			<!-- Avatar Size -->
			<div class="mb-4">
				<label class="block text-xs font-medium text-gray-600 mb-2">Size</label>
				<div class="grid grid-cols-4 gap-2">
					<button
						type="button"
						on:click={() => (avatarSize = 'xs')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'xs'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XS</div>
						<div class="text-[10px] opacity-60 mt-0.5">112px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'sm')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'sm'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">SM</div>
						<div class="text-[10px] opacity-60 mt-0.5">128px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'md')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'md'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">MD</div>
						<div class="text-[10px] opacity-60 mt-0.5">144px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'lg')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'lg'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">LG</div>
						<div class="text-[10px] opacity-60 mt-0.5">160px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'xl')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'xl'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XL</div>
						<div class="text-[10px] opacity-60 mt-0.5">176px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = '2xl')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === '2xl'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">2XL</div>
						<div class="text-[10px] opacity-60 mt-0.5">192px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = '3xl')}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === '3xl'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">3XL</div>
						<div class="text-[10px] opacity-60 mt-0.5">208px</div>
					</button>
					<button
						type="button"
						on:click={() => (avatarSize = 'full')}
						disabled={selectedHeaderPreset === 'with-cover'}
						class="py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarSize === 'full'
							? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]'
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
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'circle' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 rounded-full bg-current opacity-20"></div>
						<div class="font-semibold">Circle</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'rounded'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'rounded' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 rounded-md bg-current opacity-20"></div>
						<div class="font-semibold">Rounded</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'square'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'square' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-8 bg-current opacity-20"></div>
						<div class="font-semibold">Square</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'oval'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'oval' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-6 h-8 rounded-full bg-current opacity-20"></div>
						<div class="font-semibold">Oval</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'portrait'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'portrait' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-6 h-8 rounded-sm bg-current opacity-20"></div>
						<div class="font-semibold">Portrait</div>
					</button>
					<button
						type="button"
						on:click={() => avatarShape = 'landscape'}
						class="py-3 px-3 text-xs font-medium rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 {avatarShape === 'landscape' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="w-8 h-6 rounded-sm bg-current opacity-20"></div>
						<div class="font-semibold">Landscape</div>
					</button>
				</div>
			</div>
		</div>
		{/if}

		<!-- Content Settings -->
		<div class="border-t border-gray-200 pt-4">
			<h3 class="text-sm font-medium text-gray-700 mb-3">Content Settings</h3>
			
			<!-- Show Bio Toggle -->
			<div class="mb-4">
				<div class="flex items-center justify-between">
					<div>
						<label class="block text-xs font-medium text-gray-600">Show Bio</label>
						<p class="text-xs text-gray-500 mt-0.5">Display bio text in header</p>
					</div>
					<button
						type="button"
						on:click={() => showBio = !showBio}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {showBio ? 'bg-[#00aa4f]' : 'bg-gray-200'}"
					>
						<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {showBio ? 'translate-x-6' : 'translate-x-1'}"></span>
					</button>
				</div>
			</div>
		</div>

		<!-- Avatar Border Settings -->
		{#if hasAvatarBorder}
			<div class="border-t border-gray-200 pt-4">
				<div class="flex items-center justify-between mb-3">
					<div>
						<label class="block text-sm font-medium text-gray-700">Avatar Border</label>
						<p class="text-xs text-gray-500 mt-0.5">Add border around avatar</p>
					</div>
					<button
						type="button"
						on:click={toggleAvatarBorder}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {avatarBorderEnabled ? 'bg-[#00aa4f]' : 'bg-gray-200'}"
					>
						<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {avatarBorderEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
					</button>
				</div>
				
				{#if avatarBorderEnabled}
					<div class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
						<div>
							<label class="block text-xs font-medium text-gray-600 mb-2">Border Color</label>
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
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-600 mb-2">Border Width</label>
							<div class="grid grid-cols-4 gap-2">
								<button
									type="button"
									on:click={() => avatarBorderWidth = 'thin'}
									class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'thin' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
								>
									<div class="font-semibold">Thin</div>
									<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.thin}px</div>
								</button>
								<button
									type="button"
									on:click={() => avatarBorderWidth = 'default'}
									class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'default' || avatarBorderWidth === 4 ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
								>
									<div class="font-semibold">Default</div>
									<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.default}px</div>
								</button>
								<button
									type="button"
									on:click={() => avatarBorderWidth = 'thick'}
									class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'thick' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
								>
									<div class="font-semibold">Thick</div>
									<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.thick}px</div>
								</button>
								<button
									type="button"
									on:click={() => avatarBorderWidth = 'bold'}
									class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {avatarBorderWidth === 'bold' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
								>
									<div class="font-semibold">Bold</div>
									<div class="text-[10px] opacity-60 mt-0.5">{AVATAR_BORDER_WIDTH_PRESETS.bold}px</div>
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Avatar Glow Effect (hide for avatar-cover) -->
		{#if !isAvatarCover}
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
								class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:border-[#00aa4f] focus:ring-2 focus:ring-[#00aa4f]/20 outline-none"
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
		{/if}

		<!-- Title Glow Effect -->
		<div class="border-t border-gray-200 pt-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Title Glow Effect</label>
					<p class="text-xs text-gray-500 mt-0.5">Add glowing effect to your name</p>
				</div>
				<button
					type="button"
					on:click={() => {
						titleGlowEnabled = !titleGlowEnabled;
						if (titleGlowEnabled && !titleGlowColor) {
							titleGlowColor = primaryColor;
						}
					}}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 {titleGlowEnabled ? 'bg-[#00aa4f]' : 'bg-gray-200'}"
					style={titleGlowEnabled ? 'box-shadow: 0 2px 8px rgba(0, 170, 79, 0.2);' : ''}
				>
					<span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 {titleGlowEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
				</button>
			</div>
			
			{#if titleGlowEnabled}
				<div class="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div>
						<label class="block text-xs font-medium text-gray-600 mb-2">Glow Color</label>
						<div class="flex gap-2">
							<input
								type="color"
								bind:value={titleGlowColor}
								class="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
							/>
							<input
								type="text"
								bind:value={titleGlowColor}
								placeholder="#3b82f6"
								class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:border-[#00aa4f] focus:ring-2 focus:ring-[#00aa4f]/20 outline-none"
							/>
							<button
								type="button"
								on:click={() => titleGlowColor = primaryColor}
								class="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
								title="Use primary color"
							>
								Primary
							</button>
						</div>
					</div>
					
					<!-- Preview -->
					<div class="p-4 bg-gray-900 rounded-lg">
						<div 
							class="text-2xl font-bold text-white text-center"
							style="text-shadow: 0 0 20px {titleGlowColor}, 0 0 40px {titleGlowColor}, 0 0 60px {titleGlowColor};"
						>
							{previewPage?.title || 'Your Name'}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Social Icons Toggle -->
		<div class="border-t border-gray-200 pt-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Show Social Icons</label>
					<p class="text-xs text-gray-500 mt-0.5">Display social media icons on page</p>
				</div>
				<button
					type="button"
					on:click={() => socialIconsEnabled = !socialIconsEnabled}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {socialIconsEnabled ? 'bg-[#00aa4f]' : 'bg-gray-200'}"
				>
					<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {socialIconsEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
				</button>
			</div>
		</div>

		{#if socialIconsEnabled}
			<!-- Social Icons Position -->
			<div class="animate-in fade-in slide-in-from-top-2 duration-200">
				<label class="block text-sm font-medium text-gray-700 mb-2">Social Icons Position</label>
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						on:click={() => socialIconPosition = 'header'}
						class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all {socialIconPosition === 'header' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						Below Bio
					</button>
					<button
						type="button"
						on:click={() => socialIconPosition = 'footer'}
						class="py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all {socialIconPosition === 'footer' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						Below Links
					</button>
				</div>
				<p class="text-xs text-gray-500 mt-1.5">Where to display social media icons</p>
			</div>

			<!-- Social Icons Color -->
			<div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
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

			<!-- Social Icons Size -->
			<div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
				<label class="block text-sm font-medium text-gray-700 mb-2">Social Icons Size</label>
				<div class="grid grid-cols-5 gap-2">
					<button
						type="button"
						on:click={() => socialIconSize = 'xs'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {socialIconSize === 'xs' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XS</div>
						<div class="text-[10px] opacity-60 mt-0.5">12px</div>
					</button>
					<button
						type="button"
						on:click={() => socialIconSize = 'sm'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {socialIconSize === 'sm' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">SM</div>
						<div class="text-[10px] opacity-60 mt-0.5">14px</div>
					</button>
					<button
						type="button"
						on:click={() => socialIconSize = 'md'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {socialIconSize === 'md' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">MD</div>
						<div class="text-[10px] opacity-60 mt-0.5">16px</div>
					</button>
					<button
						type="button"
						on:click={() => socialIconSize = 'lg'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {socialIconSize === 'lg' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">LG</div>
						<div class="text-[10px] opacity-60 mt-0.5">18px</div>
					</button>
					<button
						type="button"
						on:click={() => socialIconSize = 'xl'}
						class="py-2.5 px-2 text-xs font-medium rounded-lg border-2 transition-all {socialIconSize === 'xl' ? 'border-[#00aa4f] bg-[#e6f7ed] text-[#00aa4f]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						<div class="font-semibold">XL</div>
						<div class="text-[10px] opacity-60 mt-0.5">20px</div>
					</button>
				</div>
				<p class="text-xs text-gray-500 mt-1.5">Icon size for social media</p>
			</div>
		{/if}
	</div>
</section>
