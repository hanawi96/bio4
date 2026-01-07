<script lang="ts">
	import ParticlesSettings from './background/ParticlesSettings.svelte';
	import VideoEditor from './background/VideoEditor.svelte';
	import ImageEditor from './background/ImageEditor.svelte';
	import SolidColorEditor from './background/SolidColorEditor.svelte';
	import GradientEditor from './background/GradientEditor.svelte';
	import PatternEditor from '$lib/components/shared/PatternEditor.svelte';
	import { generatePatternColors } from '$lib/utils/patternColors';
	import {
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';

	export let bgType: 'solid' | 'gradient' | 'image' | 'video' | 'pattern';
	export let bgSolidColor: string;
	export let bgGradientType: 'linear' | 'radial';
	export let bgGradientFrom: string;
	export let bgGradientTo: string;
	export let bgGradientMiddle: string;
	export let bgGradientMiddleEnabled: boolean;
	export let bgGradientDirection: string;
	export let bgRadialShape: 'circle';
	export let bgRadialPosition: string;
	export let bgImageUrl: string;
	export let bgVideoUrl: string;
	export let uploading: boolean;
	export let bgBlur: BlurKey | number;
	export let bgBrightness: BrightnessKey | number;
	export let bgGrayscale: GrayscaleKey | number;
	export let selectedHeaderPreset: string = 'no-cover';
	
	// Pattern props
	export let selectedPattern: string = 'dots';
	export let patternColor: string = '#e5e7eb';
	export let patternBgColor: string = '#ffffff';
	
	// Animated gradient props
	export let bgAnimationEnabled: boolean = false;
	export let bgAnimationVariant: 'flowing' | 'rotating' | 'pulsing' = 'rotating';
	export let bgAnimationSpeed: 'slow' | 'medium' | 'fast' = 'medium';
	
	// Floating particles props
	export let particlesEnabled: boolean = false;
	export let particlesCount: number = 20;
	export let particlesSize: 'small' | 'medium' | 'large' = 'medium';
	export let particlesColor: string = '#ffffff';
	export let particlesSpeed: 'slow' | 'medium' | 'fast' = 'medium';
	export let particlesVariant: 'floating' | 'rain' | 'snow' | 'bubbles' | 'stars' | 'fireflies' | 'aurora' | 'sparkles' | 'confetti' | 'lightning' = 'floating';
	export let particlesBlur: 'none' | 'light' | 'medium' | 'heavy' = 'medium';
	export let particlesOpacity: number = 60;
	
	// Check if avatar-cover is selected
	$: isAvatarCover = selectedHeaderPreset === 'avatar-cover';
	
	// Track previous bgType to detect when switching to pattern
	let previousBgType = bgType;
	let isInitialLoad = true;
	
	// Auto-generate pattern colors when switching to pattern mode (not on initial load)
	$: if (bgType === 'pattern' && previousBgType !== 'pattern' && !isInitialLoad) {
		// Generate smart colors from current solid color
		const colors = generatePatternColors(bgSolidColor, selectedPattern);
		patternColor = colors.inkColor;
		patternBgColor = colors.bgColor;
		previousBgType = bgType;
	} else if (bgType !== 'pattern') {
		previousBgType = bgType;
		isInitialLoad = false;
	} else if (bgType === 'pattern' && isInitialLoad) {
		// On initial load with pattern, just mark as loaded
		isInitialLoad = false;
		previousBgType = bgType;
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
	
	<!-- Background Type Tabs -->
	<div class="grid grid-cols-5 gap-2 mb-4">
		<button
			type="button"
			on:click={() => bgType = 'solid'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'solid' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Solid Color
		</button>
		<button
			type="button"
			on:click={() => bgType = 'gradient'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'gradient' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar Cover preset' : ''}
		>
			Gradient
		</button>
		<button
			type="button"
			on:click={() => bgType = 'pattern'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'pattern' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar Cover preset' : ''}
		>
			Pattern
		</button>
		<button
			type="button"
			on:click={() => bgType = 'image'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'image' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar Cover preset' : ''}
		>
			Image
		</button>
		<button
			type="button"
			on:click={() => bgType = 'video'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'video' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar Cover preset' : ''}
		>
			Video
		</button>
	</div>
	
	{#if isAvatarCover}
		<div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
			<p class="text-xs text-amber-800 flex items-center gap-2">
				<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
				</svg>
				<span>Avatar Cover preset only supports solid color backgrounds. Your avatar will be used as the cover image.</span>
			</p>
		</div>
	{/if}

	<!-- Solid Color -->
	{#if bgType === 'solid'}
		<SolidColorEditor bind:bgSolidColor />
	{/if}

	<!-- Gradient -->
	{#if bgType === 'gradient'}
		<GradientEditor
			bind:bgGradientType
			bind:bgGradientFrom
			bind:bgGradientTo
			bind:bgGradientMiddle
			bind:bgGradientMiddleEnabled
			bind:bgGradientDirection
			bind:bgRadialShape
			bind:bgRadialPosition
			bind:bgAnimationEnabled
			bind:bgAnimationVariant
			bind:bgAnimationSpeed
		/>
	{/if}

	<!-- Pattern -->
	{#if bgType === 'pattern'}
		<PatternEditor
			bind:selectedPattern
			bind:patternColor
			bind:patternBgColor
		/>
	{/if}

	<!-- Image Upload -->
	{#if bgType === 'image'}
		<ImageEditor
			bind:bgImageUrl
			bind:bgBlur
			bind:bgBrightness
			bind:bgGrayscale
			{uploading}
			on:imageUpload
		/>
	{/if}

	<!-- Video Upload -->
	{#if bgType === 'video'}
		<VideoEditor
			bind:bgVideoUrl
			bind:bgBlur
			bind:bgBrightness
			bind:bgGrayscale
			{uploading}
			on:videoUpload
			on:videoRemove
		/>
	{/if}
	
	<!-- Floating Particles Section -->
	<ParticlesSettings
		bind:particlesEnabled
		bind:particlesCount
		bind:particlesSize
		bind:particlesColor
		bind:particlesSpeed
		bind:particlesVariant
		bind:particlesBlur
		bind:particlesOpacity
	/>
</section>
