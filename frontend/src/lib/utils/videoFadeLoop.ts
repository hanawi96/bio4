/**
 * Seamless video loop with smooth fade transitions
 * Uses event-based approach for reliability
 */
export function createVideoFadeHandler() {
	const FADE_DURATION = 1.5; // 1.5 seconds fade
	let lastFadeTime = 0;
	let isNearEnd = false;

	return function handleVideoTimeUpdate(event: Event) {
		const video = event.target as HTMLVideoElement;
		if (!video.duration || isNaN(video.duration)) return;

		const currentTime = video.currentTime;
		const duration = video.duration;
		const remaining = duration - currentTime;

		// Prevent multiple triggers in same cycle
		const now = Date.now();
		if (now - lastFadeTime < 100) return;

		// Near end: start fade out (last 2 seconds)
		if (remaining <= FADE_DURATION + 0.5 && !isNearEnd) {
			isNearEnd = true;
			lastFadeTime = now;
			video.style.transition = `opacity ${FADE_DURATION}s ease-out`;
			video.style.opacity = '0';
		}

		// After loop: fade back in (first 0.5 seconds)
		if (currentTime < 0.5 && isNearEnd) {
			isNearEnd = false;
			lastFadeTime = now;
			
			// Immediate reset without transition
			video.style.transition = 'none';
			video.style.opacity = '0';
			
			// Fade in after a frame
			requestAnimationFrame(() => {
				video.style.transition = `opacity ${FADE_DURATION}s ease-in`;
				video.style.opacity = '1';
			});
		}
	};
}
