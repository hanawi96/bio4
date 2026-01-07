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
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[650px] flex flex-col animate-scale-in" on:click|stopPropagation>
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
					<div class="grid grid-cols-8 gap-3">
						{#each icons as iconId}
							<button
								on:click={() => selectIcon(iconId)}
								class="aspect-square rounded-xl border-2 transition-all flex items-center justify-center group {selectedIcon === iconId 
									? 'border-blue-500 bg-blue-50' 
									: 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'}"
								title={iconId}
							>
								<img 
									src={getIconUrl('iconify', iconId, selectedIcon === iconId ? selectedColor : null)} 
									alt={iconId}
									class="w-7 h-7 {selectedIcon === iconId ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}"
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
				<div class="flex items-center gap-4">
					<span class="text-sm font-medium text-gray-700">Icon Color:</span>
					<div class="flex items-center gap-2">
						<!-- Default (no color) -->
						<button
							on:click={() => selectColor(null)}
							class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all {isColorSelected(null) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'}"
							title="Default"
							style="background: linear-gradient(135deg, #fff 45%, #e5e7eb 45%, #e5e7eb 55%, #fff 55%);"
						>
							{#if isColorSelected(null)}
								<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							{/if}
						</button>
						
						<!-- Preset Colors -->
						{#each ICON_COLOR_PRESETS as preset}
							<button
								on:click={() => selectColor(preset.value)}
								class="w-7 h-7 rounded-full border-2 transition-all {isColorSelected(preset.value) ? 'border-blue-500 ring-2 ring-blue-200 scale-110' : 'border-gray-200 hover:scale-110'}"
								style="background-color: {preset.value};"
								title={preset.name}
							/>
						{/each}
						
						<!-- Custom Color -->
						<div class="relative">
							<button
								on:click={() => showCustomColorPicker = !showCustomColorPicker}
								class="w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center transition-all {showCustomColorPicker ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'}"
								style="background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);"
								title="Custom color"
							/>
							{#if showCustomColorPicker}
								<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
									<input
										type="color"
										value={customColorInput}
										on:input={handleCustomColorChange}
										class="w-8 h-8 cursor-pointer rounded border-0"
									/>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
			<div class="flex items-center gap-3">
				{#if selectedIcon}
					<div class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
						<img 
							src={getIconUrl('iconify', selectedIcon, selectedColor)} 
							alt={selectedIcon}
							class="w-5 h-5"
						/>
						<span class="text-sm font-medium text-gray-900">{selectedIcon}</span>
						{#if selectedColor}
							<div class="w-4 h-4 rounded-full border border-gray-200" style="background-color: {selectedColor};"></div>
						{/if}
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
