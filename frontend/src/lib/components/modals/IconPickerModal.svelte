<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { searchIconifyIcons, getIconUrl, ICON_COLOR_PRESETS } from '$lib/utils/iconUtils';

	const dispatch = createEventDispatcher();

	export let initialColor: string | null = null;

	// Popular social media icons
	const popularIcons = [
		'fa6-brands:facebook',
		'fa6-brands:instagram',
		'fa6-brands:twitter',
		'fa6-brands:youtube',
		'fa6-brands:tiktok',
		'fa6-brands:linkedin',
		'fa6-brands:github',
		'fa6-brands:discord',
		'fa6-brands:telegram',
		'fa6-brands:whatsapp',
		'fa6-brands:snapchat',
		'fa6-brands:pinterest',
		'fa6-brands:reddit',
		'fa6-brands:twitch',
		'fa6-brands:spotify',
		'fa6-brands:apple',
		'fa6-brands:google',
		'mdi:web',
		'mdi:email',
		'mdi:phone'
	];

	let searchQuery = '';
	let icons: string[] = [];
	let loading = false;
	let selectedIcon: string | null = null;
	let selectedColor: string | null = null;
	let showCustomColorPicker = false;
	let customColorInput = '#000000';

	// Show popular icons on mount
	onMount(() => {
		icons = popularIcons;
		selectedColor = initialColor;
		if (initialColor && !ICON_COLOR_PRESETS.find(p => p.value === initialColor)) {
			customColorInput = initialColor;
		}
	});

	// Debounced search
	let searchTimeout: any;
	$: {
		clearTimeout(searchTimeout);
		if (searchQuery.trim()) {
			searchTimeout = setTimeout(() => {
				handleSearch();
			}, 300);
		} else {
			icons = popularIcons;
		}
	}

	async function handleSearch() {
		loading = true;
		icons = await searchIconifyIcons(searchQuery);
		loading = false;
	}

	function selectIcon(iconId: string) {
		selectedIcon = iconId;
		// Set default color to black if no color selected yet
		if (selectedColor === null) {
			selectedColor = '#000000';
		}
	}

	function selectColor(color: string | null) {
		selectedColor = color;
		showCustomColorPicker = false;
	}

	function handleCustomColorChange(e: Event) {
		const input = e.target as HTMLInputElement;
		customColorInput = input.value;
		selectedColor = input.value;
	}

	function handleConfirm() {
		if (selectedIcon) {
			dispatch('select', { 
				iconType: 'iconify',
				iconData: selectedIcon,
				iconColor: selectedColor
			});
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleBack() {
		dispatch('back');
	}

	// Check if color is selected (for highlighting)
	function isColorSelected(color: string | null): boolean {
		if (color === null) return selectedColor === null;
		return selectedColor === color;
	}
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" on:click={handleCancel}></div>

<!-- Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[650px] flex flex-col animate-scale-in" on:click|stopPropagation>
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
				<h2 class="text-xl font-semibold text-gray-900">Choose Icon</h2>
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
					placeholder="Search icons... (e.g. github, home, user)"
					class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					autofocus
				/>
			</div>
		</div>

		<!-- Icon Grid -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if loading}
				<div class="flex items-center justify-center h-full">
					<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				</div>
			{:else if icons.length > 0}
				<div class="space-y-4">
					{#if !searchQuery}
						<div class="text-sm font-medium text-gray-600 mb-3">Popular Social Icons</div>
					{/if}
					<div class="grid grid-cols-6 gap-3">
						{#each icons as iconId (iconId)}
							{@const isSelected = selectedIcon === iconId}
							<button
								on:click={() => selectIcon(iconId)}
								class="aspect-square rounded-xl border-2 transition-all flex items-center justify-center group {isSelected 
									? 'border-blue-500 bg-blue-50' 
									: 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'}"
								title={iconId}
							>
								<!-- Always use base icon (no color) for grid - cached by browser -->
								<img 
									src={getIconUrl('iconify', iconId, null)} 
									alt={iconId}
									class="w-7 h-7 {isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}"
									loading="lazy"
								/>
							</button>
						{/each}
					</div>
				</div>
			{:else if searchQuery}
				<div class="flex flex-col items-center justify-center h-full text-center">
					<div class="text-4xl mb-3">🔍</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-1">No icons found</h3>
					<p class="text-sm text-gray-500">Try a different search term</p>
				</div>
			{/if}
		</div>

		<!-- Color Picker Section -->
		{#if selectedIcon}
			<div class="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
				<div class="flex items-center gap-6">
					<!-- Large preview of selected icon with color -->
					<div class="w-14 h-14 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
						<img 
							src={getIconUrl('iconify', selectedIcon, selectedColor)} 
							alt={selectedIcon}
							class="w-10 h-10"
						/>
					</div>
					
					<div class="flex-1">
						<span class="text-sm font-medium text-gray-700 block mb-2">Icon Color:</span>
						<div class="flex items-center gap-2">
							<!-- Custom Color Picker -->
							<button
								type="button"
								on:click={() => document.getElementById('icon-modal-custom-color')?.click()}
								class="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:scale-110 transition-all bg-white flex items-center justify-center"
								title="Add custom color"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
								</svg>
								<input
									id="icon-modal-custom-color"
									type="color"
									value={customColorInput}
									on:input={handleCustomColorChange}
									class="absolute opacity-0 w-0 h-0 pointer-events-none"
								/>
							</button>

							<!-- Preset Colors -->
							{#each ICON_COLOR_PRESETS as preset (preset.value)}
								<button
									on:click={() => selectColor(preset.value)}
									class="w-7 h-7 rounded-full border-2 transition-all {isColorSelected(preset.value) ? 'border-blue-500 ring-2 ring-blue-200 scale-110' : 'border-gray-200 hover:scale-110'}"
									style="background-color: {preset.value};"
									title={preset.name}
								/>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
			<div class="flex items-center gap-3">
				{#if selectedIcon}
					<span class="text-sm text-gray-600">{selectedIcon}</span>
					{#if selectedColor}
						<div class="w-4 h-4 rounded-full border border-gray-300" style="background-color: {selectedColor};"></div>
					{/if}
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
