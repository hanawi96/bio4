<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let bgType: 'solid' | 'gradient' | 'image';
	export let bgSolidColor: string;
	export let bgGradientFrom: string;
	export let bgGradientTo: string;
	export let bgGradientDirection: string;
	export let bgImageUrl: string;
	export let uploading: boolean;
	export let bgBlur: number;
	export let bgDim: number;
	export let bgBrightness: number;
	export let bgGrayscale: number;

	const dispatch = createEventDispatcher();
	
	// Filter UI state
	let activeFilter: 'blur' | 'brightness' | 'grayscale' | null = null;

	function handleImageUpload(event: Event) {
		// Pass the original event directly to parent
		dispatch('imageUpload', { originalEvent: event });
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Background</h2>
	
	<!-- Background Type Tabs -->
	<div class="grid grid-cols-3 gap-2 mb-4">
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
	</div>

	<!-- Solid Color -->
	{#if bgType === 'solid'}
		<div class="space-y-3">
			<label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					bind:value={bgSolidColor}
					class="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
				/>
				<input
					type="text"
					bind:value={bgSolidColor}
					class="flex-1 input-ios font-mono"
					placeholder="#ffffff"
				/>
			</div>
		</div>
	{/if}

	<!-- Gradient -->
	{#if bgType === 'gradient'}
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">From Color</label>
					<div class="flex items-center gap-2">
						<input
							type="color"
							bind:value={bgGradientFrom}
							class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
						/>
						<input
							type="text"
							bind:value={bgGradientFrom}
							class="flex-1 input-ios font-mono text-sm"
							placeholder="#667eea"
						/>
					</div>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">To Color</label>
					<div class="flex items-center gap-2">
						<input
							type="color"
							bind:value={bgGradientTo}
							class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
						/>
						<input
							type="text"
							bind:value={bgGradientTo}
							class="flex-1 input-ios font-mono text-sm"
							placeholder="#764ba2"
						/>
					</div>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Direction</label>
				<select bind:value={bgGradientDirection} class="input-ios">
					<option value="0deg">Top to Bottom (0°)</option>
					<option value="90deg">Left to Right (90°)</option>
					<option value="135deg">Diagonal (135°)</option>
					<option value="180deg">Bottom to Top (180°)</option>
					<option value="270deg">Right to Left (270°)</option>
				</select>
			</div>
			<!-- Preview -->
			<div class="mt-3">
				<p class="text-xs text-gray-500 mb-2">Preview:</p>
				<div
					class="h-20 rounded-lg border-2 border-gray-200"
					style="background: linear-gradient({bgGradientDirection}, {bgGradientFrom} 0%, {bgGradientTo} 100%);"
				></div>
			</div>
		</div>
	{/if}

	<!-- Image Upload -->
	{#if bgType === 'image'}
		<div class="space-y-3">
			{#if bgImageUrl}
				<!-- Preview with uploaded image -->
				<div class="relative group rounded-xl overflow-hidden border-2 border-gray-200">
					<img 
						src={bgImageUrl} 
						alt="Background" 
						class="w-full h-48 object-cover"
						style="filter: blur({bgBlur}px) brightness({bgBrightness / 100}) grayscale({bgGrayscale / 100});"
					/>
					<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
						<label class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
							<input
								type="file"
								accept="image/*"
								on:change={handleImageUpload}
								disabled={uploading}
								class="hidden"
							/>
							<div class="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								Change Image
							</div>
						</label>
					</div>
					{#if uploading}
						<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
							<div class="flex items-center gap-3 text-white">
								<div class="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
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
							on:click={() => activeFilter = activeFilter === 'blur' ? null : 'blur'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'blur' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							<div class="flex items-center justify-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								<span>Blur</span>
							</div>
						</button>
						<button
							type="button"
							on:click={() => activeFilter = activeFilter === 'brightness' ? null : 'brightness'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'brightness' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							<div class="flex items-center justify-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
								<span>Brightness</span>
							</div>
						</button>
						<button
							type="button"
							on:click={() => activeFilter = activeFilter === 'grayscale' ? null : 'grayscale'}
							class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'grayscale' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
						>
							<div class="flex items-center justify-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
								<span>Grayscale</span>
							</div>
						</button>
					</div>

					<!-- Filter Presets (Expandable) -->
					{#if activeFilter === 'blur'}
						<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div class="grid grid-cols-4 gap-2">
								<button
									type="button"
									on:click={() => bgBlur = 0}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 0 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 0 ? 'text-blue-600' : 'text-gray-900'}">None</div>
									<div class="text-[10px] text-gray-500 mt-0.5">0px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 4}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 4 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 4 ? 'text-blue-600' : 'text-gray-900'}">Light</div>
									<div class="text-[10px] text-gray-500 mt-0.5">4px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 8}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 8 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 8 ? 'text-blue-600' : 'text-gray-900'}">Medium</div>
									<div class="text-[10px] text-gray-500 mt-0.5">8px</div>
								</button>
								<button
									type="button"
									on:click={() => bgBlur = 15}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBlur === 15 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBlur === 15 ? 'text-blue-600' : 'text-gray-900'}">Strong</div>
									<div class="text-[10px] text-gray-500 mt-0.5">15px</div>
								</button>
							</div>
						</div>
					{:else if activeFilter === 'brightness'}
						<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div class="grid grid-cols-5 gap-2">
								<button
									type="button"
									on:click={() => bgBrightness = 50}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 50 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 50 ? 'text-blue-600' : 'text-gray-900'}">Dark</div>
									<div class="text-[10px] text-gray-500 mt-0.5">50%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 75}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 75 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 75 ? 'text-blue-600' : 'text-gray-900'}">Dim</div>
									<div class="text-[10px] text-gray-500 mt-0.5">75%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 100}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 100 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 100 ? 'text-blue-600' : 'text-gray-900'}">Normal</div>
									<div class="text-[10px] text-gray-500 mt-0.5">100%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 125}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 125 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 125 ? 'text-blue-600' : 'text-gray-900'}">Bright</div>
									<div class="text-[10px] text-gray-500 mt-0.5">125%</div>
								</button>
								<button
									type="button"
									on:click={() => bgBrightness = 150}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgBrightness === 150 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgBrightness === 150 ? 'text-blue-600' : 'text-gray-900'}">Very Bright</div>
									<div class="text-[10px] text-gray-500 mt-0.5">150%</div>
								</button>
							</div>
						</div>
					{:else if activeFilter === 'grayscale'}
						<div class="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div class="grid grid-cols-4 gap-2">
								<button
									type="button"
									on:click={() => bgGrayscale = 0}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 0 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 0 ? 'text-blue-600' : 'text-gray-900'}">Color</div>
									<div class="text-[10px] text-gray-500 mt-0.5">0%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 50}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 50 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 50 ? 'text-blue-600' : 'text-gray-900'}">Half</div>
									<div class="text-[10px] text-gray-500 mt-0.5">50%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 75}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 75 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 75 ? 'text-blue-600' : 'text-gray-900'}">Mostly</div>
									<div class="text-[10px] text-gray-500 mt-0.5">75%</div>
								</button>
								<button
									type="button"
									on:click={() => bgGrayscale = 100}
									class="p-3 rounded-lg border-2 transition-all hover:scale-105 {bgGrayscale === 100 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<div class="text-xs font-semibold {bgGrayscale === 100 ? 'text-blue-600' : 'text-gray-900'}">B&W</div>
									<div class="text-[10px] text-gray-500 mt-0.5">100%</div>
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
					<div class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
						<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
							<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="text-center">
							<p class="text-sm font-medium text-gray-900">Upload Background Image</p>
							<p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</p>
						</div>
						<div class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
							Choose File
						</div>
					</div>
				</label>
			{/if}
		</div>
	{/if}
</section>
