/**
 * Seamless video loop with smooth fade transitions
 * Handles fade out before loop and fade in after loop
 */
export function createVideoFadeHandler() {
	let isFadingOut = false;
	let isFadingIn = false;

	const FADE_DURATION = 2.0; // 2 seconds fade
	const FADE_START = FADE_DURATION + 0.3; // Start fade 2.3s before end
	const LOOP_POINT = 0.15; // Loop when 0.15s remaining

	return function handleVideoTimeUpdate(event: Event) {
		const video = event.target as HTMLVideoElement;
		if (!video.duration || isNaN(video.duration)) return;

		const remaining = video.duration - video.currentTime;

		// Start fade out
		if (remaining <= FADE_START && remaining > LOOP_POINT && !isFadingOut && !isFadingIn) {
			isFadingOut = true;
			video.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
			video.style.opacity = '0';
		}

		// Loop and start fade in
		if (remaining <= LOOP_POINT && isFadingOut) {
			isFadingOut = false;
			isFadingIn = true;
			video.currentTime = 0;

			// Reset transition and opacity immediately
			video.style.transition = 'none';
			video.style.opacity = '0';

			// Then fade in with CSS transition
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					video.style.transition = `opacity ${FADE_DURATION}s ease-in-out`;
					video.style.opacity = '1';

					// Reset fade in flag after transition completes
					setTimeout(() => {
						isFadingIn = false;
					}, FADE_DURATION * 1000 + 100);
				});
			});
		}
	};
}
