<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import { createVideoFadeHandler } from '$lib/utils/videoFadeLoop';
	import {
		BLUR_PRESETS,
		BRIGHTNESS_PRESETS,
		GRAYSCALE_PRESETS,
		resolveBlur,
		resolveBrightness,
		resolveGrayscale,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';

	export let bgVideoUrl: string;
	export let uploading: boolean;
	export let bgBlur: BlurKey | number;
	export let bgBrightness: BrightnessKey | number;
	export let bgGrayscale: GrayscaleKey | number;

	const dispatch = createEventDispatcher();

	// Filter UI state
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;

	// Resolve filter values to numbers
	$: resolvedBlur = resolveBlur(bgBlur);
	$: resolvedBrightness = resolveBrightness(bgBrightness);
	$: resolvedGrayscale = resolveGrayscale(bgGrayscale);

	// Video state
	let showVideoCropModal = false;
	let tempVideoFile: File | null = null;
	let tempVideoPreviewUrl = '';
	let isDragging = false;
	let videoElement: HTMLVideoElement;

	// Default video background (local)
	const DEFAULT_VIDEO_BG = '/presets/videos/14950008_1080_1920_60fps.mp4';

	// Create video fade handler
	const handleVideoTimeUpdate = createVideoFadeHandler();
	async function handleVideoUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Validate and process video
		await processVideoFile(file);
		input.value = '';
	}

	async function processVideoFile(file: File) {
		// Validation
		if (!file.type.startsWith('video/')) {
			alert('Please upload a video file (MP4, WebM)');
			return;
		}

		if (file.size > 20 * 1024 * 1024) {
			alert('Video must be less than 20MB');
			return;
		}

		// Extract first frame and show crop modal
		tempVideoFile = file;
		tempVideoPreviewUrl = await extractVideoFrame(file);
		showVideoCropModal = true;
	}

	async function extractVideoFrame(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');
			video.preload = 'metadata';
			video.muted = true;
			video.playsInline = true;

			video.onloadeddata = () => {
				video.currentTime = 0.1; // Seek to 0.1s
			};

			video.onseeked = () => {
				const canvas = document.createElement('canvas');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;

				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(video, 0, 0);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(URL.createObjectURL(blob));
						} else {
							reject(new Error('Failed to extract frame'));
						}
					},
					'image/jpeg',
					0.9
				);
			};

			video.onerror = reject;
			video.src = URL.createObjectURL(file);
		});
	}

	function handleVideoCropAccept(event: CustomEvent<Blob>) {
		if (!tempVideoFile) return;
		dispatch('videoUpload', { file: tempVideoFile });
		showVideoCropModal = false;
		URL.revokeObjectURL(tempVideoPreviewUrl);
		tempVideoPreviewUrl = '';
		tempVideoFile = null;
	}

	function handleVideoCropCancel() {
		showVideoCropModal = false;
		URL.revokeObjectURL(tempVideoPreviewUrl);
		tempVideoPreviewUrl = '';
		tempVideoFile = null;
	}

	function handleVideoDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (!file) return;

		// Reuse validation and processing logic
		processVideoFile(file);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function handleRemoveVideo() {
		dispatch('videoRemove');
	}
</script>

