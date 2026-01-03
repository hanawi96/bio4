<script lang="ts">
	export let count: number = 20;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let color: string = '#ffffff';
	export let speed: 'slow' | 'medium' | 'fast' = 'medium';
	export let variant: 'floating' | 'rain' | 'snow' | 'bubbles' | 'stars' | 'fireflies' | 'aurora' | 'sparkles' | 'confetti' = 'floating';
	
	// Size mapping (px)
	const sizeMap = {
		small: 4,
		medium: 8,
		large: 12
	};
	
	// Rain-specific: width and height different (thinner and sharper)
	const rainSizeMap = {
		small: { width: 1, height: 12 },
		medium: { width: 2, height: 18 },
		large: { width: 2, height: 25 }
	};
	
	// Aurora-specific: wide waves with gradient
	const auroraSizeMap = {
		small: { width: 200, height: 80 },
		medium: { width: 300, height: 120 },
		large: { width: 400, height: 160 }
	};
	
	// Petals-specific: oval petal shapes
	const confettiSizeMap = {
		small: { width: 6, height: 10 },
		medium: { width: 8, height: 14 },
		large: { width: 10, height: 18 }
	};
	
	// Generate particles with random positions and delays
	$: particles = Array.from({ length: variant === 'aurora' ? Math.min(count, 5) : count }, (_, i) => {
		// For fireflies, use grid-based distribution for even spacing
		let left, top;
		if (variant === 'fireflies') {
			const cols = Math.ceil(Math.sqrt(count));
			const rows = Math.ceil(count / cols);
			const col = i % cols;
			const row = Math.floor(i / cols);
			// Center each particle in its grid cell with small random offset
			left = ((col + 0.5) / cols) * 100 + (Math.random() * 10 - 5);
			top = ((row + 0.5) / rows) * 100 + (Math.random() * 10 - 5);
		} else {
			left = variant === 'aurora' ? -20 + Math.random() * 40 : Math.random() * 100;
			top = (variant === 'stars' || variant === 'sparkles') 
				? Math.random() * 100 
				: variant === 'aurora'
					? 20 + (i * 15) + Math.random() * 10
					: 0;
		}
		
		return {
			id: i,
			left,
			top,
			delay: Math.random() * 5,
			duration:
				variant === 'rain'
					? speed === 'slow'
						? 1.5 + Math.random() * 0.5
						: speed === 'medium'
							? 1 + Math.random() * 0.3
							: 0.5 + Math.random() * 0.2
					: variant === 'stars'
						? speed === 'slow'
							? 3 + Math.random() * 2
							: speed === 'medium'
								? 2 + Math.random() * 1
								: 1 + Math.random() * 0.5
					: variant === 'fireflies'
						? speed === 'slow'
							? 4 + Math.random() * 2
							: speed === 'medium'
								? 3 + Math.random() * 1
								: 2 + Math.random() * 0.5
					: variant === 'aurora'
						? speed === 'slow'
							? 12 + Math.random() * 4
							: speed === 'medium'
								? 8 + Math.random() * 2
								: 5 + Math.random() * 1
					: variant === 'sparkles'
						? speed === 'slow'
							? 8 + Math.random() * 2
							: speed === 'medium'
								? 6 + Math.random() * 2
								: 4 + Math.random() * 2
					: variant === 'confetti'
						? speed === 'slow'
							? 10 + Math.random() * 4
							: speed === 'medium'
								? 8 + Math.random() * 3
								: 6 + Math.random() * 2
					: speed === 'slow'
						? 15 + Math.random() * 10
						: speed === 'medium'
							? 10 + Math.random() * 5
							: 5 + Math.random() * 3
		};
	});
	
	// Get size based on variant
	$: particleSize = variant === 'rain' 
		? rainSizeMap[size] 
		: variant === 'aurora'
			? auroraSizeMap[size]
			: variant === 'confetti'
				? confettiSizeMap[size]
				: { width: sizeMap[size], height: sizeMap[size] };
