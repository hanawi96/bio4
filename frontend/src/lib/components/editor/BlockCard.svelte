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
	class="w-full card-ios p-5 text-left group cursor-pointer"
>
	<div class="flex items-start gap-4">
		<!-- Move Up/Down Buttons -->
		<div class="flex flex-col gap-1 mt-1">
			<button
				on:click={handleMoveUp}
				disabled={isFirst}
				class="p-1.5 text-gray-400 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed {isFirst ? '' : 'hover:text-gray-700 hover:bg-gray-100 active:scale-95'}"
				title="Move up"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
				</svg>
			</button>
			<button
				on:click={handleMoveDown}
				disabled={isLast}
				class="p-1.5 text-gray-400 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed {isLast ? '' : 'hover:text-gray-700 hover:bg-gray-100 active:scale-95'}"
				title="Move down"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>

		<!-- Icon -->
		<div class="icon-ios w-12 h-12 flex-shrink-0">
			<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
			</svg>
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Title & Meta -->
			<div class="flex items-center justify-between gap-2 mb-1.5">
				<h3 class="font-semibold text-gray-900 text-base tracking-tight">{group.title || 'Untitled'}</h3>
				<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						on:click={handleDeleteClick}
						class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
						title="Delete group"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Meta Info -->
			<div class="flex items-center gap-2 text-sm text-gray-500">
				<span class="font-medium">{linkCount} {linkCount === 1 ? 'link' : 'links'}</span>
			</div>
		</div>
	</div>
</button>
