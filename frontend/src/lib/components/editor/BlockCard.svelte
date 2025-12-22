<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { LinkGroup } from '$lib/types';

	export let group: LinkGroup;
	export let isFirst = false;
	export let isLast = false;

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click', group.id);
	}

	function handleMoveUp(e: MouseEvent) {
		e.stopPropagation();
		if (!isFirst) {
			dispatch('moveUp', group.id);
		}
	}

	function handleMoveDown(e: MouseEvent) {
		e.stopPropagation();
		if (!isLast) {
			dispatch('moveDown', group.id);
		}
	}

	function handleMenuClick(e: MouseEvent) {
		e.stopPropagation();
		// TODO: Show menu
	}

	function handleDeleteClick(e: MouseEvent) {
		e.stopPropagation();
		dispatch('delete', group.id);
	}

	const linkCount = group.links?.length || 0;
</script>

<button
	on:click={handleClick}
	class="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
>
	<div class="flex items-start gap-3">
		<!-- Move Up/Down Buttons -->
		<div class="flex flex-col gap-0.5 mt-1">
			<button
				on:click={handleMoveUp}
				disabled={isFirst}
				class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
				title="Move up"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
				</svg>
			</button>
			<button
				on:click={handleMoveDown}
				disabled={isLast}
				class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
				title="Move down"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>

		<!-- Icon -->
		<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
			<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
			</svg>
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Title & Meta -->
			<div class="flex items-center justify-between gap-2 mb-1">
				<h3 class="font-semibold text-gray-900">{group.title || 'Untitled'}</h3>
				<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						on:click={handleMenuClick}
						class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
						title="More options"
					>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
						</svg>
					</button>
					<button
						on:click={handleDeleteClick}
						class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
						title="Delete group"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Meta Info -->
			<div class="flex items-center gap-2 text-xs text-gray-500">
				<span class="font-medium">{linkCount} {linkCount === 1 ? 'link' : 'links'}</span>
				<span>•</span>
				<span>Last edited 2h ago</span>
			</div>
		</div>
	</div>
</button>
