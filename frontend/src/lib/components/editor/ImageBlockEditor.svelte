<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { api } from '$lib/api.client';
	import { toast } from '$lib/stores/toast';
	import type { ImageBlockContent, ImageBlockImage } from '$lib/types';
	
	export let blockId: number | null = null;
	export let initialContent: ImageBlockContent | null = null;
	export let layout: 'column' | 'carousel' | 'marquee' = 'column';
	
	const dispatch = createEventDispatcher();
	
	type TabType = 'images' | 'layout';
	let activeTab: TabType = 'images';
	
	let images: ImageBlockImage[] = initialContent?.images || [];
	let config: ImageBlockContent['config'] = initialContent?.config || {
		spacing: 'comfortable',
		imageAspect: 'landscape',
		autoplay: false,
		interval: 3,
		showDots: true,
		showArrows: true,
		direction: 'left',
		speed: 'medium',
		pauseOnHover: true,
		imageHeight: 120
	};
	let title: string = initialContent?.title || '';
	let subtitle: string = initialContent?.subtitle || '';
	
	let uploading = false;
	let dragOver = false;
	let fileInput: HTMLInputElement;
	
	// Helper: Build content object
	function buildContent(): ImageBlockContent {
		return {
			layout,
			images,
			config,
			title,
			subtitle
		};
	}
	
	// Generate unique ID
	function generateId(): string {
		return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
	
	// Handle file selection
	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files) {
			await uploadFiles(Array.from(files));
		}
		// Reset input
		target.value = '';
	}
	
	// Handle drag & drop
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}
	
	function handleDragLeave() {
		dragOver = false;
	}
	
	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		
		const files = event.dataTransfer?.files;
		if (files) {
			await uploadFiles(Array.from(files));
		}
	}
	
	// Upload multiple files
	async function uploadFiles(files: File[]) {
		// Filter only images
		const imageFiles = files.filter(f => f.type.startsWith('image/'));
		
		if (imageFiles.length === 0) {
			toast.error('Please select image files only');
			return;
		}
		
		// Check file size (max 5MB each)
		const oversized = imageFiles.filter(f => f.size > 5 * 1024 * 1024);
		if (oversized.length > 0) {
			toast.error('Some images are too large (max 5MB each)');
			return;
		}
		
		uploading = true;
		
		try {
			const startIndex = images.length;
			
			// Upload all files in parallel
			const uploadPromises = imageFiles.map(async (file, index) => {
				const result = await api.uploadBlockImage(file);
				return {
					id: generateId(),
					url: result.url,
					storage_key: result.storage_key,
					sort_order: startIndex + index
				};
			});
			
			const newImages = await Promise.all(uploadPromises);
			images = [...images, ...newImages];
			
			toast.success(`Uploaded ${newImages.length} image(s)`);
			
			// Notify parent immediately
			notifyContentChange();
		} catch (error: any) {
			toast.error(error.message || 'Failed to upload images');
		} finally {
			uploading = false;
		}
	}
	
	// Delete image
	async function deleteImage(imageId: string) {
		const image = images.find(img => img.id === imageId);
		if (!image) return;
		
		// Remove from list
		images = images.filter(img => img.id !== imageId);
		
		// Notify parent immediately
		notifyContentChange();
		
		// Delete from storage (background)
		try {
			await api.deleteImage(image.storage_key);
		} catch (error) {
			console.error('Failed to delete image from storage:', error);
		}
	}
	
	// Reorder images
	function moveImage(imageId: string, direction: 'up' | 'down') {
		const index = images.findIndex(img => img.id === imageId);
		if (index === -1) return;
		
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= images.length) return;
		
		// Swap
		const temp = images[index];
		images[index] = images[newIndex];
		images[newIndex] = temp;
		
		// Update sort_order
		images = images.map((img, i) => ({ ...img, sort_order: i }));
		
		// Notify parent immediately
		notifyContentChange();
	}
	
	// Update image caption
	function updateCaption(imageId: string, caption: string) {
		images = images.map(img => 
			img.id === imageId ? { ...img, caption } : img
		);
		// Notify parent immediately
		notifyContentChange();
	}
	
	// Update image link
	function updateLink(imageId: string, link: string) {
		images = images.map(img => 
			img.id === imageId ? { ...img, link } : img
		);
		// Notify parent immediately
		notifyContentChange();
	}
	
	// Notify parent of content change (optimistic update)
	function notifyContentChange() {
		dispatch('contentChange', { content: buildContent() });
	}
	
	// Back to list - save before leaving
	function handleBack() {
		dispatch('save', { content: buildContent() });
		dispatch('back');
	}
