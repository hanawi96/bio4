<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LinkCard from './LinkCard.svelte';
	import LinkForm from './LinkForm.svelte';
	import type { Link } from '$lib/types';
	import { api } from '$lib/api.client';

	export let links: Link[] = [];
	export let groupName = 'Links';

	const dispatch = createEventDispatcher();

	let showAddForm = false;
	let editingLink: Link | null = null;
	let linkHeadline = '';
	let linkSubtitle = '';
	let linkUrl = '';
	let iconFile: File | null = null;
	let iconPreviewUrl = '';
	let uploading = false;

	$: isEditMode = editingLink !== null;

	function handleBack() {
		dispatch('back');
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
		editingLink = null;
		if (!showAddForm) cleanupPreview();
		resetForm();
	}

	function handleEdit(event: CustomEvent<number>) {
		const link = links.find(l => l.id === event.detail);
		if (!link) return;

		showAddForm = false;
		editingLink = link;
		
		const parts = link.title.split(' - ');
		linkHeadline = parts[0];
		linkSubtitle = parts.length > 1 ? parts.slice(1).join(' - ') : '';
		linkUrl = link.url;
		iconPreviewUrl = link.icon_url || '';
	}

	function cancelEdit() {
		editingLink = null;
		resetForm();
	}

	function resetForm() {
		linkHeadline = '';
		linkSubtitle = '';
		linkUrl = '';
		iconFile = null;
		cleanupPreview();
	}

	function cleanupPreview() {
		if (iconPreviewUrl && iconPreviewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		iconPreviewUrl = '';
	}

	function handleFileChange(event: CustomEvent<any>) {
		const detail = event.detail;
		const file = detail.target?.files?.[0];
		if (!file) return;
		
		cleanupPreview();
		iconFile = file;
		iconPreviewUrl = URL.createObjectURL(file);
	}

	function handleRemoveIcon() {
		cleanupPreview();
		iconFile = null;
	}

	async function handleSave() {
		if (!linkHeadline.trim() || !linkUrl.trim()) return;

		const normalizedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
		const title = linkSubtitle ? `${linkHeadline} - ${linkSubtitle}` : linkHeadline;
		
		let uploadedIconUrl = null;
		if (iconFile) {
			uploading = true;
			try {
				const result = await api.uploadLinkIcon(iconFile);
				uploadedIconUrl = result.url;
			} catch (error: any) {
				alert(error.message || 'Failed to upload icon');
				uploading = false;
				return;
			}
			uploading = false;
		}

		const payload = {
			title: title.trim(),
			url: normalizedUrl,
			icon_url: uploadedIconUrl || (iconPreviewUrl && !iconPreviewUrl.startsWith('blob:') ? iconPreviewUrl : null)
		};

		if (isEditMode && editingLink) {
			dispatch('updateLink', { linkId: editingLink.id, ...payload });
			cancelEdit();
		} else {
			dispatch('addLink', payload);
			showAddForm = false;
		}

		cleanupPreview();
		resetForm();
	}

	function handleToggle(event: CustomEvent<any>) {
		dispatch('toggleLink', event.detail);
	}

	function handleDelete(event: CustomEvent<number>) {
		dispatch('deleteLink', event.detail);
	}
</script>

<div class="h-full flex flex-col">
	<!-- Header -->
	<div class="flex-shrink-0 pb-6 border-b border-gray-200">
		<button 
			on:click={handleBack}
			class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="font-medium">Back</span>
		</button>

		<div class="flex items-center gap-3">
			<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
			</div>
			<div>
				<h2 class="text-2xl font-bold text-gray-900">{groupName}</h2>
				<p class="text-sm text-gray-500">Manage your links</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto py-6 space-y-3">
		<!-- Add Link Button/Form -->
		{#if !showAddForm}
			<button
				on:click={toggleAddForm}
				class="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add link
			</button>
		{:else}
			<LinkForm
				bind:headline={linkHeadline}
				bind:subtitle={linkSubtitle}
				bind:url={linkUrl}
				bind:iconPreviewUrl
				{uploading}
				isEditMode={false}
				on:fileChange={handleFileChange}
				on:removeIcon={handleRemoveIcon}
				on:cancel={toggleAddForm}
				on:save={handleSave}
			/>
		{/if}

		<!-- Links List -->
		{#if links.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
				</div>
				<p class="text-gray-500">No links yet. Add your first link above.</p>
			</div>
		{:else}
			{#each links as link (link.id)}
				{#if editingLink && editingLink.id === link.id}
					<LinkForm
						bind:headline={linkHeadline}
						bind:subtitle={linkSubtitle}
						bind:url={linkUrl}
						bind:iconPreviewUrl
						{uploading}
						isEditMode={true}
						on:fileChange={handleFileChange}
						on:removeIcon={handleRemoveIcon}
						on:cancel={cancelEdit}
						on:save={handleSave}
					/>
				{:else}
					<LinkCard 
						{link}
						on:edit={handleEdit}
						on:toggle={handleToggle}
						on:delete={handleDelete}
					/>
				{/if}
			{/each}
		{/if}
	</div>
</div>
