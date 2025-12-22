<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, groups } from '$lib/stores/page';
	import PhoneMockup from '$lib/components/editor/PhoneMockup.svelte';

	export let params = {};
	import AddBlockModal from '$lib/components/modals/AddBlockModal.svelte';
	import LinksEditor from '$lib/components/editor/LinksEditor.svelte';
	import BlockCard from '$lib/components/editor/BlockCard.svelte';
	import type { Link } from '$lib/types';

	const username = 'demo';
	let loading = true;
	let error = '';

	// View state
	type ViewMode = 'list' | 'edit-links';
	let viewMode: ViewMode = 'list';
	let currentGroupId: number | null = null;
	let currentGroupName: string = 'Links';
	let currentLinks: Link[] = [];
	let isCreatingGroup = false; // Track group creation status

	let addBlockModal: AddBlockModal;

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

	function handleAddBlock() {
		addBlockModal.open();
	}

	function handleEditGroup(groupId: number) {
		const group = $groups.find(g => g.id === groupId);
		if (group) {
			currentGroupId = groupId;
			currentGroupName = group.title || 'Links';
			currentLinks = group.links || [];
			viewMode = 'edit-links';
		}
	}

	async function handleDeleteGroup(groupId: number) {
		if (!confirm('Are you sure you want to delete this group and all its links?')) return;

		// OPTIMISTIC UI: Remove group immediately
		const deletedGroup = $groups.find(g => g.id === groupId);
		groups.update(g => g.filter(group => group.id !== groupId));

		// Delete in background
		try {
			await api.deleteGroup(groupId);
			
			// Reload data silently
			const data = await api.getEditorData(username);
			loadEditorData(data);
		} catch (e: any) {
			// Restore on error
			if (deletedGroup) {
				groups.update(g => [...g, deletedGroup].sort((a, b) => a.sort_order - b.sort_order));
			}
			error = e.message || 'Failed to delete group';
		}
	}

	async function handleMoveGroup(groupId: number, direction: 'up' | 'down') {
		const currentIndex = $groups.findIndex(g => g.id === groupId);
		if (currentIndex === -1) return;

		const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		if (targetIndex < 0 || targetIndex >= $groups.length) return;

		// OPTIMISTIC UI: Swap immediately
		const newGroups = [...$groups];
		[newGroups[currentIndex], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[currentIndex]];
		groups.set(newGroups);

		// Update sort_order in background (no reload needed - optimistic update is correct)
		try {
			await Promise.all([
				api.updateGroup(newGroups[currentIndex].id, { sort_order: currentIndex }),
				api.updateGroup(newGroups[targetIndex].id, { sort_order: targetIndex })
			]);
			// Success - no action needed, optimistic update is already correct
		} catch (e: any) {
			// Revert on error
			groups.set($groups);
			error = e.message || 'Failed to reorder groups';
		}
	}

	async function handleBlockTypeSelect(event: CustomEvent<string>) {
		const blockType = event.detail;
		if (blockType === 'link') {
			// Generate unique group name
			const groupName = generateUniqueGroupName();
			
			// OPTIMISTIC UI: Show editor immediately
			currentGroupId = null; // Temp null, will be set when API returns
			currentGroupName = groupName;
			currentLinks = [];
			viewMode = 'edit-links';
			isCreatingGroup = true;
			
			// Create group in background (non-blocking)
			try {
				const groupResult = await api.createGroup(username, {
					title: groupName,
					layout_type: 'list',
					sort_order: $groups.length
				});
				
				// Update with real groupId
				currentGroupId = groupResult.id;
				isCreatingGroup = false;
				
				// Reload data silently in background
				const data = await api.getEditorData(username);
				loadEditorData(data);
			} catch (e: any) {
				// If creation fails, show error and go back
				error = e.message || 'Failed to create link group';
				viewMode = 'list';
				currentGroupId = null;
				isCreatingGroup = false;
			}
		}
	}

	function generateUniqueGroupName(): string {
		const baseName = 'Links';
		const existingNames = $groups.map(g => g.title?.toLowerCase() || '');
		
		// Check if "Links" is available
		if (!existingNames.includes(baseName.toLowerCase())) {
			return baseName;
		}
		
		// Find next available number
		let counter = 2;
		while (existingNames.includes(`${baseName.toLowerCase()} ${counter}`)) {
			counter++;
		}
		
		return `${baseName} ${counter}`;
	}

	function handleBackToList() {
		viewMode = 'list';
		currentGroupId = null;
	}

	async function handleAddLink(event: CustomEvent<any>) {
		const { title, url } = event.detail;
		
		// Wait for groupId if still creating
		if (isCreatingGroup || currentGroupId === null) {
			const maxWait = 5000; // 5 seconds max
			const startTime = Date.now();
			
			while ((isCreatingGroup || currentGroupId === null) && Date.now() - startTime < maxWait) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			
			if (currentGroupId === null) {
				error = 'Failed to create group. Please try again.';
				return;
			}
		}

		// OPTIMISTIC UI: Add link immediately with temp ID
		const tempLink = {
			id: -Date.now(), // Negative temp ID to avoid conflicts
			group_id: currentGroupId,
			title: title,
			url: url,
			icon_url: null,
			sort_order: currentLinks.length,
			is_active: 1,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		// Show link immediately
		currentLinks = [...currentLinks, tempLink];

		// Create link in background
		try {
			await api.createLink(currentGroupId, {
				title,
				url,
				icon_url: null,
				sort_order: currentLinks.length - 1
			});

			// Reload data to get real link with real ID
			const data = await api.getEditorData(username);
			loadEditorData(data);
			
			// Update current links with real data
			const group = $groups.find(g => g.id === currentGroupId);
			if (group) {
				currentLinks = group.links || [];
			}
		} catch (e: any) {
			// If API fails, remove the temp link
			currentLinks = currentLinks.filter(link => link.id !== tempLink.id);
			error = e.message || 'Failed to add link';
		}
	}

	async function handleToggleLink(event: CustomEvent<any>) {
		const { linkId, isActive } = event.detail;
		
		// OPTIMISTIC UI: Update immediately
		currentLinks = currentLinks.map(link => 
			link.id === linkId ? { ...link, is_active: isActive ? 1 : 0 } : link
		);
		
		// Update in background
		try {
			await api.updateLink(linkId, { is_active: isActive ? 1 : 0 });
			
			// Reload data silently
			const data = await api.getEditorData(username);
			loadEditorData(data);
			
			// Update current links
			const group = $groups.find(g => g.id === currentGroupId);
			if (group) {
				currentLinks = group.links || [];
			}
		} catch (e: any) {
			// Revert on error
			currentLinks = currentLinks.map(link => 
				link.id === linkId ? { ...link, is_active: isActive ? 0 : 1 } : link
			);
			error = e.message || 'Failed to update link';
		}
	}

	async function handleDeleteLink(event: CustomEvent<number>) {
		const linkId = event.detail;
		
		if (!confirm('Are you sure you want to delete this link?')) return;

		// OPTIMISTIC UI: Remove immediately
		const deletedLink = currentLinks.find(link => link.id === linkId);
		currentLinks = currentLinks.filter(link => link.id !== linkId);
		
		// Delete in background
		try {
			await api.deleteLink(linkId);
			
			// Reload data silently
			const data = await api.getEditorData(username);
			loadEditorData(data);
			
			// Update current links
			const group = $groups.find(g => g.id === currentGroupId);
			if (group) {
				currentLinks = group.links || [];
			}
		} catch (e: any) {
			// Restore on error
			if (deletedLink) {
				currentLinks = [...currentLinks, deletedLink].sort((a, b) => a.sort_order - b.sort_order);
			}
			error = e.message || 'Failed to delete link';
		}
	}
</script>

<div class="flex h-[calc(100vh-64px)] bg-gray-50">
	<!-- Left: Content Area -->
	<div class="flex-1 overflow-y-auto p-8">
		<div class="max-w-3xl mx-auto h-full">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				</div>
			{:else if error}
				<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
			{:else if viewMode === 'list'}
				<!-- List View -->
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-lg font-semibold text-gray-900">Manage Bio Content</h2>
						<p class="text-sm text-gray-500">Add, edit, and organize your links and content blocks</p>
					</div>
					<button on:click={handleAddBlock} class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Add Block
					</button>
				</div>

				{#if $groups.length === 0}
					<div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
						<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
						</div>
						<h3 class="text-lg font-medium text-gray-900 mb-1">No content yet</h3>
						<p class="text-gray-500 mb-4">Add your first block to get started</p>
						<button on:click={handleAddBlock} class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
							Add Block
						</button>
					</div>
				{:else}
					<div class="space-y-3">
						{#each $groups as group, index (group.id)}
							<BlockCard 
								{group}
								isFirst={index === 0}
								isLast={index === $groups.length - 1}
								on:click={(e) => handleEditGroup(e.detail)}
								on:moveUp={(e) => handleMoveGroup(e.detail, 'up')}
								on:moveDown={(e) => handleMoveGroup(e.detail, 'down')}
								on:delete={(e) => handleDeleteGroup(e.detail)}
							/>
						{/each}
					</div>
				{/if}
			{:else if viewMode === 'edit-links'}
				<!-- Links Editor View -->
				<LinksEditor 
					links={currentLinks}
					groupName={currentGroupName}
					on:back={handleBackToList}
					on:addLink={handleAddLink}
					on:toggleLink={handleToggleLink}
					on:deleteLink={handleDeleteLink}
				/>
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

<!-- Modals -->
<AddBlockModal bind:this={addBlockModal} on:select={handleBlockTypeSelect} />
