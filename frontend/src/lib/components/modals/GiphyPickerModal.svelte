<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { searchGifs, getTrendingGifs, type GiphyGif } from '$lib/services/giphy';

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let gifs: GiphyGif[] = [];
	let loading = false;
	let selectedGif: GiphyGif | null = null;

	onMount(async () => {
		loading = true;
		gifs = await getTrendingGifs(24);
		loading = false;
	});

	// Debounced search
	let searchTimeout: any;
	$: {
		clearTimeout(searchTimeout);
		if (searchQuery.trim()) {
			searchTimeout = setTimeout(async () => {
				loading = true;
				gifs = await searchGifs(searchQuery, 24);
				loading = false;
			}, 400);
		} else {
			// Show trending when search is empty
			searchTimeout = setTimeout(async () => {
				loading = true;
				gifs = await getTrendingGifs(24);
				loading = false;
			}, 100);
		}
	}

	function selectGif(gif: GiphyGif) {
		selectedGif = gif;
	}

	function handleConfirm() {
		if (selectedGif) {
			dispatch('select', { 
				iconType: 'giphy',
				iconData: selectedGif.id,
				iconColor: null
			});
		}
	}

	function handleBack() {
		dispatch('back');
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
	<!-- Modal -->
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
		<!-- Header -->
		<div class="px-8 pt-8 pb-6 flex items-center justify-between border-b border-gray-200">
			<div class="flex items-center gap-3">
				<button
					on:click={handleBack}
					class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
					title="Back"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h2 class="text-2xl font-bold text-gray-900">Search GIFs</h2>
			</div>
			<button 
				on:click={handleCancel}
				class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
			>
				<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Search -->
		<div class="px-8 py-4 border-b border-gray-200">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search GIFs... (e.g. happy, dance, cat)"
					class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					autofocus
				/>
			</div>
		</div>

		<!-- GIF Grid -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if loading}
				<div class="grid grid-cols-4 gap-3">
					{#each Array(12) as _}
						<div class="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
					{/each}
				</div>
			{:else if gifs.length === 0}
				<div class="text-center py-12">
					<svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-gray-500">No GIFs found</p>
					<p class="text-sm text-gray-400 mt-1">Try a different search term</p>
				</div>
			{:else}
				<div class="grid grid-cols-4 gap-3">
					{#each gifs as gif (gif.id)}
						<button
							on:click={() => selectGif(gif)}
							class="aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
							class:border-blue-500={selectedGif?.id === gif.id}
							class:ring-2={selectedGif?.id === gif.id}
							class:ring-blue-200={selectedGif?.id === gif.id}
							class:border-gray-200={selectedGif?.id !== gif.id}
							title={gif.title}
						>
							<img 
								src={gif.images.fixed_width_small.url} 
								alt={gif.title}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-3xl">
			<div class="flex items-center gap-2 text-xs text-gray-500">
				<span>Powered by</span>
				<svg class="h-4" viewBox="0 0 200 50" fill="currentColor">
					<text x="0" y="35" font-family="Arial, sans-serif" font-size="32" font-weight="bold">GIPHY</text>
				</svg>
			</div>
			<div class="flex gap-3">
				<button
					on:click={handleCancel}
					class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
				>
					Cancel
				</button>
				<button
					on:click={handleConfirm}
					disabled={!selectedGif}
					class="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Select
				</button>
			</div>
		</div>
	</div>
</div>

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
