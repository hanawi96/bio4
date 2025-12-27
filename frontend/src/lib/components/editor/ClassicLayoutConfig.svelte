<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let config: {
		iconShape: 'square' | 'rounded' | 'circle';
	} = {
		iconShape: 'rounded'
	};

	const dispatch = createEventDispatcher();

	function updateConfig(updates: Partial<typeof config>) {
		config = { ...config, ...updates };
		dispatch('change', config);
	}
</script>

<div class="mt-6 pt-6 border-t border-gray-200">
	<h4 class="text-sm font-semibold text-gray-900 mb-4">Classic Settings</h4>
	
	<div class="space-y-4">
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
	</div>
</div>
