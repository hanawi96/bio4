<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		resolveBlur,
		resolveBrightness,
		resolveGrayscale,
		type BlurKey,
		type BrightnessKey,
		type GrayscaleKey
	} from '$lib/appearance/effectsTokens';
	import FilterTabs from '$lib/components/shared/FilterTabs.svelte';
	import BackgroundFilterPanel from '$lib/components/shared/BackgroundFilterPanel.svelte';

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

	function handleFilterSelect(filter: 'blur' | 'brightness' | 'grayscale' | null) {
		activeFilter = filter;
	}

	function handleBlurChange(value: string | number) {
		bgBlur = value as BlurKey;
	}

	function handleBrightnessChange(value: string | number) {
		bgBrightness = value as BrightnessKey;
	}

	function handleGrayscaleChange(value: string | number) {
		bgGrayscale = value as GrayscaleKey;
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
			<FilterTabs {activeFilter} onSelect={handleFilterSelect} />

			<!-- Filter Presets (Expandable) -->
			{#if activeFilter === 'blur'}
				<BackgroundFilterPanel
					filterType="blur"
					currentValue={bgBlur}
					onChange={handleBlurChange}
				/>
			{:else if activeFilter === 'brightness'}
				<BackgroundFilterPanel
					filterType="brightness"
					currentValue={bgBrightness}
					onChange={handleBrightnessChange}
				/>
			{:else if activeFilter === 'grayscale'}
				<BackgroundFilterPanel
					filterType="grayscale"
					currentValue={bgGrayscale}
					onChange={handleGrayscaleChange}
				/>
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
				class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#00aa4f] hover:bg-[#e6f7ed] transition-all"
			>
				<div class="w-16 h-16 rounded-full bg-[#e6f7ed] flex items-center justify-center">
					<svg class="w-8 h-8 text-[#00aa4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					class="px-4 py-2 bg-[#00aa4f] text-white rounded-lg text-sm font-medium hover:bg-[#008f42] transition"
				>
					Choose File
				</div>
			</div>
		</label>
	{/if}
</div>
