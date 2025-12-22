<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Link } from '$lib/types';

	export let link: Link;

	const dispatch = createEventDispatcher();

	function handleToggle(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		dispatch('toggle', { linkId: link.id, isActive: target.checked });
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		dispatch('delete', link.id);
	}
</script>

<div class="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition group">
	<div class="flex items-center gap-3">
		<!-- Drag Handle -->
		<button class="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
			</svg>
		</button>

		<!-- Icon/Favicon -->
		<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
			{#if link.icon_url}
				<img src={link.icon_url} alt="" class="w-6 h-6 rounded" />
			{:else}
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
				</svg>
			{/if}
		</div>

		<!-- Link Info -->
		<div class="flex-1 min-w-0">
			<p class="font-medium text-gray-900 truncate">{link.title}</p>
			<p class="text-sm text-gray-500 truncate">{link.url}</p>
		</div>

		<!-- Toggle -->
		<label class="relative inline-flex items-center cursor-pointer">
			<input 
				type="checkbox" 
				checked={link.is_active === 1} 
				on:change={handleToggle}
				class="sr-only peer" 
			/>
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
		</label>

		<!-- Delete -->
		<button
			on:click={handleDelete}
			class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
			title="Delete link"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
			</svg>
		</button>
	</div>
</div>
