<script lang="ts">
	import type { GridLayoutConfig, CardLayoutConfig, ListLayoutConfig } from '$lib/types';

	export let selectedLinkGroupLayout: 'list' | 'grid' | 'cards';
	export let gridConfig: GridLayoutConfig = {
		columns: 2,
		aspectRatio: 'square',
		showLabels: true,
		imagePadding: false
	};
	export let cardConfig: CardLayoutConfig = {
		imagePosition: 'left',
		imageSize: 50,
		imageAspect: 'square',
		showSubtitle: true,
		imagePadding: false
	};
	export let listConfig: ListLayoutConfig = {
		iconPosition: 'left',
		textAlign: 'center'
	};

	function updateGridConfig(key: keyof GridLayoutConfig, value: any) {
		gridConfig = { ...gridConfig, [key]: value };
	}

	function updateCardConfig(key: keyof CardLayoutConfig, value: any) {
		cardConfig = { ...cardConfig, [key]: value };
	}

	function updateListConfig(key: keyof ListLayoutConfig, value: any) {
		listConfig = { ...listConfig, [key]: value };
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Link Group Layout</h2>
	<div class="space-y-6">
		<!-- Layout Type Selector - Card Style -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				Default Layout
			</label>
			<div class="grid grid-cols-3 gap-3">
				<!-- List Layout -->
				<button
					type="button"
					on:click={() => selectedLinkGroupLayout = 'list'}
					class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLinkGroupLayout === 'list' 
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
					<p class="text-xs font-semibold {selectedLinkGroupLayout === 'list' ? 'text-blue-700' : 'text-gray-700'}">List</p>
				</button>

				<!-- Grid Layout -->
				<button
					type="button"
					on:click={() => selectedLinkGroupLayout = 'grid'}
					class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLinkGroupLayout === 'grid' 
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
					<p class="text-xs font-semibold {selectedLinkGroupLayout === 'grid' ? 'text-blue-700' : 'text-gray-700'}">Grid</p>
				</button>

				<!-- Card Layout -->
				<button
					type="button"
					on:click={() => selectedLinkGroupLayout = 'cards'}
					class="group relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] {selectedLinkGroupLayout === 'cards' 
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
					<p class="text-xs font-semibold {selectedLinkGroupLayout === 'cards' ? 'text-blue-700' : 'text-gray-700'}">Cards</p>
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-2">Default layout style for link groups</p>
		</div>

		<!-- Grid Config -->
		{#if selectedLinkGroupLayout === 'grid'}
			<div class="pt-4 border-t border-gray-200 space-y-4">
				<h3 class="text-sm font-semibold text-gray-900">Grid Settings</h3>
				
				<!-- Columns -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Columns</label>
					<div class="flex gap-2">
						{#each [1, 2, 3, 4] as cols}
							<button
								type="button"
								on:click={() => updateGridConfig('columns', cols)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {gridConfig.columns === cols
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
						{#each ['square', 'portrait', 'landscape'] as ratio}
							<button
								type="button"
								on:click={() => updateGridConfig('aspectRatio', ratio)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all capitalize {gridConfig.aspectRatio === ratio
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{ratio}
							</button>
						{/each}
					</div>
				</div>

				<!-- Show Labels -->
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium text-gray-700">Show Labels</label>
					<button
						type="button"
						on:click={() => updateGridConfig('showLabels', !gridConfig.showLabels)}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {gridConfig.showLabels
							? 'bg-gray-900'
							: 'bg-gray-200'}"
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {gridConfig.showLabels
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</div>

				<!-- Image Padding -->
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium text-gray-700">Image Padding</label>
					<button
						type="button"
						on:click={() => updateGridConfig('imagePadding', !gridConfig.imagePadding)}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {gridConfig.imagePadding
							? 'bg-gray-900'
							: 'bg-gray-200'}"
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {gridConfig.imagePadding
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</div>
			</div>
		{/if}

		<!-- Card Config -->
		{#if selectedLinkGroupLayout === 'cards'}
			<div class="pt-4 border-t border-gray-200 space-y-4">
				<h3 class="text-sm font-semibold text-gray-900">Card Settings</h3>
				
				<!-- Image Position -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Image Position</label>
					<div class="flex gap-2">
						{#each ['left', 'right', 'alternate'] as pos}
							<button
								type="button"
								on:click={() => updateCardConfig('imagePosition', pos)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all capitalize {cardConfig.imagePosition === pos
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{pos}
							</button>
						{/each}
					</div>
				</div>

				<!-- Image Size -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Image Size</label>
					<div class="flex gap-2">
						{#each [40, 50, 60] as size}
							<button
								type="button"
								on:click={() => updateCardConfig('imageSize', size)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all {cardConfig.imageSize === size
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{size}%
							</button>
						{/each}
					</div>
				</div>

				<!-- Image Aspect -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Image Aspect</label>
					<div class="flex gap-2">
						{#each ['square', 'landscape', 'portrait'] as aspect}
							<button
								type="button"
								on:click={() => updateCardConfig('imageAspect', aspect)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all capitalize {cardConfig.imageAspect === aspect
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{aspect}
							</button>
						{/each}
					</div>
				</div>

				<!-- Show Subtitle -->
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium text-gray-700">Show Subtitle</label>
					<button
						type="button"
						on:click={() => updateCardConfig('showSubtitle', !cardConfig.showSubtitle)}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {cardConfig.showSubtitle
							? 'bg-gray-900'
							: 'bg-gray-200'}"
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {cardConfig.showSubtitle
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</div>

				<!-- Image Padding -->
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium text-gray-700">Image Padding</label>
					<button
						type="button"
						on:click={() => updateCardConfig('imagePadding', !cardConfig.imagePadding)}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {cardConfig.imagePadding
							? 'bg-gray-900'
							: 'bg-gray-200'}"
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {cardConfig.imagePadding
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</div>
			</div>
		{/if}

		<!-- List Config -->
		{#if selectedLinkGroupLayout === 'list'}
			<div class="pt-4 border-t border-gray-200 space-y-4">
				<h3 class="text-sm font-semibold text-gray-900">List Settings</h3>
				
				<!-- Icon Position -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Icon Position</label>
					<div class="flex gap-2">
						{#each ['left', 'top', 'none'] as pos}
							<button
								type="button"
								on:click={() => updateListConfig('iconPosition', pos)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all capitalize {listConfig.iconPosition === pos
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{pos}
							</button>
						{/each}
					</div>
				</div>

				<!-- Text Align -->
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-2">Text Align</label>
					<div class="flex gap-2">
						{#each ['left', 'center', 'right'] as align}
							<button
								type="button"
								on:click={() => updateListConfig('textAlign', align)}
								class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all capitalize {listConfig.textAlign === align
									? 'border-gray-900 bg-gray-50 text-gray-900'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
							>
								{align}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>
