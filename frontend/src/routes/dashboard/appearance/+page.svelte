<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, page as pageStore, theme } from '$lib/stores/page';
	import PresetPicker from '$lib/components/editor/PresetPicker.svelte';
	import GlobalStylePanel from '$lib/components/editor/GlobalStylePanel.svelte';
	import BioPreview from '$lib/components/preview/BioPreview.svelte';
	import { editorState } from '$lib/stores/editor';

	const username = 'demo';
	let loading = true;
	let error = '';
	let saving = false;

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
				theme_preset_key: $pageStore.theme_preset_key,
				theme_mode: $pageStore.theme_mode
			});
		} catch (e) {
			console.error('Save failed:', e);
		} finally {
			saving = false;
		}
	}
</script>

<div class="h-[calc(100vh-64px)] flex">
	<!-- Editor Panel -->
	<div class="w-[400px] bg-white border-r border-gray-200 flex flex-col">
		<div class="p-6 border-b border-gray-200">
			<h2 class="font-semibold text-gray-900">Customize Appearance</h2>
			<p class="text-sm text-gray-500 mt-1">Choose a theme and customize colors</p>
		</div>

		<div class="flex-1 overflow-y-auto p-6 space-y-8">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				</div>
			{:else if error}
				<div class="text-red-600">{error}</div>
			{:else}
				<PresetPicker />
				<hr class="border-gray-200" />
				<GlobalStylePanel />
			{/if}
		</div>

		<div class="p-4 border-t border-gray-200">
			<button 
				on:click={handleSave}
				disabled={saving}
				class="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
			>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</div>

	<!-- Preview Panel -->
	<div class="flex-1 bg-gray-100 flex flex-col">
		<div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">Preview</span>
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button 
					class="px-3 py-1.5 text-xs font-medium rounded-md transition {$editorState.previewMode === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}"
					on:click={() => editorState.update(s => ({ ...s, previewMode: 'mobile' }))}
				>Mobile</button>
				<button 
					class="px-3 py-1.5 text-xs font-medium rounded-md transition {$editorState.previewMode === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}"
					on:click={() => editorState.update(s => ({ ...s, previewMode: 'desktop' }))}
				>Desktop</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-8 flex justify-center items-start">
			<div class="{$editorState.previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl'} bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
				<BioPreview />
			</div>
		</div>
	</div>
</div>
