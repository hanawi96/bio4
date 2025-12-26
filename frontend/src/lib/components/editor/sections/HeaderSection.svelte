<script lang="ts">
	import { api } from '$lib/api.client';
	import { appearanceState, updateAppearance, changeHeaderPreset } from '$lib/stores/appearanceManager';
	import { HEADER_PRESETS } from '$lib/appearance/presets';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import type { HeaderPreset } from '$lib/appearance/types';

	const username = 'demo';
	let uploading = false;
	let pendingSave = false;

	// Default cover image (demo)
	const DEFAULT_COVER_IMAGE = '/presets/images/cover-demo.jpg';

	// Crop modal state
	let showCropModal = false;
	let tempImageUrl = '';

	// Get all header presets
	const presets = Object.values(HEADER_PRESETS);

	// Derived from store
	$: selectedPresetId = $appearanceState.headerPresetId || 'no-cover';
	$: selectedPreset = HEADER_PRESETS[selectedPresetId];
	
	// Get cover value from store
	$: coverValue = ($appearanceState.overrides['header.coverValue'] as string) 
		|| selectedPreset?.coverValue 
		|| '';
	$: coverImageUrl = (() => {
		// Kiểm tra nếu coverValue là URL ảnh hợp lệ
		const isValidImageUrl = coverValue && (coverValue.startsWith('http') || coverValue.startsWith('/'));
		return isValidImageUrl ? coverValue : DEFAULT_COVER_IMAGE;
	})();
	$: isDefaultCover = coverImageUrl === DEFAULT_COVER_IMAGE;
	$: showCoverOptions = selectedPreset?.hasCover && selectedPresetId !== 'avatar-cover';

	// Select header preset
	async function selectPreset(presetId: string) {
		pendingSave = true;
		try {
			await changeHeaderPreset(presetId);
		} finally {
			pendingSave = false;
		}
	}

	async function handleCoverUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Validate
		if (!file.type.startsWith('image/')) {
			alert('Please upload an image file (JPG, PNG, WebP)');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image must be less than 5MB');
			return;
		}

		// Create temporary URL and show crop modal
		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;

		// Reset input
		input.value = '';
	}

	async function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		uploading = true;

		try {
			// Create file from blob
			const croppedFile = new File([croppedBlob], 'cover.jpg', {
				type: 'image/jpeg'
			});

			// Upload to server
			const result = await api.uploadCover(username, croppedFile);

			// Update appearance with new image URL
			await updateAppearance('header.coverValue', result.url);

			// Close modal and cleanup
			showCropModal = false;
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		} catch (e) {
			console.error('Failed to upload cover:', e);
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

	async function handleRemoveCover() {
		// Check if current image is the default one
		if (isDefaultCover) {
			alert('This is the default cover image. Upload a custom image to replace it.');
			return;
		}
		
		if (!confirm('Remove custom cover image and restore default?')) return;
		
		uploading = true;
		try {
			await api.removeCover(username);
			
			// Restore default image instead of switching to gradient
			await updateAppearance('header.coverValue', DEFAULT_COVER_IMAGE);
		} catch (e) {
			console.error('Failed to remove cover:', e);
			alert('Failed to remove cover');
		} finally {
			uploading = false;
		}
	}

	// Drag & Drop support
	let isDragging = false;

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			// Validate
			if (!file.type.startsWith('image/')) {
				alert('Please upload an image file (JPG, PNG, WebP)');
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				alert('Image must be less than 5MB');
				return;
			}

			// Create temporary URL and show crop modal
			tempImageUrl = URL.createObjectURL(file);
			showCropModal = true;
		}
	}

	function getPresetPreview(preset: HeaderPreset) {
		if (preset.id === 'avatar-cover') {
			return 'avatar-cover';
		}
		if (preset.hasCover) {
			return 'with-cover';
		}
		if (preset.id === 'centered-large') {
			return 'centered-large';
		}
		return 'no-cover';
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
	<div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="font-semibold text-gray-900">Header Style</h2>
				<p class="text-sm text-gray-500 mt-0.5">Choose your profile header layout</p>
			</div>
			{#if pendingSave}
				<div class="flex items-center gap-2 text-xs text-gray-500">
					<div class="animate-spin w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>
					Saving...
				</div>
			{/if}
		</div>
	</div>
	
	<div class="p-6">
		<!-- Header Presets Grid -->
		<div class="grid grid-cols-4 gap-3">
		{#each presets as preset}
			<button
				on:click={() => selectPreset(preset.id)}
				class="group relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] {selectedPresetId === preset.id ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}"
			>
				<!-- Preview -->
					<div class="aspect-[4/5] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 flex flex-col items-center relative overflow-hidden">
						{#if getPresetPreview(preset) === 'avatar-cover'}
							<!-- Avatar Cover - Full screen avatar with text overlay -->
							<div class="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
							
							<div class="absolute bottom-6 left-0 right-0 z-10 text-center px-4">
								<div class="h-3.5 bg-white/90 rounded-full w-28 mx-auto mb-2"></div>
								<div class="h-2 bg-white/70 rounded-full w-36 mx-auto mb-1"></div>
								<div class="h-2 bg-white/70 rounded-full w-32 mx-auto"></div>
							</div>
						{:else if getPresetPreview(preset) === 'with-cover'}
							<!-- With Cover -->
							<div class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
							
							<div class="relative z-10 mt-12">
								<div class="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
									<div class="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
								</div>
							</div>
							
							<div class="relative z-10 mt-3 text-center w-full px-4">
								<div class="h-3 bg-gray-300 rounded-full w-24 mx-auto mb-2"></div>
								<div class="h-2 bg-gray-200 rounded-full w-32 mx-auto mb-1"></div>
								<div class="h-2 bg-gray-200 rounded-full w-28 mx-auto"></div>
							</div>
						{:else if getPresetPreview(preset) === 'centered-large'}
							<!-- Centered Large - Extra large oval avatar -->
							<div class="mt-6">
								<div class="w-32 h-40 bg-gradient-to-br from-gray-300 to-gray-400 rounded-[50%] shadow-lg"></div>
							</div>
							
							<div class="mt-5 text-center w-full px-4">
								<div class="h-3.5 bg-gray-300 rounded-full w-28 mx-auto mb-2.5"></div>
								<div class="h-2 bg-gray-200 rounded-full w-36 mx-auto mb-1.5"></div>
								<div class="h-2 bg-gray-200 rounded-full w-32 mx-auto"></div>
							</div>
						{:else}
							<!-- No Cover -->
							<div class="mt-8">
								<div class="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-md"></div>
							</div>
							
							<div class="mt-4 text-center w-full px-4">
								<div class="h-3 bg-gray-300 rounded-full w-24 mx-auto mb-2"></div>
								<div class="h-2 bg-gray-200 rounded-full w-32 mx-auto mb-1"></div>
								<div class="h-2 bg-gray-200 rounded-full w-28 mx-auto"></div>
							</div>
						{/if}

						{#if selectedPresetId === preset.id}
							<div class="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
							</div>
						{/if}
					</div>
					
					<div class="py-3 px-4 bg-white border-t border-gray-100 {selectedPresetId === preset.id ? 'bg-blue-50' : ''}">
						<p class="text-sm font-semibold text-gray-900 mb-0.5">{preset.name}</p>
						<p class="text-xs text-gray-500 line-clamp-1">{preset.description}</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- Cover Options -->
		{#if showCoverOptions}
			<div class="mt-6 pt-6 border-t border-gray-200">
				<h3 class="text-sm font-semibold text-gray-900 mb-4">Cover Image</h3>

				<!-- Image Upload -->
				<div class="space-y-3">
						{#if coverImageUrl}
							<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
								<img src={coverImageUrl} alt="Cover" class="w-full h-40 object-cover" />
								<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
									<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
										<input
											type="file"
											accept="image/*"
											on:change={handleCoverUpload}
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
										on:click={handleRemoveCover}
										disabled={uploading}
										class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {isDefaultCover ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										{isDefaultCover ? 'Default' : 'Remove'}
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
									class="relative group"
									on:dragover={handleDragOver}
									on:dragleave={handleDragLeave}
									on:drop={handleDrop}
									role="button"
									tabindex="0"
								>
									<div class="flex flex-col items-center justify-center gap-4 px-6 py-12 border-2 border-dashed rounded-xl transition-all bg-gradient-to-br from-gray-50 to-white {isDragging ? 'border-blue-500 bg-blue-100 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}">
										{#if uploading}
											<div class="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full"></div>
											<div class="text-center">
												<p class="text-sm font-medium text-gray-900">Uploading cover...</p>
												<p class="text-xs text-gray-500 mt-1">Please wait</p>
											</div>
										{:else}
											<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform {isDragging ? 'scale-110' : 'group-hover:scale-110'}">
												<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
											</div>
											<div class="text-center">
												<p class="text-base font-semibold text-gray-900 mb-1">
													{isDragging ? 'Drop image here' : 'Upload Cover Image'}
												</p>
												<p class="text-sm text-gray-600 mb-2">
													{isDragging ? 'Release to upload' : 'Click to browse or drag and drop'}
												</p>
												<div class="flex items-center justify-center gap-4 text-xs text-gray-500">
													<span class="flex items-center gap-1">
														<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
														JPG, PNG, WebP
													</span>
													<span class="flex items-center gap-1">
														<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
														</svg>
														Max 5MB
													</span>
												</div>
											</div>
										{/if}
									</div>
								</div>
							</label>
							<div class="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
								</svg>
								<div class="flex-1">
									<p class="text-sm font-medium text-blue-900">Recommended size</p>
									<p class="text-xs text-blue-700 mt-0.5">1200 x 400 pixels for best quality</p>
								</div>
							</div>
						{/if}
					</div>
			</div>
		{/if}
	</div>
</section>

<!-- Crop Modal -->
{#if showCropModal}
	<ImageCropModal
		imageUrl={tempImageUrl}
		aspectRatio={3}
		outputWidth={1200}
		outputHeight={400}
		title="Adjust Cover Image"
		uploading={uploading}
		on:accept={handleCropAccept}
		on:cancel={handleCropCancel}
	/>
{/if}
