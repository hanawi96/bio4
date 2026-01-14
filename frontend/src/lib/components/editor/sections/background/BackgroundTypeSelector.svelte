<script lang="ts">
	import { bgTypes } from '$lib/utils/background/backgroundConstants';
	import { createEventDispatcher } from 'svelte';

	export let selectedType: string;
	export let isAvatarCoverMode: boolean = false;

	const dispatch = createEventDispatcher<{ select: string }>();

	function handleSelect(typeId: string) {
		if (isAvatarCoverMode && typeId !== 'solid') return;
		dispatch('select', typeId);
	}
</script>

<!-- Avatar Cover Mode Warning -->
{#if isAvatarCoverMode}
	<div class="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
		<div class="flex gap-3">
			<div class="flex-shrink-0">
				<svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
				</svg>
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium text-amber-900">Avatar Cover Mode</p>
				<p class="text-xs text-amber-700 mt-0.5">Only solid color backgrounds are available in this header style</p>
			</div>
		</div>
	</div>
{/if}

<!-- Background Type Selector -->
<div class="grid grid-cols-5 gap-2">
	{#each bgTypes as type}
		<button
			on:click={() => handleSelect(type.id)}
			disabled={isAvatarCoverMode && type.id !== 'solid'}
			class="selection-card-ios {isAvatarCoverMode && type.id !== 'solid' ? 'opacity-50 cursor-not-allowed' : ''} {selectedType === type.id ? 'selection-card-ios-active' : 'selection-card-ios-inactive'}"
			title={isAvatarCoverMode && type.id !== 'solid' ? 'Not available in Avatar Cover mode' : ''}
		>
			<!-- Icon -->
			<div class="w-11 h-11 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors {selectedType === type.id ? 'bg-[#00aa4f]' : 'bg-gray-100'}">
				{#if type.id === 'solid'}
					<svg class="w-5 h-5 {selectedType === type.id ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
					</svg>
				{:else if type.id === 'gradient'}
					<svg class="w-5 h-5 {selectedType === type.id ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
					</svg>
				{:else if type.id === 'image'}
					<svg class="w-5 h-5 {selectedType === type.id ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				{:else if type.id === 'video'}
					<svg class="w-5 h-5 {selectedType === type.id ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				{:else}
					<svg class="w-5 h-5 {selectedType === type.id ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
					</svg>
				{/if}
			</div>
			<p class="text-sm font-semibold text-gray-900">{type.name}</p>
			<p class="text-xs text-gray-500 mt-0.5">{type.description}</p>
		</button>
	{/each}
</div>
