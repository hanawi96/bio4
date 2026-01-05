<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import type { ThemePreset } from '$lib/types';

	let themes: ThemePreset[] = [];
	let loading = true;
	let selectedTheme: ThemePreset | null = null;
	let deleteConfirm: ThemePreset | null = null;
	let deleting = false;
	let deleteError = '';

	onMount(async () => {
		await loadThemes();
	});

	async function loadThemes() {
		loading = true;
		try {
			const result = await api.getThemes();
			themes = result.themes;
		} catch (e) {
			console.error('Failed to load themes:', e);
		} finally {
			loading = false;
		}
	}

	async function handleDelete(theme: ThemePreset) {
		deleting = true;
		deleteError = '';
		try {
			await api.deleteTheme(theme.key);
			deleteConfirm = null;
			await loadThemes();
		} catch (e: any) {
			deleteError = e.message || 'Failed to delete theme';
		} finally {
			deleting = false;
		}
	}

	function getThemePreview(theme: ThemePreset) {
		const config = theme.config;
		const schemaVersion = config.meta?.schemaVersion || 1;

		if (schemaVersion === 2) {
			// v2: Use semantic colors
			const semantic = config.semantic?.color;
			return {
				bg: resolveRef(semantic?.surface?.page, config) || '#ffffff',
				primary: resolveRef(semantic?.primary, config) || '#3b82f6',
				text: resolveRef(semantic?.text?.default, config) || '#000000'
			};
		} else {
			// v1: Use flat tokens
			const tokens = config.tokens;
			return {
				bg: tokens?.bg?.value || '#ffffff',
				primary: tokens?.primary || '#3b82f6',
				text: tokens?.text || '#000000'
			};
		}
	}

	function resolveRef(value: any, config: any): string | null {
		if (!value || typeof value !== 'string') return value;
		if (!value.startsWith('ref:')) return value;

		const path = value.replace('ref:', '').split('.');
		let resolved: any = config;
		for (const key of path) {
			resolved = resolved?.[key];
			if (!resolved) return null;
		}
		return typeof resolved === 'string' && resolved.startsWith('ref:')
			? resolveRef(resolved, config)
			: resolved;
	}
</script>

