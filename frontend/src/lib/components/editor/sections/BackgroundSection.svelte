<script lang="ts">
	import { page } from '$lib/stores/page';
	import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
	import { themes } from '$lib/stores/themes';
	import { api } from '$lib/api.client';
	import { generatePatternColors, type PatternType } from '$lib/utils/patternColors';
	import { FALLBACK_THEME } from '$lib/appearance/presets';
	
	// New components
	import BackgroundTypeSelector from './background/BackgroundTypeSelector.svelte';
	import SolidColorPicker from './background/SolidColorPicker.svelte';
	import GradientEditor from './background/GradientEditor.svelte';
	import PatternEditor from './background/PatternEditor.svelte';
	import ImageUploader from './background/ImageUploader.svelte';
	import VideoUploader from './background/VideoUploader.svelte';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	
	// Utils
	import { 
		normalizeGradient, 
		parseGradient, 
		extractSolidColorFromCurrent, 
		generateSmartGradient,
		getPatternStyle 
	} from '$lib/utils/background/backgroundUtils';
	import { DEFAULT_IMAGE_BG, DEFAULT_VIDEO_BG } from '$lib/utils/background/backgroundConstants';
	import { extractVideoFrame, validateVideoFile } from '$lib/utils/videoUtils';

	const username = 'demo';

	// Get bg token from theme config (new format)
	$: themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
	$: themesLoaded = Object.keys($themes).length > 0;
	$: currentTheme = themesMap[$appearanceState.presetKey] || FALLBACK_THEME;
	$: themeConfig = currentTheme.config;
	
	// Get background from NEW structure (background.type + background.value)
	$: presetBgValue = (() => {
		// NEW FORMAT: background.type + background.value
		const bgType = themeConfig?.background?.type;
		const bgValue = themeConfig?.background?.value;
		
		if (bgType && bgValue) {
			if (bgType === 'solid') {
				return bgValue; // hex color
			} else if (bgType === 'gradient') {
				return bgValue; // gradient CSS string
			} else if (bgType === 'image') {
				return `url('${bgValue}')`; // image URL wrapped
			} else if (bgType === 'video') {
				return '#000000'; // fallback color for video
			}
		}
		
		// Fallback
		return '#ffffff';
	})();
	
	// Get resolved values (override > preset)
	$: resolvedBgColor = $appearanceState.overrides['backgroundColor'] ?? presetBgValue;
	$: resolvedBgVideo = $appearanceState.overrides['backgroundVideo'] ?? (themeConfig?.background?.type === 'video' ? themeConfig?.background?.value : undefined);
	
	// Detect background type from theme config or overrides (reactive - runs on theme change)
	$: {
		// Force re-detection when theme changes (even if color value is same)
		const _themeKey = $appearanceState.presetKey;
		
		// Always detect from resolved values (override + theme merged)
		if (themesLoaded && (resolvedBgColor || resolvedBgVideo)) {
			if (resolvedBgVideo) {
				selectedType = 'video';
				backgroundVideoUrl = resolvedBgVideo;
				currentBgColor = resolvedBgColor;
			} else if (resolvedBgColor.match(/^#[0-9a-fA-F]{6}$/)) {
				selectedType = 'solid';
				currentBgColor = resolvedBgColor;
			} else if (resolvedBgColor.includes('gradient') && !resolvedBgColor.startsWith('background:')) {
				selectedType = 'gradient';
				currentBgColor = resolvedBgColor;
				const parsed = parseGradient(resolvedBgColor);
				if (parsed) {
					gradientFromColor = parsed.from;
					gradientToColor = parsed.to;
					gradientDirection = parsed.direction;
					gradientType = parsed.type;
				}
			} else if (resolvedBgColor.startsWith('background:')) {
				selectedType = 'pattern';
				currentBgColor = resolvedBgColor;
				
				// Extract pattern colors from pattern string
				const colorMatches = resolvedBgColor.match(/#[0-9a-fA-F]{6}/g);
				if (colorMatches && colorMatches.length >= 2) {
					patternColor = colorMatches[0];
					patternBgColor = colorMatches[colorMatches.length - 1];
					basePatternBgColor = patternBgColor;
				}
				
				// Try to detect pattern ID from the string
				if (resolvedBgColor.includes('radial-gradient(circle')) {
					selectedPattern = 'dots';
				} else if (resolvedBgColor.includes('linear-gradient') && resolvedBgColor.includes('90deg')) {
					selectedPattern = 'grid';
				} else if (resolvedBgColor.includes('repeating-linear-gradient')) {
					selectedPattern = 'diagonal';
				} else if (resolvedBgColor.includes('url(')) {
					selectedPattern = 'cross';
				}
			} else if (resolvedBgColor.startsWith("url(")) {
				selectedType = 'image';
				currentBgColor = resolvedBgColor;
				const urlMatch = resolvedBgColor.match(/url\(['"]?([^'"]+)['"]?\)/);
				if (urlMatch && urlMatch[1]) {
					backgroundImageUrl = urlMatch[1];
				}
			}
		}
	}


	
	// Check if Avatar Cover mode (only allow solid background)
	$: isAvatarCoverMode = $appearanceState.headerPresetId === 'avatar-cover';
	
	// Auto-switch to solid when Avatar Cover mode is activated
	$: if (isAvatarCoverMode && selectedType !== 'solid') {
		// Extract solid color from current background
		const solidColor = extractSolidColorFromCurrent(currentBgColor);
		
		// Switch to solid type
		selectedType = 'solid';
		currentBgColor = solidColor;
		backgroundHistory.solid = solidColor;
		
		// Update appearance with solid color
		updateAppearance('backgroundColor', solidColor);
		
		// Clear video background if exists (important!)
		updateAppearance('backgroundVideo', null);
	}
	



	let selectedType = 'solid';
	let currentBgColor = '#ffffff';
	let lastSyncedThemeKey = '';
	
	// Update solid color
	function updateSolidColor(color: string) {
		currentBgColor = color;
		backgroundHistory.solid = color;
		updateAppearance('backgroundColor', color);
	}
	
	// Update gradient
	function updateGradientColor(gradient: string, from?: string, to?: string, direction?: string, type?: 'linear' | 'radial') {
		currentBgColor = gradient;
		backgroundHistory.gradient = gradient;
		if (from) gradientFromColor = from;
		if (to) gradientToColor = to;
		if (direction) gradientDirection = direction;
		if (type) gradientType = type;
		updateAppearance('backgroundColor', gradient);
	}
	
	// Update pattern
	function updatePatternColor(patternId: string, inkColor: string, bgColor: string) {
		selectedPattern = patternId;
		patternColor = inkColor;
		patternBgColor = bgColor;
		basePatternBgColor = bgColor;
		const patternStyle = getPatternStyle(patternId, inkColor, bgColor);
		currentBgColor = patternStyle;
		backgroundHistory.pattern = patternStyle;
		updateAppearance('backgroundColor', patternStyle);
	}
	
	// Update image background
	function updateImageBackground(imageUrl: string) {
		backgroundImageUrl = imageUrl;
		const bgValue = `url('${imageUrl}')`;
		currentBgColor = bgValue;
		if (imageUrl !== DEFAULT_IMAGE_BG) {
			backgroundHistory.image = imageUrl;
		}
		updateAppearance('backgroundColor', bgValue);
	}
	
	// Update video background
	function updateVideoBackground(videoUrl: string) {
		backgroundVideoUrl = videoUrl;
		currentBgColor = '#000000';
		if (videoUrl !== DEFAULT_VIDEO_BG) {
			backgroundHistory.video = videoUrl;
		}
		updateAppearance('backgroundColor', '#000000');
		updateAppearance('backgroundVideo', videoUrl);
	}
	
	
	// Gradient state
	let gradientFromColor = '#667eea';
	let gradientToColor = '#764ba2';
	let gradientDirection = '135deg';
	let gradientType: 'linear' | 'radial' = 'linear';
	
	// Image/Video state
	let backgroundImageUrl = '';
	let backgroundVideoUrl = '';
	
	// Pattern state
	let selectedPattern = 'dots';
	let patternColor = '#e5e7eb';
	let patternBgColor = '#ffffff';
	let basePatternBgColor = '#ffffff';
	let baseThemeColor = '#ffffff';

	// Upload/Modal state
	let showCropModal = false;
	let tempImageUrl = '';
	let uploading = false;
	let showVideoCropModal = false;
	let tempVideoPreviewUrl = '';
	let tempVideoFile: File | null = null;
	let isDragging = false;
	
	// Background history (session-only)
	let backgroundHistory = {
		solid: '#ffffff',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		image: '',
		video: '',
		pattern: ''
	};

	// Track previous overrides state to detect when user selects theme preset
	let lastHadOverrides = false;

	// Reactive: Sync theme changes
	$: if ($appearanceState.presetKey) {
		const currentThemeKey = $appearanceState.presetKey;
		const hasOverrides = Object.keys($appearanceState.overrides).length > 0;
		
		// Extract base color for pattern preview
		if (presetBgValue.match(/^#[0-9a-fA-F]{6}$/)) {
			baseThemeColor = presetBgValue;
		} else if (presetBgValue.includes('gradient')) {
			const matches = presetBgValue.match(/#[0-9a-fA-F]{6}/g);
			if (matches?.[0]) baseThemeColor = matches[0];
		}
		
		// Reset when:
		// 1. Theme changed (different key), OR
		// 2. Overrides cleared (user selected theme preset: had overrides → no overrides)
		const themeChanged = lastSyncedThemeKey && currentThemeKey !== lastSyncedThemeKey;
		const overridesCleared = lastHadOverrides && !hasOverrides;
		
		if ((themeChanged || overridesCleared) && !isAvatarCoverMode) {
			lastSyncedThemeKey = currentThemeKey;
			lastHadOverrides = hasOverrides;
			
			if (presetBgValue.match(/^#[0-9a-fA-F]{6}$/)) {
				currentBgColor = presetBgValue;
				selectedType = 'solid';
			} else if (presetBgValue.includes('gradient')) {
				currentBgColor = presetBgValue;
				selectedType = 'gradient';
				const parsed = parseGradient(presetBgValue);
				if (parsed) {
					gradientFromColor = parsed.from;
					gradientToColor = parsed.to;
					gradientDirection = parsed.direction;
					gradientType = parsed.type;
				}
			} else {
				currentBgColor = '#ffffff';
				selectedType = 'solid';
			}
			
			backgroundImageUrl = '';
			backgroundVideoUrl = '';
			backgroundHistory.pattern = '';
		} else {
			// Update tracking variables
			if (!lastSyncedThemeKey) {
				lastSyncedThemeKey = currentThemeKey;
			}
			lastHadOverrides = hasOverrides;
		}
	}
	
	function selectType(type: string) {
		// Save current state to history based on type
		if (selectedType === 'solid' && currentBgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			backgroundHistory.solid = currentBgColor;
		} else if (selectedType === 'gradient' && currentBgColor.includes('gradient')) {
			backgroundHistory.gradient = currentBgColor;
		} else if (selectedType === 'image' && backgroundImageUrl) {
			backgroundHistory.image = backgroundImageUrl;
		} else if (selectedType === 'video' && backgroundVideoUrl) {
			backgroundHistory.video = backgroundVideoUrl;
		} else if (selectedType === 'pattern' && currentBgColor.startsWith('background:')) {
			backgroundHistory.pattern = currentBgColor;
		}
		
		selectedType = type;
		
		// Clear video when switching away
		if (type !== 'video') {
			updateAppearance('backgroundVideo', null);
		}
		
		// Clear URLs
		backgroundImageUrl = '';
		backgroundVideoUrl = '';
		
		// Smart color inheritance - load appropriate background for new type
		if (type === 'solid') {
			const hasCustomHistory = backgroundHistory.solid && backgroundHistory.solid !== '#ffffff';
			const smartColor = hasCustomHistory ? backgroundHistory.solid : extractSolidColorFromCurrent(currentBgColor);
			updateSolidColor(smartColor);
		} else if (type === 'gradient') {
			// Always generate smart gradient from current solid color
			const currentSolid = extractSolidColorFromCurrent(currentBgColor);
			const smartGrad = generateSmartGradient(currentSolid);
			updateGradientColor(smartGrad.gradient, smartGrad.from, smartGrad.to, smartGrad.direction, 'linear');
		} else if (type === 'image') {
			updateImageBackground(backgroundHistory.image?.trim() || DEFAULT_IMAGE_BG);
		} else if (type === 'video') {
			updateVideoBackground(backgroundHistory.video?.trim() || DEFAULT_VIDEO_BG);
		} else if (type === 'pattern') {
			const bgColorForPattern = extractSolidColorFromCurrent(currentBgColor);
			basePatternBgColor = bgColorForPattern;
			const colors = generatePatternColors(bgColorForPattern, selectedPattern);
			updatePatternColor(selectedPattern, colors.inkColor, colors.bgColor);
		}
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
			backgroundHistory.image = result.url; // Save to history
			await updateImageBackground(result.url);

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
			// Restore default image instead of clearing
			backgroundHistory.image = ''; // Clear custom image from history
			await updateImageBackground(DEFAULT_IMAGE_BG);
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
	
	async function handleVideoUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validation = validateVideoFile(file);
		if (!validation.valid) {
			alert(validation.error);
			input.value = '';
			return;
		}

		tempVideoFile = file;
		tempVideoPreviewUrl = await extractVideoFrame(file);
		showVideoCropModal = true;
		
		input.value = '';
	}
	
	async function handleVideoCropAccept(event: CustomEvent<Blob>) {
		if (!tempVideoFile) return;
		
		uploading = true;
		try {
			const result = await api.uploadBackgroundVideo(username, tempVideoFile);
			backgroundHistory.video = result.url; // Save to history
			await updateVideoBackground(result.url);
			
			showVideoCropModal = false;
			URL.revokeObjectURL(tempVideoPreviewUrl);
			tempVideoPreviewUrl = '';
			tempVideoFile = null;
		} catch (e) {
			console.error('Failed to upload video:', e);
			alert('Failed to upload video. Please try again.');
		} finally {
			uploading = false;
		}
	}
	
	function handleVideoCropCancel() {
		showVideoCropModal = false;
		URL.revokeObjectURL(tempVideoPreviewUrl);
		tempVideoPreviewUrl = '';
		tempVideoFile = null;
	}
	
	async function handleRemoveVideo() {
		// Check if current video is the default one
		if (backgroundVideoUrl === DEFAULT_VIDEO_BG) {
			alert('This is the default background video. Upload a custom video to replace it.');
			return;
		}
		
		if (!confirm('Remove custom background video and restore default?')) return;
		
		uploading = true;
		try {
			await api.removeBackgroundVideo(username);
			// Restore default video instead of clearing
			backgroundHistory.video = ''; // Clear custom video from history
			await updateVideoBackground(DEFAULT_VIDEO_BG);
		} catch (e) {
			console.error('Failed to remove video:', e);
			alert('Failed to remove video');
		} finally {
			uploading = false;
		}
	}
	
	async function handleVideoDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (!file) return;

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
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Background</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your page background</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Background Type Selector -->
		<BackgroundTypeSelector 
			{selectedType} 
			{isAvatarCoverMode}
			on:select={(e) => selectType(e.detail)}
		/>

		<!-- Solid Color Options -->
		{#if selectedType === 'solid'}
			<SolidColorPicker 
				{currentBgColor}
				on:update={(e) => updateSolidColor(e.detail)}
			/>
		{/if}

		<!-- Gradient Options -->
		{#if selectedType === 'gradient'}
			<GradientEditor 
				{currentBgColor}
				bind:gradientFromColor
				bind:gradientToColor
				bind:gradientDirection
				bind:gradientType
				on:update={(e) => {
					const { gradient, from, to, direction, type } = e.detail;
					updateGradientColor(gradient, from, to, direction, type);
				}}
			/>
		{/if}

		<!-- Image Upload -->
		{#if selectedType === 'image'}
			<ImageUploader 
				{backgroundImageUrl}
				{username}
				on:update={(e) => updateImageBackground(e.detail)}
				on:remove={() => updateImageBackground(DEFAULT_IMAGE_BG)}
			/>
		{/if}

		<!-- Video Upload -->
		{#if selectedType === 'video'}
			<VideoUploader 
				{backgroundVideoUrl}
				{username}
				on:update={(e) => updateVideoBackground(e.detail)}
				on:remove={() => updateVideoBackground(DEFAULT_VIDEO_BG)}
			/>
		{/if}

		<!-- Pattern -->
		{#if selectedType === 'pattern'}
			<PatternEditor 
				{selectedPattern}
				bind:patternColor
				bind:patternBgColor
				on:update={(e) => {
					const { patternId, inkColor, bgColor } = e.detail;
					updatePatternColor(patternId, inkColor, bgColor);
				}}
			/>
		{/if}
	</div>
</section>

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
