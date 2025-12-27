<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let config: {
		columns: 1 | 2 | 3 | 4;
		aspectRatio: 'square' | 'portrait' | 'landscape';
		showLabels: boolean;
		shadowEnabled?: boolean; // undefined = follow theme, true = force ON, false = force OFF
		borderEnabled?: boolean; // undefined = follow theme, true = force ON, false = force OFF
	} = {
		columns: 2,
		aspectRatio: 'square',
		showLabels: true
	};
	
	export let themeHasShadow: boolean = false; // Does current theme have shadow?
	export let themeHasBorder: boolean = false; // Does current theme have border?

	const dispatch = createEventDispatcher();

	function updateConfig(updates: Partial<typeof config>) {
		config = { ...config, ...updates };
		dispatch('change', config);
	}
</script>

<div class="mt-6 pt-6 border-t border-gray-200">
	<h4 class="text-sm font-semibold text-gray-900 mb-4">Grid Settings</h4>
	
	<div class="space-y-4">
		<!-- Columns -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Columns</label>
			<div class="flex gap-2">
				{#each [1, 2, 3, 4] as cols}
					<button
						on:click={() => updateConfig({ columns: cols })}
						class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.columns === cols
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						{cols}
					</button>
				{/each}
			</div>
		</div>

		<!-- Aspect Ratio -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Aspect Ratio</label>
			<div class="flex gap-2">
				<button
					on:click={() => updateConfig({ aspectRatio: 'square' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.aspectRatio === 'square'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-4 h-4 border-2 border-current rounded"></div>
						<span class="text-xs">Square</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ aspectRatio: 'portrait' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.aspectRatio === 'portrait'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-3 h-4 border-2 border-current rounded"></div>
						<span class="text-xs">Portrait</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ aspectRatio: 'landscape' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.aspectRatio === 'landscape'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-5 h-3 border-2 border-current rounded"></div>
						<span class="text-xs">Landscape</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Show Labels -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Show Labels</label>
			<button
				on:click={() => updateConfig({ showLabels: !config.showLabels })}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {config.showLabels
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {config.showLabels
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>

		<!-- Shadow (3-state: undefined=auto, true=on, false=off) -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Shadow</label>
			<button
				on:click={() => {
					// Smart cycle based on current state and theme
					if (config.shadowEnabled === undefined) {
						// Auto mode: toggle opposite of theme
						// If theme has shadow → turn OFF
						// If theme no shadow → turn ON
						updateConfig({ shadowEnabled: !themeHasShadow });
					} else if (config.shadowEnabled === true) {
						// Force ON → turn OFF
						updateConfig({ shadowEnabled: false });
					} else {
						// Force OFF → turn ON (not back to Auto)
						updateConfig({ shadowEnabled: true });
					}
				}}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {(config.shadowEnabled === undefined && themeHasShadow) || config.shadowEnabled === true
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {(config.shadowEnabled === undefined && themeHasShadow) || config.shadowEnabled === true
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>
		{#if config.shadowEnabled === undefined}
			<p class="text-xs text-gray-500 -mt-2">Following theme style</p>
		{/if}

		<!-- Border (3-state: undefined=auto, true=on, false=off) -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Border</label>
			<button
				on:click={() => {
					// Smart cycle based on current state and theme
					if (config.borderEnabled === undefined) {
						// Auto mode: toggle opposite of theme
						// If theme has border → turn OFF
						// If theme no border → turn ON
						updateConfig({ borderEnabled: !themeHasBorder });
					} else if (config.borderEnabled === true) {
						// Force ON → turn OFF
						updateConfig({ borderEnabled: false });
					} else {
						// Force OFF → turn ON (not back to Auto)
						updateConfig({ borderEnabled: true });
					}
				}}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {(config.borderEnabled === undefined && themeHasBorder) || config.borderEnabled === true
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {(config.borderEnabled === undefined && themeHasBorder) || config.borderEnabled === true
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>
		{#if config.borderEnabled === undefined}
			<p class="text-xs text-gray-500 -mt-2">Following theme style</p>
		{/if}
	</div>
</div>