<div class="p-8 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 mb-2">Theme Gallery</h2>
			<p class="text-gray-600">Browse and explore all available themes</p>
		</div>
		<a
			href="/dashboard/themes/new"
			class="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Theme
		</a>
	</div>

	{#if loading}
		<!-- Loading State -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each [1, 2, 3, 4] as _}
				<div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
					<div class="aspect-[4/3] bg-gray-200"></div>
					<div class="p-4 space-y-3">
						<div class="h-5 bg-gray-200 rounded w-3/4"></div>
						<div class="h-4 bg-gray-200 rounded w-full"></div>
						<div class="h-4 bg-gray-200 rounded w-2/3"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Theme Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each themes as theme}
				{@const preview = getThemePreview(theme)}
				<div class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative">
					<!-- Action buttons -->
					<div class="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
						<a
							href="/dashboard/themes/{theme.key}"
							class="w-8 h-8 bg-[#00aa4f] text-white rounded-full hover:bg-[#008f42] transition-all flex items-center justify-center shadow-lg"
							title="Edit theme"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</a>
						<button
							on:click={() => deleteConfirm = theme}
							class="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all flex items-center justify-center shadow-lg"
							title="Delete theme"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>

					<button
						on:click={() => selectedTheme = theme}
						class="w-full text-left"
					>
						<!-- Preview -->
						<div 
							class="aspect-[4/3] p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
							style="background: {preview.bg};"
						>
							<!-- Decorative circles -->
							<div 
								class="absolute top-4 right-4 w-16 h-16 rounded-full opacity-20"
								style="background: {preview.primary};"
							></div>
							<div 
								class="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-10"
								style="background: {preview.primary};"
							></div>

							<!-- Mini preview -->
							<div class="relative z-10 w-full max-w-[140px] space-y-2">
								<div 
									class="w-12 h-12 rounded-full mx-auto border-2 border-white shadow-sm"
									style="background: {preview.primary};"
								></div>
								<div class="space-y-1.5">
									{#each [1, 2] as _}
										<div 
											class="h-7 rounded-lg shadow-sm"
											style="background: {preview.primary};"
										></div>
									{/each}
								</div>
							</div>

							<!-- Schema badge -->
							<div class="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-gray-600">
								v{theme.config.meta?.schemaVersion || 1}
							</div>
						</div>

						<!-- Info -->
						<div class="p-4 border-t border-gray-100">
							<h3 class="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
								{theme.name}
							</h3>
							<p class="text-sm text-gray-500 line-clamp-2 mb-2">
								{theme.config.meta?.description || 'No description'}
							</p>
							<div class="flex items-center gap-2 text-xs">
								{#if theme.config.meta?.tier}
									<span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium uppercase">
										{theme.config.meta.tier}
									</span>
								{/if}
								{#if theme.config.meta?.category}
									<span class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
										{theme.config.meta.category}
									</span>
								{/if}
							</div>
						</div>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Theme Detail Modal -->
{#if selectedTheme}
	{@const preview = getThemePreview(selectedTheme)}
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={() => selectedTheme = null}
	>
		<div 
			class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
			on:click|stopPropagation
		>
			<!-- Preview -->
			<div 
				class="aspect-video p-12 flex items-center justify-center relative"
				style="background: {preview.bg};"
			>
				<div class="w-full max-w-xs space-y-3">
					<div 
						class="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg"
						style="background: {preview.primary};"
					></div>
					<div class="space-y-2">
						{#each [1, 2, 3] as _}
							<div 
								class="h-12 rounded-xl shadow-md"
								style="background: {preview.primary};"
							></div>
						{/each}
					</div>
				</div>
				<button
					on:click={() => selectedTheme = null}
					class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
				>
					<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Details -->
			<div class="p-8 space-y-6">
				<div>
					<h2 class="text-2xl font-bold text-gray-900 mb-2">{selectedTheme.name}</h2>
					<p class="text-gray-600">{selectedTheme.config.meta?.description || 'No description'}</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-xs text-gray-500 mb-1">Schema Version</p>
						<p class="text-lg font-semibold text-gray-900">v{selectedTheme.config.meta?.schemaVersion || 1}</p>
					</div>
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-xs text-gray-500 mb-1">Version</p>
						<p class="text-lg font-semibold text-gray-900">{selectedTheme.config.meta?.version || 'N/A'}</p>
					</div>
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-xs text-gray-500 mb-1">Tier</p>
						<p class="text-lg font-semibold text-gray-900 uppercase">{selectedTheme.config.meta?.tier || 'Free'}</p>
					</div>
					<div class="bg-gray-50 rounded-xl p-4">
						<p class="text-xs text-gray-500 mb-1">Category</p>
						<p class="text-lg font-semibold text-gray-900 capitalize">{selectedTheme.config.meta?.category || 'General'}</p>
					</div>
				</div>

				<div class="flex gap-3">
					<button
						on:click={() => selectedTheme = null}
						class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
					>
						Close
					</button>
					<button
						class="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
					>
						Use This Theme
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteConfirm}
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={() => { deleteConfirm = null; deleteError = ''; }}
	>
		<div 
			class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
			on:click|stopPropagation
		>
			<div class="flex items-start gap-4 mb-4">
				<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
					<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900 mb-1">Delete Theme</h3>
					<p class="text-sm text-gray-600">
						Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
					</p>
				</div>
			</div>

			{#if deleteError}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					{deleteError}
				</div>
			{/if}

			<div class="flex gap-3">
				<button
					on:click={() => { deleteConfirm = null; deleteError = ''; }}
					disabled={deleting}
					class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					on:click={() => handleDelete(deleteConfirm)}
					disabled={deleting}
					class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
				>
					{#if deleting}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						Deleting...
					{:else}
						Delete
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
