<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageCropModal from '../modals/ImageCropModal.svelte';

	export let headline = '';
	export let subtitle = '';
	export let url = '';
	export let iconPreviewUrl = '';
	export let uploading = false;
	export let isEditMode = false;

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let showCropModal = false;
	let tempImageUrl = '';

	function handleIconClick() {
		fileInput?.click();
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Validate
		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image size must be less than 5MB');
			return;
		}

		// Show crop modal
		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
	}

	function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		
		// Clean up temp URL
		if (tempImageUrl) {
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		}

		// Create File from Blob
		const croppedFile = new File([croppedBlob], 'icon.jpg', { type: 'image/jpeg' });
		
		// Dispatch with cropped file
		dispatch('fileChange', { target: { files: [croppedFile] } });
		
		showCropModal = false;
	}

	function handleCropCancel() {
		// Clean up temp URL
		if (tempImageUrl) {
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		}
		
		// Reset file input
		if (fileInput) fileInput.value = '';
		
		showCropModal = false;
	}

	function handleRemoveIcon() {
		dispatch('removeIcon');
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleSave() {
		dispatch('save');
	}
</script>

<div class="bg-white rounded-xl p-5 space-y-4 border {isEditMode ? 'border-2 border-blue-500' : 'border-gray-200'} shadow-sm">
	<!-- Link Text Section -->
	<div>
		<div class="flex items-center gap-2 mb-3">
			<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
			</svg>
			<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Link text</span>
		</div>
		
		<div class="flex gap-3">
			<!-- Image Upload -->
			<div class="flex-shrink-0 text-center">
				<input
					type="file"
					accept="image/*"
					bind:this={fileInput}
					on:change={handleFileChange}
					class="hidden"
				/>
				
				{#if uploading}
					<div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
						<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
					</div>
				{:else if iconPreviewUrl}
					<div class="relative group">
						<img 
							src={iconPreviewUrl} 
							alt="Link icon preview" 
							class="w-14 h-14 rounded-lg object-cover border border-gray-200"
						/>
						<button
							type="button"
							on:click={handleRemoveIcon}
							class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
						>
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{:else}
					<button
						type="button"
						on:click={handleIconClick}
						class="w-14 h-14 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
					</button>
				{/if}
				<span class="text-xs text-gray-500 mt-1 block">Image</span>
			</div>

			<!-- Text Inputs -->
			<div class="flex-1 space-y-2">
				<input
					type="text"
					bind:value={headline}
					placeholder="Headline"
					autofocus
					class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
				/>
				<input
					type="text"
					bind:value={subtitle}
					placeholder="Subtitle"
					class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
				/>
			</div>
		</div>
	</div>

	<!-- Website Section -->
	<div>
		<div class="flex items-center gap-2 mb-3">
			<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
			</svg>
			<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</span>
		</div>
		
		<input
			type="text"
			bind:value={url}
			placeholder="http://"
			class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
		/>
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-2 pt-1">
		<button
			on:click={handleCancel}
			class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
		>
			Cancel
		</button>
		<button
			on:click={handleSave}
			disabled={!headline.trim() || !url.trim()}
			class="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isEditMode ? 'Save' : 'Add Link'}
		</button>
	</div>
</div>

<!-- Crop Modal -->
{#if showCropModal}
	<ImageCropModal
		imageUrl={tempImageUrl}
		aspectRatio={1}
		title="Crop Link Icon"
		outputWidth={512}
		outputHeight={512}
		{uploading}
		on:accept={handleCropAccept}
		on:cancel={handleCropCancel}
	/>
{/if}
