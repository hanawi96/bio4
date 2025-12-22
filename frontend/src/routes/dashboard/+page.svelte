<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, page as pageStore, groups } from '$lib/stores/page';

	export let params = {};
	const username = 'demo';
	let loading = true;
	let error = '';
	let stats = { views: 0, clicks: 0, links: 0 };

	onMount(async () => {
		try {
			const data = await api.getEditorData(username);
			loadEditorData(data);
			stats.links = data.groups.reduce((acc, g) => acc + g.links.length, 0);
		} catch (e) {
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});
</script>

<div class="p-8">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{stats.views}</p>
						<p class="text-sm text-gray-500">Total Views</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{stats.clicks}</p>
						<p class="text-sm text-gray-500">Link Clicks</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{stats.links}</p>
						<p class="text-sm text-gray-500">Active Links</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">0%</p>
						<p class="text-sm text-gray-500">CTR</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Page Preview Card -->
			<div class="lg:col-span-2">
				<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<div class="p-6 border-b border-gray-100 flex items-center justify-between">
						<h2 class="font-semibold text-gray-900">Your Bio Page</h2>
						<span class="px-3 py-1 text-xs font-medium rounded-full {$pageStore?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
							{$pageStore?.status || 'draft'}
						</span>
					</div>
					<div class="p-6">
						<div class="flex items-start gap-6">
							{#if $pageStore?.avatar_url}
								<img src={$pageStore.avatar_url} alt="" class="w-20 h-20 rounded-full object-cover" />
							{:else}
								<div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
									<span class="text-3xl text-white">👤</span>
								</div>
							{/if}
							<div class="flex-1">
								<h3 class="text-xl font-semibold text-gray-900">{$pageStore?.title || 'Your Name'}</h3>
								<p class="text-gray-500 mt-1">{$pageStore?.bio || 'Add a bio to tell people about yourself'}</p>
								<div class="flex items-center gap-2 mt-3">
									<span class="text-sm text-blue-600">biolink.com/{$pageStore?.username}</span>
									<button class="text-gray-400 hover:text-gray-600">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class="mt-6 flex gap-3">
							<a href="/dashboard/appearance" class="flex-1 px-4 py-2.5 bg-blue-600 text-white text-center text-sm font-medium rounded-lg hover:bg-blue-700 transition">
								Edit Page
							</a>
							<a href="/{$pageStore?.username}" target="_blank" class="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition">
								Preview
							</a>
							<button class="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition">
								Share
							</button>
						</div>
					</div>
				</div>

				<!-- Links Section -->
				<div class="bg-white rounded-xl border border-gray-200 mt-6">
					<div class="p-6 border-b border-gray-100 flex items-center justify-between">
						<h2 class="font-semibold text-gray-900">Recent Links</h2>
						<a href="/dashboard/links" class="text-sm text-blue-600 hover:text-blue-700">View all →</a>
					</div>
					<div class="divide-y divide-gray-100">
						{#each $groups as group}
							{#each group.links.slice(0, 5) as link}
								<div class="p-4 flex items-center justify-between hover:bg-gray-50 transition">
									<div class="flex items-center gap-4">
										<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
											<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
											</svg>
										</div>
										<div>
											<p class="font-medium text-gray-900">{link.title}</p>
											<p class="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
										</div>
									</div>
									<div class="flex items-center gap-4">
										<span class="text-sm text-gray-400">0 clicks</span>
										<span class="w-2 h-2 rounded-full {link.is_active ? 'bg-green-500' : 'bg-gray-300'}"></span>
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
								<p class="text-gray-500">No links yet</p>
								<a href="/dashboard/links" class="text-sm text-blue-600 hover:underline mt-1 inline-block">Add your first link</a>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Sidebar -->
			<div class="space-y-6">
				<!-- Quick Actions -->
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
					<div class="space-y-2">
						<a href="/dashboard/links" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600">
							<span class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">➕</span>
							Add New Link
						</a>
						<a href="/dashboard/appearance" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600">
							<span class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">🎨</span>
							Change Theme
						</a>
						<a href="/dashboard/appearance" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600">
							<span class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">✏️</span>
							Edit Profile
						</a>
					</div>
				</div>

				<!-- Share Card -->
				<div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
					<h3 class="font-semibold mb-2">Share Your Page</h3>
					<p class="text-sm text-blue-100 mb-4">Copy your link and share it everywhere!</p>
					<div class="bg-white/20 backdrop-blur rounded-lg p-3 flex items-center gap-2">
						<span class="text-sm flex-1 truncate">biolink.com/{$pageStore?.username}</span>
						<button class="px-3 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-blue-50 transition">
							Copy
						</button>
					</div>
				</div>

				<!-- Tips -->
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<h3 class="font-semibold text-gray-900 mb-4">💡 Tips</h3>
					<ul class="space-y-3 text-sm text-gray-600">
						<li class="flex items-start gap-2">
							<span class="text-green-500 mt-0.5">✓</span>
							Add a profile photo to increase engagement
						</li>
						<li class="flex items-start gap-2">
							<span class="text-green-500 mt-0.5">✓</span>
							Keep your bio short and memorable
						</li>
						<li class="flex items-start gap-2">
							<span class="text-green-500 mt-0.5">✓</span>
							Put your most important link first
						</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
