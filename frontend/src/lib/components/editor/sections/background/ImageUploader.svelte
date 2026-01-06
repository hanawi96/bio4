<script lang="ts">
	import { DEFAULT_IMAGE_BG } from '$lib/utils/background/backgroundConstants';
	import { updateAppearance, appearanceState } from '$lib/stores/appearanceManager';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import {
		resolveBlur,
		resolveBrightness,
		resolveGrayscale,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';
	import FilterTabs from './shared/FilterTabs.svelte';
	import BackgroundFilterPanel from './shared/BackgroundFilterPanel.svelte';

	export let backgroundImageUrl: string;
	export let username: string = 'demo';

	const dispatch = createEventDispatcher<{
		update: string;
		remove: void;
	}>();

	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';
	let isDragging = false;
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;

	// Get current filter values from appearanceState
	$: currentBlur = ($appearanceState.overrides['backgroundBlur'] ?? 'none') as BlurKey | number;
	$: currentBrightness = ($appearanceState.overrides['backgroundBrightness'] ?? 'normal') as
		| BrightnessKey
		| number;
	$: currentGrayscale = ($appearanceState.overrides['backgroundGrayscale'] ?? 'none') as
		| GrayscaleKey
		| number;

	// Resolve filter values to numbers for preview
	$: resolvedBlur = resolveBlur(currentBlur);
	$: resolvedBrightness = resolveBrightness(currentBrightness);
	$: resolvedGrayscale = resolveGrayscale(currentGrayscale);

	// Background filters - computed for preview
	$: previewFilters = `blur(${resolvedBlur}px) brightness(${resolvedBrightness / 100}) grayscale(${resolvedGrayscale / 100})`;

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

	function handleBackgroundUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Please upload an image file (JPG, PNG, WebP)');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image must be less than 5MB');
			return;
		}

		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
		input.value = '';
	}

	async function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		uploading = true;

		try {
			const croppedFile = new File([croppedBlob], 'background.jpg', {
				type: 'image/jpeg'
			});

			const result = await api.uploadBackground(username, croppedFile);
			dispatch('update', result.url);

			showCropModal = false;
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		} catch (e) {
			console.error('Failed to upload background:', e);
			alert('Failed to upload image. Please try again.');
		} finally {
			uploading = false;
		}
	}

	function handleCropCancel() {
		showCropModal = false;
		URL.revokeObjectURL(tempImageUrl);
		tempImageUrl = '';
	}

	async function handleRemoveBackground() {
		// Check if current image is the default one
		if (backgroundImageUrl === DEFAULT_IMAGE_BG) {
			alert('This is the default background image. Upload a custom image to replace it.');
			return;
		}
		
		if (!confirm('Remove custom background image and restore default?')) return;
		
		uploading = true;
		try {
			await api.removeBackground(username);
			dispatch('remove');
		} catch (e) {
			console.error('Failed to remove background:', e);
			alert('Failed to remove background');
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

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Please upload an image file (JPG, PNG, WebP)');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image must be less than 5MB');
			return;
		}

		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
	}
</script>

<div class="space-y-3">
	{#if backgroundImageUrl}
		<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
			<img 
				src={backgroundImageUrl} 
				alt="Background" 
				class="w-full h-48 object-cover" 
				style="filter: {previewFilters};"
			/>
			<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
				<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
					<input
						type="file"
						accept="image/*"
						on:change={handleBackgroundUpload}
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
					on:click={handleRemoveBackground}
					disabled={uploading}
					class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {backgroundImageUrl === DEFAULT_IMAGE_BG ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					{backgroundImageUrl === DEFAULT_IMAGE_BG ? 'Default' : 'Remove'}
				</button>
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
				accept="image/jpeg,image/png,image/webp"
				on:change={handleBackgroundUpload}
				disabled={uploading}
				class="hidden"
			/>
			<div 
				class="relative group"
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				on:drop={handleDrop}
				role="button"
				tabindex="0"
			>
				<div class="flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed rounded-xl transition-all {isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}">
					{#if uploading}
						<div class="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full"></div>
						<p class="text-sm font-medium text-gray-900">Uploading...</p>
					{:else}
						<div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-transform {isDragging ? 'scale-110' : 'group-hover:scale-110'}">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="text-center">
							<p class="text-sm font-semibold text-gray-900 mb-1">
								{isDragging ? 'Drop image here' : 'Upload Background Image'}
							</p>
							<p class="text-xs text-gray-600">
								{isDragging ? 'Release to upload' : 'Click to browse or drag and drop'}
							</p>
						</div>
						<div class="flex items-center gap-3 text-xs text-gray-500">
							<span>JPG, PNG, WebP</span>
							<span>•</span>
							<span>Max 5MB</span>
						</div>
					{/if}
				</div>
			</div>
		</label>
	{/if}
</div>

<!-- Crop Modal -->
{#if showCropModal}
	<ImageCropModal
		imageUrl={tempImageUrl}
		aspectRatio={0.483}
		outputWidth={1080}
		outputHeight={2236}
		title="Adjust Background Image"
		uploading={uploading}
		on:accept={handleCropAccept}
		on:cancel={handleCropCancel}
	/>
{/if}
