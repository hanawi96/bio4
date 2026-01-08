<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { Link } from '$lib/types';
	import { getIconUrl, getIconClasses } from '$lib/utils/iconUtils';

	export let link: Link;
	export let isFirst = false;
	export let isLast = false;

	const dispatch = createEventDispatcher();
	let showMenu = false;
	let showAnimationPanel = false;
	let menuButton: HTMLButtonElement;
	let menuPosition = { top: 0, right: 0 };
	
	type AnimationType = 'none' | 'bounce' | 'jello' | 'wobble' | 'pulse' | 'shake' | 'tada';
	
	// Reactive: sync selectedAnimation with link.animation
	$: selectedAnimation = (link.animation || 'none') as AnimationType;

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

	function toggleAnimationPanel(e: MouseEvent) {
		e.stopPropagation();
		showAnimationPanel = !showAnimationPanel;
	}

	function selectAnimation(e: MouseEvent, animation: AnimationType) {
		e.stopPropagation();
		selectedAnimation = animation;
		dispatch('updateAnimation', { linkId: link.id, animation });
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
			
			<!-- Action Icons Toolbar -->
			<div class="flex items-center gap-2 mt-3">
				<!-- Analytics/Stats -->
				<button
					on:click={(e) => { e.stopPropagation(); /* TODO: Show analytics */ }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="View analytics"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
					</svg>
				</button>

				<!-- Animation -->
				<button
					on:click={toggleAnimationPanel}
					class="p-1.5 rounded-lg transition-colors relative"
					class:bg-purple-100={showAnimationPanel}
					class:text-purple-600={showAnimationPanel}
					class:text-gray-400={!showAnimationPanel}
					class:hover:text-gray-600={!showAnimationPanel}
					class:hover:bg-gray-100={!showAnimationPanel}
					title="Add animation"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
					</svg>
					{#if selectedAnimation !== 'none'}
						<span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-600 rounded-full"></span>
					{/if}
				</button>

				<!-- Thumbnail -->
				<button
					on:click={(e) => { e.stopPropagation(); /* TODO: Upload thumbnail */ }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="Add thumbnail"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
					</svg>
				</button>

				<!-- Highlight/Featured -->
				<button
					on:click={(e) => { e.stopPropagation(); /* TODO: Toggle highlight */ }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="Highlight link"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
					</svg>
				</button>

				<!-- Schedule -->
				<button
					on:click={(e) => { e.stopPropagation(); /* TODO: Schedule link */ }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="Schedule link"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75v3.75m0 0-1.5-1.5m1.5 1.5 1.5-1.5" opacity="0.5" />
					</svg>
				</button>

				<!-- Lock/Private -->
				<button
					on:click={(e) => { e.stopPropagation(); /* TODO: Toggle lock */ }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
					title="Lock link"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
					</svg>
				</button>

				<!-- Clicks Counter -->
				<div class="flex items-center gap-1.5 px-2 py-1 text-gray-500">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
					</svg>
					<span class="text-sm font-medium">0 clicks</span>
				</div>
			</div>
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

	<!-- Animation Panel (Inline) - Outside flex container -->
	{#if showAnimationPanel}
		<div 
			on:click={(e) => e.stopPropagation()}
			class="w-full mt-4 border-t border-gray-200 pt-4 animate-scale-in"
		>
			<!-- Panel Header -->
			<div class="flex items-center justify-between mb-4 px-1">
				<h3 class="text-sm font-semibold text-gray-900">Animate this link</h3>
				<button
					on:click={toggleAnimationPanel}
					class="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<p class="text-xs text-gray-500 mb-4 px-1">Add an animation to your link for emphasis.</p>

			<!-- Animation Options Grid -->
			<div class="grid grid-cols-3 gap-2">
				<!-- NONE -->
				<button 
						on:click={(e) => selectAnimation(e, 'none')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'none'}
						class:bg-purple-50={selectedAnimation === 'none'}
						class:border-gray-200={selectedAnimation !== 'none'}
						class:hover:border-gray-300={selectedAnimation !== 'none'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<svg class="w-8 h-8 text-gray-300" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="4" y1="28" x2="28" y2="4" />
							</svg>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'none'}
							class:text-gray-500={selectedAnimation !== 'none'}
						>NONE</span>
				</button>

				<!-- BOUNCE -->
				<button 
						on:click={(e) => selectAnimation(e, 'bounce')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'bounce'}
						class:bg-purple-50={selectedAnimation === 'bounce'}
						class:border-gray-200={selectedAnimation !== 'bounce'}
						class:hover:border-gray-300={selectedAnimation !== 'bounce'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-bounce-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'bounce'}
							class:text-gray-500={selectedAnimation !== 'bounce'}
						>BOUNCE</span>
				</button>

				<!-- JELLO -->
				<button 
						on:click={(e) => selectAnimation(e, 'jello')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'jello'}
						class:bg-purple-50={selectedAnimation === 'jello'}
						class:border-gray-200={selectedAnimation !== 'jello'}
						class:hover:border-gray-300={selectedAnimation !== 'jello'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-jello-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'jello'}
							class:text-gray-500={selectedAnimation !== 'jello'}
						>JELLO</span>
				</button>

				<!-- WOBBLE -->
				<button 
						on:click={(e) => selectAnimation(e, 'wobble')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'wobble'}
						class:bg-purple-50={selectedAnimation === 'wobble'}
						class:border-gray-200={selectedAnimation !== 'wobble'}
						class:hover:border-gray-300={selectedAnimation !== 'wobble'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-wobble-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'wobble'}
							class:text-gray-500={selectedAnimation !== 'wobble'}
						>WOBBLE</span>
				</button>

				<!-- PULSE -->
				<button 
						on:click={(e) => selectAnimation(e, 'pulse')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'pulse'}
						class:bg-purple-50={selectedAnimation === 'pulse'}
						class:border-gray-200={selectedAnimation !== 'pulse'}
						class:hover:border-gray-300={selectedAnimation !== 'pulse'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-pulse-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'pulse'}
							class:text-gray-500={selectedAnimation !== 'pulse'}
						>PULSE</span>
				</button>

				<!-- SHAKE -->
				<button 
						on:click={(e) => selectAnimation(e, 'shake')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white"
						class:border-purple-500={selectedAnimation === 'shake'}
						class:bg-purple-50={selectedAnimation === 'shake'}
						class:border-gray-200={selectedAnimation !== 'shake'}
						class:hover:border-gray-300={selectedAnimation !== 'shake'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-shake-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'shake'}
							class:text-gray-500={selectedAnimation !== 'shake'}
						>SHAKE</span>
				</button>

				<!-- TADA -->
				<button 
						on:click={(e) => selectAnimation(e, 'tada')}
						class="flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-colors bg-white col-span-1"
						class:border-purple-500={selectedAnimation === 'tada'}
						class:bg-purple-50={selectedAnimation === 'tada'}
						class:border-gray-200={selectedAnimation !== 'tada'}
						class:hover:border-gray-300={selectedAnimation !== 'tada'}
					>
						<div class="w-12 h-12 flex items-center justify-center mb-2">
							<div class="w-10 h-3 bg-gray-400 rounded-full animate-tada-preview"></div>
						</div>
						<span class="text-[10px] font-bold uppercase"
							class:text-purple-600={selectedAnimation === 'tada'}
							class:text-gray-500={selectedAnimation !== 'tada'}
						>TADA</span>
				</button>
			</div>
		</div>
	{/if}
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

	@keyframes bounce-preview {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-bounce-preview {
		animation: bounce-preview 1s ease-in-out infinite;
	}

	@keyframes jello-preview {
		0%, 100% {
			transform: skewX(0deg) skewY(0deg);
		}
		30% {
			transform: skewX(15deg) skewY(3deg);
		}
		40% {
			transform: skewX(-10deg) skewY(-3deg);
		}
		50% {
			transform: skewX(10deg) skewY(2deg);
		}
		65% {
			transform: skewX(-5deg) skewY(-2deg);
		}
		75% {
			transform: skewX(3deg) skewY(1deg);
		}
	}

	.animate-jello-preview {
		animation: jello-preview 1.5s ease-in-out infinite;
	}

	@keyframes wobble-preview {
		0%, 100% {
			transform: translateX(0) rotate(0deg);
		}
		15% {
			transform: translateX(-4px) rotate(-3deg);
		}
		30% {
			transform: translateX(3px) rotate(2deg);
		}
		45% {
			transform: translateX(-3px) rotate(-2deg);
		}
		60% {
			transform: translateX(2px) rotate(1deg);
		}
		75% {
			transform: translateX(-1px) rotate(-1deg);
		}
	}

	.animate-wobble-preview {
		animation: wobble-preview 1.5s ease-in-out infinite;
	}

	@keyframes pulse-preview {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}

	.animate-pulse-preview {
		animation: pulse-preview 1.5s ease-in-out infinite;
	}

	@keyframes shake-preview {
		0%, 100% {
			transform: translateX(0);
		}
		10%, 30%, 50%, 70%, 90% {
			transform: translateX(-3px);
		}
		20%, 40%, 60%, 80% {
			transform: translateX(3px);
		}
	}

	.animate-shake-preview {
		animation: shake-preview 1.5s ease-in-out infinite;
	}

	@keyframes tada-preview {
		0%, 100% {
			transform: scale(1) rotate(0deg);
		}
		10%, 20% {
			transform: scale(0.95) rotate(-2deg);
		}
		30%, 50%, 70%, 90% {
			transform: scale(1.05) rotate(2deg);
		}
		40%, 60%, 80% {
			transform: scale(1.05) rotate(-2deg);
		}
	}

	.animate-tada-preview {
		animation: tada-preview 1.5s ease-in-out infinite;
	}
</style>
