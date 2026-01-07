<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, groups } from '$lib/stores/page';
	import { appearance } from '$lib/stores/appearance';
	import PhoneMockup from '$lib/components/editor/PhoneMockup.svelte';

	export let params = {};
	import AddBlockModal from '$lib/components/modals/AddBlockModal.svelte';
	import RenameGroupModal from '$lib/components/modals/RenameGroupModal.svelte';
	import DeleteGroupModal from '$lib/components/modals/DeleteGroupModal.svelte';
	import LinksEditor from '$lib/components/editor/LinksEditor.svelte';
	import BlockCard from '$lib/components/editor/BlockCard.svelte';
	import type { Link } from '$lib/types';

	const username = 'demo';
	let loading = true;
	let error = '';
	
	// Get default linkGroupLayout from theme
	$: defaultLinkGroupLayout = (() => {
		const themeConfig = $appearance?.theme?.config;
		return themeConfig?.page?.defaults?.linkGroupLayout || 'list';
	})();

	// Bio URL
	$: bioUrl = `https://biolink.com/${username}`;

	// Copy link function
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(bioUrl);
		} catch (e) {
			console.error('Failed to copy:', e);
			const input = document.createElement('input');
			input.value = bioUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
		}
	}

	// Open in new tab
	function openInNewTab() {
		window.open(bioUrl, '_blank', 'noopener,noreferrer');
	}

	// View state
	type ViewMode = 'list' | 'edit-links';
	let viewMode: ViewMode = 'list';
	let currentGroupId: number | null = null;
	let currentGroupName: string = 'Links';
	let currentLinks: Link[] = [];
	let currentLayoutType: 'list' | 'carousel' | 'grid' | 'cards' = 'list';
	let currentLayoutConfig: string | null = null;
	let isCreatingGroup = false; // Track group creation status

	// Reactive: Update currentLayoutConfig when groups store changes (e.g., theme reset)
	$: if (currentGroupId && viewMode === 'edit-links') {
		const group = $groups.find(g => g.id === currentGroupId);
		if (group) {
			currentLayoutType = group.layout_type || defaultLinkGroupLayout;
			currentLayoutConfig = group.layout_config || null;
		}
	}

	let addBlockModal: AddBlockModal;
	let renameGroupModal: RenameGroupModal;
	let deleteGroupModal: DeleteGroupModal;
	let renamingGroupId: number | null = null;
	let deletingGroupId: number | null = null;

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
			currentLayoutType = group.layout_type || defaultLinkGroupLayout;
			currentLayoutConfig = group.layout_config || null;
			viewMode = 'edit-links';
		}
	}

	async function handleDeleteGroup(groupId: number) {
		const group = $groups.find(g => g.id === groupId);
		if (!group) return;

		deletingGroupId = groupId;
		deleteGroupModal.open(group.title || 'Untitled', group.links?.length || 0);
	}

	async function handleDeleteConfirm() {
		if (!deletingGroupId) return;

		const groupId = deletingGroupId;
		deletingGroupId = null;

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

	async function handleToggleGroupVisible(event: CustomEvent<any>) {
		const { groupId, isVisible } = event.detail;
		
		// OPTIMISTIC UI: Update immediately
		const oldGroups = [...$groups];
		groups.update(g => g.map(group => 
			group.id === groupId ? { ...group, is_visible: isVisible } : group
		));

		// Update in background
		try {
			await api.updateGroup(groupId, { is_visible: isVisible });
		} catch (e: any) {
			// Revert on error
			groups.set(oldGroups);
			error = e.message || 'Failed to update group visibility';
		}
	}

	async function handleRenameGroup(groupId: number) {
		const group = $groups.find(g => g.id === groupId);
		if (!group) return;

		renamingGroupId = groupId;
		renameGroupModal.open(group.title || '');
	}

	async function handleRenameSubmit(event: CustomEvent<string>) {
		const newTitle = event.detail;
		if (!renamingGroupId || !newTitle) return;

		const groupId = renamingGroupId;
		renamingGroupId = null;

		// OPTIMISTIC UI: Update immediately
		const oldGroups = [...$groups];
		groups.update(g => g.map(grp => 
			grp.id === groupId ? { ...grp, title: newTitle } : grp
		));

		// Update in background
		try {
			await api.updateGroup(groupId, { title: newTitle });
		} catch (e: any) {
			// Revert on error
			groups.set(oldGroups);
			error = e.message || 'Failed to rename group';
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

	async function handleBlockTypeSelect(event: CustomEvent<{ type: string; layout: string }>) {
		const { type: blockType, layout } = event.detail;
		if (blockType === 'link') {
			// Generate unique group name
			const groupName = generateUniqueGroupName();
			
			// Map layout to layout_type
			const layoutTypeMap: Record<string, 'list' | 'carousel' | 'grid' | 'cards'> = {
				'classic': 'list',
				'carousel': 'carousel',
				'grid': 'grid',
				'card': 'cards'
			};
			const layoutType = layoutTypeMap[layout] || 'list';
			
			// OPTIMISTIC UI: Show editor immediately
			currentGroupId = null; // Temp null, will be set when API returns
			currentGroupName = groupName;
			currentLinks = [];
			currentLayoutType = layoutType;
			viewMode = 'edit-links';
			isCreatingGroup = true;
			
			// Create group in background (non-blocking)
			try {
				const groupResult = await api.createGroup(username, {
					title: groupName,
					layout_type: layoutType,
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
		const { title, url, icon_type, icon_data } = event.detail;
		
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

		// OPTIMISTIC UI: Add link immediately with uploaded icon
		const tempLink = {
			id: -Date.now(), // Negative temp ID to avoid conflicts
			group_id: currentGroupId,
			title: title,
			url: url,
			icon_type: icon_type || 'none',
			icon_data: icon_data || null,
			icon_url: null, // deprecated
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
				icon_type: icon_type || 'none',
				icon_data: icon_data || null,
				sort_order: currentLinks.length - 1
			});

			// Reload data to get real link with real ID and URL
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

	async function handleUpdateLink(event: CustomEvent<any>) {
		const { linkId, title, url, icon_type, icon_data } = event.detail;

		// Store old link for revert
		const oldLink = currentLinks.find(link => link.id === linkId);

		// OPTIMISTIC UI: Update immediately
		currentLinks = currentLinks.map(link =>
			link.id === linkId
				? { ...link, title, url, icon_type: icon_type || link.icon_type, icon_data: icon_data !== undefined ? icon_data : link.icon_data }
				: link
		);

		// Update in store for PhoneMockup
		groups.update(g => g.map(group => 
			group.id === currentGroupId 
				? { ...group, links: currentLinks }
				: group
		));

		// Update in background
		try {
			await api.updateLink(linkId, {
				title,
				url,
				icon_type: icon_type || 'none',
				icon_data: icon_data || null
			});

			// Update store silently in background
			const data = await api.getEditorData(username);
			loadEditorData(data);
		} catch (e: any) {
			// Revert on error
			if (oldLink) {
				currentLinks = currentLinks.map(link =>
					link.id === linkId ? oldLink : link
				);
				groups.update(g => g.map(group => 
					group.id === currentGroupId 
						? { ...group, links: currentLinks }
						: group
				));
			}
			error = e.message || 'Failed to update link';
		}
	}

	async function handleToggleLink(event: CustomEvent<any>) {
		const { linkId, isActive } = event.detail;
		
		// OPTIMISTIC UI: Update immediately in both currentLinks and $groups store
		const newLinks = currentLinks.map(link => 
			link.id === linkId ? { ...link, is_active: isActive ? 1 : 0 } : link
		);
		currentLinks = newLinks;
		
		// Update $groups store for PhoneMockup
		groups.update(g => g.map(group => 
			group.id === currentGroupId 
				? { ...group, links: newLinks }
				: group
		));
		
		// Update in background
		try {
			await api.updateLink(linkId, { is_active: isActive ? 1 : 0 });
			// Success - keep optimistic state, no reload needed
		} catch (e: any) {
			// Revert on error
			const revertedLinks = currentLinks.map(link => 
				link.id === linkId ? { ...link, is_active: isActive ? 0 : 1 } : link
			);
			currentLinks = revertedLinks;
			
			groups.update(g => g.map(group => 
				group.id === currentGroupId 
					? { ...group, links: revertedLinks }
					: group
			));
			
			error = e.message || 'Failed to update link';
		}
	}

	async function handleToggleNewTab(event: CustomEvent<any>) {
		const { linkId, openInNewTab } = event.detail;
		
		// OPTIMISTIC UI: Update immediately in both currentLinks and $groups store
		const newLinks = currentLinks.map(link => 
			link.id === linkId ? { ...link, open_in_new_tab: openInNewTab } : link
		);
		currentLinks = newLinks;
		
		// Update $groups store for PhoneMockup
		groups.update(g => g.map(group => 
			group.id === currentGroupId 
				? { ...group, links: newLinks }
				: group
		));
		
		// Update in background
		try {
			await api.updateLink(linkId, { open_in_new_tab: openInNewTab });
			// Success - keep optimistic state, no reload needed
		} catch (e: any) {
			// Revert on error
			const revertedLinks = currentLinks.map(link => 
				link.id === linkId ? { ...link, open_in_new_tab: openInNewTab === 1 ? 0 : 1 } : link
			);
			currentLinks = revertedLinks;
			
			groups.update(g => g.map(group => 
				group.id === currentGroupId 
					? { ...group, links: revertedLinks }
					: group
			));
			
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

	async function handleMoveLink(event: CustomEvent<any>) {
		const { linkId1, linkId2, index1, index2 } = event.detail;
		
		// Optimistic UI: Update both currentLinks AND $groups store immediately
		const newLinks = [...currentLinks];
		const idx1 = newLinks.findIndex(l => l.id === linkId1);
		const idx2 = newLinks.findIndex(l => l.id === linkId2);
		
		if (idx1 !== -1 && idx2 !== -1) {
			[newLinks[idx1], newLinks[idx2]] = [newLinks[idx2], newLinks[idx1]];
			currentLinks = newLinks; // Update local
			
			// Update $groups store for PhoneMockup
			groups.update(g => g.map(group => 
				group.id === currentGroupId 
					? { ...group, links: newLinks }
					: group
			));
		}
		
		// API call in background (don't wait)
		try {
			await Promise.all([
				api.updateLink(linkId1, { sort_order: index1 }),
				api.updateLink(linkId2, { sort_order: index2 })
			]);
			// Success - keep optimistic state, no reload needed
		} catch (e: any) {
			// Only reload on error to revert
			const data = await api.getEditorData(username);
			loadEditorData(data);
			const group = $groups.find(g => g.id === currentGroupId);
			if (group) {
				currentLinks = group.links || [];
			}
			error = e.message || 'Failed to reorder links';
		}
	}

	async function handleUpdateLayout(event: CustomEvent<string>) {
		const newLayoutType = event.detail as 'list' | 'carousel' | 'grid' | 'cards';
		
		if (!currentGroupId) return;

		// OPTIMISTIC UI: Update immediately
		const oldLayoutType = currentLayoutType;
		const oldLayoutConfig = currentLayoutConfig;
		currentLayoutType = newLayoutType;
		
		// Set default config for grid/list layout if not exists
		// borderEnabled/shadowEnabled: undefined = follow theme (3-state logic)
		let newLayoutConfig = currentLayoutConfig;
		if (newLayoutType === 'grid' && !currentLayoutConfig) {
			newLayoutConfig = JSON.stringify({ 
				grid: { 
					columns: 2, 
					aspectRatio: 'square', 
					showLabels: true 
				} 
			});
			currentLayoutConfig = newLayoutConfig;
		} else if (newLayoutType === 'list' && !currentLayoutConfig) {
			const themeConfig = $appearance?.theme?.config;
			const defaultIconShape = themeConfig?.page?.defaults?.linkIconShape || 'rounded';
			const defaultTextAlign = themeConfig?.page?.layout?.textAlign || 'center';
			newLayoutConfig = JSON.stringify({ 
				list: { 
					iconShape: defaultIconShape, 
					iconPosition: 'left', 
					textAlign: defaultTextAlign 
				} 
			});
			currentLayoutConfig = newLayoutConfig;
		}
		
		// Update in store
		groups.update(g => g.map(group => 
			group.id === currentGroupId 
				? { ...group, layout_type: newLayoutType, layout_config: newLayoutConfig }
				: group
		));

		// Update in background (no reload - optimistic update is correct)
		try {
			await api.updateGroup(currentGroupId, { 
				layout_type: newLayoutType,
				layout_config: newLayoutConfig
			});
			// Success - no action needed, optimistic update is already correct
		} catch (e: any) {
			// Revert on error
			currentLayoutType = oldLayoutType;
			currentLayoutConfig = oldLayoutConfig;
			groups.update(g => g.map(group => 
				group.id === currentGroupId 
					? { ...group, layout_type: oldLayoutType, layout_config: oldLayoutConfig }
					: group
			));
			error = e.message || 'Failed to update layout';
		}
	}

	async function handleUpdateLayoutConfig(event: CustomEvent<string>) {
		const newLayoutConfig = event.detail;
		
		if (!currentGroupId) return;

		// OPTIMISTIC UI: Update immediately
		const oldLayoutConfig = currentLayoutConfig;
		currentLayoutConfig = newLayoutConfig;
		
		// Update in store
		groups.update(g => g.map(group => 
			group.id === currentGroupId 
				? { ...group, layout_config: newLayoutConfig }
				: group
		));

		// Update in background (no reload - optimistic update is correct)
		try {
			await api.updateGroup(currentGroupId, { layout_config: newLayoutConfig });
			// Success - no action needed, optimistic update is already correct
		} catch (e: any) {
			// Revert on error
			currentLayoutConfig = oldLayoutConfig;
			groups.update(g => g.map(group => 
				group.id === currentGroupId 
					? { ...group, layout_config: oldLayoutConfig }
					: group
			));
			error = e.message || 'Failed to update layout config';
		}
	}
</script>

<div class="flex h-[calc(100vh-64px)]" style="background-color: #f6f1eb;">
	<!-- Main Content + Preview (Scrollable together) -->
	<div class="flex-1 overflow-y-auto">
		<div class="flex gap-8 p-8 justify-center">
			<!-- Left: Content Area -->
			<div class="w-full max-w-3xl">
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin w-8 h-8 border-2 border-gray-300 rounded-full" style="border-top-color: #00aa4f;"></div>
				</div>
			{:else if error}
				<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
			{:else if viewMode === 'list'}
				<!-- List View -->
				<div class="mb-6">
					<div class="mb-4">
						<h2 class="text-xl font-semibold text-gray-900 tracking-tight">Manage Bio Content</h2>
						<p class="text-sm text-gray-500 mt-0.5">Add, edit, and organize your links and content blocks</p>
					</div>
					<button on:click={handleAddBlock} class="btn-ios-primary w-full flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
						</svg>
						Add Block
					</button>
				</div>

				{#if $groups.length === 0}
					<div class="card-ios p-16 text-center">
						<div class="icon-ios w-20 h-20 mx-auto mb-5">
							<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2 tracking-tight">No content yet</h3>
						<p class="text-gray-500 mb-6">Add your first block to get started</p>
						<button on:click={handleAddBlock} class="btn-ios-primary">
							Add Block
						</button>
					</div>
				{:else}
					<div class="space-y-4">
						{#each $groups as group, index (group.id)}
							<BlockCard 
								{group}
								isFirst={index === 0}
								isLast={index === $groups.length - 1}
								on:click={(e) => handleEditGroup(e.detail)}
								on:moveUp={(e) => handleMoveGroup(e.detail, 'up')}
								on:moveDown={(e) => handleMoveGroup(e.detail, 'down')}
								on:delete={(e) => handleDeleteGroup(e.detail)}
								on:toggleVisible={handleToggleGroupVisible}
								on:rename={(e) => handleRenameGroup(e.detail)}
							/>
						{/each}
					</div>
				{/if}
			{:else if viewMode === 'edit-links'}
				<!-- Links Editor View -->
				<LinksEditor 
					links={currentLinks}
					groupName={currentGroupName}
					groupId={currentGroupId}
					layoutType={currentLayoutType}
					layoutConfig={currentLayoutConfig}
					on:back={handleBackToList}
					on:addLink={handleAddLink}
					on:updateLink={handleUpdateLink}
					on:toggleLink={handleToggleLink}
					on:toggleNewTab={handleToggleNewTab}
					on:deleteLink={handleDeleteLink}
					on:moveLink={handleMoveLink}
					on:updateLayout={handleUpdateLayout}
					on:updateLayoutConfig={handleUpdateLayoutConfig}
				/>
			{/if}
			</div>

			<!-- Right: Preview -->
			<div class="w-[440px] flex-shrink-0 -mr-8 pr-8">
				<div class="sticky top-8 space-y-4">
					<!-- Selected Domain Section -->
					<div class="pb-4">
						<p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Selected Domain</p>
						
						<div class="flex items-center gap-2 flex-wrap">
							<!-- URL Display -->
							<div class="flex items-center gap-2 px-3 h-[38px] border border-gray-200 rounded-lg flex-1 min-w-[200px] bg-white">
								<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
								</svg>
								<span class="text-sm font-medium text-gray-900 truncate">biolink.com/{username}</span>
							</div>

							<!-- Copy Button -->
							<button 
								on:click={copyLink}
								class="w-[38px] h-[38px] flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
								title="Copy link"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
							</button>

							<!-- External Link Button -->
							<button 
								on:click={openInNewTab}
								class="w-[38px] h-[38px] flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
								title="Open in new tab"
							>
								<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</button>

							<!-- Share Button -->
							<button class="px-4 h-[38px] flex items-center justify-center text-white text-sm font-semibold rounded-lg transition-colors bg-[#00aa4f] hover:bg-[#008f42] leading-none">
								SHARE
							</button>
						</div>
					</div>

					<!-- Phone Mockup -->
					<div class="pt-16 pb-8">
						<div class="flex items-center justify-center py-8">
							<PhoneMockup />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modals -->
<AddBlockModal bind:this={addBlockModal} on:select={handleBlockTypeSelect} />
<RenameGroupModal bind:this={renameGroupModal} on:rename={handleRenameSubmit} />
<DeleteGroupModal bind:this={deleteGroupModal} on:confirm={handleDeleteConfirm} />
