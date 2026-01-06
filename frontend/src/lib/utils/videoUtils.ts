/**
 * Video utility functions for background video handling
 */

// Video constraints
export const VIDEO_MAX_SIZE = 20 * 1024 * 1024; // 20MB
export const VIDEO_ACCEPTED_TYPES = ['video/mp4', 'video/webm'];

/**
 * Extract first frame from video file as blob URL
 */
export async function extractVideoFrame(file: File): Promise<string> {
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

			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(URL.createObjectURL(blob));
					} else {
						reject(new Error('Failed to extract frame'));
					}
				},
				'image/jpeg',
				0.9
			);
		};

		video.onerror = reject;
		video.src = URL.createObjectURL(file);
	});
}

/**
 * Validate video file type and size
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
	if (!file.type.startsWith('video/')) {
		return { valid: false, error: 'Please upload a video file (MP4, WebM)' };
	}

	if (file.size > VIDEO_MAX_SIZE) {
		return { valid: false, error: 'Video must be less than 20MB' };
	}

	return { valid: true };
}
