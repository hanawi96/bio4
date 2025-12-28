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

<div class="card-ios p-5 space-y-5 {isEditMode ? 'ring-2 ring-blue-500' : ''}">
	<!-- Link Text Section -->
	<div class="form-section-ios">
		<div class="form-label-ios">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
			</svg>
			<span>Link text</span>
		</div>
		
		<div class="flex gap-3">
			<!-- Text Inputs -->
			<div class="flex-1 flex flex-col gap-2.5">
				<input
					type="text"
					bind:value={headline}
					placeholder="Headline"
					autofocus
					class="input-ios"
				/>
				<input
					type="text"
					bind:value={subtitle}
					placeholder="Subtitle"
					class="input-ios"
				/>
			</div>

			<!-- Image Upload -->
			<div class="flex-shrink-0 w-24 aspect-square">
				<input
					type="file"
					accept="image/*"
					bind:this={fileInput}
					on:change={handleFileChange}
					class="hidden"
				/>
				
				{#if uploading}
					<div class="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
						<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
					</div>
				{:else if iconPreviewUrl}
					<button
						type="button"
						on:click={handleIconClick}
						class="w-full h-full rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition cursor-pointer relative group"
					>
						<img 
							src={iconPreviewUrl} 
							alt="Link icon preview" 
							class="w-full h-full object-cover"
						/>
						<div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
					</button>
				{:else}
					<button
						type="button"
						on:click={handleIconClick}
						class="w-full h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Website Section -->
	<div class="form-section-ios">
		<div class="form-label-ios">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
			</svg>
			<span>Website</span>
		</div>
		
		<input
			type="text"
			bind:value={url}
			placeholder="https://"
			class="input-ios"
		/>
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 pt-1">
		<button
			on:click={handleCancel}
			class="btn-ios-secondary flex-1"
		>
			Cancel
		</button>
		<button
			on:click={handleSave}
			disabled={!headline.trim() || !url.trim()}
			class="btn-ios-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
