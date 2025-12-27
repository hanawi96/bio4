<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let config: {
		imagePosition: 'left' | 'right' | 'alternate';
		imageSize: 40 | 50 | 60;
		showSubtitle: boolean;
		shadowEnabled?: boolean;
		borderEnabled?: boolean;
	} = {
		imagePosition: 'left',
		imageSize: 50,
		showSubtitle: true
	};
	
	export let themeHasShadow: boolean = false;
	export let themeHasBorder: boolean = false;

	const dispatch = createEventDispatcher();

	function updateConfig(updates: Partial<typeof config>) {
		config = { ...config, ...updates };
		dispatch('change', config);
	}

	function resetToTheme() {
		const { shadowEnabled, borderEnabled, ...rest } = config;
		config = rest;
		dispatch('change', config);
	}

	$: hasOverrides = config.shadowEnabled !== undefined || config.borderEnabled !== undefined;
</script>

<div class="mt-6 pt-6 border-t border-gray-200">
	<div class="flex items-center justify-between mb-4">
		<h4 class="text-sm font-semibold text-gray-900">Card Settings</h4>
		{#if hasOverrides}
			<button
				on:click={resetToTheme}
				class="text-xs text-gray-500 hover:text-gray-900 transition-colors"
				title="Reset style overrides to theme defaults"
			>
				↺ Reset to Theme
			</button>
		{/if}
	</div>
	
	<div class="space-y-4">
		<!-- Image Position -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Image Position</label>
			<div class="flex gap-2">
				<button
					on:click={() => updateConfig({ imagePosition: 'left' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.imagePosition === 'left'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="flex items-center gap-1">
							<div class="w-3 h-3 bg-current rounded"></div>
							<div class="w-2 h-1 bg-current"></div>
						</div>
						<span class="text-xs">Left</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ imagePosition: 'right' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.imagePosition === 'right'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="flex items-center gap-1">
							<div class="w-2 h-1 bg-current"></div>
							<div class="w-3 h-3 bg-current rounded"></div>
						</div>
						<span class="text-xs">Right</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ imagePosition: 'alternate' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.imagePosition === 'alternate'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="flex flex-col gap-0.5">
							<div class="flex items-center gap-1">
								<div class="w-2 h-1.5 bg-current rounded-sm"></div>
								<div class="w-1.5 h-0.5 bg-current"></div>
							</div>
							<div class="flex items-center gap-1">
								<div class="w-1.5 h-0.5 bg-current"></div>
								<div class="w-2 h-1.5 bg-current rounded-sm"></div>
							</div>
						</div>
						<span class="text-xs">Alternate</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Image Size -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Image Size</label>
			<div class="flex gap-2">
				{#each [40, 50, 60] as size}
					<button
						on:click={() => updateConfig({ imageSize: size })}
						class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.imageSize === size
							? 'border-gray-900 bg-gray-50 text-gray-900'
							: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						{size}%
					</button>
				{/each}
			</div>
		</div>

		<!-- Show Subtitle -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Show Subtitle</label>
			<button
				on:click={() => updateConfig({ showSubtitle: !config.showSubtitle })}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {config.showSubtitle
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {config.showSubtitle
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>

		<!-- Shadow -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Shadow</label>
			<button
				on:click={() => {
					if (config.shadowEnabled === undefined) {
						updateConfig({ shadowEnabled: !themeHasShadow });
					} else if (config.shadowEnabled === true) {
						updateConfig({ shadowEnabled: false });
					} else {
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

		<!-- Border -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Border</label>
			<button
				on:click={() => {
					if (config.borderEnabled === undefined) {
						updateConfig({ borderEnabled: !themeHasBorder });
					} else if (config.borderEnabled === true) {
						updateConfig({ borderEnabled: false });
					} else {
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
