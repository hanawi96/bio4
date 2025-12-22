<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isOpen = false;

	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}

	const blockTypes = [
		{
			id: 'link',
			name: 'Link',
			description: 'Add a clickable link',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`,
			available: true
		},
		{
			id: 'image',
			name: 'Image',
			description: 'Add an image',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
			available: false
		},
		{
			id: 'text',
			name: 'Text',
			description: 'Add a text block',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
			available: false
		},
		{
			id: 'video',
			name: 'Video',
			description: 'Embed a video',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
			available: false
		},
		{
			id: 'divider',
			name: 'Divider',
			description: 'Add a divider line',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>`,
			available: false
		},
		{
			id: 'social',
			name: 'Social Icons',
			description: 'Add social media icons',
			icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
			available: false
		}
	];

	function selectBlock(blockType: typeof blockTypes[0]) {
		if (!blockType.available) return;
		dispatch('select', blockType.id);
		close();
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black/50 z-40 animate-fade-in" on:click={close}></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">Add Block</h2>
					<p class="text-sm text-gray-500 mt-1">Choose a block type to add to your bio</p>
				</div>
				<button on:click={close} class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				<div class="grid grid-cols-2 gap-4">
					{#each blockTypes as blockType}
						<button
							on:click={() => selectBlock(blockType)}
							disabled={!blockType.available}
							class="relative p-6 rounded-xl border-2 transition-all text-left {blockType.available 
								? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer' 
								: 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'}"
						>
							<!-- Icon -->
							<div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 {blockType.available ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}">
								{@html blockType.icon}
							</div>

							<!-- Info -->
							<h3 class="font-semibold text-gray-900 mb-1">{blockType.name}</h3>
							<p class="text-sm text-gray-500">{blockType.description}</p>

							<!-- Coming Soon Badge -->
							{#if !blockType.available}
								<div class="absolute top-4 right-4">
									<span class="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
										Coming Soon
									</span>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
