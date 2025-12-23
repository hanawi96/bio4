<script lang="ts">
	import { page } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';

	const username = 'demo';

	const bgTypes = [
		{ id: 'solid', name: 'Solid Color', description: 'Single color' },
		{ id: 'gradient', name: 'Gradient', description: 'Color blend' },
		{ id: 'image', name: 'Image', description: 'Custom photo' },
		{ id: 'video', name: 'Video', description: 'Animated background' },
		{ id: 'pattern', name: 'Pattern', description: 'Repeating design' }
	];

	const solidColors = [
		{ name: 'White', color: '#ffffff' },
		{ name: 'Light Gray', color: '#f3f4f6' },
		{ name: 'Dark Gray', color: '#1f2937' },
		{ name: 'Black', color: '#000000' },
		{ name: 'Blue', color: '#3b82f6' },
		{ name: 'Purple', color: '#8b5cf6' },
		{ name: 'Pink', color: '#ec4899' },
		{ name: 'Green', color: '#10b981' }
	];

	const gradients = [
		{ name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', from: '#667eea', to: '#764ba2', direction: '135deg' },
		{ name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)', from: '#667eea', to: '#00d4ff', direction: '135deg' },
		{ name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', from: '#0ba360', to: '#3cba92', direction: '135deg' },
		{ name: 'Fire', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', from: '#f093fb', to: '#f5576c', direction: '135deg' },
		{ name: 'Sky', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', from: '#4facfe', to: '#00f2fe', direction: '135deg' },
		{ name: 'Peach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', from: '#fa709a', to: '#fee140', direction: '135deg' },
		{ name: 'Night', gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)', from: '#2c3e50', to: '#000000', direction: '135deg' },
		{ name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', from: '#a8edea', to: '#fed6e3', direction: '135deg' }
	];

	const patterns = [
		{ 
			id: 'dots', 
			name: 'Dots',
			css: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
			size: '20px 20px'
		},
		{ 
			id: 'grid', 
			name: 'Grid',
			css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
			size: '30px 30px'
		},
		{ 
			id: 'diagonal', 
			name: 'Diagonal',
			css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
			size: 'auto'
		},
		{ 
			id: 'cross', 
			name: 'Cross',
			css: 'linear-gradient(currentColor 2px, transparent 2px), linear-gradient(90deg, currentColor 2px, transparent 2px)',
			size: '40px 40px'
		},
		{ 
			id: 'zigzag', 
			name: 'Zigzag',
			css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%)',
			size: '20px 20px'
		},
		{ 
			id: 'organic', 
			name: 'Organic',
			svg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30 10c-8 0-12 8-12 12s4 8 8 12c4-4 12-8 12-12s-4-12-8-12z" fill="currentColor" opacity="0.3"/></svg>`
		},
		{ 
			id: 'noise', 
			name: 'Noise',
			svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="3"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.15"/></svg>`
		},
		{ 
			id: 'waves', 
			name: 'Waves',
			svg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" fill="none" stroke-width="2" opacity="0.3"/></svg>`
		}
	];

	let selectedType = 'solid';
	let currentBgColor = '#ffffff';
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let isUserUpdate = false;
	let lastSyncedThemeKey = '';
	
	// Custom gradient state
	let showCustomGradient = false;
	let gradientFromColor = '#667eea';
	let gradientToColor = '#764ba2';
	let gradientDirection = '135deg'; // Default diagonal
	let gradientType = 'linear'; // 'linear' or 'radial'
	
	// Custom solid color state
	let showCustomColor = false;
	
	// Image upload state
	let uploading = false;
	let showCropModal = false;
	let tempImageUrl = '';
	let backgroundImageUrl = '';
	let isDragging = false;
	
	// Default image background (local)
	const DEFAULT_IMAGE_BG = '/presets/images/preset-img.jpg';
	
	// Video upload state
	let backgroundVideoUrl = '';
	let showVideoCropModal = false;
	let tempVideoFile: File | null = null;
	let tempVideoPreviewUrl = '';
	
	// Default video background (local)
	const DEFAULT_VIDEO_BG = '/presets/videos/14950008_1080_1920_60fps.mp4';
	
	// Pattern state
	let selectedPattern = 'dots';
	let patternColor = '#e5e7eb';
	let patternBgColor = '#ffffff';
	
	// Background history (session-only, not saved to DB)
	let backgroundHistory = {
		solid: '#ffffff',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		image: '',
		video: '',
		pattern: ''
	};

	// Reactive: Sync backgroundHistory from DB when draft_appearance changes
	$: if ($page?.draft_appearance && !isUserUpdate) {
		try {
			const appearance = JSON.parse($page.draft_appearance);
			const savedBackgrounds = appearance.customTheme?.backgrounds;
			
			if (savedBackgrounds) {
				const newHistory = {
					solid: savedBackgrounds.solid || '#ffffff',
					gradient: savedBackgrounds.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					image: (savedBackgrounds.image && savedBackgrounds.image.trim()) ? savedBackgrounds.image : '',
					video: (savedBackgrounds.video && savedBackgrounds.video.trim()) ? savedBackgrounds.video : '',
					pattern: savedBackgrounds.pattern || ''
				};
				
				backgroundHistory = newHistory;
				
				// Clear local URLs if history is empty
				if (!newHistory.image) {
					backgroundImageUrl = '';
				}
				if (!newHistory.video) {
					backgroundVideoUrl = '';
				}
			}
		} catch (e) {
			console.error('[BackgroundSection] Failed to parse draft_appearance:', e);
		}
	}

	// Reactive: Sync with appearance tokens (only when theme changes)
	$: if ($appearance?.tokens?.backgroundColor && !isUserUpdate) {
		const bgColor = $appearance.tokens.backgroundColor;
		const currentThemeKey = $page?.theme_preset_key || '';
		
		// Only auto-detect type when theme changes (not on every appearance update)
		const isThemeChange = currentThemeKey !== lastSyncedThemeKey;
		
		if (isThemeChange) {
			currentBgColor = bgColor;
			lastSyncedThemeKey = currentThemeKey;
			
			// Get appearance for video check
			const appearance = JSON.parse($page?.draft_appearance || '{}');
			const videoUrl = appearance.customTheme?.backgroundVideo;
			
			if (videoUrl && videoUrl.trim()) {
				selectedType = 'video';
				backgroundVideoUrl = videoUrl;
				backgroundImageUrl = '';
			} else if (bgColor.startsWith('background:') || bgColor.startsWith('background ')) {
				selectedType = 'pattern';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			} else if (bgColor.includes('gradient')) {
				selectedType = 'gradient';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			} else if (bgColor.includes('url(')) {
				const urlMatch = bgColor.match(/url\(['"]?([^'"]+)['"]?\)/);
				if (urlMatch && urlMatch[1].trim()) {
					selectedType = 'image';
					backgroundVideoUrl = '';
					backgroundImageUrl = urlMatch[1];
				} else {
					selectedType = 'solid';
					backgroundImageUrl = '';
				}
			} else {
				selectedType = 'solid';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			}
		} else {
			// Just sync color, don't change type
			currentBgColor = bgColor;
			
			// Sync video URL if type is video
			if (selectedType === 'video') {
				const appearance = JSON.parse($page?.draft_appearance || '{}');
				const videoUrl = appearance.customTheme?.backgroundVideo;
				if (videoUrl && videoUrl.trim()) {
					if (backgroundVideoUrl !== videoUrl) {
						backgroundVideoUrl = videoUrl;
					}
				} else {
					// Use default video if no custom video
					backgroundVideoUrl = DEFAULT_VIDEO_BG;
				}
			}
		}
	}

	// Reactive: Ensure default video is set when video type is selected
	$: if (selectedType === 'video' && !backgroundVideoUrl && !isUserUpdate) {
		backgroundVideoUrl = DEFAULT_VIDEO_BG;
	}

	function selectType(type: string) {
		isUserUpdate = true;
		
		// Save current state to history before switching
		if (selectedType === 'solid') {
			backgroundHistory.solid = currentBgColor;
		} else if (selectedType === 'gradient') {
			backgroundHistory.gradient = currentBgColor;
		} else if (selectedType === 'image') {
			backgroundHistory.image = backgroundImageUrl;
		} else if (selectedType === 'video') {
			backgroundHistory.video = backgroundVideoUrl;
		} else if (selectedType === 'pattern') {
			backgroundHistory.pattern = currentBgColor;
		}
		
		selectedType = type;
		
		// Clear video from store when switching away from video (non-blocking)
		if (type !== 'video' && $page) {
			const appearance = JSON.parse($page.draft_appearance || '{}');
			if (appearance.customTheme?.backgroundVideo) {
				delete appearance.customTheme.backgroundVideo;
				
				if (!appearance.customTheme.backgrounds) {
					appearance.customTheme.backgrounds = {};
				}
				appearance.customTheme.backgrounds.video = backgroundHistory.video;
				
				page.update(p => p ? {
					...p,
					draft_appearance: JSON.stringify(appearance)
				} : p);
				
				// Save to DB in background (non-blocking)
				api.saveDraft(username, {
					draft_appearance: JSON.stringify(appearance)
				}).catch(e => {
					console.error('[BackgroundSection] Failed to save:', e);
				});
			}
		}
		
		// Load from history and update URLs
		if (type === 'solid') {
			backgroundImageUrl = '';
			backgroundVideoUrl = '';
			
			if (backgroundHistory.solid) {
				updateBgColor(backgroundHistory.solid);
			} else {
				updateBgColor('#ffffff');
			}
		} else if (type === 'gradient') {
			backgroundImageUrl = '';
			backgroundVideoUrl = '';
			
			if (backgroundHistory.gradient) {
				updateBgColor(backgroundHistory.gradient);
			} else {
				updateBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '#667eea', '#764ba2', '135deg');
			}
		} else if (type === 'image') {
			backgroundVideoUrl = '';
			
			if (backgroundHistory.image && backgroundHistory.image.trim()) {
				backgroundImageUrl = backgroundHistory.image;
				updateBgColor(`url('${backgroundHistory.image}')`);
			} else {
				// Use default image when no custom image uploaded
				backgroundImageUrl = DEFAULT_IMAGE_BG;
				updateBgColor(`url('${DEFAULT_IMAGE_BG}')`);
			}
		} else if (type === 'video') {
			backgroundImageUrl = '';
			
			if (backgroundHistory.video && backgroundHistory.video.trim()) {
				backgroundVideoUrl = backgroundHistory.video;
				
				if (!$page) {
					isUserUpdate = false;
					return;
				}
				
				const appearance = JSON.parse($page.draft_appearance || '{}');
				if (!appearance.customTheme) appearance.customTheme = {};
				
				appearance.customTheme.backgroundVideo = backgroundHistory.video;
				
				if (!appearance.customTheme.backgrounds) {
					appearance.customTheme.backgrounds = {};
				}
				appearance.customTheme.backgrounds.video = backgroundHistory.video;
				
				page.update(p => p ? {
					...p,
					draft_appearance: JSON.stringify(appearance)
				} : p);
				
				// Save to DB in background (non-blocking)
				api.saveDraft(username, {
					draft_appearance: JSON.stringify(appearance)
				}).catch(e => {
					console.error('[BackgroundSection] Failed to save:', e);
				});
			} else {
				// Use default video when no custom video uploaded
				backgroundVideoUrl = DEFAULT_VIDEO_BG;
				
				if (!$page) {
					isUserUpdate = false;
					return;
				}
				
				const appearance = JSON.parse($page.draft_appearance || '{}');
				if (!appearance.customTheme) appearance.customTheme = {};
				
				appearance.customTheme.backgroundVideo = DEFAULT_VIDEO_BG;
				
				if (!appearance.customTheme.backgrounds) {
					appearance.customTheme.backgrounds = {};
				}
				appearance.customTheme.backgrounds.video = DEFAULT_VIDEO_BG;
				
				page.update(p => p ? {
					...p,
					draft_appearance: JSON.stringify(appearance)
				} : p);
				
				// Save to DB in background (non-blocking)
				api.saveDraft(username, {
					draft_appearance: JSON.stringify(appearance)
				}).catch(e => {
					console.error('[BackgroundSection] Failed to save:', e);
				});
			}
		} else if (type === 'pattern') {
			backgroundImageUrl = '';
			backgroundVideoUrl = '';
			
			if (backgroundHistory.pattern) {
				updateBgColor(backgroundHistory.pattern);
			}
		}
		
		setTimeout(() => {
			isUserUpdate = false;
		}, 500);
	}

	async function updateBgColor(color: string) {
		isUserUpdate = true;
		currentBgColor = color;
		
		// Update history
		if (selectedType === 'solid' || selectedType === 'gradient' || selectedType === 'pattern') {
			backgroundHistory[selectedType] = color;
		}

		// Update page store immediately (optimistic)
		page.update(p => {
			if (!p) return p;

			const appearance = JSON.parse(p.draft_appearance || '{}');

			// Update customTheme
			if (!appearance.customTheme) {
				appearance.customTheme = {
					backgroundColor: color,
					textColor: '#000000',
					primaryColor: '#3b82f6',
					fontFamily: 'Inter',
					borderRadius: 12,
					spacing: 16
				};
			} else {
				appearance.customTheme.backgroundColor = color;
			}
			
			// Save history to DB
			appearance.customTheme.backgrounds = { ...backgroundHistory };

			const newDraftAppearance = JSON.stringify(appearance);

			return {
				...p,
				draft_appearance: newDraftAppearance
			};
		});

		// Debounce save to API
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			try {
				const currentPage = $page;
				if (!currentPage) return;

				await api.saveDraft(username, {
					draft_appearance: currentPage.draft_appearance
				});
			} catch (e) {
				console.error('[BackgroundSection] Failed to save background:', e);
			} finally {
				isUserUpdate = false;
			}
		}, 300);
	}

	function updateBgGradient(gradient: string, fromColor?: string, toColor?: string, direction?: string) {
		// Sync gradient colors and type if provided
		if (fromColor) gradientFromColor = fromColor;
		if (toColor) gradientToColor = toColor;
		if (direction) gradientDirection = direction;
		
		// Set gradient type to linear since all presets are linear
		gradientType = 'linear';
		
		updateBgColor(gradient);
	}
	
	function toggleCustomGradient() {
		showCustomGradient = !showCustomGradient;
	}
	
	function toggleCustomColor() {
		showCustomColor = !showCustomColor;
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
			backgroundImageUrl = result.url;
			backgroundHistory.image = result.url; // Save to history
			
			updateBgColor(`url('${result.url}')`);

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
			backgroundImageUrl = DEFAULT_IMAGE_BG;
			backgroundHistory.image = ''; // Clear custom image from history
			updateBgColor(`url('${DEFAULT_IMAGE_BG}')`);
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
		
		input.value = '';
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
	
	async function handleVideoCropAccept(event: CustomEvent<Blob>) {
		if (!tempVideoFile) return;
		
		uploading = true;
		try {
			const result = await api.uploadBackgroundVideo(username, tempVideoFile);
			backgroundVideoUrl = result.url;
			backgroundHistory.video = result.url; // Save to history
			
			// Update appearance with video URL
			if (!$page) return;
			const appearance = JSON.parse($page.draft_appearance || '{}');
			if (!appearance.customTheme) appearance.customTheme = {};
			appearance.customTheme.backgroundVideo = result.url;
			
			page.update(p => p ? {
				...p,
				draft_appearance: JSON.stringify(appearance)
			} : p);
			
			await api.saveDraft(username, {
				draft_appearance: JSON.stringify(appearance)
			});
			
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
	
	function getPatternStyle(patternId: string, color: string, bgColor: string): string {
		const pattern = patterns.find(p => p.id === patternId);
		console.log('[getPatternStyle] patternId:', patternId, 'pattern:', pattern);
		
		if (!pattern) return `background: ${bgColor};`;
		
		if (pattern.svg) {
			// SVG pattern - encode as data URI
			const svg = pattern.svg.replace(/currentColor/g, color);
			const encoded = btoa(svg);
			const result = `background: url('data:image/svg+xml;base64,${encoded}') repeat, ${bgColor};`;
			console.log('[getPatternStyle] SVG result:', result);
			return result;
		} else {
			// CSS pattern
			const css = pattern.css!.replace(/currentColor/g, color);
			const result = `background: ${css}, ${bgColor}; background-size: ${pattern.size};`;
			console.log('[getPatternStyle] CSS result:', result);
			return result;
		}
	}
	
	function updatePattern() {
		console.log('[updatePattern] selectedPattern:', selectedPattern, 'patternColor:', patternColor, 'patternBgColor:', patternBgColor);
		const patternStyle = getPatternStyle(selectedPattern, patternColor, patternBgColor);
		console.log('[updatePattern] patternStyle:', patternStyle);
		updateBgColor(patternStyle);
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
			backgroundVideoUrl = DEFAULT_VIDEO_BG;
			backgroundHistory.video = ''; // Clear custom video from history
			
			// Update appearance with default video
			if (!$page) return;
			const appearance = JSON.parse($page.draft_appearance || '{}');
			if (!appearance.customTheme) appearance.customTheme = {};
			
			appearance.customTheme.backgroundVideo = DEFAULT_VIDEO_BG;
			
			if (!appearance.customTheme.backgrounds) {
				appearance.customTheme.backgrounds = {};
			}
			appearance.customTheme.backgrounds.video = DEFAULT_VIDEO_BG;
			
			page.update(p => p ? {
				...p,
				draft_appearance: JSON.stringify(appearance)
			} : p);
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
	
	function updateCustomGradient() {
		let customGradient;
		if (gradientType === 'radial') {
			customGradient = `radial-gradient(circle, ${gradientFromColor}, ${gradientToColor})`;
		} else {
			customGradient = `linear-gradient(${gradientDirection}, ${gradientFromColor}, ${gradientToColor})`;
		}
		updateBgColor(customGradient);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Background</h2>
		<p class="text-sm text-gray-500 mt-1">Customize your page background</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Background Type Selector -->
		<div class="grid grid-cols-5 gap-3">
			{#each bgTypes as type}
				<button
					on:click={() => selectType(type.id)}
					class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedType === type.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
				>
					<!-- Icon -->
					<div class="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center {selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'}">
						{#if type.id === 'solid'}
							<!-- Palette Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
							</svg>
						{:else if type.id === 'gradient'}
							<!-- Sparkles Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
							</svg>
						{:else if type.id === 'image'}
							<!-- Image Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						{:else if type.id === 'video'}
							<!-- Video Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						{:else}
							<!-- Grid Pattern Icon -->
							<svg class="w-6 h-6 {selectedType === type.id ? 'text-blue-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
							</svg>
						{/if}
					</div>
					<p class="text-sm font-semibold text-gray-900">{type.name}</p>
					<p class="text-xs text-gray-500 mt-1">{type.description}</p>
				</button>
			{/each}
		</div>

		<!-- Solid Color Options -->
		{#if selectedType === 'solid'}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Preset Colors</label>
					<div class="grid grid-cols-9 gap-1.5">
						{#each solidColors as color}
							<button
								on:click={() => updateBgColor(color.color)}
								class="group relative aspect-square rounded-md transition-all hover:scale-105 border {currentBgColor === color.color ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}"
								style="background: {color.color};"
								title={color.name}
							>
								{#if currentBgColor === color.color}
									<svg class="absolute inset-0 m-auto w-3 h-3 {color.color === '#ffffff' || color.color === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
						
						<!-- Custom Color Button -->
						<button
							on:click={toggleCustomColor}
							class="group relative aspect-square rounded-md transition-all hover:scale-105 border {showCustomColor ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
							title="Custom Color"
						>
							<div class="absolute inset-0 flex items-center justify-center">
								<svg class="w-4 h-4 {showCustomColor ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</div>
						</button>
					</div>
				</div>

				<!-- Custom Color Controls -->
				{#if showCustomColor}
					<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-3">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-semibold text-gray-900">Custom Color</h4>
							<button
								on:click={toggleCustomColor}
								class="p-1 hover:bg-white/50 rounded transition"
								title="Close"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div class="flex items-center gap-3">
							<div class="relative">
								<input 
									type="color" 
									value={currentBgColor}
									on:input={(e) => updateBgColor(e.currentTarget.value)}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div 
									class="w-12 h-12 rounded-lg border-2 border-white shadow-sm cursor-pointer"
									style="background-color: {currentBgColor};"
								></div>
							</div>
							<input 
								type="text"
								value={currentBgColor}
								on:input={(e) => updateBgColor(e.currentTarget.value)}
								class="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-mono bg-white"
								placeholder="#ffffff"
							/>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Gradient Options -->
		{#if selectedType === 'gradient'}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
					<div class="grid grid-cols-9 gap-1.5">
						{#each gradients as grad}
							<button
								on:click={() => updateBgGradient(grad.gradient, grad.from, grad.to, grad.direction)}
								class="group relative aspect-square rounded-md transition-all hover:scale-105 border {currentBgColor === grad.gradient ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}"
								style="background: {grad.gradient};"
								title={grad.name}
							>
								{#if currentBgColor === grad.gradient}
									<svg class="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
						
						<!-- Custom Gradient Button -->
						<button
							on:click={toggleCustomGradient}
							class="group relative aspect-square rounded-md transition-all hover:scale-105 border {showCustomGradient ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400 bg-white'}"
							title="Custom Gradient"
						>
							<div class="absolute inset-0 flex items-center justify-center">
								<svg class="w-4 h-4 {showCustomGradient ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</div>
						</button>
					</div>
				</div>

				<!-- Custom Gradient Controls -->
				{#if showCustomGradient}
					<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl space-y-4">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-sm font-semibold text-gray-900">Custom Gradient</h4>
							<button
								on:click={toggleCustomGradient}
								class="p-1 hover:bg-white/50 rounded transition"
								title="Close"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<!-- Color Pickers -->
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">From Color</label>
								<div class="relative">
									<input
										type="color"
										bind:value={gradientFromColor}
										on:input={updateCustomGradient}
										class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
									<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
										<div 
											class="w-8 h-8 rounded border-2 border-white shadow-sm"
											style="background-color: {gradientFromColor};"
										></div>
										<p class="text-xs font-mono text-gray-900">{gradientFromColor}</p>
									</div>
								</div>
							</div>
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">To Color</label>
								<div class="relative">
									<input
										type="color"
										bind:value={gradientToColor}
										on:input={updateCustomGradient}
										class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
									<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
										<div 
											class="w-8 h-8 rounded border-2 border-white shadow-sm"
											style="background-color: {gradientToColor};"
										></div>
										<p class="text-xs font-mono text-gray-900">{gradientToColor}</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Gradient Type Selector -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Gradient Type</label>
							<div class="grid grid-cols-2 gap-2">
								<button
									on:click={() => { gradientType = 'linear'; updateCustomGradient(); }}
									class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition {gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
									<span class="text-xs font-medium">Linear</span>
								</button>
								<button
									on:click={() => { gradientType = 'radial'; updateCustomGradient(); }}
									class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition {gradientType === 'radial' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="10" stroke-width="2"/>
										<circle cx="12" cy="12" r="6" stroke-width="2"/>
										<circle cx="12" cy="12" r="2" stroke-width="2"/>
									</svg>
									<span class="text-xs font-medium">Radial</span>
								</button>
							</div>
						</div>

						<!-- Direction Selector (only for linear) -->
						{#if gradientType === 'linear'}
							<div>
								<label class="block text-xs font-medium text-gray-700 mb-2">Direction</label>
								<div class="grid grid-cols-4 gap-2">
									<!-- Top to Bottom -->
									<button
										on:click={() => { gradientDirection = '0deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '0deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Top to Bottom"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
										</svg>
									</button>
									
									<!-- Left to Right -->
									<button
										on:click={() => { gradientDirection = '90deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '90deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Left to Right"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
										</svg>
									</button>
									
									<!-- Diagonal (Top-Left to Bottom-Right) -->
									<button
										on:click={() => { gradientDirection = '135deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '135deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Diagonal"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 19L5 5m14 0v14" />
										</svg>
									</button>
									
									<!-- Bottom to Top -->
									<button
										on:click={() => { gradientDirection = '180deg'; updateCustomGradient(); }}
										class="flex items-center justify-center px-3 py-2.5 rounded-lg transition {gradientDirection === '180deg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
										title="Bottom to Top"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
										</svg>
									</button>
								</div>
							</div>
						{/if}

						<!-- Preview -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Preview</label>
							<div 
								class="h-20 rounded-lg border-2 border-white shadow-sm"
								style="background: {gradientType === 'radial' ? `radial-gradient(circle, ${gradientFromColor}, ${gradientToColor})` : `linear-gradient(${gradientDirection}, ${gradientFromColor}, ${gradientToColor})`};"
							></div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Image Upload -->
		{#if selectedType === 'image'}
			<div class="space-y-3">
				{#if backgroundImageUrl}
					<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
						<img src={backgroundImageUrl} alt="Background" class="w-full h-48 object-cover" />
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
		{/if}

		<!-- Video Upload -->
		{#if selectedType === 'video'}
			<div class="space-y-3">
				{#if backgroundVideoUrl}
					<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
						<video src={backgroundVideoUrl} class="w-full h-48 object-cover" autoplay loop muted playsinline></video>
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
								on:click={handleRemoveVideo}
								disabled={uploading}
								class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 {backgroundVideoUrl === DEFAULT_VIDEO_BG ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-medium text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								{backgroundVideoUrl === DEFAULT_VIDEO_BG ? 'Default' : 'Remove'}
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
							<div class="flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed rounded-xl transition-all {isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}">
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

		<!-- Pattern -->
		{#if selectedType === 'pattern'}
			<div class="space-y-4">
				<!-- Pattern Presets -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Pattern Style</label>
					<div class="grid grid-cols-4 gap-2">
						{#each patterns as pattern}
							<button
								on:click={() => { selectedPattern = pattern.id; updatePattern(); }}
								class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 overflow-hidden {selectedPattern === pattern.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}"
								title={pattern.name}
							>
								<div 
									class="w-full h-full"
									style={getPatternStyle(pattern.id, patternColor, patternBgColor)}
								></div>
								{#if selectedPattern === pattern.id}
									<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
										<svg class="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Pattern Customization -->
				<div class="p-4 bg-gray-50 rounded-xl space-y-3">
					<h4 class="text-sm font-semibold text-gray-900">Customize Pattern</h4>
					
					<div class="grid grid-cols-2 gap-3">
						<!-- Pattern Color -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Pattern Color</label>
							<div class="relative">
								<input
									type="color"
									bind:value={patternColor}
									on:input={updatePattern}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
									<div 
										class="w-8 h-8 rounded border-2 border-white shadow-sm"
										style="background-color: {patternColor};"
									></div>
									<p class="text-xs font-mono text-gray-900">{patternColor}</p>
								</div>
							</div>
						</div>

						<!-- Background Color -->
						<div>
							<label class="block text-xs font-medium text-gray-700 mb-2">Background</label>
							<div class="relative">
								<input
									type="color"
									bind:value={patternBgColor}
									on:input={updatePattern}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer">
									<div 
										class="w-8 h-8 rounded border-2 border-white shadow-sm"
										style="background-color: {patternBgColor};"
									></div>
									<p class="text-xs font-mono text-gray-900">{patternBgColor}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Preview -->
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-2">Preview</label>
						<div 
							class="h-24 rounded-lg border-2 border-white shadow-sm"
							style={getPatternStyle(selectedPattern, patternColor, patternBgColor)}
						></div>
					</div>
				</div>
			</div>
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