</script>

<div class="particles-container">
	{#each particles as particle (particle.id)}
		<div
			class="particle particle-{variant}"
			style="
				left: {particle.left}%;
				{(variant === 'stars' || variant === 'fireflies' || variant === 'aurora' || variant === 'sparkles') ? `top: ${particle.top}%;` : ''}
				width: {particleSize.width}px;
				height: {particleSize.height}px;
				{variant === 'sparkles' ? `--particle-size: ${particleSize.width * 3}px;` : ''}
				{variant === 'aurora' 
					? `background: linear-gradient(90deg, transparent, ${color}, transparent);` 
					: variant === 'sparkles' 
						? `color: ${color};`
						: `background-color: ${color};`}
				animation-delay: {particle.delay}s;
				animation-duration: {particle.duration}s;
			"
		></div>
	{/each}
</div>

<style>
	.particles-container {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 1;
	}

	.particle {
		position: absolute;
		opacity: 0.6;
		animation: float-up ease-in infinite;
	}

	/* Floating particles */
	.particle-floating {
		bottom: -20px;
		border-radius: 50%;
	}

	/* Rain drops */
	.particle-rain {
		top: -30px;
		border-radius: 50% / 80% 80% 20% 20%;
		opacity: 0.8;
		animation: rain-fall linear infinite;
		box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
	}

	/* Snow flakes - with glow and depth */
	.particle-snow {
		top: -20px;
		border-radius: 50%;
		opacity: 0.7;
		animation: snow-fall ease-in-out infinite;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 24px rgba(255, 255, 255, 0.6), 0 0 36px rgba(255, 255, 255, 0.3);
		filter: blur(1.5px);
	}
	
	/* Snow variations - different sizes for depth */
	.particle-snow:nth-child(3n) {
		transform: scale(0.6);
		opacity: 0.4;
		filter: blur(3px);
		animation-duration: 1.3em;
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.3);
	}
	
	.particle-snow:nth-child(5n) {
		transform: scale(1.4);
		opacity: 0.9;
		filter: blur(0.5px);
		box-shadow: 0 0 16px rgba(255, 255, 255, 1), 0 0 32px rgba(255, 255, 255, 0.7), 0 0 48px rgba(255, 255, 255, 0.4);
		animation-duration: 0.8em;
	}
	
	.particle-snow:nth-child(7n) {
		transform: scale(0.4);
		opacity: 0.3;
		filter: blur(4px);
		animation-duration: 1.5em;
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.5), 0 0 12px rgba(255, 255, 255, 0.2);
	}
	
	.particle-snow:nth-child(11n) {
		transform: scale(1.8);
		opacity: 1;
		filter: blur(0px);
		box-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5);
		animation-duration: 0.7em;
	}

	/* Bubbles */
	.particle-bubbles {
		bottom: -20px;
		border-radius: 50%;
		opacity: 0.5;
		animation: bubbles-rise ease-in-out infinite;
		box-shadow: inset -2px -2px 4px rgba(255, 255, 255, 0.5),
			inset 2px 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Stars */
	.particle-stars {
		border-radius: 50%;
		opacity: 0;
		animation: stars-twinkle ease-in-out infinite;
		box-shadow: 0 0 4px currentColor, 0 0 8px currentColor;
		clip-path: polygon(
			50% 0%,
			61% 35%,
			98% 35%,
			68% 57%,
			79% 91%,
			50% 70%,
			21% 91%,
			32% 57%,
			2% 35%,
			39% 35%
		);
	}

	/* Fireflies */
	.particle-fireflies {
		border-radius: 50%;
		opacity: 0;
		animation: fireflies-glow ease-in-out infinite;
		box-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor;
	}

	/* Aurora */
	.particle-aurora {
		border-radius: 50%;
		opacity: 0;
		animation: aurora-wave ease-in-out infinite;
		filter: blur(20px);
		transform-origin: center;
	}

	/* Music Notes (replaces Bouncing Balls) */
	.particle-sparkles {
		border-radius: 0;
		opacity: 0;
		animation: music-notes-float ease-in-out infinite;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}
	
	.particle-sparkles::before {
		font-size: max(var(--particle-size, 24px), 16px);
	}
	
	/* 10 different music note types - no conflicts */
	.particle-sparkles:nth-child(10n+1)::before {
		content: '♪';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+2)::before {
		content: '♫';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+3)::before {
		content: '♬';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+4)::before {
		content: '♩';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+5)::before {
		content: '♭';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+6)::before {
		content: '♮';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+7)::before {
		content: '♯';
		display: block;
	}
	
	.particle-sparkles:nth-child(10n+8)::before {
		content: '𝄞';
		display: block;
		font-size: calc(max(var(--particle-size, 24px), 16px) * 1.2);
	}
	
	.particle-sparkles:nth-child(10n+9)::before {
		content: '𝄢';
		display: block;
		font-size: calc(max(var(--particle-size, 24px), 16px) * 1.2);
	}
	
	.particle-sparkles:nth-child(10n)::before {
		content: '♪';
		display: block;
	}

	/* Petals */
	.particle-confetti {
		top: -30px;
		border-radius: 20%;
		opacity: 0.9;
		animation: confetti-fall ease-in infinite;
	}

	/* Floating animation (bottom to top) */
	@keyframes float-up {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 0.6;
		}
		90% {
			opacity: 0.6;
		}
		100% {
			transform: translateY(-100vh) translateX(calc(var(--drift) * 50px)) rotate(360deg);
			opacity: 0;
		}
	}

	/* Rain animation (top to bottom, fast, slight angle) */
	@keyframes rain-fall {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 0.7;
		}
		90% {
			opacity: 0.7;
		}
		100% {
			transform: translateY(100vh) translateX(20px);
			opacity: 0;
		}
	}

	/* Snow animation (top to bottom, slow, zigzag) */
	@keyframes snow-fall {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 0.8;
		}
		25% {
			transform: translateY(25vh) translateX(-10px);
		}
		50% {
			transform: translateY(50vh) translateX(10px);
		}
		75% {
			transform: translateY(75vh) translateX(-5px);
		}
		90% {
			opacity: 0.8;
		}
		100% {
			transform: translateY(100vh) translateX(5px);
			opacity: 0;
		}
	}

	/* Bubbles animation (bottom to top, wobble, scale) */
	@keyframes bubbles-rise {
		0% {
			transform: translateY(0) translateX(0) scale(0.5);
			opacity: 0;
		}
		10% {
			opacity: 0.6;
			transform: translateY(-10vh) translateX(15px) scale(0.7);
		}
		20% {
			transform: translateY(-20vh) translateX(30px) scale(0.85);
		}
		30% {
			transform: translateY(-30vh) translateX(20px) scale(0.95);
		}
		40% {
			transform: translateY(-40vh) translateX(-10px) scale(1);
		}
		50% {
			transform: translateY(-50vh) translateX(-35px) scale(1.05);
		}
		60% {
			transform: translateY(-60vh) translateX(-25px) scale(1.1);
		}
		70% {
			transform: translateY(-70vh) translateX(5px) scale(1);
		}
		80% {
			transform: translateY(-80vh) translateX(30px) scale(0.9);
			opacity: 0.5;
		}
		90% {
			transform: translateY(-90vh) translateX(10px) scale(0.6);
			opacity: 0.3;
		}
		100% {
			transform: translateY(-100vh) translateX(-5px) scale(0.3);
			opacity: 0;
		}
	}

	/* Stars animation (twinkle, scale, rotate) */
	@keyframes stars-twinkle {
		0% {
			transform: scale(0) rotate(0deg);
			opacity: 0;
		}
		10% {
			transform: scale(0.5) rotate(45deg);
			opacity: 0.3;
		}
		20% {
			transform: scale(1) rotate(90deg);
			opacity: 0.8;
		}
		40% {
			transform: scale(1.2) rotate(180deg);
			opacity: 1;
		}
		60% {
			transform: scale(1) rotate(270deg);
			opacity: 0.8;
		}
		80% {
			transform: scale(0.5) rotate(315deg);
			opacity: 0.3;
		}
		100% {
			transform: scale(0) rotate(360deg);
			opacity: 0;
		}
	}

	/* Fireflies animation (glow, float, fade) */
	@keyframes fireflies-glow {
		0% {
			transform: translate(0, 0) scale(0.8);
			opacity: 0;
		}
		5% {
			opacity: 0.4;
		}
		15% {
			transform: translate(10px, -15px) scale(1);
			opacity: 0.9;
		}
		30% {
			transform: translate(-5px, -25px) scale(1.1);
			opacity: 1;
		}
		45% {
			transform: translate(15px, -10px) scale(0.9);
			opacity: 0.7;
		}
		60% {
			transform: translate(-10px, 5px) scale(1);
			opacity: 0.5;
		}
		75% {
			transform: translate(8px, -20px) scale(1.05);
			opacity: 0.8;
		}
		90% {
			transform: translate(-3px, -8px) scale(0.85);
			opacity: 0.3;
		}
		100% {
			transform: translate(0, 0) scale(0.8);
			opacity: 0;
		}
	}

	/* Aurora animation (wave, flow, fade) */
	@keyframes aurora-wave {
		0% {
			transform: translateX(-100%) skewX(-10deg) scaleY(0.8);
			opacity: 0;
		}
		10% {
			opacity: 0.4;
		}
		20% {
			transform: translateX(-50%) skewX(-5deg) scaleY(1);
			opacity: 0.6;
		}
		40% {
			transform: translateX(0%) skewX(0deg) scaleY(1.1);
			opacity: 0.8;
		}
		60% {
			transform: translateX(50%) skewX(5deg) scaleY(1);
			opacity: 0.6;
		}
		80% {
			transform: translateX(100%) skewX(10deg) scaleY(0.9);
			opacity: 0.4;
		}
		100% {
			transform: translateX(150%) skewX(15deg) scaleY(0.8);
			opacity: 0;
		}
	}

	/* Music Notes - Main animation: float up with rhythm */
	@keyframes music-notes-float {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg) scale(0.5);
			opacity: 0;
		}
		10% {
			opacity: 0.8;
			transform: translateY(-10vh) translateX(5px) rotate(5deg) scale(0.8);
		}
		20% {
			transform: translateY(-20vh) translateX(-8px) rotate(-8deg) scale(1);
		}
		30% {
			transform: translateY(-30vh) translateX(10px) rotate(10deg) scale(1.1);
		}
		40% {
			transform: translateY(-40vh) translateX(-5px) rotate(-5deg) scale(1);
		}
		50% {
			transform: translateY(-50vh) translateX(8px) rotate(8deg) scale(0.95);
			opacity: 0.9;
		}
		60% {
			transform: translateY(-60vh) translateX(-10px) rotate(-10deg) scale(1.05);
		}
		70% {
			transform: translateY(-70vh) translateX(6px) rotate(6deg) scale(1);
		}
		80% {
			transform: translateY(-80vh) translateX(-4px) rotate(-4deg) scale(0.9);
			opacity: 0.7;
		}
		90% {
			transform: translateY(-90vh) translateX(3px) rotate(3deg) scale(0.7);
			opacity: 0.4;
		}
		100% {
			transform: translateY(-100vh) translateX(0) rotate(0deg) scale(0.5);
			opacity: 0;
		}
	}

	/* Music Notes - Variation 2: Swing left */
	@keyframes music-notes-swing-left {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg);
			opacity: 0;
		}
		15% {
			opacity: 0.8;
			transform: translateY(-15vh) translateX(-15px) rotate(-15deg);
		}
		30% {
			transform: translateY(-30vh) translateX(-25px) rotate(-20deg);
		}
		50% {
			transform: translateY(-50vh) translateX(-20px) rotate(-15deg);
			opacity: 0.9;
		}
		70% {
			transform: translateY(-70vh) translateX(-10px) rotate(-10deg);
		}
		85% {
			opacity: 0.5;
			transform: translateY(-85vh) translateX(-5px) rotate(-5deg);
		}
		100% {
			transform: translateY(-100vh) translateX(0) rotate(0deg);
			opacity: 0;
		}
	}

	/* Music Notes - Variation 3: Swing right */
	@keyframes music-notes-swing-right {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg);
			opacity: 0;
		}
		15% {
			opacity: 0.8;
			transform: translateY(-15vh) translateX(15px) rotate(15deg);
		}
		30% {
			transform: translateY(-30vh) translateX(25px) rotate(20deg);
		}
		50% {
			transform: translateY(-50vh) translateX(20px) rotate(15deg);
			opacity: 0.9;
		}
		70% {
			transform: translateY(-70vh) translateX(10px) rotate(10deg);
		}
		85% {
			opacity: 0.5;
			transform: translateY(-85vh) translateX(5px) rotate(5deg);
		}
		100% {
			transform: translateY(-100vh) translateX(0) rotate(0deg);
			opacity: 0;
		}
	}

	/* Petals animation (falling, rotating, swaying) */
	@keyframes confetti-fall {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 0.9;
		}
		25% {
			transform: translateY(25vh) translateX(-15px) rotate(120deg) scale(0.95);
		}
		50% {
			transform: translateY(50vh) translateX(10px) rotate(240deg) scale(1.05);
			opacity: 0.8;
		}
		75% {
			transform: translateY(75vh) translateX(-10px) rotate(360deg) scale(0.9);
		}
		90% {
			opacity: 0.6;
		}
		100% {
			transform: translateY(100vh) translateX(8px) rotate(480deg) scale(0.8);
			opacity: 0;
		}
	}

	.particle-floating:nth-child(odd) {
		--drift: 1;
	}

	.particle-floating:nth-child(even) {
		--drift: -1;
	}

	.particle-floating:nth-child(3n) {
		--drift: 0.5;
	}

	.particle-floating:nth-child(4n) {
		--drift: -0.5;
	}

	/* Bubbles variations - create chaotic movement */
	.particle-bubbles:nth-child(2n) {
		animation-direction: reverse;
	}

	.particle-bubbles:nth-child(3n) {
		animation-duration: 0.8em;
		transform: rotate(15deg);
	}

	.particle-bubbles:nth-child(4n) {
		animation-duration: 1.2em;
		transform: rotate(-20deg);
	}

	.particle-bubbles:nth-child(5n) {
		animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
	}

	.particle-bubbles:nth-child(7n) {
		animation-delay: 0.5s;
		transform: rotate(10deg);
	}

	/* Music Notes variations - different movements */
	.particle-sparkles:nth-child(3n+1) {
		animation-name: music-notes-float;
	}

	.particle-sparkles:nth-child(3n+2) {
		animation-name: music-notes-swing-left;
	}

	.particle-sparkles:nth-child(3n) {
		animation-name: music-notes-swing-right;
	}

	.particle-sparkles:nth-child(2n) {
		animation-delay: 0.5s;
	}

	.particle-sparkles:nth-child(4n) {
		animation-delay: 1s;
	}

	.particle-sparkles:nth-child(5n) {
		animation-delay: 1.5s;
		animation-duration: 0.9em;
	}

	.particle-sparkles:nth-child(7n) {
		animation-delay: 2s;
		animation-duration: 1.1em;
	}
</style>
