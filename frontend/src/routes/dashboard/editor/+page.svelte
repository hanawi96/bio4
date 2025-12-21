<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, page as pageStore, groups, theme } from '$lib/stores/page';
	import { editorState, isDirty } from '$lib/stores/editor';
	import BioPreview from '$lib/components/preview/BioPreview.svelte';
	import PresetPicker from '$lib/components/editor/PresetPicker.svelte';
	import GlobalStylePanel from '$lib/components/editor/GlobalStylePanel.svelte';

	const username = 'demo';
	let loading = true;
	let error = '';
	let saving = false;
	let activeTab = 'profile';

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

	async function handleSave() {
		if (!$pageStore) return;
		saving = true;
		try {
			await api.updatePage(username, {
				title: $pageStore.title,
				bio: $pageStore.bio,
				avatar_url: $pageStore.avatar_url,
				theme_preset_key: $pageStore.theme_preset_key,
				theme_mode: $pageStore.theme_mode,
				status: $pageStore.status
			});
			isDirty.set(false);
		} catch (e) {
			console.error('Save failed:', e);
		} finally {
			saving = false;
		}
	}

	function updateField(field: string, value: any) {
		pageStore.update(p => p ? { ...p, [field]: value } : p);
	}
</script>

<div class="h-[calc(100vh-64px)] flex">
	<!-- Editor Sidebar -->
	<div class="w-96 bg-white border-r border-gray-200 flex flex-col">
		<!-- Tabs -->
		<div class="flex border-b border-gray-200">
			<button 
				class="flex-1 px-4 py-3 text-sm font-medium {activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
				on:click={() => activeTab = 'profile'}
			>Profile</button>
			<button 
				class="flex-1 px-4 py-3 text-sm font-medium {activeTab === 'links' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
				on:click={() => activeTab = 'links'}
			>Links</button>
			<button 
				class="flex-1 px-4 py-3 text-sm font-medium {activeTab === 'theme' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
				on:click={() => activeTab = 'theme'}
			>Theme</button>
		</div>

		<!-- Tab Content -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if loading}
				<div class="text-center py-8">
					<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
				</div>
			{:else if error}
				<div class="text-red-600">{error}</div>
			{:else if activeTab === 'profile'}
				<!-- Profile Tab -->
				<div class="space-y-6">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
						<input 
							type="text" 
							value={$pageStore?.title || ''}
							on:input={(e) => updateField('title', e.currentTarget.value)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Your name"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
						<textarea 
							value={$pageStore?.bio || ''}
							on:input={(e) => updateField('bio', e.currentTarget.value)}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
							placeholder="Tell people about yourself"
						></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
						<input 
							type="text" 
							value={$pageStore?.avatar_url || ''}
							on:input={(e) => updateField('avatar_url', e.currentTarget.value)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="https://..."
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
						<select 
							value={$pageStore?.status || 'draft'}
							on:change={(e) => updateField('status', e.currentTarget.value)}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
						</select>
					</div>
				</div>

			{:else if activeTab === 'links'}
				<!-- Links Tab -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="font-medium">Your Links</h3>
						<button class="text-sm text-blue-600 hover:text-blue-700">+ Add Link</button>
					</div>
					{#each $groups as group}
						{#each group.links as link}
							<div class="p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium">{link.title}</span>
									<span class="w-2 h-2 rounded-full {link.is_active ? 'bg-green-500' : 'bg-gray-300'}"></span>
								</div>
								<p class="text-sm text-gray-500 truncate">{link.url}</p>
							</div>
						{/each}
					{:else}
						<div class="text-center py-8 text-gray-500">
							<p>No links yet</p>
							<button class="text-blue-600 hover:underline mt-2">Add your first link</button>
						</div>
					{/each}
				</div>

			{:else if activeTab === 'theme'}
				<!-- Theme Tab -->
				<div class="space-y-8">
					<PresetPicker />
					<hr class="border-gray-200" />
					<GlobalStylePanel />
				</div>
			{/if}
		</div>

		<!-- Save Button -->
		<div class="p-4 border-t border-gray-200">
			<button 
				on:click={handleSave}
				disabled={saving}
				class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
			>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</div>

	<!-- Preview Panel -->
	<div class="flex-1 bg-gray-100 flex flex-col">
		<!-- Preview Header -->
		<div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<span class="text-sm font-medium text-gray-700">Preview</span>
				<div class="flex bg-gray-100 rounded-lg p-1">
					<button 
						class="px-3 py-1 text-xs rounded {$editorState.previewMode === 'mobile' ? 'bg-white shadow' : ''}"
						on:click={() => editorState.update(s => ({ ...s, previewMode: 'mobile' }))}
					>📱 Mobile</button>
					<button 
						class="px-3 py-1 text-xs rounded {$editorState.previewMode === 'desktop' ? 'bg-white shadow' : ''}"
						on:click={() => editorState.update(s => ({ ...s, previewMode: 'desktop' }))}
					>🖥️ Desktop</button>
				</div>
			</div>
			<a href="/{$pageStore?.username}" target="_blank" class="text-sm text-blue-600 hover:text-blue-700">
				Open in new tab →
			</a>
		</div>

		<!-- Preview Content -->
		<div class="flex-1 overflow-y-auto p-8 flex justify-center">
			<div class="{$editorState.previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl'} bg-white rounded-2xl shadow-lg overflow-hidden transition-all">
				<BioPreview />
			</div>
		</div>
	</div>
</div>
