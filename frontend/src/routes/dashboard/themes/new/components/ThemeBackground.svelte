<script lang="ts">
	import ParticlesSettings from './background/ParticlesSettings.svelte';
	import VideoEditor from './background/VideoEditor.svelte';
	import ImageEditor from './background/ImageEditor.svelte';
	import SolidColorEditor from './background/SolidColorEditor.svelte';
	import GradientEditor from './background/GradientEditor.svelte';
	import {
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';

	export let bgType: 'solid' | 'gradient' | 'image' | 'video';
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
	export let particlesVariant: 'floating' | 'rain' | 'snow' | 'bubbles' | 'stars' | 'fireflies' | 'aurora' = 'floating';
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
	
	<!-- Background Type Tabs -->
	<div class="grid grid-cols-4 gap-2 mb-4">
		<button
			type="button"
			on:click={() => bgType = 'solid'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'solid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Solid Color
		</button>
		<button
			type="button"
			on:click={() => bgType = 'gradient'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'gradient' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Gradient
		</button>
		<button
			type="button"
			on:click={() => bgType = 'image'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'image' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Image
		</button>
		<button
			type="button"
			on:click={() => bgType = 'video'}
			class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {bgType === 'video' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
		>
			Video
		</button>
	</div>

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
		<VideoEditor bind:bgVideoUrl {uploading} on:videoUpload on:videoRemove />
	{/if}
	
	<!-- Floating Particles Section -->
	<ParticlesSettings
		bind:particlesEnabled
		bind:particlesCount
		bind:particlesSize
		bind:particlesColor
		bind:particlesSpeed
		bind:particlesVariant
	/>
</section>