<div class="space-y-3">
	{#if bgVideoUrl}
		<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
			<video 
				bind:this={videoElement}
				src={bgVideoUrl} 
				class="w-full h-48 object-cover" 
				style="filter: blur({resolvedBlur}px) brightness({resolvedBrightness / 100}) grayscale({resolvedGrayscale / 100});"
				autoplay 
				loop 
				muted 
				playsinline
				on:timeupdate={handleVideoTimeUpdate}
			></video>
			<div
				class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2"
			>
				<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
					<input
						type="file"
						accept="video/mp4,video/webm"
						on:change={handleVideoUpload}
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
						Change
					</div>
				</label>
				<button
					type="button"
					on:click={handleRemoveVideo}
					disabled={uploading}
					class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {bgVideoUrl ===
					DEFAULT_VIDEO_BG
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					{bgVideoUrl === DEFAULT_VIDEO_BG ? 'Default' : 'Remove'}
				</button>
			</div>
			{#if uploading}
				<div
					class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
				>
					<div class="flex items-center gap-3 text-white">
						<div
							class="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"
						></div>
						<span class="font-medium">Uploading...</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Video Filters -->
		<div class="p-4 bg-gray-50 rounded-xl space-y-3">
			<h4 class="text-sm font-semibold text-gray-900 mb-3">Video Filters</h4>

			<!-- Filter Tabs -->
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'blur' ? null : 'blur')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'blur'
						? 'bg-[#00aa4f] text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						<span>Blur</span>
					</div>
				</button>
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'brightness' ? null : 'brightness')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'brightness'
						? 'bg-[#00aa4f] text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
						<span>Brightness</span>
					</div>
				</button>
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'grayscale' ? null : 'grayscale')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'grayscale'
						? 'bg-[#00aa4f] text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
						</svg>
						<span>Grayscale</span>
					</div>
				</button>
			</div>

			<!-- Filter Presets (Expandable) -->
			{#if activeFilter === 'blur'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button type="button" on:click={() => (bgBlur = 'none')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'none' || bgBlur === 0 ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBlur === 'none' || bgBlur === 0 ? 'text-[#00aa4f]' : 'text-gray-900'}">None</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.none}px</div>
						</button>
						<button type="button" on:click={() => (bgBlur = 'subtle')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'subtle' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBlur === 'subtle' ? 'text-[#00aa4f]' : 'text-gray-900'}">Subtle</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.subtle}px</div>
						</button>
						<button type="button" on:click={() => (bgBlur = 'medium')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'medium' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBlur === 'medium' ? 'text-[#00aa4f]' : 'text-gray-900'}">Medium</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.medium}px</div>
						</button>
						<button type="button" on:click={() => (bgBlur = 'strong')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'strong' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBlur === 'strong' ? 'text-[#00aa4f]' : 'text-gray-900'}">Strong</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.strong}px</div>
						</button>
						<button type="button" on:click={() => (bgBlur = 'extreme')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'extreme' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBlur === 'extreme' ? 'text-[#00aa4f]' : 'text-gray-900'}">Extreme</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.extreme}px</div>
						</button>
					</div>
				</div>
			{:else if activeFilter === 'brightness'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button type="button" on:click={() => (bgBrightness = 'darkest')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 'darkest' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBrightness === 'darkest' ? 'text-[#00aa4f]' : 'text-gray-900'}">Darkest</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.darkest}%</div>
						</button>
						<button type="button" on:click={() => (bgBrightness = 'dark')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 'dark' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBrightness === 'dark' ? 'text-[#00aa4f]' : 'text-gray-900'}">Dark</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.dark}%</div>
						</button>
						<button type="button" on:click={() => (bgBrightness = 'normal')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 'normal' || bgBrightness === 100 ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBrightness === 'normal' || bgBrightness === 100 ? 'text-[#00aa4f]' : 'text-gray-900'}">Normal</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.normal}%</div>
						</button>
						<button type="button" on:click={() => (bgBrightness = 'bright')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 'bright' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBrightness === 'bright' ? 'text-[#00aa4f]' : 'text-gray-900'}">Bright</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.bright}%</div>
						</button>
						<button type="button" on:click={() => (bgBrightness = 'brightest')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 'brightest' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgBrightness === 'brightest' ? 'text-[#00aa4f]' : 'text-gray-900'}">Brightest</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.brightest}%</div>
						</button>
					</div>
				</div>
			{:else if activeFilter === 'grayscale'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button type="button" on:click={() => (bgGrayscale = 'none')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 'none' || bgGrayscale === 0 ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgGrayscale === 'none' || bgGrayscale === 0 ? 'text-[#00aa4f]' : 'text-gray-900'}">None</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.none}%</div>
						</button>
						<button type="button" on:click={() => (bgGrayscale = 'subtle')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 'subtle' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgGrayscale === 'subtle' ? 'text-[#00aa4f]' : 'text-gray-900'}">Subtle</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.subtle}%</div>
						</button>
						<button type="button" on:click={() => (bgGrayscale = 'medium')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 'medium' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgGrayscale === 'medium' ? 'text-[#00aa4f]' : 'text-gray-900'}">Medium</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.medium}%</div>
						</button>
						<button type="button" on:click={() => (bgGrayscale = 'strong')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 'strong' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgGrayscale === 'strong' ? 'text-[#00aa4f]' : 'text-gray-900'}">Strong</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.strong}%</div>
						</button>
						<button type="button" on:click={() => (bgGrayscale = 'full')} class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 'full' ? 'border-[#00aa4f] ring-2 ring-[#00aa4f]/20 bg-[#e6f7ed]' : 'border-gray-200 hover:border-gray-300 bg-white'}">
							<div class="text-xs font-semibold {bgGrayscale === 'full' ? 'text-[#00aa4f]' : 'text-gray-900'}">Full</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.full}%</div>
						</button>
					</div>
				</div>
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
				<div
					class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl transition-all {isDragging
						? 'border-[#00aa4f] bg-[#e6f7ed] scale-105'
						: 'border-gray-300 hover:border-[#00aa4f] hover:bg-[#e6f7ed]'}"
				>
					{#if uploading}
						<div
							class="animate-spin w-10 h-10 border-2 border-[#00aa4f] border-t-transparent rounded-full"
						></div>
						<p class="text-sm font-medium text-gray-900">Uploading video...</p>
					{:else}
						<div
							class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transition-transform {isDragging
								? 'scale-110'
								: 'group-hover:scale-110'}"
						>
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
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
		{uploading}
		on:accept={handleVideoCropAccept}
		on:cancel={handleVideoCropCancel}
	/>
{/if}
