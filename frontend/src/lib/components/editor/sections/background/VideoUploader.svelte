<script lang="ts">
	import { DEFAULT_VIDEO_BG } from '$lib/utils/background/backgroundConstants';
	import { updateAppearance, appearanceState } from '$lib/stores/appearanceManager';
	import { themes } from '$lib/stores/themes';
	import { FALLBACK_THEME } from '$lib/appearance/presets';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createVideoFadeHandler } from '$lib/utils/videoFadeLoop';
	import { extractVideoFrame, validateVideoFile } from '$lib/utils/videoUtils';
	import {
		resolveBlur,
		resolveBrightness,
		resolveGrayscale,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';
	import FilterTabs from '$lib/components/shared/FilterTabs.svelte';
	import BackgroundFilterPanel from '$lib/components/shared/BackgroundFilterPanel.svelte';

	export let backgroundVideoUrl: string;
	export let username: string = 'demo';

	const dispatch = createEventDispatcher<{
		update: string;
		remove: void;
	}>();

	let uploading = false;
	let showVideoCropModal = false;
	let tempVideoFile: File | null = null;
	let tempVideoPreviewUrl = '';
	let isDragging = false;
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;
	let videoElement: HTMLVideoElement;

	// Get theme config for default filter values
	$: themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
	$: currentTheme = themesMap[$appearanceState.presetKey] || FALLBACK_THEME;
	$: themeConfig = currentTheme.config;
	
	// Get current filter values: override > theme config > hardcoded default
	$: currentBlur = ($appearanceState.overrides['backgroundBlur'] 
		?? themeConfig?.background?.effects?.blur 
		?? 'none') as BlurKey | number;
	$: currentBrightness = ($appearanceState.overrides['backgroundBrightness'] 
		?? themeConfig?.background?.effects?.brightness 
		?? 'normal') as BrightnessKey | number;
	$: currentGrayscale = ($appearanceState.overrides['backgroundGrayscale'] 
		?? themeConfig?.background?.effects?.grayscale 
		?? 'none') as GrayscaleKey | number;

	// Resolve filter values to numbers for preview
	$: resolvedBlur = resolveBlur(currentBlur);
	$: resolvedBrightness = resolveBrightness(currentBrightness);
	$: resolvedGrayscale = resolveGrayscale(currentGrayscale);

	// Create video fade handler
	const handleVideoTimeUpdate = createVideoFadeHandler();

	function handleFilterSelect(filter: 'blur' | 'brightness' | 'grayscale' | null) {
		activeFilter = filter;
	}

	function handleBlurChange(value: string | number) {
		updateAppearance('backgroundBlur', value);
	}

	function handleBrightnessChange(value: string | number) {
		updateAppearance('backgroundBrightness', value);
	}

	function handleGrayscaleChange(value: string | number) {
		updateAppearance('backgroundGrayscale', value);
	}

	async function handleVideoUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validation = validateVideoFile(file);
		if (!validation.valid) {
			alert(validation.error);
			input.value = '';
			return;
		}

		tempVideoFile = file;
		tempVideoPreviewUrl = await extractVideoFrame(file);
		showVideoCropModal = true;
		
		input.value = '';
	}

	async function handleVideoCropAccept(event: CustomEvent<Blob>) {
		if (!tempVideoFile) return;
		
		uploading = true;
		try {
			const result = await api.uploadBackgroundVideo(username, tempVideoFile);
			dispatch('update', result.url);
			
			showVideoCropModal = false;
			URL.revokeObjectURL(tempVideoPreviewUrl);
			tempVideoPreviewUrl = '';
			tempVideoFile = null;
		} catch (e) {
			console.error('Failed to upload video:', e);
			alert('Failed to upload video. Please try again.');
		} finally {
			uploading = false;
		}
	}
	
	function handleVideoCropCancel() {
		showVideoCropModal = false;
		URL.revokeObjectURL(tempVideoPreviewUrl);
		tempVideoPreviewUrl = '';
		tempVideoFile = null;
	}
	
	async function handleRemoveVideo() {
		// Check if current video is the default one
		if (backgroundVideoUrl === DEFAULT_VIDEO_BG) {
			alert('This is the default background video. Upload a custom video to replace it.');
			return;
		}
		
		if (!confirm('Remove custom background video and restore default?')) return;
		
		uploading = true;
		try {
			await api.removeBackgroundVideo(username);
			dispatch('remove');
		} catch (e) {
			console.error('Failed to remove video:', e);
			alert('Failed to remove video');
		} finally {
			uploading = false;
		}
	}
	
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	async function handleVideoDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (!file) return;

		const validation = validateVideoFile(file);
		if (!validation.valid) {
			alert(validation.error);
			return;
		}

		tempVideoFile = file;
		tempVideoPreviewUrl = await extractVideoFrame(file);
		showVideoCropModal = true;
	}

