<script lang="ts">
	import ParticlesSettings from './background/ParticlesSettings.svelte';
	import VideoEditor from './background/VideoEditor.svelte';
	import ImageEditor from './background/ImageEditor.svelte';
	import GradientEditor from './background/GradientEditor.svelte';
	import PatternEditor from '$lib/components/shared/PatternEditor.svelte';
	import { generatePatternColors } from '$lib/utils/patternColors';
	import { solidColors } from '$lib/utils/background/backgroundConstants';
	import { generateSmartGradient } from '$lib/utils/background/backgroundUtils';
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
	
	// Base color for unified color selection
	let baseColor = bgSolidColor || '#ffffff';
	let previousBgType = bgType;
	let previousMiddleEnabled = bgGradientMiddleEnabled;
	
	// Apply baseColor to current background type
	function applyBaseColor(color: string) {
		baseColor = color;
		
		if (bgType === 'solid') {
			bgSolidColor = color;
		} else if (bgType === 'gradient') {
			const smartGrad = generateSmartGradient(color, bgGradientMiddleEnabled);
			bgGradientFrom = smartGrad.from;
			bgGradientTo = smartGrad.to;
			if (bgGradientMiddleEnabled && smartGrad.middle) {
				bgGradientMiddle = smartGrad.middle;
			}
			bgGradientDirection = smartGrad.direction;
		} else if (bgType === 'pattern') {
			const colors = generatePatternColors(color, selectedPattern);
			patternColor = colors.inkColor;
			patternBgColor = colors.bgColor;
		}
	}
	
	// Auto-apply baseColor when switching background types
	$: if (bgType !== previousBgType) {
		applyBaseColor(baseColor);
		previousBgType = bgType;
	}
	
	// Auto-regenerate gradient when toggling 3-Color mode
	$: if (bgType === 'gradient' && bgGradientMiddleEnabled !== previousMiddleEnabled) {
		applyBaseColor(baseColor);
		previousMiddleEnabled = bgGradientMiddleEnabled;
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
	
	<!-- Base Color Selection -->
	<div class="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-gray-900">Base Color</h3>
				<p class="text-xs text-gray-600 mt-0.5">Choose a color that adapts to all background types</p>
			</div>
			<div class="relative">
				<input 
					type="color" 
					value={baseColor}
					on:input={(e) => applyBaseColor(e.currentTarget.value)}
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>
				<div 
					class="w-12 h-12 rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
					style="background-color: {baseColor};"
				></div>
			</div>
		</div>
		
		<div class="grid grid-cols-8 gap-1.5">
			{#each solidColors as color}
				<button
					type="button"
					on:click={() => applyBaseColor(color.color)}
					class="relative aspect-square rounded-md transition-all hover:scale-105 border-2 {baseColor === color.color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-white hover:border-blue-300'}"
					style="background: {color.color};"
					title={color.name}
				>
					{#if baseColor === color.color}
						<svg class="absolute inset-0 m-auto w-3 h-3 {color.color === '#ffffff' || color.color === '#f3f4f6' ? 'text-gray-900' : 'text-white'}" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
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
			title={isAvatarCover ? 'Not available with Avatar/Video Cover preset' : ''}
		>
			Gradient
		</button>
		<button
			type="button"
			on:click={() => bgType = 'pattern'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'pattern' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar/Video Cover preset' : ''}
		>
			Pattern
		</button>
		<button
			type="button"
			on:click={() => bgType = 'image'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'image' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar/Video Cover preset' : ''}
		>
			Image
		</button>
		<button
			type="button"
			on:click={() => bgType = 'video'}
			disabled={isAvatarCover}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {isAvatarCover ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : bgType === 'video' ? 'bg-[#00aa4f] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
			title={isAvatarCover ? 'Not available with Avatar/Video Cover preset' : ''}
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
