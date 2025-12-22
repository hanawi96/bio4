<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, groups } from '$lib/stores/page';
	import PhoneMockup from '$lib/components/editor/PhoneMockup.svelte';

	const username = 'demo';
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const data = await api.getEditorData(username);
			loadEditorData(data);
		} catch (e) {
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});
</script>

<div class="flex h-[calc(100vh-64px)] bg-gray-50">
	<!-- Left: Content Area -->
	<div class="flex-1 overflow-y-auto p-8">
		<div class="max-w-3xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-lg font-semibold text-gray-900">Manage Bio Content</h2>
				<p class="text-sm text-gray-500">Add, edit, and organize your links and content blocks</p>
			</div>
			<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Block
			</button>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
		{:else if error}
			<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
		{:else}
			<!-- Links List -->
			<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
				{#each $groups as group, groupIndex}
					{#if group.title}
						<div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
							<span class="text-sm font-medium text-gray-700">{group.title}</span>
						</div>
					{/if}
					{#each group.links as link, linkIndex}
						<div class="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition group">
							<div class="flex items-center gap-4">
								<!-- Drag Handle -->
								<button class="text-gray-300 hover:text-gray-500 cursor-grab">
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
									</svg>
								</button>

								<!-- Link Icon -->
								<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
									{#if link.icon_url}
										<img src={link.icon_url} alt="" class="w-6 h-6" />
									{:else}
										<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
										</svg>
									{/if}
								</div>

								<!-- Link Info -->
								<div class="flex-1 min-w-0">
									<p class="font-medium text-gray-900">{link.title}</p>
									<p class="text-sm text-gray-500 truncate">{link.url}</p>
								</div>

								<!-- Stats -->
								<div class="text-right mr-4">
									<p class="text-sm font-medium text-gray-900">0</p>
									<p class="text-xs text-gray-500">clicks</p>
								</div>

								<!-- Toggle -->
								<label class="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={link.is_active === 1} class="sr-only peer" />
									<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
						</div>
					{/each}
				{:else}
					<div class="p-12 text-center">
						<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
						</div>
						<h3 class="text-lg font-medium text-gray-900 mb-1">No links yet</h3>
						<p class="text-gray-500 mb-4">Add your first link to get started</p>
						<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
							Add Link
						</button>
					</div>
				{/each}
			</div>
		{/if}
		</div>
	</div>

	<!-- Right: Preview (Sticky) -->
	<aside class="w-[440px] bg-white border-l border-gray-200 flex-shrink-0">
		<div class="sticky top-0 h-[calc(100vh-64px)] flex flex-col">
			<!-- Phone Mockup Container -->
			<div class="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
				<PhoneMockup />
			</div>
		</div>
	</aside>
</div>
