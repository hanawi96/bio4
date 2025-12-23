<script lang="ts">
	import { page } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import { api } from '$lib/api.client';
	import ImageCropModal from '$lib/components/modals/ImageCropModal.svelte';
	import { generatePatternColors, type PatternType } from '$lib/utils/patternColors';
	import { THEMES_MAP } from '$lib/appearance/presets';

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
			name: 'Circuit',
			svg: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><circle cx="10" cy="10" r="3"/><circle cx="70" cy="10" r="3"/><circle cx="10" cy="70" r="3"/><circle cx="70" cy="70" r="3"/><circle cx="40" cy="40" r="4"/><line x1="13" y1="10" x2="37" y2="40"/><line x1="67" y1="10" x2="43" y2="40"/><line x1="13" y1="70" x2="37" y2="43"/><line x1="67" y1="70" x2="43" y2="43"/><rect x="38" y="8" width="4" height="4"/><rect x="38" y="68" width="4" height="4"/><rect x="8" y="38" width="4" height="4"/><rect x="68" y="38" width="4" height="4"/></g></svg>`
		},
		{ 
			id: 'zigzag', 
			name: 'Hexagon',
			svg: `<svg width="56" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M28 0L0 16v32l28 16 28-16V16L28 0zm0 6l22 12.5v25L28 56 6 43.5v-25L28 6z" fill="currentColor" opacity="0.15"/><path d="M28 50L0 66v32l28 16 28-16V66L28 50zm0 6l22 12.5v25L28 106 6 93.5v-25L28 56z" fill="currentColor" opacity="0.15"/></svg>`
		},
		{ 
			id: 'organic', 
			name: 'Organic',
			svg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30 10c-8 0-12 8-12 12s4 8 8 12c4-4 12-8 12-12s-4-12-8-12z" fill="currentColor" opacity="0.3"/></svg>`
		},
		{ 
			id: 'noise', 
			name: 'Topography',
			svg: `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 3c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M60 15c-8 0-15 7-15 15s7 15 15 15 15-7 15-15-7-15-15-15zm0 4c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M30 60c-6 0-12 6-12 12s6 12 12 12 12-6 12-12-6-12-12-12zm0 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M75 65c-7 0-13 6-13 13s6 13 13 13 13-6 13-13-6-13-13-13zm0 3c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>`
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
	let isInitialLoad = true; // Flag để detect lần đầu load
	
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
	
	// Màu nền gốc để tạo pattern preview (KHÔNG thay đổi)
	let baseThemeColor = '#ffffff';
	
	// Reactive: Sync base theme color từ theme preset (không từ customTheme)
	$: if ($page?.theme_preset_key && !isUserUpdate) {
		const themeKey = $page.theme_preset_key;
		const theme = THEMES_MAP[themeKey];
		
		if (theme?.config?.backgroundColor) {
			const bgColor = theme.config.backgroundColor;
			
			// Extract base color cho pattern
			if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
				// Solid color
				baseThemeColor = bgColor;
			} else if (bgColor.includes('gradient')) {
				// Gradient: extract màu đầu tiên
				const matches = bgColor.match(/#[0-9a-fA-F]{6}/g);
				if (matches && matches.length > 0) {
					baseThemeColor = matches[0]; // Lấy màu đầu tiên
				}
			}
		}
	}
	
	// Reactive: Sync pattern colors khi baseThemeColor hoặc selectedType thay đổi
	$: if (baseThemeColor && selectedType === 'pattern' && !isUserUpdate) {
		const patternColors = generatePatternColors(baseThemeColor, selectedPattern);
		patternBgColor = patternColors.bgColor;
		patternColor = patternColors.inkColor;
	}
	
	// Fixed pattern colors for preset previews - dùng baseThemeColor
	$: fixedPreviewColors = generatePatternColors(baseThemeColor, 'grid');
	
	// Reactive: Log backgroundImageUrl changes
	$: if (selectedType === 'image') {
		console.log('🖼️ [REACTIVE] backgroundImageUrl changed:', backgroundImageUrl);
		console.log('🖼️ [REACTIVE] Should show:', backgroundImageUrl ? 'IMAGE' : 'UPLOAD BOX');
	}
	
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
				
				// KHÔNG clear backgroundImageUrl nếu đang ở image type
				// Vì detect logic đã set nó từ backgroundColor
			}
		} catch (e) {
			console.error('[BackgroundSection] Failed to parse draft_appearance:', e);
		}
	}

	// Reactive: Detect background type từ backgroundColor (khi load trang)
	$: if ($appearance?.tokens?.backgroundColor && !isUserUpdate) {
		const bgColor = $appearance.tokens.backgroundColor;
		
		// Detect type từ backgroundColor
		if (bgColor.startsWith('background:') || bgColor.startsWith('background ')) {
			// Pattern CSS string
			if (selectedType !== 'pattern') {
				selectedType = 'pattern';
				currentBgColor = bgColor;
				
				// Detect pattern type từ CSS string
				if (bgColor.includes('radial-gradient(circle')) {
					selectedPattern = 'dots';
				} else if (bgColor.includes('repeating-linear-gradient(45deg')) {
					selectedPattern = 'diagonal';
				} else if (bgColor.includes('linear-gradient') && bgColor.includes('90deg')) {
					// Grid pattern (chỉ còn grid, không có cross nữa)
					selectedPattern = 'grid';
				} else if (bgColor.includes('url(') && bgColor.includes('svg')) {
					// SVG pattern - detect by content
					if (bgColor.includes('path') && bgColor.includes('Q')) {
						selectedPattern = 'waves';
					} else if (bgColor.includes('path') && bgColor.includes('L28 0L0 16')) {
						selectedPattern = 'zigzag'; // Hexagon pattern
					} else if (bgColor.includes('stroke="currentColor"') && bgColor.includes('fill="none"')) {
						selectedPattern = 'noise'; // Topography pattern
					} else if (bgColor.includes('circle') && bgColor.includes('line') && bgColor.includes('rect')) {
						selectedPattern = 'cross'; // Circuit pattern
					} else {
						selectedPattern = 'organic';
					}
				}
				
				// Sync pattern colors từ baseThemeColor
				const patternColors = generatePatternColors(baseThemeColor, selectedPattern);
				patternBgColor = patternColors.bgColor;
				patternColor = patternColors.inkColor;
			}
		} else if (bgColor.includes('gradient')) {
			if (selectedType !== 'gradient') {
				selectedType = 'gradient';
				currentBgColor = bgColor;
			}
		} else if (bgColor.includes('url(')) {
			// Image background
			console.log('🖼️ [IMAGE] Detected image background');
			console.log('🖼️ [IMAGE] bgColor:', bgColor);
			console.log('🖼️ [IMAGE] Current selectedType:', selectedType);
			console.log('🖼️ [IMAGE] Current backgroundImageUrl:', backgroundImageUrl);
			
			if (selectedType !== 'image') {
				selectedType = 'image';
				currentBgColor = bgColor;
				
				// Extract image URL
				const urlMatch = bgColor.match(/url\(['"]?([^'"]+)['"]?\)/);
				console.log('🖼️ [IMAGE] URL match:', urlMatch);
				
				if (urlMatch && urlMatch[1]) {
					backgroundImageUrl = urlMatch[1];
					console.log('🖼️ [IMAGE] Set backgroundImageUrl to:', backgroundImageUrl);
				} else {
					// Fallback to default if can't extract
					backgroundImageUrl = DEFAULT_IMAGE_BG;
					console.log('🖼️ [IMAGE] Fallback to default:', DEFAULT_IMAGE_BG);
				}
			} else {
				console.log('🖼️ [IMAGE] Already image type, skipping');
			}
		} else if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
			if (selectedType !== 'solid') {
				selectedType = 'solid';
				currentBgColor = bgColor;
			}
		}
	}

	// Reactive: Sync with appearance tokens (only when theme changes)
	$: if ($appearance?.tokens?.backgroundColor && !isUserUpdate) {
		const bgColor = $appearance.tokens.backgroundColor;
		const currentThemeKey = $page?.theme_preset_key || '';
		
		// Only auto-detect type when theme changes (not on initial load or every appearance update)
		const isThemeChange = currentThemeKey !== lastSyncedThemeKey && lastSyncedThemeKey !== '';
		
		if (isInitialLoad) {
			// Lần đầu load: chỉ sync theme key, KHÔNG reset type
			lastSyncedThemeKey = currentThemeKey;
			isInitialLoad = false;
		} else if (isThemeChange) {
			// Theme thật sự thay đổi: reset về theme default
			lastSyncedThemeKey = currentThemeKey;
			
			// Khi đổi theme, RESET về solid color của theme mới
			// Không giữ pattern/gradient/image cũ
			if (bgColor.match(/^#[0-9a-fA-F]{6}$/)) {
				// Theme mới có màu solid
				currentBgColor = bgColor;
				selectedType = 'solid';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			} else if (bgColor.includes('gradient')) {
				// Theme mới có gradient
				currentBgColor = bgColor;
				selectedType = 'gradient';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			} else {
				// Fallback: reset về solid white
				currentBgColor = '#ffffff';
				selectedType = 'solid';
				backgroundImageUrl = '';
				backgroundVideoUrl = '';
			}
			
			// Clear pattern history khi đổi theme
			backgroundHistory.pattern = '';
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
			
			console.log('🖼️ [SELECT] Switching to image type');
			console.log('🖼️ [SELECT] backgroundHistory.image:', backgroundHistory.image);
			
			if (backgroundHistory.image && backgroundHistory.image.trim()) {
				backgroundImageUrl = backgroundHistory.image;
				console.log('🖼️ [SELECT] Restored from history:', backgroundImageUrl);
				updateBgColor(`url('${backgroundHistory.image}')`);
			} else {
				// Use default image when no custom image uploaded
				backgroundImageUrl = DEFAULT_IMAGE_BG;
				console.log('🖼️ [SELECT] Using default image:', DEFAULT_IMAGE_BG);
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
			
			// Generate pattern colors từ baseThemeColor
			const patternColors = generatePatternColors(baseThemeColor, selectedPattern);
			patternBgColor = patternColors.bgColor;
			patternColor = patternColors.inkColor;
			
			// Update pattern ngay lập tức
			const patternStyle = getPatternStyle(selectedPattern, patternColors.inkColor, patternColors.bgColor);
			updateBgColor(patternStyle);
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

		// Optimistic update: Update store ngay lập tức
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

		// Debounce API call (chạy background, không block UI)
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
		
		if (!pattern) return `background: ${bgColor};`;
		
		if (pattern.svg) {
			// SVG pattern - encode as data URI
			const svg = pattern.svg.replace(/currentColor/g, color);
			const encoded = btoa(svg);
			return `background: url('data:image/svg+xml;base64,${encoded}') repeat, ${bgColor};`;
		} else {
			// CSS pattern
			const css = pattern.css!.replace(/currentColor/g, color);
			return `background: ${css}, ${bgColor}; background-size: ${pattern.size};`;
		}
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
					</div>
				</div>
			</div>
		{/if}

		<!-- Gradient Options -->
		{#if selectedType === 'gradient'}
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
					<div class="grid grid-cols-8 gap-2">
						{#each gradients as grad}
							<button
								on:click={() => updateBgColor(grad.gradient)}
								class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 {currentBgColor === grad.gradient ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}"
								style="background: {grad.gradient};"
								title={grad.name}
							>
								{#if currentBgColor === grad.gradient}
									<svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
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
								on:click={() => {
									selectedPattern = pattern.id;
									
									// Generate pattern colors từ baseThemeColor
									const patternColors = generatePatternColors(baseThemeColor, pattern.id);
									patternBgColor = patternColors.bgColor;
									patternColor = patternColors.inkColor;
									
									// Update ngay lập tức
									const patternStyle = getPatternStyle(pattern.id, patternColors.inkColor, patternColors.bgColor);
									updateBgColor(patternStyle);
								}}
								class="relative aspect-square rounded-lg border-2 transition-all hover:scale-105 overflow-hidden {selectedPattern === pattern.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}"
								title={pattern.name}
							>
								<div 
									class="w-full h-full"
									style={getPatternStyle(pattern.id, fixedPreviewColors.inkColor, fixedPreviewColors.bgColor)}
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
									on:input={() => {
										const patternStyle = getPatternStyle(selectedPattern, patternColor, patternBgColor);
										updateBgColor(patternStyle);
									}}
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
									on:input={() => {
										const patternStyle = getPatternStyle(selectedPattern, patternColor, patternBgColor);
										updateBgColor(patternStyle);
									}}
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
