// Video platform utilities

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'vimeo';

interface VideoInfo {
	platform: VideoPlatform;
	id: string;
	embedUrl: string;
	aspectRatio: '16/9' | '9/16';
}

// Platform regex patterns
const patterns = {
	youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
	tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
	instagram: /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
	vimeo: /vimeo\.com\/(\d+)/
};

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): VideoPlatform | null {
	if (patterns.youtube.test(url)) return 'youtube';
	if (patterns.tiktok.test(url)) return 'tiktok';
	if (patterns.instagram.test(url)) return 'instagram';
	if (patterns.vimeo.test(url)) return 'vimeo';
	return null;
}

/**
 * Validate URL for specific platform
 */
export function validatePlatformUrl(url: string, platform: VideoPlatform): boolean {
	return patterns[platform].test(url);
}

/**
 * Parse video URL and extract info
 */
export function parseVideoUrl(url: string, expectedPlatform?: VideoPlatform): VideoInfo | null {
	const platform = detectPlatform(url);
	if (!platform) return null;
	
	// If expected platform specified, validate it matches
	if (expectedPlatform && platform !== expectedPlatform) return null;
	
	const match = url.match(patterns[platform]);
	if (!match || !match[1]) return null;
	
	const id = match[1];
	const aspectRatio = (platform === 'tiktok' || platform === 'instagram') ? '9/16' : '16/9';
	
	// Generate embed URL
	let embedUrl = '';
	switch (platform) {
		case 'youtube':
			embedUrl = `https://www.youtube.com/embed/${id}`;
			break;
		case 'tiktok':
			// Add parameters to minimize TikTok UI (hide title, description, etc.)
			embedUrl = `https://www.tiktok.com/embed/v2/${id}?autoplay=1&music_info=0&description=0`;
			break;
		case 'instagram':
			embedUrl = `https://www.instagram.com/p/${id}/embed`;
			break;
		case 'vimeo':
			embedUrl = `https://player.vimeo.com/video/${id}`;
			break;
	}
	
	return { platform, id, embedUrl, aspectRatio };
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: VideoPlatform): string {
	const names = {
		youtube: 'YouTube',
		tiktok: 'TikTok',
		instagram: 'Instagram',
		vimeo: 'Vimeo'
	};
	return names[platform];
}

/**
 * Get platform icon emoji
 */
export function getPlatformIcon(platform: VideoPlatform): string {
	const icons = {
		youtube: '🔴',
		tiktok: '⚫',
		instagram: '📷',
		vimeo: '🎬'
	};
	return icons[platform];
}

/**
 * Fetch video metadata (title, thumbnail) from platform
 */
export async function fetchVideoMetadata(platform: VideoPlatform, videoId: string, videoUrl: string): Promise<{ title?: string; thumbnail?: string }> {
	try {
		switch (platform) {
			case 'youtube': {
				const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
				if (!response.ok) return {};
				const data = await response.json();
				return {
					title: data.title,
					thumbnail: data.thumbnail_url || getYouTubeThumbnail(videoId, 'hq')
				};
			}
			case 'vimeo': {
				const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
				if (!response.ok) return {};
				const data = await response.json();
				return {
					title: data.title,
					thumbnail: data.thumbnail_url
				};
			}
			case 'tiktok': {
				try {
					const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
					if (response.ok) {
						const data = await response.json();
						return {
							title: data.title || 'TikTok Video',
							thumbnail: data.thumbnail_url
						};
					}
				} catch (e) {
					// TikTok oEmbed failed, use fallback
				}
				return {
					title: 'TikTok Video',
					thumbnail: undefined
				};
			}
			case 'instagram':
				return {
					title: 'Instagram Video',
					thumbnail: undefined
				};
			default:
				return {};
		}
	} catch (error) {
		console.error('[videoUtils] Failed to fetch video metadata:', error);
		return {};
	}
}

/**
 * Get error message for invalid URL
 */
export function getValidationError(platform: VideoPlatform): string {
	const messages = {
		youtube: 'Please enter a valid YouTube URL (e.g., youtube.com/watch?v=... or youtu.be/...)',
		tiktok: 'Please enter a valid TikTok URL (e.g., tiktok.com/@user/video/...)',
		instagram: 'Please enter a valid Instagram URL (e.g., instagram.com/p/... or instagram.com/reel/...)',
		vimeo: 'Please enter a valid Vimeo URL (e.g., vimeo.com/...)'
	};
	return messages[platform];
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
	return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Get video thumbnail URL based on platform
 */
export function getVideoThumbnail(platform: VideoPlatform, videoId: string): string {
	switch (platform) {
		case 'youtube':
			return getYouTubeThumbnail(videoId, 'hq');
		case 'tiktok':
			// TikTok thumbnail pattern (may not always work due to CDN)
			// Fallback will be handled in component
			return '';
		case 'instagram':
			// Instagram doesn't provide direct thumbnail URLs
			return '';
		case 'vimeo':
			// Vimeo requires API call for thumbnail
			return '';
		default:
			return '';
	}
}

/**
 * Validate video file (for background video upload)
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
	// Check file type
	if (!file.type.startsWith('video/')) {
		return { valid: false, error: 'File must be a video' };
	}
	
	// Check file size (max 50MB)
	const maxSize = 50 * 1024 * 1024;
	if (file.size > maxSize) {
		return { valid: false, error: 'Video must be less than 50MB' };
	}
	
	return { valid: true };
}

/**
 * Extract frame from video file (for thumbnail)
 */
export async function extractVideoFrame(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		
		if (!ctx) {
			reject(new Error('Could not get canvas context'));
			return;
		}
		
		video.preload = 'metadata';
		video.muted = true;
		video.playsInline = true;
		
		video.onloadedmetadata = () => {
			// Seek to 1 second or 10% of video
			video.currentTime = Math.min(1, video.duration * 0.1);
		};
		
		video.onseeked = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0);
			
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(URL.createObjectURL(blob));
				} else {
					reject(new Error('Could not extract frame'));
				}
			}, 'image/jpeg', 0.8);
		};
		
		video.onerror = () => {
			reject(new Error('Could not load video'));
		};
		
		video.src = URL.createObjectURL(file);
	});
}
