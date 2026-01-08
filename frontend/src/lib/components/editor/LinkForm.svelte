<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageCropModal from '../modals/ImageCropModal.svelte';
	import ThumbnailSelectionModal from '../modals/ThumbnailSelectionModal.svelte';
	import IconPickerModal from '../modals/IconPickerModal.svelte';
	import GiphyPickerModal from '../modals/GiphyPickerModal.svelte';
	import { getIconUrl, getIconClasses, ICON_COLOR_PRESETS, type IconType } from '$lib/utils/iconUtils';

	export let headline = '';
	export let subtitle = '';
	export let url = '';
	export let iconType: IconType = 'none';
	export let iconData: string | null = null;
	export let iconColor: string | null = null;
	export let uploading = false;
	export let isEditMode = false;
	export let iconThumbnailColor: string = '#000000'; // Default icon color from theme

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let showCropModal = false;
	let showThumbnailModal = false;
	let showIconPickerModal = false;
	let showGiphyPickerModal = false;
	let showColorTooltip = false;
	let tempImageUrl = '';
	let colorDotButton: HTMLButtonElement;
	let tempIconColor: string | null = null; // Temp color for preview
	let originalIconColor: string | null = null; // Store original color for cancel

	// Computed icon preview URL and classes - use tempIconColor when tooltip is open
	$: previewColor = showColorTooltip ? tempIconColor : iconColor;
	$: iconPreviewUrl = getIconUrl(iconType, iconData, previewColor);
	$: iconPreviewClasses = getIconClasses(iconType, 'list-left', 'w-full h-full');
	$: canChangeColor = iconType === 'iconify' && iconData;

	function handleIconClick() {
		showThumbnailModal = true;
	}

	function handleThumbnailSelect(event: CustomEvent<{ type: 'upload' | 'icon' | 'gif' }>) {
		showThumbnailModal = false;
		
		if (event.detail.type === 'upload') {
			fileInput?.click();
		} else if (event.detail.type === 'icon') {
			showIconPickerModal = true;
		} else if (event.detail.type === 'gif') {
			showGiphyPickerModal = true;
		}
	}

	function handleIconSelect(event: CustomEvent<{ iconType: string; iconData: string; iconColor: string | null }>) {
		iconType = event.detail.iconType as IconType;
		iconData = event.detail.iconData;
		iconColor = event.detail.iconColor;
		showIconPickerModal = false;
		
		dispatch('iconChange', { 
			iconType: event.detail.iconType,
			iconData: event.detail.iconData,
			iconColor: event.detail.iconColor
		});
	}

	function handleIconPickerBack() {
		showIconPickerModal = false;
		showThumbnailModal = true;
	}

	function handleGiphySelect(event: CustomEvent<{ iconType: string; iconData: string; iconColor: string | null }>) {
		iconType = event.detail.iconType as IconType;
		iconData = event.detail.iconData;
		iconColor = event.detail.iconColor;
		showGiphyPickerModal = false;
		
		dispatch('iconChange', { 
			iconType: event.detail.iconType,
			iconData: event.detail.iconData,
			iconColor: event.detail.iconColor
		});
	}

	function handleGiphyPickerBack() {
		showGiphyPickerModal = false;
		showThumbnailModal = true;
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert('Image size must be less than 5MB');
			return;
		}

		tempImageUrl = URL.createObjectURL(file);
		showCropModal = true;
	}

	function handleCropAccept(event: CustomEvent<Blob>) {
		const croppedBlob = event.detail;
		
		if (tempImageUrl) {
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		}

		const croppedFile = new File([croppedBlob], 'icon.jpg', { type: 'image/jpeg' });
		
		iconType = 'image';
		iconColor = null;
		
		dispatch('fileChange', { target: { files: [croppedFile] } });
		showCropModal = false;
	}

	function handleCropCancel() {
		if (tempImageUrl) {
			URL.revokeObjectURL(tempImageUrl);
			tempImageUrl = '';
		}
		if (fileInput) fileInput.value = '';
		showCropModal = false;
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleSave() {
		dispatch('save');
	}

	// Color tooltip handlers
	function toggleColorTooltip(e: MouseEvent) {
		e.stopPropagation();
		if (!showColorTooltip) {
			// Opening tooltip - save original color for cancel
			originalIconColor = iconColor;
			tempIconColor = iconColor;
		}
		showColorTooltip = !showColorTooltip;
	}

	function selectTempColor(color: string | null) {
		// Update temp color for preview
		tempIconColor = color;
		// Also update actual iconColor for realtime preview in PhoneMockup
		iconColor = color;
		// Dispatch to parent immediately for preview
		dispatch('iconChange', { iconType, iconData, iconColor: color });
	}

	function saveColorChange() {
		// Just close tooltip, color already applied
		showColorTooltip = false;
	}

	function cancelColorChange() {
		// Revert to original color
		iconColor = originalIconColor;
		tempIconColor = originalIconColor;
		showColorTooltip = false;
		// Dispatch to revert in parent
		dispatch('iconChange', { iconType, iconData, iconColor: originalIconColor });
	}

	function handleCustomColorChange(e: Event) {
		const input = e.target as HTMLInputElement;
		// Reuse selectTempColor logic - DRY principle
		selectTempColor(input.value);
	}

	function handleClickOutside(e: MouseEvent) {
		if (showColorTooltip) {
			// Close tooltip when clicking outside, but let button handlers run first
			// This prevents race condition where tooltip closes before Cancel/Save handlers execute
			requestAnimationFrame(() => {
				if (showColorTooltip) {
					showColorTooltip = false;
				}
			});
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

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

			<!-- Thumbnail Upload/Select -->
			<div class="flex-shrink-0 w-24 aspect-square relative">
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
					<!-- Icon/Image thumbnail -->
					<button
						type="button"
						on:click={handleIconClick}
						class="w-full h-full rounded-xl border-2 border-gray-200 hover:border-blue-400 transition cursor-pointer relative group bg-gray-50 flex items-center justify-center overflow-hidden"
					>
						<img
							src={iconPreviewUrl}
							alt="Link icon preview"
							class="{iconPreviewClasses}"
						/>
						<div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
							</svg>
						</div>
					</button>

					<!-- Color Dot (only for iconify) - Outside the button -->
					{#if canChangeColor}
						<button
							type="button"
							on:click={toggleColorTooltip}
							bind:this={colorDotButton}
							class="color-dot-btn absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 z-10"
							style="background: {iconColor || '#000000'};"
							title="Change icon color"
						/>
					{/if}
				{:else}
					<!-- Empty state -->
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

<!-- Thumbnail Selection Modal -->
{#if showThumbnailModal}
	<ThumbnailSelectionModal
		on:select={handleThumbnailSelect}
		on:cancel={() => showThumbnailModal = false}
	/>
{/if}

<!-- Icon Picker Modal -->
{#if showIconPickerModal}
	<IconPickerModal
		initialColor={iconColor || iconThumbnailColor}
		on:select={handleIconSelect}
		on:back={handleIconPickerBack}
		on:cancel={() => showIconPickerModal = false}
	/>
{/if}

<!-- Giphy Picker Modal -->
{#if showGiphyPickerModal}
	<GiphyPickerModal
		on:select={handleGiphySelect}
		on:back={handleGiphyPickerBack}
		on:cancel={() => showGiphyPickerModal = false}
	/>
{/if}

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

<!-- Color Tooltip - Fixed positioning outside all containers -->
{#if showColorTooltip && canChangeColor && colorDotButton}
	{@const buttonRect = colorDotButton.getBoundingClientRect()}
	{@const tooltipWidth = 200}
	{@const tooltipLeft = buttonRect.right - tooltipWidth - 8}
	<div 
		class="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-fade-in"
		style="z-index: 99999; top: {buttonRect.bottom + 8}px; left: {tooltipLeft}px; width: {tooltipWidth}px;"
		on:click|stopPropagation
	>
		<div class="text-sm font-medium text-gray-600 mb-3">Icon Color</div>
		<div class="grid grid-cols-4 gap-2 mb-4">
			<!-- Custom Color Picker -->
			<button
				type="button"
				on:click={() => document.getElementById('custom-color-input')?.click()}
				class="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:scale-110 transition-all bg-white flex items-center justify-center"
				title="Add custom color"
			>
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<input
					id="custom-color-input"
					type="color"
					value={tempIconColor || '#000000'}
					on:input={handleCustomColorChange}
					class="absolute opacity-0 w-0 h-0 pointer-events-none"
				/>
			</button>

			<!-- Preset Colors -->
			{#each ICON_COLOR_PRESETS as preset}
				<button
					type="button"
					on:click={() => selectTempColor(preset.value)}
					class="w-9 h-9 rounded-full border-2 transition-all {tempIconColor === preset.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:scale-110'}"
					style="background-color: {preset.value};"
					title={preset.name}
				/>
			{/each}
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			<button
				type="button"
				on:click={cancelColorChange}
				class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
			>
				Cancel
			</button>
			<button
				type="button"
				on:click={saveColorChange}
				class="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
			>
				Save
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	.animate-fade-in {
		animation: fade-in 0.15s ease-out;
	}
</style>
