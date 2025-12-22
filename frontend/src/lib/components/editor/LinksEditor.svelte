<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LinkCard from './LinkCard.svelte';
	import type { Link } from '$lib/types';

	export let links: Link[] = [];
	export let groupName = 'Links';

	const dispatch = createEventDispatcher();

	let showAddForm = false;
	let linkTitle = '';
	let linkUrl = '';

	function handleBack() {
		dispatch('back');
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
		if (showAddForm) {
			linkTitle = '';
			linkUrl = '';
		}
	}

	function handleAddLink() {
		if (!linkTitle.trim() || !linkUrl.trim()) return;

		const normalizedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
		
		dispatch('addLink', {
			title: linkTitle.trim(),
			url: normalizedUrl
		});

		linkTitle = '';
		linkUrl = '';
		showAddForm = false;
	}

	function handleToggle(event: CustomEvent<any>) {
		dispatch('toggleLink', event.detail);
	}

	function handleDelete(event: CustomEvent<number>) {
		dispatch('deleteLink', event.detail);
	}
</script>

<div class="h-full flex flex-col">
	<!-- Header -->
	<div class="flex-shrink-0 pb-6 border-b border-gray-200">
		<button 
			on:click={handleBack}
			class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="font-medium">Back</span>
		</button>

		<div class="flex items-center gap-3">
			<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
			</div>
			<div>
				<h2 class="text-2xl font-bold text-gray-900">{groupName}</h2>
				<p class="text-sm text-gray-500">Manage your links</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto py-6 space-y-3">
		<!-- Add Link Button/Form -->
		{#if !showAddForm}
			<button
				on:click={toggleAddForm}
				class="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add link
			</button>
		{:else}
			<div class="bg-gray-50 rounded-xl p-4 space-y-3 border-2 border-blue-500">
				<input
					type="text"
					bind:value={linkTitle}
					placeholder="Link title"
					autofocus
					class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
				/>
				<input
					type="text"
					bind:value={linkUrl}
					placeholder="https://example.com"
					class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
				/>
				<div class="flex gap-2">
					<button
						on:click={toggleAddForm}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition"
					>
						Cancel
					</button>
					<button
						on:click={handleAddLink}
						disabled={!linkTitle.trim() || !linkUrl.trim()}
						class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Add
					</button>
				</div>
			</div>
		{/if}

		<!-- Links List -->
		{#if links.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
				</div>
				<p class="text-gray-500">No links yet. Add your first link above.</p>
			</div>
		{:else}
			{#each links as link (link.id)}
				<LinkCard 
					{link}
					on:toggle={handleToggle}
					on:delete={handleDelete}
				/>
			{/each}
		{/if}
	</div>
</div>
