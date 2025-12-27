<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedLayout: 'list' | 'carousel' | 'grid' | 'cards' = 'list';

	const dispatch = createEventDispatcher();

	const layouts = [
		{
			id: 'list',
			name: 'Classic',
			icon: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="17" width="16" height="2" rx="1"/></svg>`
		},
		{
			id: 'carousel',
			name: 'Carousel',
			icon: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="5" height="10" rx="1"/><rect x="9.5" y="7" width="5" height="10" rx="1"/><rect x="17" y="7" width="5" height="10" rx="1"/></svg>`
		},
		{
			id: 'grid',
			name: 'Image grid',
			icon: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="5.5" height="5.5" rx="1"/><rect x="10.25" y="3" width="5.5" height="5.5" rx="1"/><rect x="17.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="3" y="10.25" width="5.5" height="5.5" rx="1"/><rect x="10.25" y="10.25" width="5.5" height="5.5" rx="1"/><rect x="17.5" y="10.25" width="5.5" height="5.5" rx="1"/><rect x="3" y="17.5" width="5.5" height="5.5" rx="1"/><rect x="10.25" y="17.5" width="5.5" height="5.5" rx="1"/><rect x="17.5" y="17.5" width="5.5" height="5.5" rx="1"/></svg>`
		},
		{
			id: 'cards',
			name: 'Card',
			icon: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="8" height="14" rx="1"/><rect x="13" y="7" width="8" height="3" rx="0.5"/><rect x="13" y="12" width="8" height="3" rx="0.5"/></svg>`
		}
	];

	function selectLayout(layoutId: typeof selectedLayout) {
		dispatch('select', layoutId);
	}
</script>

<div class="py-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">Layout</h3>
	
	<div class="grid grid-cols-2 gap-4">
		{#each layouts as layout}
			<button
				on:click={() => selectLayout(layout.id)}
				class="relative p-6 rounded-xl border-2 transition-all hover:shadow-md {selectedLayout === layout.id 
					? 'border-gray-900 bg-gray-50' 
					: 'border-gray-200 hover:border-gray-300'}"
			>
				<!-- Icon -->
				<div class="flex items-center justify-center mb-3 text-gray-700">
					{@html layout.icon}
				</div>
				
				<!-- Name -->
				<p class="text-sm font-medium text-gray-900 text-center">{layout.name}</p>
				
				<!-- Selected indicator -->
				{#if selectedLayout === layout.id}
					<div class="absolute top-3 right-3 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
