<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { LinkGroup } from '$lib/types';

	export let group: LinkGroup;
	export let isFirst = false;
	export let isLast = false;

	const dispatch = createEventDispatcher();
	let showMenu = false;
	let menuButton: HTMLButtonElement;

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

	function handleDeleteClick(e: MouseEvent) {
		e.stopPropagation();
		showMenu = false;
		dispatch('delete', group.id);
	}

	function handleRenameClick(e: MouseEvent) {
		e.stopPropagation();
		showMenu = false;
		dispatch('rename', group.id);
	}

	function handleToggleVisible(e: MouseEvent) {
		e.stopPropagation();
		const currentVisible = group.is_visible ?? 1;
		dispatch('toggleVisible', { groupId: group.id, isVisible: currentVisible === 1 ? 0 : 1 });
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		showMenu = !showMenu;
	}

	// Close menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (!showMenu || !menuButton) return;
		
		const menu = document.getElementById(`menu-${group.id}`);
		const target = event.target as Node;
		
		if (!menuButton.contains(target) && (!menu || !menu.contains(target))) {
			showMenu = false;
		}
	}

	// Manage event listener lifecycle
	$: {
		if (showMenu) {
			window.addEventListener('click', handleClickOutside);
		} else {
			window.removeEventListener('click', handleClickOutside);
		}
	}

	// Cleanup on component destroy
	onDestroy(() => {
		window.removeEventListener('click', handleClickOutside);
	});

	const linkCount = group.links?.length || 0;
	$: isVisible = group.is_visible ?? 1;
</script>

<button
	on:click={handleClick}
	class="w-full card-ios p-4 text-left cursor-pointer"
>
	<div class="flex items-center gap-4">
		<!-- Move Up/Down Buttons -->
		<div class="flex flex-col gap-1">
			<button
				on:click={handleMoveUp}
				disabled={isFirst}
				class="p-1.5 text-gray-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
				title="Move up"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
				</svg>
			</button>
			<button
				on:click={handleMoveDown}
				disabled={isLast}
				class="p-1.5 text-gray-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
				title="Move down"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
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
			<h3 class="font-semibold text-gray-900 text-base tracking-tight">{group.title || 'Untitled'}</h3>
			<div class="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
				<span class="font-medium">{linkCount} {linkCount === 1 ? 'link' : 'links'}</span>
				{#if isVisible === 0}
					<span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Hidden</span>
				{/if}
			</div>
		</div>

		<!-- Toggle Switch -->
		<button
			on:click={handleToggleVisible}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
			class:bg-green-500={isVisible === 1}
			class:bg-gray-300={isVisible === 0}
			title={isVisible === 1 ? 'Hide group' : 'Show group'}
		>
			<span
				class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
				class:translate-x-[22px]={isVisible === 1}
				class:translate-x-0.5={isVisible === 0}
			/>
		</button>

		<!-- Menu (3 dots) -->
		<div class="relative">
			<button
				bind:this={menuButton}
				on:click={toggleMenu}
				class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
				title="More options"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="5" r="2"/>
					<circle cx="12" cy="12" r="2"/>
					<circle cx="12" cy="19" r="2"/>
				</svg>
			</button>

			<!-- Popup Menu -->
			{#if showMenu}
				<div 
					id="menu-{group.id}"
					class="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-in"
					style="transform-origin: top right;"
				>
					<!-- Rename Group -->
					<button
						on:click={handleRenameClick}
						class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
					>
						<div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-semibold text-gray-900">Rename Group</p>
							<p class="text-xs text-gray-500">Change group name</p>
						</div>
					</button>

					<!-- Divider -->
					<div class="h-px bg-gray-200 my-2"></div>

					<!-- Delete -->
					<button
						on:click={handleDeleteClick}
						class="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
					>
						<div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-semibold text-red-600">Delete Group</p>
							<p class="text-xs text-red-500">This action cannot be undone</p>
						</div>
					</button>
				</div>
			{/if}
		</div>
	</div>
</button>

<style>
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

	.animate-scale-in {
		animation: scale-in 0.15s ease-out;
	}
</style>
