<script lang="ts">
	export let bgGradientType: 'linear' | 'radial';
	export let bgGradientFrom: string;
	export let bgGradientTo: string;
	export let bgGradientMiddle: string;
	export let bgGradientMiddleEnabled: boolean;
	export let bgGradientDirection: string;
	export let bgRadialShape: 'circle';
	export let bgRadialPosition: string;
	export let bgAnimationEnabled: boolean;
	export let bgAnimationVariant: 'flowing' | 'rotating' | 'pulsing';
	export let bgAnimationSpeed: 'slow' | 'medium' | 'fast';

	// Gradient presets
	let GRADIENT_PRESETS = [
		{ name: 'Sunset', from: '#ff6b6b', middle: '#ee5a6f', to: '#c44569' },
		{ name: 'Ocean', from: '#667eea', middle: '#48bb78', to: '#38b2ac' },
		{ name: 'Purple Dream', from: '#6b46c1', middle: '#9f7aea', to: '#ed64a6' },
		{ name: 'Forest', from: '#22543d', middle: '#38a169', to: '#ecc94b' },
		{ name: 'Fire', from: '#c53030', middle: '#dd6b20', to: '#ecc94b' },
		{ name: 'Sky', from: '#2c5282', middle: '#4299e1', to: '#90cdf4' },
		{ name: 'Rose', from: '#702459', middle: '#d53f8c', to: '#fc8181' },
		{ name: 'Mint', from: '#276749', middle: '#48bb78', to: '#9ae6b4' }
	];

	// Direction presets
	const DIRECTION_PRESETS = [
		{ label: '↓', name: 'Top to Bottom', value: '0deg' },
		{ label: '→', name: 'Left to Right', value: '90deg' },
		{ label: '↘', name: 'Diagonal', value: '135deg' },
		{ label: '↑', name: 'Bottom to Top', value: '180deg' },
		{ label: '←', name: 'Right to Left', value: '270deg' }
	];

	// Radial position presets
	const RADIAL_POSITIONS = [
		{ label: '●', name: 'Center', value: 'center' },
		{ label: '↑', name: 'Top', value: 'top' },
		{ label: '↓', name: 'Bottom', value: 'bottom' },
		{ label: '←', name: 'Left', value: 'left' },
		{ label: '→', name: 'Right', value: 'right' },
		{ label: '⬉', name: 'Top Left', value: 'top left' },
		{ label: '⬈', name: 'Top Right', value: 'top right' },
		{ label: '⬊', name: 'Bottom Right', value: 'bottom right' }
	];

	function applyPreset(preset: typeof GRADIENT_PRESETS[0]) {
		bgGradientFrom = preset.from;
		bgGradientMiddle = preset.middle;
		bgGradientTo = preset.to;
	}

	function randomGradient() {
		const randomColor = () =>
			'#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

		bgGradientFrom = randomColor();
		bgGradientTo = randomColor();
		if (bgGradientMiddleEnabled) {
			bgGradientMiddle = randomColor();
		}

		GRADIENT_PRESETS = GRADIENT_PRESETS.map((preset) => ({
			...preset,
			from: randomColor(),
			middle: randomColor(),
			to: randomColor()
		}));
	}

	function reverseColors() {
		const temp = bgGradientFrom;
		bgGradientFrom = bgGradientTo;
		bgGradientTo = temp;
	}
	
	// Get animation class based on direction (for flowing variant only)
	$: flowingAnimationClass = (() => {
		if (bgAnimationVariant !== 'flowing' || bgGradientType !== 'linear') {
			return `gradient-${bgAnimationVariant}`;
		}
		
		const deg = parseInt(bgGradientDirection);
		const flowingVariant = 
			(deg === 90 || deg === 270) ? 'horizontal' :
			(deg === 0 || deg === 180) ? 'vertical' : 'diagonal';
		return `gradient-flowing-${flowingVariant}`;
	})();
</script>

