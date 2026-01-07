<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { tablerIcons, type TablerIcon } from '$lib/data/tablerIcons';

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let selectedIcon: TablerIcon | null = null;

	$: filteredIcons = tablerIcons.filter(icon => {
		const query = searchQuery.toLowerCase();
		return (
			icon.name.toLowerCase().includes(query) ||
			icon.keywords.some(keyword => keyword.includes(query))
		);
	});

	function selectIcon(icon: TablerIcon) {
		selectedIcon = icon;
	}

	function handleConfirm() {
		if (selectedIcon) {
			dispatch('select', { 
				iconId: selectedIcon.id, 
				svg: selectedIcon.svg,
				name: selectedIcon.name
			});
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleBack() {
		dispatch('back');
	}
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" on:click={handleCancel}></div>

<!-- Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col animate-scale-in" on:click|stopPropagation>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
			<div class="flex items-center gap-3">
				<button
					on:click={handleBack}
					class="p-2 hover:bg-gray-100 rounded-lg transition"
					title="Back"
				>
					<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h2 class="text-xl font-semibold text-gray-900">Choose from Tabler Icons</h2>
			</div>
			<button
				on:click={handleCancel}
				class="p-2 hover:bg-gray-100 rounded-lg transition"
				title="Close"
			>
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Search Bar -->
		<div class="px-6 py-4 border-b border-gray-200">
			<div class="relative">
				<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search icons..."
					class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>
		</div>

		<!-- Icon Grid -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if filteredIcons.length > 0}
				<div class="grid grid-cols-6 gap-3">
					{#each filteredIcons as icon}
						<button
							on:click={() => selectIcon(icon)}
							class="aspect-square rounded-xl border-2 transition-all flex items-center justify-center group {selectedIcon?.id === icon.id 
								? 'border-blue-500 bg-blue-50' 
								: 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'}"
							title={icon.name}
						>
							<div class="w-8 h-8 {selectedIcon?.id === icon.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}">
								{@html icon.svg}
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center h-full text-center">
					<div class="text-4xl mb-3">🔍</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-1">No icons found</h3>
					<p class="text-sm text-gray-500">Try a different search term</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
			<div class="flex items-center gap-3">
				{#if selectedIcon}
					<div class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
						<div class="w-5 h-5 text-blue-600">
							{@html selectedIcon.svg}
						</div>
						<span class="text-sm font-medium text-gray-900">{selectedIcon.name}</span>
					</div>
				{:else}
					<span class="text-sm text-gray-500">Select an icon</span>
				{/if}
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
					disabled={!selectedIcon}
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
