<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Link } from '$lib/types';

	export let link: Link;
	export let isFirst = false;
	export let isLast = false;

	const dispatch = createEventDispatcher();

	function handleToggle(e: Event) {
		e.stopPropagation();
		const target = e.currentTarget as HTMLInputElement;
		dispatch('toggle', { linkId: link.id, isActive: target.checked });
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		dispatch('delete', link.id);
	}

	function handleEdit() {
		dispatch('edit', link.id);
	}

	function handleMove(e: MouseEvent, direction: 'up' | 'down') {
		e.stopPropagation();
		dispatch('move', { linkId: link.id, direction });
	}
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
			{#if link.icon_url}
				<img src={link.icon_url} alt="" class="w-8 h-8 rounded-lg object-cover" />
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

		<!-- Toggle -->
		<label 
			on:click={(e) => e.stopPropagation()}
			class="relative inline-flex items-center cursor-pointer flex-shrink-0"
		>
			<input 
				type="checkbox" 
				checked={link.is_active === 1} 
				on:change={handleToggle}
				class="sr-only peer" 
			/>
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
		</label>

		<!-- Delete -->
		<button
			on:click={handleDelete}
			class="p-2 text-gray-400 rounded-xl"
			title="Delete link"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
			</svg>
		</button>
	</div>
</button>