</script>

<div class="flex flex-col h-full bg-white">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-gray-200">
		<div class="flex items-center gap-3 mb-4">
			<button
				on:click={handleBack}
				class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Image Block</h2>
				<p class="text-sm text-gray-500">
					{images.length} {images.length === 1 ? 'image' : 'images'}
				</p>
			</div>
		</div>
		
		<!-- Tabs -->
		<div class="flex gap-6 border-b border-gray-200 -mb-px">
			<button
				on:click={() => activeTab = 'images'}
				class="pb-3 px-1 font-medium text-sm transition-colors relative {activeTab === 'images' 
					? 'text-gray-900' 
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Images
				{#if activeTab === 'images'}
					<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
				{/if}
			</button>
			<button
				on:click={() => activeTab = 'layout'}
				class="pb-3 px-1 font-medium text-sm transition-colors relative {activeTab === 'layout' 
					? 'text-gray-900' 
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Layout
				{#if activeTab === 'layout'}
					<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Content -->
	<div class="flex-1 overflow-y-auto">
		{#if activeTab === 'layout'}
			<div class="p-6">
				<div class="mb-6">
					<h3 class="text-sm font-semibold text-gray-900 mb-3">Layout Style</h3>
					<div class="grid grid-cols-3 gap-3">
				<button
					on:click={() => { layout = 'column'; notifyContentChange(); }}
					class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-green-400"
					class:border-green-500={layout === 'column'}
					class:bg-green-50={layout === 'column'}
					class:border-gray-200={layout !== 'column'}
				>
					<div class="w-full space-y-1.5">
						<div class="h-3 bg-gray-400 rounded"></div>
						<div class="h-3 bg-gray-400 rounded"></div>
						<div class="h-3 bg-gray-400 rounded"></div>
					</div>
					<span class="text-xs font-medium" class:text-green-600={layout === 'column'}>Column</span>
				</button>
				
				<button
					on:click={() => { layout = 'carousel'; notifyContentChange(); }}
					class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-green-400"
					class:border-green-500={layout === 'carousel'}
					class:bg-green-50={layout === 'carousel'}
					class:border-gray-200={layout !== 'carousel'}
				>
					<div class="flex gap-1 w-full overflow-hidden">
						<div class="w-6 h-6 bg-gray-400 rounded flex-shrink-0"></div>
						<div class="w-6 h-6 bg-gray-400 rounded flex-shrink-0"></div>
						<div class="w-6 h-6 bg-gray-300 rounded flex-shrink-0"></div>
					</div>
					<span class="text-xs font-medium" class:text-green-600={layout === 'carousel'}>Carousel</span>
				</button>
				
				<button
					on:click={() => { layout = 'marquee'; notifyContentChange(); }}
					class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-green-400"
					class:border-green-500={layout === 'marquee'}
					class:bg-green-50={layout === 'marquee'}
					class:border-gray-200={layout !== 'marquee'}
				>
					<div class="flex gap-1 w-full overflow-hidden">
						<div class="w-4 h-6 bg-gray-400 rounded flex-shrink-0"></div>
						<div class="w-4 h-6 bg-gray-400 rounded flex-shrink-0"></div>
						<div class="w-4 h-6 bg-gray-400 rounded flex-shrink-0"></div>
						<div class="w-4 h-6 bg-gray-300 rounded flex-shrink-0"></div>
					</div>
					<span class="text-xs font-medium" class:text-green-600={layout === 'marquee'}>Marquee</span>
					</div>
				</div>
				
				{#if layout === 'column'}
					<!-- Column settings -->
					<div class="space-y-5">
						<!-- Spacing Presets -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Spacing</label>
							<div class="grid grid-cols-3 gap-2">
								<button
									on:click={() => { config.spacing = 'compact'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.spacing === 'compact'}
									class:bg-green-50={config.spacing === 'compact'}
									class:border-gray-200={config.spacing !== 'compact'}
								>
									<div class="flex flex-col gap-0.5 w-full">
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
									</div>
									<span class="text-xs font-medium" class:text-green-600={config.spacing === 'compact'}>Compact</span>
								</button>
								
								<button
									on:click={() => { config.spacing = 'comfortable'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.spacing === 'comfortable'}
									class:bg-green-50={config.spacing === 'comfortable'}
									class:border-gray-200={config.spacing !== 'comfortable'}
								>
									<div class="flex flex-col gap-1.5 w-full">
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
									</div>
									<span class="text-xs font-medium" class:text-green-600={config.spacing === 'comfortable'}>Comfortable</span>
								</button>
								
								<button
									on:click={() => { config.spacing = 'spacious'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.spacing === 'spacious'}
									class:bg-green-50={config.spacing === 'spacious'}
									class:border-gray-200={config.spacing !== 'spacious'}
								>
									<div class="flex flex-col gap-2.5 w-full">
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
										<div class="h-1.5 bg-gray-400 rounded"></div>
									</div>
									<span class="text-xs font-medium" class:text-green-600={config.spacing === 'spacious'}>Spacious</span>
								</button>
							</div>
						</div>
						
						<!-- Image Aspect Presets -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Image Aspect</label>
							<div class="grid grid-cols-3 gap-2">
								<button
									on:click={() => { config.imageAspect = 'square'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'square'}
									class:bg-green-50={config.imageAspect === 'square'}
									class:border-gray-200={config.imageAspect !== 'square'}
								>
									<div class="w-8 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'square'}>Square</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'portrait'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'portrait'}
									class:bg-green-50={config.imageAspect === 'portrait'}
									class:border-gray-200={config.imageAspect !== 'portrait'}
								>
									<div class="w-6 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'portrait'}>Portrait</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'landscape'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'landscape'}
									class:bg-green-50={config.imageAspect === 'landscape'}
									class:border-gray-200={config.imageAspect !== 'landscape'}
								>
									<div class="w-full h-5 bg-gray-400 rounded"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'landscape'}>Landscape</span>
								</button>
							</div>
						</div>
					</div>
				{:else if layout === 'carousel'}
					<!-- Carousel settings -->
					<div class="space-y-4">
						<!-- Autoplay Toggle -->
						<button
							on:click={() => { config.autoplay = !config.autoplay; notifyContentChange(); }}
							class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:border-green-400"
							class:border-green-500={config.autoplay}
							class:bg-green-50={config.autoplay}
							class:border-gray-200={!config.autoplay}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
									<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
									</svg>
								</div>
								<div class="text-left">
									<p class="text-sm font-semibold text-gray-900">Autoplay</p>
									<p class="text-xs text-gray-500">Auto-advance slides</p>
								</div>
							</div>
							<div class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
								class:bg-green-500={config.autoplay}
								class:bg-gray-300={!config.autoplay}
							>
								<span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
									class:translate-x-[22px]={config.autoplay}
									class:translate-x-0.5={!config.autoplay}
								/>
							</div>
						</button>
						
						<!-- Interval Slider (only if autoplay is on) -->
						{#if config.autoplay}
							<div class="p-4 bg-gray-50 rounded-lg">
								<label class="block text-sm font-medium text-gray-700 mb-3">
									Interval: {config.interval}s
								</label>
								<input
									type="range"
									bind:value={config.interval}
									on:input={notifyContentChange}
									min="1"
									max="10"
									step="1"
									class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
								/>
								<div class="flex justify-between text-xs text-gray-500 mt-1">
									<span>1s</span>
									<span>10s</span>
								</div>
							</div>
						{/if}
						
						<!-- Show Dots Toggle -->
						<button
							on:click={() => { config.showDots = !config.showDots; notifyContentChange(); }}
							class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:border-green-400"
							class:border-green-500={config.showDots}
							class:bg-green-50={config.showDots}
							class:border-gray-200={!config.showDots}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
									<div class="flex gap-1">
										<div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
										<div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
										<div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
									</div>
								</div>
								<div class="text-left">
									<p class="text-sm font-semibold text-gray-900">Show Dots</p>
									<p class="text-xs text-gray-500">Navigation dots</p>
								</div>
							</div>
							<div class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
								class:bg-green-500={config.showDots}
								class:bg-gray-300={!config.showDots}
							>
								<span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
									class:translate-x-[22px]={config.showDots}
									class:translate-x-0.5={!config.showDots}
								/>
							</div>
						</button>
						
						<!-- Show Arrows Toggle -->
						<button
							on:click={() => { config.showArrows = !config.showArrows; notifyContentChange(); }}
							class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:border-green-400"
							class:border-green-500={config.showArrows}
							class:bg-green-50={config.showArrows}
							class:border-gray-200={!config.showArrows}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
									<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
									</svg>
								</div>
								<div class="text-left">
									<p class="text-sm font-semibold text-gray-900">Show Arrows</p>
									<p class="text-xs text-gray-500">Navigation arrows</p>
								</div>
							</div>
							<div class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
								class:bg-green-500={config.showArrows}
								class:bg-gray-300={!config.showArrows}
							>
								<span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
									class:translate-x-[22px]={config.showArrows}
									class:translate-x-0.5={!config.showArrows}
								/>
							</div>
						</button>
						
						<!-- Image Aspect Presets -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Image Aspect</label>
							<div class="grid grid-cols-3 gap-2">
								<button
									on:click={() => { config.imageAspect = 'square'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'square'}
									class:bg-green-50={config.imageAspect === 'square'}
									class:border-gray-200={config.imageAspect !== 'square'}
								>
									<div class="w-8 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'square'}>Square</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'portrait'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'portrait'}
									class:bg-green-50={config.imageAspect === 'portrait'}
									class:border-gray-200={config.imageAspect !== 'portrait'}
								>
									<div class="w-6 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'portrait'}>Portrait</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'landscape'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'landscape'}
									class:bg-green-50={config.imageAspect === 'landscape'}
									class:border-gray-200={config.imageAspect !== 'landscape'}
								>
									<div class="w-full h-5 bg-gray-400 rounded"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'landscape'}>Landscape</span>
								</button>
							</div>
						</div>
					</div>
				{:else if layout === 'marquee'}
					<!-- Marquee settings -->
					<div class="space-y-4">
						<!-- Direction -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Scroll Direction</label>
							<div class="grid grid-cols-2 gap-2">
								<button
									on:click={() => { config.direction = 'left'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.direction === 'left'}
									class:bg-green-50={config.direction === 'left'}
									class:border-gray-200={config.direction !== 'left'}
								>
									<svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
									</svg>
									<span class="text-xs font-medium" class:text-green-600={config.direction === 'left'}>Left</span>
								</button>
								
								<button
									on:click={() => { config.direction = 'right'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.direction === 'right'}
									class:bg-green-50={config.direction === 'right'}
									class:border-gray-200={config.direction !== 'right'}
								>
									<svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
									</svg>
									<span class="text-xs font-medium" class:text-green-600={config.direction === 'right'}>Right</span>
								</button>
							</div>
						</div>
						
						<!-- Speed -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Scroll Speed</label>
							<div class="grid grid-cols-3 gap-2">
								<button
									on:click={() => { config.speed = 'slow'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.speed === 'slow'}
									class:bg-green-50={config.speed === 'slow'}
									class:border-gray-200={config.speed !== 'slow'}
								>
									<div class="text-2xl">🐢</div>
									<span class="text-xs font-medium" class:text-green-600={config.speed === 'slow'}>Slow</span>
								</button>
								
								<button
									on:click={() => { config.speed = 'medium'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.speed === 'medium'}
									class:bg-green-50={config.speed === 'medium'}
									class:border-gray-200={config.speed !== 'medium'}
								>
									<div class="text-2xl">🚶</div>
									<span class="text-xs font-medium" class:text-green-600={config.speed === 'medium'}>Medium</span>
								</button>
								
								<button
									on:click={() => { config.speed = 'fast'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.speed === 'fast'}
									class:bg-green-50={config.speed === 'fast'}
									class:border-gray-200={config.speed !== 'fast'}
								>
									<div class="text-2xl">🏃</div>
									<span class="text-xs font-medium" class:text-green-600={config.speed === 'fast'}>Fast</span>
								</button>
							</div>
						</div>
						
						<!-- Image Height Slider -->
						<div class="p-4 bg-gray-50 rounded-lg">
							<label class="block text-sm font-medium text-gray-700 mb-3">
								Image Height: {config.imageHeight || 120}px
							</label>
							<input
								type="range"
								bind:value={config.imageHeight}
								on:input={notifyContentChange}
								min="80"
								max="200"
								step="10"
								class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
							/>
							<div class="flex justify-between text-xs text-gray-500 mt-1">
								<span>80px</span>
								<span>200px</span>
							</div>
						</div>
						
						<!-- Pause on Hover Toggle -->
						<button
							on:click={() => { config.pauseOnHover = !config.pauseOnHover; notifyContentChange(); }}
							class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:border-green-400"
							class:border-green-500={config.pauseOnHover}
							class:bg-green-50={config.pauseOnHover}
							class:border-gray-200={!config.pauseOnHover}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
									<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
									</svg>
								</div>
								<div class="text-left">
									<p class="text-sm font-semibold text-gray-900">Pause on Hover</p>
									<p class="text-xs text-gray-500">Stop scrolling when hovering</p>
								</div>
							</div>
							<div class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
								class:bg-green-500={config.pauseOnHover}
								class:bg-gray-300={!config.pauseOnHover}
							>
								<span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
									class:translate-x-[22px]={config.pauseOnHover}
									class:translate-x-0.5={!config.pauseOnHover}
								/>
							</div>
						</button>
						
						<!-- Image Aspect Presets -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Image Aspect</label>
							<div class="grid grid-cols-3 gap-2">
								<button
									on:click={() => { config.imageAspect = 'square'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'square'}
									class:bg-green-50={config.imageAspect === 'square'}
									class:border-gray-200={config.imageAspect !== 'square'}
								>
									<div class="w-8 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'square'}>Square</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'portrait'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'portrait'}
									class:bg-green-50={config.imageAspect === 'portrait'}
									class:border-gray-200={config.imageAspect !== 'portrait'}
								>
									<div class="w-6 h-8 bg-gray-400 rounded mx-auto"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'portrait'}>Portrait</span>
								</button>
								
								<button
									on:click={() => { config.imageAspect = 'landscape'; notifyContentChange(); }}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
									class:border-green-500={config.imageAspect === 'landscape'}
									class:bg-green-50={config.imageAspect === 'landscape'}
									class:border-gray-200={config.imageAspect !== 'landscape'}
								>
									<div class="w-full h-5 bg-gray-400 rounded"></div>
									<span class="text-xs font-medium" class:text-green-600={config.imageAspect === 'landscape'}>Landscape</span>
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Images Tab -->
			<div class="p-6">
				<!-- Title & Subtitle Section -->
				<div class="mb-6 space-y-4">
					<h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
						Add a headline
						<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
							<line x1="12" y1="17" x2="12.01" y2="17"></line>
						</svg>
					</h3>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
						<div class="relative">
							<input
								type="text"
								bind:value={title}
								on:input={notifyContentChange}
								placeholder="Enter title..."
								class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
							/>
							<button
								class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
								title="Generate with AI"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
								</svg>
							</button>
						</div>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
						<div class="relative">
							<input
								type="text"
								bind:value={subtitle}
								on:input={notifyContentChange}
								placeholder="Enter subtitle..."
								class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
							/>
							<button
								class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
								title="Generate with AI"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
								</svg>
							</button>
						</div>
					</div>
				</div>
				
				<!-- Upload Zone -->
				<div
					class="border-2 border-dashed rounded-2xl p-8 text-center transition-colors mb-6"
					class:border-green-500={dragOver}
					class:bg-green-50={dragOver}
					class:border-gray-300={!dragOver}
					on:dragover={handleDragOver}
					on:dragleave={handleDragLeave}
					on:drop={handleDrop}
				>
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						multiple
						on:change={handleFileSelect}
						class="hidden"
					/>
					
					{#if uploading}
						<div class="flex flex-col items-center gap-3">
							<div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
							<p class="text-sm font-medium text-gray-900">Uploading...</p>
						</div>
					{:else}
						<svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
						</svg>
						<p class="text-sm font-medium text-gray-900 mb-1">Drop images here or click to upload</p>
						<p class="text-xs text-gray-500 mb-4">PNG, JPG, GIF up to 5MB each</p>
						<button
							on:click={() => fileInput.click()}
							class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
						>
							Choose Files
						</button>
					{/if}
				</div>
				
				<!-- Image List -->
				{#if images.length > 0}
					<div class="space-y-3">
						<h3 class="text-sm font-semibold text-gray-900">Images ({images.length})</h3>
						
						{#each images as image, index (image.id)}
							<div class="card-ios p-4 flex items-start gap-4">
								<img
									src={image.url}
									alt={image.alt || ''}
									class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
								/>
								
								<div class="flex-1 min-w-0 space-y-2">
									<input
										type="text"
										value={image.caption || ''}
										on:input={(e) => updateCaption(image.id, e.currentTarget.value)}
										placeholder="Add caption (optional)"
										class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
									<input
										type="url"
										value={image.link || ''}
										on:input={(e) => updateLink(image.id, e.currentTarget.value)}
										placeholder="Add link (optional)"
										class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
									<p class="text-xs text-gray-500 truncate">{image.url.split('/').pop()}</p>
								</div>
								
								<div class="flex flex-col gap-1">
									<button
										on:click={() => moveImage(image.id, 'up')}
										disabled={index === 0}
										class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
										title="Move up"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
										</svg>
									</button>
									<button
										on:click={() => moveImage(image.id, 'down')}
										disabled={index === images.length - 1}
										class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
										title="Move down"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
										</svg>
									</button>
									<button
										on:click={() => deleteImage(image.id)}
										class="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
										title="Delete"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<p class="text-sm text-gray-500">No images yet. Upload some images to get started.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