</script>

<div class="space-y-3">
	{#if backgroundVideoUrl}
		<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
			<video 
				bind:this={videoElement}
				src={backgroundVideoUrl} 
				class="w-full h-48 object-cover" 
				style="filter: blur({resolvedBlur}px) brightness({resolvedBrightness / 100}) grayscale({resolvedGrayscale / 100});"
				autoplay 
				loop 
				muted 
				playsinline
				on:timeupdate={handleVideoTimeUpdate}
			></video>
			<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
				<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
					<input
						type="file"
						accept="video/mp4,video/webm"
						on:change={handleVideoUpload}
						disabled={uploading}
						class="hidden"
					/>
					<div class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
						</svg>
						Change
					</div>
				</label>
				<button
					on:click={handleRemoveVideo}
					disabled={uploading}
					class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {backgroundVideoUrl === DEFAULT_VIDEO_BG ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					{backgroundVideoUrl === DEFAULT_VIDEO_BG ? 'Default' : 'Remove'}
				</button>
			</div>
			{#if uploading}
				<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div class="flex items-center gap-3 text-white">
						<div class="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
						<span class="font-medium">Uploading...</span>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Video Filters -->
		<div class="p-4 bg-gray-50 rounded-xl space-y-3">
			<h4 class="text-sm font-semibold text-gray-900 mb-3">Video Filters</h4>
			
			<!-- Filter Tabs -->
			<FilterTabs {activeFilter} onSelect={handleFilterSelect} />

			<!-- Filter Presets (Expandable) -->
			{#if activeFilter === 'blur'}
				<BackgroundFilterPanel
					filterType="blur"
					currentValue={currentBlur}
					onChange={handleBlurChange}
				/>
			{:else if activeFilter === 'brightness'}
				<BackgroundFilterPanel
					filterType="brightness"
					currentValue={currentBrightness}
					onChange={handleBrightnessChange}
				/>
			{:else if activeFilter === 'grayscale'}
				<BackgroundFilterPanel
					filterType="grayscale"
					currentValue={currentGrayscale}
					onChange={handleGrayscaleChange}
				/>
			{/if}
		</div>
	{:else}
		<label class="block cursor-pointer">
			<input
				type="file"
				accept="video/mp4,video/webm"
				on:change={handleVideoUpload}
				disabled={uploading}
				class="hidden"
			/>
			<div 
				class="relative group"
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				on:drop={handleVideoDrop}
				role="button"
				tabindex="0"
			>
				<div class="flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed rounded-xl transition-all {isDragging ? 'border-[#00aa4f] bg-[#e6f7ed] scale-105' : 'border-gray-300 hover:border-gray-400'}">
					{#if uploading}
						<div class="animate-spin w-10 h-10 border-2 border-[#00aa4f] border-t-transparent rounded-full"></div>
						<p class="text-sm font-medium text-gray-900">Uploading video...</p>
					{:else}
						<div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transition-transform {isDragging ? 'scale-110' : 'group-hover:scale-110'}">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="text-center">
							<p class="text-sm font-semibold text-gray-900 mb-1">
								{isDragging ? 'Drop video here' : 'Upload Background Video'}
							</p>
							<p class="text-xs text-gray-600">
								{isDragging ? 'Release to upload' : 'Click to browse or drag and drop'}
							</p>
						</div>
						<div class="flex items-center gap-3 text-xs text-gray-500">
							<span>MP4, WebM</span>
							<span>•</span>
							<span>Max 20MB</span>
						</div>
					{/if}
				</div>
			</div>
		</label>
	{/if}
</div>

<!-- Video Crop Modal -->
{#if showVideoCropModal}
	<ImageCropModal
		imageUrl={tempVideoPreviewUrl}
		aspectRatio={0.483}
		outputWidth={1080}
		outputHeight={2236}
		title="Adjust Video Position"
		uploading={uploading}
		on:accept={handleVideoCropAccept}
		on:cancel={handleVideoCropCancel}
	/>
{/if}
