<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		BLUR_PRESETS,
		BRIGHTNESS_PRESETS,
		GRAYSCALE_PRESETS,
		resolveBlur,
		resolveBrightness,
		resolveGrayscale,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';

	export let bgImageUrl: string;
	export let uploading: boolean;
	export let bgBlur: BlurKey | number;
	export let bgBrightness: BrightnessKey | number;
	export let bgGrayscale: GrayscaleKey | number;

	const dispatch = createEventDispatcher();

	// Filter UI state
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;

	// Resolve filter values to numbers
	$: resolvedBlur = resolveBlur(bgBlur);
	$: resolvedBrightness = resolveBrightness(bgBrightness);
	$: resolvedGrayscale = resolveGrayscale(bgGrayscale);

	function handleImageUpload(event: Event) {
		dispatch('imageUpload', { originalEvent: event });
	}
</script>

<div class="space-y-3">
	{#if bgImageUrl}
		<!-- Preview with uploaded image -->
		<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
			<img
				src={bgImageUrl}
				alt="Background"
				class="w-full h-48 object-cover"
				style="filter: blur({resolvedBlur}px) brightness({resolvedBrightness /
					100}) grayscale({resolvedGrayscale / 100});"
			/>
			<div
				class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center"
			>
				<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
					<input
						type="file"
						accept="image/*"
						on:change={handleImageUpload}
						disabled={uploading}
						class="hidden"
					/>
					<div
						class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						Change Image
					</div>
				</label>
			</div>
			{#if uploading}
				<div
					class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
				>
					<div class="flex items-center gap-3 text-white">
						<div
							class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"
						></div>
						<span class="font-medium">Uploading...</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Image Filters -->
		<div class="p-4 bg-gray-50 rounded-xl space-y-3">
			<h4 class="text-sm font-semibold text-gray-900 mb-3">Image Filters</h4>

			<!-- Filter Tabs -->
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'blur' ? null : 'blur')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter ===
					'blur'
						? 'bg-blue-600 text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
						<span>Blur</span>
					</div>
				</button>
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'brightness' ? null : 'brightness')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter ===
					'brightness'
						? 'bg-blue-600 text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						<span>Brightness</span>
					</div>
				</button>
				<button
					type="button"
					on:click={() => (activeFilter = activeFilter === 'grayscale' ? null : 'grayscale')}
					class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter ===
					'grayscale'
						? 'bg-blue-600 text-white shadow-md'
						: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
							/>
						</svg>
						<span>Grayscale</span>
					</div>
				</button>
			</div>

			<!-- Filter Presets (Expandable) -->
			{#if activeFilter === 'blur'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button
							type="button"
							on:click={() => (bgBlur = 'none')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'none' ||
							bgBlur === 0
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBlur === 'none' || bgBlur === 0
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								None
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.none}px</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBlur = 'subtle')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'subtle'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBlur === 'subtle'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Subtle
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.subtle}px</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBlur = 'medium')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'medium'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBlur === 'medium'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Medium
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.medium}px</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBlur = 'strong')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'strong'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBlur === 'strong'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Strong
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.strong}px</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBlur = 'extreme')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 'extreme'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBlur === 'extreme'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Extreme
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BLUR_PRESETS.extreme}px</div>
						</button>
					</div>
				</div>
			{:else if activeFilter === 'brightness'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button
							type="button"
							on:click={() => (bgBrightness = 'darkest')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness ===
							'darkest'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBrightness === 'darkest'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Darkest
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{BRIGHTNESS_PRESETS.darkest}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBrightness = 'dark')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness ===
							'dark'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBrightness === 'dark'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Dark
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{BRIGHTNESS_PRESETS.dark}%</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBrightness = 'normal')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness ===
								'normal' || bgBrightness === 100
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBrightness === 'normal' || bgBrightness === 100
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Normal
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{BRIGHTNESS_PRESETS.normal}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBrightness = 'bright')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness ===
							'bright'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBrightness === 'bright'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Bright
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{BRIGHTNESS_PRESETS.bright}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgBrightness = 'brightest')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness ===
							'brightest'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgBrightness === 'brightest'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Brightest
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{BRIGHTNESS_PRESETS.brightest}%
							</div>
						</button>
					</div>
				</div>
			{:else if activeFilter === 'grayscale'}
				<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
					<div class="grid grid-cols-5 gap-2">
						<button
							type="button"
							on:click={() => (bgGrayscale = 'none')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale ===
								'none' || bgGrayscale === 0
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgGrayscale === 'none' || bgGrayscale === 0
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								None
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.none}%</div>
						</button>
						<button
							type="button"
							on:click={() => (bgGrayscale = 'subtle')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale ===
							'subtle'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgGrayscale === 'subtle'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Subtle
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{GRAYSCALE_PRESETS.subtle}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgGrayscale = 'medium')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale ===
							'medium'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgGrayscale === 'medium'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Medium
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{GRAYSCALE_PRESETS.medium}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgGrayscale = 'strong')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale ===
							'strong'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgGrayscale === 'strong'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Strong
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">
								{GRAYSCALE_PRESETS.strong}%
							</div>
						</button>
						<button
							type="button"
							on:click={() => (bgGrayscale = 'full')}
							class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale ===
							'full'
								? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<div
								class="text-xs font-semibold {bgGrayscale === 'full'
									? 'text-blue-600'
									: 'text-gray-900'}"
							>
								Full
							</div>
							<div class="text-[10px] text-gray-500 mt-0.5">{GRAYSCALE_PRESETS.full}%</div>
						</button>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Upload button -->
		<label class="block cursor-pointer">
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				on:change={handleImageUpload}
				disabled={uploading}
				class="hidden"
			/>
			<div
				class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
			>
				<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div class="text-center">
					<p class="text-sm font-medium text-gray-900">Upload Background Image</p>
					<p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</p>
				</div>
				<div
					class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
				>
					Choose File
				</div>
			</div>
		</label>
	{/if}
</div>
