<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let config: {
		iconShape: 'square' | 'rounded' | 'circle';
		iconPosition: 'left' | 'top' | 'none';
		textAlign: 'left' | 'center' | 'right';
		shadowEnabled: boolean;
		borderEnabled: boolean;
	} = {
		iconShape: 'rounded',
		iconPosition: 'left',
		textAlign: 'center',
		shadowEnabled: true,
		borderEnabled: true
	};

	const dispatch = createEventDispatcher();

	function updateConfig(updates: Partial<typeof config>) {
		config = { ...config, ...updates };
		
		// Auto-adjust textAlign when iconPosition changes
		if (updates.iconPosition === 'top') {
			config.textAlign = 'center';
		}
		
		dispatch('change', config);
	}
</script>

<div class="mt-6 pt-6 border-t border-gray-200">
	<h4 class="text-sm font-semibold text-gray-900 mb-4">Classic Settings</h4>
	
	<div class="space-y-4">
		<!-- Icon Position -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Icon Position</label>
			<div class="flex gap-2">
				<button
					on:click={() => updateConfig({ iconPosition: 'left' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconPosition === 'left'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="flex items-center gap-1">
							<div class="w-2 h-2 bg-current rounded-sm"></div>
							<div class="w-3 h-1 bg-current"></div>
						</div>
						<span class="text-xs">Left</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ iconPosition: 'top' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconPosition === 'top'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="flex flex-col items-center gap-0.5">
							<div class="w-2 h-2 bg-current rounded-sm"></div>
							<div class="w-3 h-1 bg-current"></div>
						</div>
						<span class="text-xs">Top</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ iconPosition: 'none' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconPosition === 'none'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-4 h-1 bg-current"></div>
						<span class="text-xs">None</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Icon Shape -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Icon Shape</label>
			<div class="flex gap-2">
				<button
					on:click={() => updateConfig({ iconShape: 'square' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconShape === 'square'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-4 h-4 border-2 border-current"></div>
						<span class="text-xs">Square</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ iconShape: 'rounded' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconShape === 'rounded'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-4 h-4 border-2 border-current rounded"></div>
						<span class="text-xs">Rounded</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ iconShape: 'circle' })}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.iconShape === 'circle'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
				>
					<div class="flex flex-col items-center gap-1">
						<div class="w-4 h-4 border-2 border-current rounded-full"></div>
						<span class="text-xs">Circle</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Text Align -->
		<div>
			<label class="block text-xs font-medium text-gray-700 mb-2">Text Align</label>
			<div class="flex gap-2">
				<button
					on:click={() => updateConfig({ textAlign: 'left' })}
					disabled={config.iconPosition === 'top'}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.textAlign === 'left'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'} {config.iconPosition === 'top' ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					<div class="flex flex-col items-center gap-1">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z"/>
						</svg>
						<span class="text-xs">Left</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ textAlign: 'center' })}
					disabled={config.iconPosition === 'top'}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.textAlign === 'center'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'} {config.iconPosition === 'top' ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					<div class="flex flex-col items-center gap-1">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M3 6h18v2H3V6zm3 5h12v2H6v-2zm-3 5h18v2H3v-2z"/>
						</svg>
						<span class="text-xs">Center</span>
					</div>
				</button>
				<button
					on:click={() => updateConfig({ textAlign: 'right' })}
					disabled={config.iconPosition === 'top'}
					class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {config.textAlign === 'right'
						? 'border-gray-900 bg-gray-50 text-gray-900'
						: 'border-gray-200 text-gray-600 hover:border-gray-300'} {config.iconPosition === 'top' ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					<div class="flex flex-col items-center gap-1">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M3 6h18v2H3V6zm6 5h12v2H9v-2zm-6 5h18v2H3v-2z"/>
						</svg>
						<span class="text-xs">Right</span>
					</div>
				</button>
			</div>
			{#if config.iconPosition === 'top'}
				<p class="text-xs text-gray-500 mt-1">Text align is locked to center when icon is on top</p>
			{/if}
		</div>

		<!-- Shadow -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Shadow</label>
			<button
				on:click={() => updateConfig({ shadowEnabled: !config.shadowEnabled })}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {config.shadowEnabled
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {config.shadowEnabled
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>

		<!-- Border -->
		<div class="flex items-center justify-between">
			<label class="text-xs font-medium text-gray-700">Border</label>
			<button
				on:click={() => updateConfig({ borderEnabled: !config.borderEnabled })}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {config.borderEnabled
					? 'bg-gray-900'
					: 'bg-gray-200'}"
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {config.borderEnabled
						? 'translate-x-6'
						: 'translate-x-1'}"
				></span>
			</button>
		</div>
	</div>
</div>
