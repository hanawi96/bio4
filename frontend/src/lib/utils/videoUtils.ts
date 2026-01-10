// Video URL parsing utilities

export interface ParsedVideo {
	platform: 'youtube' | 'tiktok' | 'vimeo' | null;
	videoId: string | null;
	embedUrl: string | null;
	thumbnailUrl: string | null;
}

/**
 * Parse YouTube URL and extract video ID
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
function parseYouTubeUrl(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
		/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
	];
	
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	
	return null;
}

/**
 * Parse video URL and return platform info
 */
export function parseVideoUrl(url: string): ParsedVideo {
	const result: ParsedVideo = {
		platform: null,
		videoId: null,
		embedUrl: null,
		thumbnailUrl: null
	};
	
	// YouTube
	if (url.includes('youtube.com') || url.includes('youtu.be')) {
		const videoId = parseYouTubeUrl(url);
		if (videoId) {
			result.platform = 'youtube';
			result.videoId = videoId;
			result.embedUrl = `https://www.youtube.com/embed/${videoId}`;
			result.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
		}
	}
	
	return result;
}

/**
 * Validate if URL is a supported video platform
 */
export function isValidVideoUrl(url: string): boolean {
	const parsed = parseVideoUrl(url);
	return parsed.platform !== null && parsed.videoId !== null;
}

/**
 * Get embed URL for video
 */
export function getVideoEmbedUrl(platform: string, videoId: string): string {
	switch (platform) {
		case 'youtube':
			return `https://www.youtube.com/embed/${videoId}`;
		default:
			return '';
	}
}

/**
 * Get thumbnail URL for video
 */
export function getVideoThumbnail(platform: string, videoId: string): string {
	switch (platform) {
		case 'youtube':
			return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
		default:
			return '';
	}
}

/**
 * Validate video file for background upload
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
	// Check file type
	if (!file.type.startsWith('video/')) {
		return { valid: false, error: 'File must be a video' };
	}
	
	// Check file size (max 50MB)
	const maxSize = 50 * 1024 * 1024; // 50MB
	if (file.size > maxSize) {
		return { valid: false, error: 'Video must be less than 50MB' };
	}
	
	// Check supported formats
	const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
	if (!supportedFormats.includes(file.type)) {
		return { valid: false, error: 'Supported formats: MP4, WebM, OGG' };
	}
	
	return { valid: true };
}

/**
 * Extract a frame from video file as thumbnail
 */
export async function extractVideoFrame(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		
		if (!ctx) {
			reject(new Error('Failed to get canvas context'));
			return;
		}
		
		video.preload = 'metadata';
		video.muted = true;
		video.playsInline = true;
		
		video.onloadedmetadata = () => {
			// Seek to 1 second or 10% of video duration
			video.currentTime = Math.min(1, video.duration * 0.1);
		};
		
		video.onseeked = () => {
			try {
				// Set canvas size to video dimensions
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				
				// Draw video frame to canvas
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				
				// Convert to data URL
				const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
				
				// Cleanup
				URL.revokeObjectURL(video.src);
				
				resolve(dataUrl);
			} catch (e) {
				reject(e);
			}
		};
		
		video.onerror = () => {
			URL.revokeObjectURL(video.src);
			reject(new Error('Failed to load video'));
		};
		
		// Load video
		video.src = URL.createObjectURL(file);
	});
}
