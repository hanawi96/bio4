<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';

	export let bgVideoUrl: string;
	export let uploading: boolean;

	const dispatch = createEventDispatcher();

	// Video state
	let showVideoCropModal = false;
	let tempVideoFile: File | null = null;
	let tempVideoPreviewUrl = '';
	let isDragging = false;

	// Default video background (local)
	const DEFAULT_VIDEO_BG = '/presets/videos/14950008_1080_1920_60fps.mp4';

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
			<video src={bgVideoUrl} class="w-full h-48 object-cover" autoplay loop muted playsinline
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
						? 'border-blue-500 bg-blue-50 scale-105'
						: 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}"
				>
					{#if uploading}
						<div
							class="animate-spin w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full"
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
