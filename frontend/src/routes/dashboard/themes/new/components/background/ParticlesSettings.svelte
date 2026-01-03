<script lang="ts">
	export let particlesEnabled: boolean = false;
	export let particlesCount: number = 20;
	export let particlesSize: 'small' | 'medium' | 'large' = 'medium';
	export let particlesColor: string = '#ffffff';
	export let particlesSpeed: 'slow' | 'medium' | 'fast' = 'medium';
	export let particlesVariant: 'floating' | 'rain' | 'snow' = 'floating';
</script>

<div class="border-t border-gray-200 pt-6 mt-6">
	<div class="flex items-center justify-between mb-4">
		<div>
			<h3 class="text-sm font-semibold text-gray-900">Floating Particles</h3>
			<p class="text-xs text-gray-500 mt-0.5">Add animated particles to your background</p>
		</div>
		<button
			type="button"
			on:click={() => particlesEnabled = !particlesEnabled}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {particlesEnabled ? 'bg-green-600' : 'bg-gray-200'}"
		>
			<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {particlesEnabled ? 'translate-x-6' : 'translate-x-1'}"></span>
		</button>
	</div>
	
	{#if particlesEnabled}
		<div class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
			<!-- Particle Variant -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Effect Type</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => particlesVariant = 'floating'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesVariant === 'floating' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						● Floating
					</button>
					<button
						type="button"
						on:click={() => particlesVariant = 'rain'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesVariant === 'rain' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						🌧️ Rain
					</button>
					<button
						type="button"
						on:click={() => particlesVariant = 'snow'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesVariant === 'snow' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						❄️ Snow
					</button>
				</div>
			</div>
			
			<!-- Particle Count -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Particle Count: {particlesCount}</label>
				<input
					type="range"
					bind:value={particlesCount}
					min="10"
					max="50"
					step="5"
					class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
				/>
				<div class="flex justify-between text-[10px] text-gray-500 mt-1">
					<span>10</span>
					<span>30</span>
					<span>50</span>
				</div>
			</div>

			<!-- Particle Size -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Particle Size</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => particlesSize = 'small'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSize === 'small' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						● Small
					</button>
					<button
						type="button"
						on:click={() => particlesSize = 'medium'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSize === 'medium' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						● Medium
					</button>
					<button
						type="button"
						on:click={() => particlesSize = 'large'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSize === 'large' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						● Large
					</button>
				</div>
			</div>

			<!-- Particle Color -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Particle Color</label>
				<div class="flex items-center gap-2">
					<div class="relative flex-shrink-0">
						<input
							type="color"
							bind:value={particlesColor}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div 
							class="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
							style="background-color: {particlesColor};"
						></div>
					</div>
					<input
						type="text"
						bind:value={particlesColor}
						class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
						placeholder="#ffffff"
					/>
				</div>
			</div>

			<!-- Particle Speed -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-2">Animation Speed</label>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						on:click={() => particlesSpeed = 'slow'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSpeed === 'slow' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						🐢 Slow
					</button>
					<button
						type="button"
						on:click={() => particlesSpeed = 'medium'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSpeed === 'medium' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						⚡ Medium
					</button>
					<button
						type="button"
						on:click={() => particlesSpeed = 'fast'}
						class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {particlesSpeed === 'fast' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
					>
						🚀 Fast
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
