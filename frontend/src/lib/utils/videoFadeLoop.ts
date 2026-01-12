/**
 * Seamless video loop with smooth fade transitions
 * Uses event-based approach with optimized state management
 */
export function createVideoFadeHandler() {
	const FADE_DURATION = 1.0; // 1 second fade
	const DEBOUNCE_MS = 100; // Prevent rapid triggers
	const FADE_START_OFFSET = 0.5; // Start fade 0.5s before end
	const FADE_IN_THRESHOLD = 0.5; // Fade in during first 0.5s
	
	let lastFadeTime = 0;
	let isNearEnd = false;

	return function handleVideoTimeUpdate(event: Event) {
		const video = event.target as HTMLVideoElement;
		
		// Early return for invalid video state
		if (!video.duration || isNaN(video.duration)) return;

		const currentTime = video.currentTime;
		const duration = video.duration;
		const remaining = duration - currentTime;
		const now = Date.now();

		// Debounce: prevent multiple triggers in same cycle
		if (now - lastFadeTime < DEBOUNCE_MS) return;

		// Fade out: near end of video
		if (remaining <= FADE_DURATION + FADE_START_OFFSET && !isNearEnd) {
			isNearEnd = true;
			lastFadeTime = now;
			video.style.transition = `opacity ${FADE_DURATION}s ease-out`;
			video.style.opacity = '0';
			return;
		}

		// Fade in: after loop restart
		if (currentTime < FADE_IN_THRESHOLD && isNearEnd) {
			isNearEnd = false;
			lastFadeTime = now;
			
			// Reset opacity immediately without transition
			video.style.transition = 'none';
			video.style.opacity = '0';
			
			// Fade in on next frame (ensures smooth transition)
			requestAnimationFrame(() => {
				video.style.transition = `opacity ${FADE_DURATION}s ease-in`;
				video.style.opacity = '1';
			});
		}
	};
}