<div class="space-y-4">
	<!-- 3-Color Toggle -->
	<label class="flex items-center gap-2 cursor-pointer">
		<input
			type="checkbox"
			bind:checked={bgGradientMiddleEnabled}
			class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
		/>
		<span class="text-sm font-medium text-gray-700">3-Color Gradient</span>
	</label>

	<!-- Color Pickers -->
	<div
		class="grid gap-4"
		class:grid-cols-2={!bgGradientMiddleEnabled}
		class:grid-cols-3={bgGradientMiddleEnabled}
	>
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">From Color</label>
			<div class="flex items-center gap-2">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={bgGradientFrom}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {bgGradientFrom};"
					></div>
				</div>
				<input
					type="text"
					bind:value={bgGradientFrom}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#667eea"
				/>
			</div>
		</div>

		{#if bgGradientMiddleEnabled}
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Middle Color</label>
				<div class="flex items-center gap-2">
					<div class="relative flex-shrink-0">
						<input
							type="color"
							bind:value={bgGradientMiddle}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div
							class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
							style="background-color: {bgGradientMiddle};"
						></div>
					</div>
					<input
						type="text"
						bind:value={bgGradientMiddle}
						class="flex-1 input-ios font-mono text-sm"
						placeholder="#a855f7"
					/>
				</div>
			</div>
		{/if}

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">To Color</label>
			<div class="flex items-center gap-2">
				<div class="relative flex-shrink-0">
					<input
						type="color"
						bind:value={bgGradientTo}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div
						class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
						style="background-color: {bgGradientTo};"
					></div>
				</div>
				<input
					type="text"
					bind:value={bgGradientTo}
					class="flex-1 input-ios font-mono text-sm"
					placeholder="#764ba2"
				/>
			</div>
		</div>
	</div>

	<!-- Gradient Type Toggle -->
	<div class="grid grid-cols-2 gap-2">
		<button
			type="button"
			on:click={() => (bgGradientType = 'linear')}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgGradientType === 'linear'
				? 'bg-blue-600 text-white shadow-md'
				: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Linear
		</button>
		<button
			type="button"
			on:click={() => (bgGradientType = 'radial')}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgGradientType === 'radial'
				? 'bg-blue-600 text-white shadow-md'
				: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Radial
		</button>
	</div>

	<!-- Linear Direction / Radial Options -->
	{#if bgGradientType === 'linear'}
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Direction</label>
			<div class="grid grid-cols-5 gap-2">
				{#each DIRECTION_PRESETS as preset}
					<button
						type="button"
						on:click={() => (bgGradientDirection = preset.value)}
						class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGradientDirection ===
						preset.value
							? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
							: 'border-gray-200 hover:border-gray-300 bg-white'}"
						title={preset.name}
					>
						<div class="text-2xl mb-1">{preset.label}</div>
						<div
							class="text-[10px] {bgGradientDirection === preset.value
								? 'text-blue-600 font-semibold'
								: 'text-gray-500'}"
						>
							{preset.value}
						</div>
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Radial Position -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
			<div class="grid grid-cols-4 gap-2">
				{#each RADIAL_POSITIONS as preset}
					<button
						type="button"
						on:click={() => (bgRadialPosition = preset.value)}
						class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgRadialPosition ===
						preset.value
							? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
							: 'border-gray-200 hover:border-gray-300 bg-white'}"
						title={preset.name}
					>
						<div class="text-xl">{preset.label}</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="flex gap-2">
		<button
			type="button"
			on:click={randomGradient}
			class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2"
		>
			<span>🎲</span>
			<span>Random</span>
		</button>
		<button
			type="button"
			on:click={reverseColors}
			class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-center gap-2"
		>
			<span>⇄</span>
			<span>Reverse</span>
		</button>
	</div>

	<!-- Gradient Presets -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Gradient Presets</label>
		<div class="grid grid-cols-4 gap-2">
			{#each GRADIENT_PRESETS as preset}
				<button
					type="button"
					on:click={() => applyPreset(preset)}
					class="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:scale-105"
					style="background: linear-gradient(135deg, {preset.from} 0%, {bgGradientMiddleEnabled
						? `${preset.middle} 50%, `
						: ''}{preset.to} 100%); height: 60px;"
				>
					<div
						class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center"
					>
						<span
							class="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
							>{preset.name}</span
						>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Animated Gradient Section -->
	<div class="border-t border-gray-200 pt-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<label class="block text-sm font-medium text-gray-700">Animate Gradient</label>
				<p class="text-xs text-gray-500 mt-0.5">Add smooth animation to your gradient</p>
			</div>
			<button
				type="button"
				on:click={() => (bgAnimationEnabled = !bgAnimationEnabled)}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {bgAnimationEnabled
					? 'bg-green-600'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {bgAnimationEnabled
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>

		{#if bgAnimationEnabled}
			<div class="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
				<!-- Animation Variant -->
				<div>
					<label class="block text-xs font-medium text-gray-600 mb-2">Animation Style</label>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							on:click={() => (bgAnimationVariant = 'rotating')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationVariant ===
							'rotating'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							🔄 Rotating
						</button>
						<button
							type="button"
							on:click={() => (bgAnimationVariant = 'flowing')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationVariant ===
							'flowing'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							→ Flowing
						</button>
						<button
							type="button"
							on:click={() => (bgAnimationVariant = 'pulsing')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationVariant ===
							'pulsing'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							💫 Pulsing
						</button>
					</div>
				</div>

				<!-- Animation Speed -->
				<div>
					<label class="block text-xs font-medium text-gray-600 mb-2">Animation Speed</label>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							on:click={() => (bgAnimationSpeed = 'slow')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationSpeed ===
							'slow'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							🐢 Slow
						</button>
						<button
							type="button"
							on:click={() => (bgAnimationSpeed = 'medium')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationSpeed ===
							'medium'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							⚡ Medium
						</button>
						<button
							type="button"
							on:click={() => (bgAnimationSpeed = 'fast')}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgAnimationSpeed ===
							'fast'
								? 'bg-blue-600 text-white shadow-md'
								: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							🚀 Fast
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Preview -->
	<div class="mt-3">
		<p class="text-xs text-gray-500 mb-2">Preview:</p>
		<div
			class="h-20 rounded-lg border-2 border-gray-200 gradient-preview {bgAnimationEnabled
				? `${flowingAnimationClass} gradient-speed-${bgAnimationSpeed}`
				: ''}"
			style="background: {bgGradientType === 'linear'
				? `linear-gradient(${bgGradientDirection}, ${bgGradientFrom} 0%, ${bgGradientMiddleEnabled ? `${bgGradientMiddle} 50%, ` : ''}${bgGradientTo} 100%)`
				: `radial-gradient(${bgRadialShape} farthest-corner at ${bgRadialPosition}, ${bgGradientFrom} 0%, ${bgGradientMiddleEnabled ? `${bgGradientMiddle} 50%, ` : ''}${bgGradientTo} 100%)`}; {bgAnimationEnabled && bgGradientType === 'linear'
				? 'background-size: 200% 200%;'
				: ''}"
		></div>
	</div>
</div>

<style>
	/* Animated Gradient Keyframes - Multiple directions */
	
	/* Horizontal animations (for 90deg, 270deg) */
	@keyframes gradient-flowing-horizontal {
		0% {
			background-position: -200% 0%;
		}
		100% {
			background-position: 200% 0%;
		}
	}
	
	/* Vertical animations (for 0deg, 180deg) */
	@keyframes gradient-flowing-vertical {
		0% {
			background-position: 0% -200%;
		}
		100% {
			background-position: 0% 200%;
		}
	}
	
	/* Diagonal animations (for 45deg, 135deg, 225deg, 315deg) */
	@keyframes gradient-flowing-diagonal {
		0% {
			background-position: -200% -200%;
		}
		100% {
			background-position: 200% 200%;
		}
	}
	
	/* Rotating animation - works for all directions */
	@keyframes gradient-rotating {
		0% {
			background-position: 0% 0%;
		}
		25% {
			background-position: 100% 0%;
		}
		50% {
			background-position: 100% 100%;
		}
		75% {
			background-position: 0% 100%;
		}
		100% {
			background-position: 0% 0%;
		}
	}

	@keyframes gradient-pulsing {
		0%, 100% {
			filter: brightness(1) saturate(1);
		}
		50% {
			filter: brightness(1.3) saturate(1.5);
		}
	}

	/* Animation Classes */
	.gradient-preview.gradient-rotating {
		animation: gradient-rotating ease infinite;
	}

	.gradient-preview.gradient-flowing {
		animation: gradient-flowing-diagonal linear infinite;
	}

	.gradient-preview.gradient-pulsing {
		animation: gradient-pulsing ease-in-out infinite;
	}

	/* Speed Classes */
	.gradient-preview.gradient-speed-slow {
		animation-duration: 8s;
	}

	.gradient-preview.gradient-speed-medium {
		animation-duration: 4s;
	}

	.gradient-preview.gradient-speed-fast {
		animation-duration: 2s;
	}
</style>
