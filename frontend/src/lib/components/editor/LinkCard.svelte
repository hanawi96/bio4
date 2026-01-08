<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { Link } from '$lib/types';
	import { getIconUrl, getIconClasses } from '$lib/utils/iconUtils';

	export let link: Link;
	export let isFirst = false;
	export let isLast = false;

	const dispatch = createEventDispatcher();
	let showMenu = false;
	let menuButton: HTMLButtonElement;
	let menuPosition = { top: 0, right: 0 };

	// Computed icon URL and classes - Always use black color for management view
	$: iconUrl = getIconUrl(link.icon_type || 'none', link.icon_data || null, '#000000');
	$: iconClasses = getIconClasses(link.icon_type || 'none', 'list-left', 'w-8 h-8 rounded-lg');

	function handleToggle(e: MouseEvent) {
		e.stopPropagation();
		dispatch('toggle', { linkId: link.id, isActive: link.is_active === 1 ? 0 : 1 });
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		showMenu = false;
		dispatch('delete', link.id);
	}

	function handleEdit() {
		dispatch('edit', link.id);
	}

	function handleMove(e: MouseEvent, direction: 'up' | 'down') {
		e.stopPropagation();
		dispatch('move', { linkId: link.id, direction });
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		showMenu = !showMenu;
		
		if (showMenu && menuButton) {
			const rect = menuButton.getBoundingClientRect();
			menuPosition = {
				top: rect.bottom + 8,
				right: window.innerWidth - rect.right
			};
		}
	}

	function handleToggleNewTab(e: MouseEvent) {
		e.stopPropagation();
		const newValue = link.open_in_new_tab === 1 ? 0 : 1;
		dispatch('toggleNewTab', { linkId: link.id, openInNewTab: newValue });
	}

	// Close menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (!showMenu || !menuButton) return;
		
		const menu = document.getElementById(`menu-${link.id}`);
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
</script>

<button 
	on:click={handleEdit}
	class="card-ios p-4 w-full text-left cursor-pointer"
>
	<div class="flex items-center gap-4">
		<!-- Move Buttons -->
		<div class="flex flex-col gap-1">
			<button
				on:click={(e) => handleMove(e, 'up')}
				disabled={isFirst}
				class="p-1.5 text-gray-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
				title="Move up"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
				</svg>
			</button>
			<button
				on:click={(e) => handleMove(e, 'down')}
				disabled={isLast}
				class="p-1.5 text-gray-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed"
				title="Move down"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
				</svg>
			</button>
		</div>

		<!-- Icon/Favicon -->
		<div class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
			{#if iconUrl}
				<img src={iconUrl} alt="" class="{iconClasses}" />
			{:else}
				<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
				</svg>
			{/if}
		</div>

		<!-- Link Info -->
		<div class="flex-1 min-w-0">
			<p class="font-semibold text-gray-900 truncate tracking-tight">{link.title}</p>
			<p class="text-sm text-gray-500 truncate mt-0.5">{link.url}</p>
		</div>

		<!-- Toggle Switch -->
		<button
			on:click={handleToggle}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
			class:bg-green-500={link.is_active === 1}
			class:bg-gray-300={link.is_active === 0}
			title={link.is_active === 1 ? 'Hide link' : 'Show link'}
		>
			<span
				class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
				class:translate-x-[22px]={link.is_active === 1}
				class:translate-x-0.5={link.is_active === 0}
			/>
		</button>

		<!-- Delete -->
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
					id="menu-{link.id}"
					class="fixed w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-in"
					style="top: {menuPosition.top}px; right: {menuPosition.right}px; transform-origin: top right;"
				>
					<!-- Open in New Tab Toggle -->
					<button
						on:click={handleToggleNewTab}
						class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
					>
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
								<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-semibold text-gray-900">Open in New Tab</p>
								<p class="text-xs text-gray-500">Opens link in new window</p>
							</div>
						</div>
						<!-- Toggle Switch -->
						<div
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
							class:bg-green-500={link.open_in_new_tab === 1}
							class:bg-gray-300={link.open_in_new_tab !== 1}
						>
							<span 
								class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm"
								class:translate-x-[22px]={link.open_in_new_tab === 1}
								class:translate-x-0.5={link.open_in_new_tab !== 1}
							/>
						</div>
					</button>

					<!-- Divider -->
					<div class="h-px bg-gray-200 my-2"></div>

					<!-- Delete -->
					<button
						on:click={handleDelete}
						class="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
					>
						<div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
							<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-semibold text-red-600">Delete Link</p>
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
