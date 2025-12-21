<script lang="ts">
	import { groups } from '$lib/stores/page';

	let showAddModal = false;
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
		<h2 class="font-semibold text-gray-900">Links</h2>
		<button 
			on:click={() => showAddModal = true}
			class="text-sm text-blue-600 hover:text-blue-700 font-medium"
		>
			+ Add link
		</button>
	</div>
	
	<div class="divide-y divide-gray-100">
		{#each $groups as group}
			{#each group.links as link, index}
				<div class="p-4 flex items-center gap-4 hover:bg-gray-50 transition group">
					<!-- Drag Handle -->
					<button class="text-gray-300 hover:text-gray-500 cursor-grab opacity-0 group-hover:opacity-100 transition">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
						</svg>
					</button>

					<!-- Icon -->
					<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
					</div>

					<!-- Info -->
					<div class="flex-1 min-w-0">
						<p class="font-medium text-gray-900 truncate">{link.title}</p>
						<p class="text-sm text-gray-500 truncate">{link.url}</p>
					</div>

					<!-- Toggle -->
					<label class="relative inline-flex items-center cursor-pointer">
						<input type="checkbox" checked={link.is_active === 1} class="sr-only peer" />
						<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
					</label>

					<!-- Actions -->
					<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
						<button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
						<button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				</div>
			{/each}
		{:else}
			<div class="p-8 text-center">
				<div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
					<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
				</div>
				<p class="text-gray-500 mb-3">No links yet</p>
				<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
					Add your first link
				</button>
			</div>
		{/each}
	</div>
</section>
