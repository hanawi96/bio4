<script lang="ts">
	export let count: number = 20;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let color: string = '#ffffff';
	export let speed: 'slow' | 'medium' | 'fast' = 'medium';
	export let variant: 'floating' | 'rain' | 'snow' | 'bubbles' = 'floating';
	
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
	
	// Generate particles with random positions and delays
	$: particles = Array.from({ length: count }, (_, i) => ({
		id: i,
		left: Math.random() * 100,
		delay: Math.random() * 5,
		duration: variant === 'rain' 
			? (speed === 'slow' ? 1.5 + Math.random() * 0.5 : speed === 'medium' ? 1 + Math.random() * 0.3 : 0.5 + Math.random() * 0.2)
			: (speed === 'slow' ? 15 + Math.random() * 10 : speed === 'medium' ? 10 + Math.random() * 5 : 5 + Math.random() * 3)
	}));
	
	// Get size based on variant
	$: particleSize = variant === 'rain' ? rainSizeMap[size] : { width: sizeMap[size], height: sizeMap[size] };
</script>

<div class="particles-container">
	{#each particles as particle (particle.id)}
		<div
			class="particle particle-{variant}"
			style="
				left: {particle.left}%;
				width: {particleSize.width}px;
				height: {particleSize.height}px;
				background-color: {color};
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

	/* Snow flakes */
	.particle-snow {
		top: -20px;
		border-radius: 50%;
		opacity: 0.8;
		animation: snow-fall ease-in-out infinite;
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
		}
		20% {
			transform: translateY(-20vh) translateX(10px) scale(0.8);
		}
		40% {
			transform: translateY(-40vh) translateX(-10px) scale(1);
		}
		60% {
			transform: translateY(-60vh) translateX(15px) scale(1.1);
		}
		80% {
			transform: translateY(-80vh) translateX(-5px) scale(0.9);
			opacity: 0.5;
		}
		100% {
			transform: translateY(-100vh) translateX(0) scale(0.3);
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
</style>
