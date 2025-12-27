<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedLayout: 'list' | 'carousel' | 'grid' | 'cards' = 'list';

	const dispatch = createEventDispatcher();

	function selectLayout(layoutId: typeof selectedLayout) {
		dispatch('select', layoutId);
	}
</script>

<div class="py-6">
	<h3 class="text-sm font-medium text-gray-900 mb-3">Layout</h3>
	
	<div class="grid grid-cols-4 gap-3 p-1">
		<!-- Classic Layout -->
		<button
			on:click={() => selectLayout('list')}
			class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLayout === 'list' 
				? 'bg-blue-50 ring-2 ring-blue-500' 
				: 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'}"
		>
			<!-- Preview -->
			<div class="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-md p-2.5 flex flex-col gap-1.5 shadow-sm">
				<div class="w-full h-3 bg-gray-300 rounded"></div>
				<div class="w-full h-3 bg-gray-300 rounded"></div>
				<div class="w-full h-3 bg-gray-300 rounded"></div>
				<div class="w-full h-3 bg-gray-300 rounded"></div>
				<div class="w-full h-3 bg-gray-300 rounded"></div>
			</div>
			<p class="text-xs font-semibold {selectedLayout === 'list' ? 'text-blue-700' : 'text-gray-700'}">Classic</p>
		</button>

		<!-- Carousel Layout -->
		<button
			on:click={() => selectLayout('carousel')}
			class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLayout === 'carousel' 
				? 'bg-blue-50 ring-2 ring-blue-500' 
				: 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'}"
		>
			<!-- Preview -->
			<div class="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-md p-2.5 flex gap-1.5 shadow-sm">
				<div class="flex-1 bg-gray-300 rounded"></div>
				<div class="flex-1 bg-gray-300 rounded"></div>
				<div class="flex-1 bg-gray-300 rounded"></div>
			</div>
			<p class="text-xs font-semibold {selectedLayout === 'carousel' ? 'text-blue-700' : 'text-gray-700'}">Carousel</p>
		</button>

		<!-- Grid Layout -->
		<button
			on:click={() => selectLayout('grid')}
			class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLayout === 'grid' 
				? 'bg-blue-50 ring-2 ring-blue-500' 
				: 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'}"
		>
			<!-- Preview -->
			<div class="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-md p-2.5 grid grid-cols-2 gap-1.5 shadow-sm">
				<div class="bg-gray-300 rounded"></div>
				<div class="bg-gray-300 rounded"></div>
				<div class="bg-gray-300 rounded"></div>
				<div class="bg-gray-300 rounded"></div>
			</div>
			<p class="text-xs font-semibold {selectedLayout === 'grid' ? 'text-blue-700' : 'text-gray-700'}">Grid</p>
		</button>

		<!-- Card Layout -->
		<button
			on:click={() => selectLayout('cards')}
			class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLayout === 'cards' 
				? 'bg-blue-50 ring-2 ring-blue-500' 
				: 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'}"
		>
			<!-- Preview -->
			<div class="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-md p-2.5 flex flex-col gap-1.5 shadow-sm">
				<div class="flex gap-1.5 items-center">
					<div class="w-8 h-8 bg-blue-300 rounded"></div>
					<div class="flex-1 flex flex-col gap-1">
						<div class="w-full h-1.5 bg-gray-300 rounded"></div>
						<div class="w-3/4 h-1.5 bg-gray-200 rounded"></div>
					</div>
				</div>
				<div class="flex gap-1.5 items-center">
					<div class="w-8 h-8 bg-blue-300 rounded"></div>
					<div class="flex-1 flex flex-col gap-1">
						<div class="w-full h-1.5 bg-gray-300 rounded"></div>
						<div class="w-3/4 h-1.5 bg-gray-200 rounded"></div>
					</div>
				</div>
				<div class="flex gap-1.5 items-center">
					<div class="w-8 h-8 bg-blue-300 rounded"></div>
					<div class="flex-1 flex flex-col gap-1">
						<div class="w-full h-1.5 bg-gray-300 rounded"></div>
						<div class="w-3/4 h-1.5 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
			<p class="text-xs font-semibold {selectedLayout === 'cards' ? 'text-blue-700' : 'text-gray-700'}">Card</p>
		</button>
	</div>
</div>
