<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';

	export let bgType: 'solid' | 'gradient' | 'image' | 'video';
	export let bgSolidColor: string;
	export let bgGradientType: 'linear' | 'radial';
	export let bgGradientFrom: string;
	export let bgGradientTo: string;
	export let bgGradientMiddle: string;
	export let bgGradientMiddleEnabled: boolean;
	export let bgGradientDirection: string;
	export let bgRadialShape: 'circle';
	export let bgRadialPosition: string;
	export let bgImageUrl: string;
	export let bgVideoUrl: string;
	export let uploading: boolean;
	export let bgBlur: number;
	export let bgBrightness: number;
	export let bgGrayscale: number;

	const dispatch = createEventDispatcher();
	
	// Video state
	let showVideoCropModal = false;
	let tempVideoFile: File | null = null;
	let tempVideoPreviewUrl = '';
	let isDragging = false;
	
	// Default video background (local)
	const DEFAULT_VIDEO_BG = '/presets/videos/14950008_1080_1920_60fps.mp4';
	
	// Filter UI state
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;

	// Gradient presets
	let GRADIENT_PRESETS = [
		{ name: 'Sunset', from: '#ff6b6b', middle: '#ee5a6f', to: '#c44569' },
		{ name: 'Ocean', from: '#667eea', middle: '#48bb78', to: '#38b2ac' },
		{ name: 'Purple Dream', from: '#6b46c1', middle: '#9f7aea', to: '#ed64a6' },
		{ name: 'Forest', from: '#22543d', middle: '#38a169', to: '#ecc94b' },
		{ name: 'Fire', from: '#c53030', middle: '#dd6b20', to: '#ecc94b' },
		{ name: 'Sky', from: '#2c5282', middle: '#4299e1', to: '#90cdf4' },
		{ name: 'Rose', from: '#702459', middle: '#d53f8c', to: '#fc8181' },
		{ name: 'Mint', from: '#276749', middle: '#48bb78', to: '#9ae6b4' }
	];

	// Direction presets
	const DIRECTION_PRESETS = [
		{ label: '↓', name: 'Top to Bottom', value: '0deg' },
		{ label: '→', name: 'Left to Right', value: '90deg' },
		{ label: '↘', name: 'Diagonal', value: '135deg' },
		{ label: '↑', name: 'Bottom to Top', value: '180deg' },
		{ label: '←', name: 'Right to Left', value: '270deg' }
	];

	// Radial position presets
	const RADIAL_POSITIONS = [
		{ label: '●', name: 'Center', value: 'center' },
		{ label: '↑', name: 'Top', value: 'top' },
		{ label: '↓', name: 'Bottom', value: 'bottom' },
		{ label: '←', name: 'Left', value: 'left' },
		{ label: '→', name: 'Right', value: 'right' },
		{ label: '⬉', name: 'Top Left', value: 'top left' },
		{ label: '⬈', name: 'Top Right', value: 'top right' },
		{ label: '⬊', name: 'Bottom Right', value: 'bottom right' }
	];

	function applyPreset(preset: typeof GRADIENT_PRESETS[0]) {
		bgGradientFrom = preset.from;
		bgGradientMiddle = preset.middle;
		bgGradientTo = preset.to;
	}

	function randomGradient() {
		const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

		bgGradientFrom = randomColor();
		bgGradientTo = randomColor();
		if (bgGradientMiddleEnabled) {
			bgGradientMiddle = randomColor();
		}

		GRADIENT_PRESETS = GRADIENT_PRESETS.map(preset => ({
			...preset,
			from: randomColor(),
			middle: randomColor(),
			to: randomColor()
		}));
	}

	function reverseColors() {
		const temp = bgGradientFrom;
		bgGradientFrom = bgGradientTo;
		bgGradientTo = temp;
	}

	function handleImageUpload(event: Event) {
		dispatch('imageUpload', { originalEvent: event });
	}
	
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
				
				canvas.toBlob((blob) => {
					if (blob) {
						resolve(URL.createObjectURL(blob));
					} else {
						reject(new Error('Failed to extract frame'));
					}
				}, 'image/jpeg', 0.9);
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

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
	
	<!-- Background Type Tabs -->
	<div class="grid grid-cols-4 gap-2 mb-4">
		<button
			type="button"
			on:click={() => bgType = 'solid'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'solid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Solid Color
		</button>
		<button
			type="button"
			on:click={() => bgType = 'gradient'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'gradient' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Gradient
		</button>
		<button
			type="button"
			on:click={() => bgType = 'image'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'image' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Image
		</button>
		<button
			type="button"
			on:click={() => bgType = 'video'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'video' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Video
		</button>
	</div>

	<!-- Solid Color -->
	{#if bgType === 'solid'}
		<div class="space-y-3">
			<label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
			<div class="flex items-center gap-3">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={bgSolidColor}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div 
						class="w-16 h-16 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {bgSolidColor};"
					></div>
				</div>
				<input
					type="text"
					bind:value={bgSolidColor}
					class="flex-1 input-ios font-mono"
					placeholder="#ffffff"
				/>
			</div>
		</div>
	{/if}

	<!-- Gradient -->
	{#if bgType === 'gradient'}
		<div class="space-y-4">
			<!-- 3-Color Toggle -->
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={bgGradientMiddleEnabled}
					class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class="text-sm font-medium text-gray-700">3-Color Gradient</span>
			</label>

			<!-- Color Pickers -->
			<div class="grid gap-4" class:grid-cols-2={!bgGradientMiddleEnabled} class:grid-cols-3={bgGradientMiddleEnabled}>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">From Color</label>
					<div class="flex items-center gap-2">
						<div class="relative flex-shrink-0">
							<input
								type="color"
								bind:value={bgGradientFrom}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div 
								class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
								style="background-color: {bgGradientFrom};"
							></div>
						</div>
						<input
							type="text"
							bind:value={bgGradientFrom}
							class="flex-1 input-ios font-mono text-sm"
							placeholder="#667eea"
						/>
					</div>
				</div>
				
				{#if bgGradientMiddleEnabled}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Middle Color</label>
						<div class="flex items-center gap-2">
							<div class="relative flex-shrink-0">
								<input
									type="color"
									bind:value={bgGradientMiddle}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div 
									class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
									style="background-color: {bgGradientMiddle};"
								></div>
							</div>
							<input
								type="text"
								bind:value={bgGradientMiddle}
								class="flex-1 input-ios font-mono text-sm"
								placeholder="#a855f7"
							/>
						</div>
					</div>
				{/if}

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">To Color</label>
					<div class="flex items-center gap-2">
						<div class="relative flex-shrink-0">
							<input
								type="color"
								bind:value={bgGradientTo}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div 
								class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
								style="background-color: {bgGradientTo};"
							></div>
						</div>
						<input
							type="text"
							bind:value={bgGradientTo}
							class="flex-1 input-ios font-mono text-sm"
							placeholder="#764ba2"
						/>
					</div>
				</div>
			</div>

			<!-- Gradient Type Toggle -->
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					on:click={() => bgGradientType = 'linear'}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgGradientType === 'linear' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					Linear
				</button>
				<button
					type="button"
					on:click={() => bgGradientType = 'radial'}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgGradientType === 'radial' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					Radial
				</button>
			</div>

			<!-- Linear Direction / Radial Options -->
			{#if bgGradientType === 'linear'}
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Direction</label>
					<div class="grid grid-cols-5 gap-2">
						{#each DIRECTION_PRESETS as preset}
							<button
								type="button"
								on:click={() => bgGradientDirection = preset.value}
								class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGradientDirection === preset.value ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								title={preset.name}
							>
								<div class="text-2xl mb-1">{preset.label}</div>
								<div class="text-[10px] {bgGradientDirection === preset.value ? 'text-blue-600 font-semibold' : 'text-gray-500'}">{preset.value}</div>
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Radial Position -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
					<div class="grid grid-cols-4 gap-2">
						{#each RADIAL_POSITIONS as preset}
							<button
								type="button"
								on:click={() => bgRadialPosition = preset.value}
								class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgRadialPosition === preset.value ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								title={preset.name}
							>
								<div class="text-xl">{preset.label}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Quick Actions -->
			<div class="flex gap-2">
				<button
					type="button"
					on:click={randomGradient}
					class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2"
				>
					<span>🎲</span>
					<span>Random</span>
				</button>
				<button
					type="button"
					on:click={reverseColors}
					class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2"
				>
					<span>⇄</span>
					<span>Reverse</span>
				</button>
			</div>

			<!-- Gradient Presets -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
				<div class="grid grid-cols-4 gap-2">
					{#each GRADIENT_PRESETS as preset}
						<button
							type="button"
							on:click={() => applyPreset(preset)}
							class="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:scale-105"
							style="background: linear-gradient(135deg, {preset.from} 0%, {bgGradientMiddleEnabled ? `${preset.middle} 50%, ` : ''}{preset.to} 100%); height: 60px;"
						>
							<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
								<span class="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{preset.name}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Preview -->
			<div class="mt-3">
				<p class="text-xs text-gray-500 mb-2">Preview:</p>
				<div
					class="h-20 rounded-lg border-2 border-gray-200"
					style="background: {bgGradientType === 'linear' 
						? `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientMiddleEnabled ? `${bgGradientMiddle} 50%, ` : ''}${bgGradientTo} 100%)`
						: `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom} 0%, ${bgGradientMiddleEnabled ? `${bgGradientMiddle} 50%, ` : ''}${bgGradientTo} 100%)`
					};"
				></div>
			</div>
		</div>
	{/if}

	<!-- Image Upload -->
	{#if bgType === 'image'}
		<div class="space-y-3">
			{#if bgImageUrl}
				<!-- Preview with uploaded image -->
				<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
					<img 
						src={bgImageUrl} 
						alt="Background" 
						class="w-full h-48 object-cover"
						style="filter: blur({bgBlur}px) brightness({bgBrightness / 100}) grayscale({bgGrayscale / 100});"
					/>
					<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
						<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
							<input
								type="file"
								accept="image/*"
								on:change={handleImageUpload}
								disabled={uploading}
								class="hidden"
							/>
							<div class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								Change Image
							</div>
						</label>
					</div>
					{#if uploading}
						<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
							<div class="flex items-center gap-3 text-white">
								<div class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
								<span class="font-medium">Uploading...</span>
							</div>
						</div>
					{/if}
				</div>
				
				<!-- Image Filters -->
				<div class="p-4 bg-gray-50 rounded-xl space-y-3">
					<h4 class="text-sm font-semibold text-gray-900 mb-3">Image Filters</h4>
					
					<!-- Filter Tabs -->
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							on:click={() => activeFilter = activeFilter === 'blur' ? null : 'blur'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'blur' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
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
							on:click={() => activeFilter = activeFilter === 'brightness' ? null : 'brightness'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'brightness' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
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
							on:click={() => activeFilter = activeFilter === 'grayscale' ? null : 'grayscale'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'grayscale' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
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
							<div class="grid grid-cols-4 gap-2">
								<button
									type="button"
									on:click={() => bgBlur = 0}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 0 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 0 ? 'text-blue-600' : 'text-gray-900'}">None</div>
									<div class="text-[10px] text-gray-500 mt-0.5">0px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 4}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 4 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 4 ? 'text-blue-600' : 'text-gray-900'}">Light</div>
									<div class="text-[10px] text-gray-500 mt-0.5">4px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 8}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 8 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 8 ? 'text-blue-600' : 'text-gray-900'}">Medium</div>
									<div class="text-[10px] text-gray-500 mt-0.5">8px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 15}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 15 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 15 ? 'text-blue-600' : 'text-gray-900'}">Strong</div>
									<div class="text-[10px] text-gray-500 mt-0.5">15px</div>
								</button>
							</div>
						</div>
					{:else if activeFilter === 'brightness'}
						<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div class="grid grid-cols-5 gap-2">
								<button
									type="button"
									on:click={() => bgBrightness = 50}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 50 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 50 ? 'text-blue-600' : 'text-gray-900'}">Dark</div>
									<div class="text-[10px] text-gray-500 mt-0.5">50%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 75}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 75 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 75 ? 'text-blue-600' : 'text-gray-900'}">Dim</div>
									<div class="text-[10px] text-gray-500 mt-0.5">75%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 100}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 100 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 100 ? 'text-blue-600' : 'text-gray-900'}">Normal</div>
									<div class="text-[10px] text-gray-500 mt-0.5">100%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 125}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 125 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 125 ? 'text-blue-600' : 'text-gray-900'}">Bright</div>
									<div class="text-[10px] text-gray-500 mt-0.5">125%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 150}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 150 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 150 ? 'text-blue-600' : 'text-gray-900'}">Very Bright</div>
									<div class="text-[10px] text-gray-500 mt-0.5">150%</div>
								</button>
							</div>
						</div>
					{:else if activeFilter === 'grayscale'}
						<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div class="grid grid-cols-4 gap-2">
								<button
									type="button"
									on:click={() => bgGrayscale = 0}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 0 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 0 ? 'text-blue-600' : 'text-gray-900'}">Color</div>
									<div class="text-[10px] text-gray-500 mt-0.5">0%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 50}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 50 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 50 ? 'text-blue-600' : 'text-gray-900'}">Half</div>
									<div class="text-[10px] text-gray-500 mt-0.5">50%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 75}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 75 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 75 ? 'text-blue-600' : 'text-gray-900'}">Mostly</div>
									<div class="text-[10px] text-gray-500 mt-0.5">75%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 100}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 100 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 100 ? 'text-blue-600' : 'text-gray-900'}">B&W</div>
									<div class="text-[10px] text-gray-500 mt-0.5">100%</div>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Upload button -->
				<label class="block cursor-pointer">
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						on:change={handleImageUpload}
						disabled={uploading}
						class="hidden"
					/>
					<div class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
						<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
							<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="text-center">
							<p class="text-sm font-medium text-gray-900">Upload Background Image</p>
							<p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</p>
						</div>
						<div class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
							Choose File
						</div>
					</div>
				</label>
			{/if}
		</div>
	{/if}

	<!-- Video Upload -->
	{#if bgType === 'video'}
		<div class="space-y-3">
			{#if bgVideoUrl}
				<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
					<video src={bgVideoUrl} class="w-full h-48 object-cover" autoplay loop muted playsinline></video>
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
							type="button"
							on:click={handleRemoveVideo}
							disabled={uploading}
							class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {bgVideoUrl === DEFAULT_VIDEO_BG ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							{bgVideoUrl === DEFAULT_VIDEO_BG ? 'Default' : 'Remove'}
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
						<div class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl transition-all {isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}">
							{#if uploading}
								<div class="animate-spin w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full"></div>
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
	{/if}
</section>


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
