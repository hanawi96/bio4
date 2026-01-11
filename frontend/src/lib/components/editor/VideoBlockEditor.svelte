<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import type { VideoBlockContent, VideoBlockItem } from '$lib/types';
	import { parseVideoUrl, validatePlatformUrl, getPlatformName, getValidationError, getVideoThumbnail, fetchVideoMetadata, type VideoPlatform } from '$lib/utils/videoUtils';
	
	export let blockId: number | null = null;
	export let initialContent: VideoBlockContent | null = null;
	export let layout: 'column' | 'carousel' | 'marquee' = 'column';
	
	const dispatch = createEventDispatcher();
	
	// Get platform from content
	$: platform = (initialContent?.platform || 'youtube') as VideoPlatform;
	$: platformName = getPlatformName(platform);
	
	type TabType = 'videos' | 'layout';
	let activeTab: TabType = 'videos';
	
	let videos: VideoBlockItem[] = initialContent?.videos || [];
	let config: VideoBlockContent['config'] = initialContent?.config || {
		spacing: 'comfortable',
		aspectRatio: platform === 'tiktok' || platform === 'instagram' ? '9/16' : '16/9',
		autoplay: false,
		interval: 3,
		showDots: true,
		showArrows: true,
		direction: 'left',
		speed: 'medium',
		pauseOnHover: true,
		videoHeight: platform === 'tiktok' || platform === 'instagram' ? 500 : 300
	};
	let title: string = initialContent?.title || '';
	let subtitle: string = initialContent?.subtitle || '';
	
	let videoUrl = '';
	let adding = false;
	
	function buildContent(): VideoBlockContent {
		return { platform, layout, videos, config, title, subtitle };
	}
	
	function generateId(): string {
		return `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
	
	async function handleAddVideo() {
		if (!videoUrl.trim()) {
			toast.error('Please enter a video URL');
			return;
		}
		
		// Validate URL for specific platform
		if (!validatePlatformUrl(videoUrl, platform)) {
			toast.error(getValidationError(platform));
			return;
		}
		
		adding = true;
		
		try {
			const parsed = parseVideoUrl(videoUrl, platform);
			
			if (!parsed) {
				toast.error('Could not parse video URL');
				return;
			}
			
			// Fetch metadata (title, thumbnail) from platform
			const metadata = await fetchVideoMetadata(parsed.platform, parsed.id, videoUrl);
			
			// Use fetched thumbnail or fallback to generated one
			const thumbnail = metadata.thumbnail || getVideoThumbnail(parsed.platform, parsed.id);
			
			const newVideo: VideoBlockItem = {
				id: generateId(),
				url: videoUrl,
				platform: parsed.platform,
				videoId: parsed.id,
				embedUrl: parsed.embedUrl,
				title: metadata.title,
				thumbnail: thumbnail || undefined,
				sort_order: videos.length
			};
			
			videos = [...videos, newVideo];
			videoUrl = '';
			toast.success('Video added');
			notifyContentChange();
		} catch (e) {
			console.error('[VideoBlockEditor] Failed to add video:', e);
			toast.error('Failed to add video');
		} finally {
			adding = false;
		}
	}
	
	function handleRemoveVideo(videoId: string) {
		videos = videos.filter(v => v.id !== videoId);
		notifyContentChange();
		toast.success('Video removed');
	}
	
	function moveVideo(videoId: string, direction: 'up' | 'down') {
		const index = videos.findIndex(v => v.id === videoId);
		if (index === -1) return;
		
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= videos.length) return;
		
		// Swap
		const temp = videos[index];
		videos[index] = videos[newIndex];
		videos[newIndex] = temp;
		
		// Update sort_order
		videos = videos.map((v, i) => ({ ...v, sort_order: i }));
		
		// Notify parent immediately
		notifyContentChange();
	}
	
	function notifyContentChange() {
		dispatch('contentChange', { content: buildContent() });
	}
	
	function handleBack() {
		dispatch('save', { content: buildContent() });
		dispatch('back');
	}
</script>


<div class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
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
			
			<!-- Icon -->
			<div class="icon-ios w-12 h-12 flex-shrink-0">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
				</svg>
			</div>
			
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Video Block</h2>
				<p class="text-sm text-gray-500">
					{videos.length} {videos.length === 1 ? 'video' : 'videos'}
				</p>
			</div>
		</div>
		
		<!-- Tabs -->
		<div class="flex gap-6 border-b border-gray-200 -mb-px">
			<button
				on:click={() => activeTab = 'videos'}
				class="pb-3 px-1 font-medium text-sm transition-colors relative {activeTab === 'videos' 
					? 'text-gray-900' 
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Videos
				{#if activeTab === 'videos'}
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
						</button>
					</div>
				</div>

				
				{#if layout === 'column'}
					<div class="space-y-5">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Spacing</label>
							<div class="grid grid-cols-3 gap-2">
								{#each ['compact', 'comfortable', 'spacious'] as spacing}
									<button
										on:click={() => { config.spacing = spacing; notifyContentChange(); }}
										class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-green-400"
										class:border-green-500={config.spacing === spacing}
										class:bg-green-50={config.spacing === spacing}
										class:border-gray-200={config.spacing !== spacing}
									>
										<div class="flex flex-col gap-{spacing === 'compact' ? '0.5' : spacing === 'comfortable' ? '1.5' : '2.5'} w-full">
											<div class="h-1.5 bg-gray-400 rounded"></div>
											<div class="h-1.5 bg-gray-400 rounded"></div>
											<div class="h-1.5 bg-gray-400 rounded"></div>
										</div>
										<span class="text-xs font-medium capitalize" class:text-green-600={config.spacing === spacing}>{spacing}</span>
									</button>
								{/each}
							</div>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Aspect Ratio</label>
							<div class="grid grid-cols-2 gap-2">
								{#each [['16/9', '16:9'], ['9/16', '9:16'], ['4/3', '4:3'], ['1/1', '1:1']] as [value, label]}
									<button
										on:click={() => { config.aspectRatio = value; notifyContentChange(); }}
										class="py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400 text-sm font-medium"
										class:border-green-500={config.aspectRatio === value}
										class:bg-green-50={config.aspectRatio === value}
										class:text-green-600={config.aspectRatio === value}
										class:border-gray-200={config.aspectRatio !== value}
									>
										{label}
									</button>
								{/each}
							</div>
						</div>
					</div>
				{:else if layout === 'carousel'}
					<div class="space-y-4">
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
					</div>
				{:else if layout === 'marquee'}
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Scroll Direction</label>
							<div class="grid grid-cols-2 gap-2">
								{#each ['left', 'right'] as dir}
									<button
										on:click={() => { config.direction = dir; notifyContentChange(); }}
										class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400"
										class:border-green-500={config.direction === dir}
										class:bg-green-50={config.direction === dir}
										class:border-gray-200={config.direction !== dir}
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" class:text-green-600={config.direction === dir}>
											<path stroke-linecap="round" stroke-linejoin="round" d="{dir === 'left' ? 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18' : 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'}" />
										</svg>
										<span class="text-sm font-medium capitalize" class:text-green-600={config.direction === dir}>{dir}</span>
									</button>
								{/each}
							</div>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Scroll Speed</label>
							<div class="grid grid-cols-3 gap-2">
								{#each ['slow', 'medium', 'fast'] as spd}
									<button
										on:click={() => { config.speed = spd; notifyContentChange(); }}
										class="py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400 text-sm font-medium capitalize"
										class:border-green-500={config.speed === spd}
										class:bg-green-50={config.speed === spd}
										class:text-green-600={config.speed === spd}
										class:border-gray-200={config.speed !== spd}
									>
										{spd}
									</button>
								{/each}
							</div>
						</div>
						
						<div class="p-4 bg-gray-50 rounded-lg">
							<label class="block text-sm font-medium text-gray-700 mb-3">
								Video Height: {config.videoHeight}px
							</label>
							<input
								type="range"
								bind:value={config.videoHeight}
								on:input={notifyContentChange}
								min="200"
								max="400"
								step="20"
								class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
							/>
							<div class="flex justify-between text-xs text-gray-500 mt-1">
								<span>200px</span>
								<span>400px</span>
							</div>
						</div>
						
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
					</div>
				{/if}
			</div>
		{:else}
			<!-- Videos Tab -->
			<div class="p-6">
				<!-- Title & Subtitle Section -->
				<div class="mb-6 form-section-ios">
					<h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
						Add a headline
						<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="5" r="1" />
							<circle cx="12" cy="19" r="1" />
						</svg>
					</h3>
					<div>
						<label class="form-label-ios">Title (optional)</label>
						<input
							type="text"
							bind:value={title}
							on:blur={notifyContentChange}
							placeholder="Video Gallery"
							class="input-ios"
						/>
					</div>
					<div>
						<label class="form-label-ios">Subtitle (optional)</label>
						<input
							type="text"
							bind:value={subtitle}
							on:blur={notifyContentChange}
							placeholder="Check out my videos"
							class="input-ios"
						/>
					</div>
				</div>
				
				<!-- Add Video -->
				<div class="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
					<label class="block text-sm font-semibold text-gray-900 mb-3">
						Add {platformName} Video
						<span class="ml-2 text-xs font-normal text-gray-500">({platform})</span>
					</label>
					<div class="flex gap-2">
						<input
							type="url"
							bind:value={videoUrl}
							on:keydown={(e) => e.key === 'Enter' && handleAddVideo()}
							placeholder={platform === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
								platform === 'tiktok' ? 'https://www.tiktok.com/@user/video/...' :
								platform === 'instagram' ? 'https://www.instagram.com/p/...' :
								'https://vimeo.com/...'}
							class="input-ios flex-1"
							disabled={adding}
						/>
						<button
							type="button"
							on:click={handleAddVideo}
							disabled={adding || !videoUrl.trim()}
							class="btn-ios-primary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{adding ? 'Adding...' : 'Add'}
						</button>
					</div>
					<p class="text-xs text-gray-500 mt-2">Paste a {platformName} video URL</p>
				</div>
				
				<!-- Video List -->
				{#if videos.length === 0}
					<div class="text-center py-12 text-gray-500">
						<svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
						</svg>
						<p class="text-sm font-medium">No videos yet</p>
						<p class="text-xs mt-1">Add your first video above</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each videos as video, index (video.id)}
							<div class="card-ios p-3 flex items-center gap-3">
								<!-- Move Buttons -->
								<div class="flex flex-col gap-1">
									<button
										type="button"
										on:click={() => moveVideo(video.id, 'up')}
										disabled={index === 0}
										class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
										title="Move up"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
										</svg>
									</button>
									<button
										type="button"
										on:click={() => moveVideo(video.id, 'down')}
										disabled={index === videos.length - 1}
										class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
										title="Move down"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
										</svg>
									</button>
								</div>
								
								<!-- Thumbnail -->
								{#if video.thumbnail}
									<img 
										src={video.thumbnail} 
										alt="" 
										class="w-24 h-16 object-cover rounded-lg flex-shrink-0"
										on:error={(e) => {
											// Fallback if thumbnail fails to load
											e.currentTarget.style.display = 'none';
											e.currentTarget.nextElementSibling?.classList.remove('hidden');
										}}
									/>
									<div class="w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex-shrink-0 items-center justify-center hidden">
										<div class="text-center">
											<svg class="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
												<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span class="text-[10px] text-gray-500 font-medium">{video.platform.toUpperCase()}</span>
										</div>
									</div>
								{:else}
									<div class="w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
										<div class="text-center">
											<svg class="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
												<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span class="text-[10px] text-gray-500 font-medium">{video.platform.toUpperCase()}</span>
										</div>
									</div>
								{/if}
								
								<!-- Info -->
								<div class="flex-1 min-w-0">
									<p class="text-sm font-semibold text-gray-900 truncate">
										{video.title || `${video.platform.charAt(0).toUpperCase() + video.platform.slice(1)} Video`}
									</p>
									<p class="text-xs text-gray-500 truncate mt-0.5">{video.url}</p>
								</div>
								
								<!-- Delete Button -->
								<button
									type="button"
									on:click={() => handleRemoveVideo(video.id)}
									class="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
									title="Delete"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
