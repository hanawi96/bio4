<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { appearance } from '$lib/stores/appearance';
	import { appearanceState } from '$lib/stores/appearanceManager';
	import { groups } from '$lib/stores/page';
	import { resolveShadow } from '$lib/appearance/tokenResolver';
	import LinkCard from './LinkCard.svelte';
	import LinkForm from './LinkForm.svelte';
	import LayoutSelector from './LayoutSelector.svelte';
	import GridLayoutConfig from './GridLayoutConfig.svelte';
	import ClassicLayoutConfig from './ClassicLayoutConfig.svelte';
	import CardLayoutConfig from './CardLayoutConfig.svelte';
	import type { Link } from '$lib/types';
	import { api } from '$lib/api.client';

	export let links: Link[] = [];
	export let groupName = 'Links';
	export let groupId: number;
	export let layoutType: 'list' | 'carousel' | 'grid' | 'cards' = 'list';
	export let layoutConfig: string | null = null;

	const dispatch = createEventDispatcher();

	type TabType = 'links' | 'layouts';
	let activeTab: TabType = 'links';

	// Get current recipe ID (shared for multiple checks)
	$: currentRecipeId = $appearanceState?.overrides?.['block.stylePreset'] 
		|| $appearance?.theme?.config?.defaults?.blockStylePreset 
		|| 'solid';

	// Check if current recipe is Neon (uses glow instead of shadow)
	$: isNeonRecipe = currentRecipeId === 'neon';

	// Check if theme has shadow or glow (neon)
	$: themeHasShadow = (() => {
		// Neon uses glow, not shadow
		if (isNeonRecipe) {
			return false;
		}
		
		// First check if there's a shadow override from BlockStyleSection
		const shadowOverride = $appearanceState?.overrides?.['block.shadow'];
		if (shadowOverride && shadowOverride !== 'none') {
			return resolveShadow(shadowOverride, $appearance?.tokens?.shadowColor || '#000000') !== 'none';
		}
		
		// Then check recipe default shadow
		if ($appearance?.blockStyle?.shadow) {
			return resolveShadow($appearance.blockStyle.shadow, $appearance?.tokens?.shadowColor || '#000000') !== 'none';
		}
		
		return false;
	})();

	// Check if theme has border
	$: themeHasBorder = (() => {
		const border = $appearance?.blockStyle?.border;
		return border && border !== 'none';
	})();

	// Parse layout config with 3-state shadow/border logic
	// shadowEnabled/borderEnabled: undefined/null = follow theme
	// shadowEnabled/borderEnabled: true = force ON
	// shadowEnabled/borderEnabled: false = force OFF
	$: gridConfig = (() => {
		const defaultConfig = { columns: 2, aspectRatio: 'square', showLabels: true };
		if (!layoutConfig) return defaultConfig;
		try {
			const parsed = JSON.parse(layoutConfig);
			return parsed.grid || defaultConfig;
		} catch {
			return defaultConfig;
		}
	})();

	$: classicConfig = (() => {
		const defaultConfig = { iconShape: 'rounded', iconPosition: 'left', textAlign: 'center' };
		if (!layoutConfig) return defaultConfig;
		try {
			const parsed = JSON.parse(layoutConfig);
			return parsed.list || defaultConfig;
		} catch {
			return defaultConfig;
		}
	})();

	$: cardConfig = (() => {
		const defaultConfig = { imagePosition: 'left', imageSize: 50, showSubtitle: true };
		if (!layoutConfig) return defaultConfig;
		try {
			const parsed = JSON.parse(layoutConfig);
			return parsed.card || defaultConfig;
		} catch {
			return defaultConfig;
		}
	})();

	let showAddForm = false;
	let editingLink: Link | null = null;
	let linkHeadline = '';
	let linkSubtitle = '';
	let linkUrl = '';
	let iconFile: File | null = null;
	let iconPreviewUrl = '';
	let uploading = false;

	// Group title editing
	let isEditingTitle = false;
	let editedGroupName = groupName;
	let titleError = '';

	$: isEditMode = editingLink !== null;

	// Validate group title
	$: {
		const trimmed = editedGroupName.trim();
		if (isEditingTitle) {
			if (!trimmed) {
				titleError = 'Group name cannot be empty';
			} else if (trimmed.length > 50) {
				titleError = 'Group name must be 50 characters or less';
			} else {
				titleError = '';
			}
		}
	}

	function handleBack() {
		dispatch('back');
	}

	function startEditTitle() {
		isEditingTitle = true;
		editedGroupName = groupName;
	}

	function selectAllText(node: HTMLInputElement) {
		node.select();
	}

	async function saveGroupTitle() {
		const trimmedName = editedGroupName.trim();
		
		// Validate
		if (!trimmedName) {
			titleError = 'Group name cannot be empty';
			return;
		}
		
		if (trimmedName.length > 50) {
			titleError = 'Group name must be 50 characters or less';
			return;
		}
		
		if (trimmedName === groupName) {
			isEditingTitle = false;
			titleError = '';
			return;
		}

		// OPTIMISTIC UI: Update immediately in both local and store
		const oldGroupName = groupName;
		groupName = trimmedName;
		isEditingTitle = false;
		titleError = '';

		// Update in store
		groups.update(g => g.map(group => 
			group.id === groupId 
				? { ...group, title: trimmedName }
				: group
		));

		// Update in background
		try {
			await api.updateGroup(groupId, { title: trimmedName });
		} catch (error: any) {
			// Revert on error
			groupName = oldGroupName;
			editedGroupName = oldGroupName;
			groups.update(g => g.map(group => 
				group.id === groupId 
					? { ...group, title: oldGroupName }
					: group
			));
			alert(error.message || 'Failed to update group name');
		}
	}

	function cancelEditTitle() {
		isEditingTitle = false;
		editedGroupName = groupName;
		titleError = '';
	}

	function handleTitleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveGroupTitle();
		} else if (event.key === 'Escape') {
			cancelEditTitle();
		}
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

	function handleLayoutSelect(event: CustomEvent<string>) {
		dispatch('updateLayout', event.detail);
	}

	function handleGridConfigChange(event: CustomEvent<any>) {
		const newConfig = { grid: event.detail };
		dispatch('updateLayoutConfig', JSON.stringify(newConfig));
	}

	function handleClassicConfigChange(event: CustomEvent<any>) {
		const newConfig = { list: event.detail };
		dispatch('updateLayoutConfig', JSON.stringify(newConfig));
	}

	function handleCardConfigChange(event: CustomEvent<any>) {
		const newConfig = { card: event.detail };
		dispatch('updateLayoutConfig', JSON.stringify(newConfig));
	}
</script>

<div class="h-full flex flex-col">
	<!-- Header -->
	<div class="flex-shrink-0 pb-4 border-b border-gray-200">
		<button 
			on:click={handleBack}
			class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="font-medium">Back</span>
		</button>

		<div class="flex items-center gap-4 mb-4">
			<div class="icon-ios w-14 h-14">
				<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
			</div>
			<div class="flex-1">
				{#if isEditingTitle}
					<div>
						<input
							type="text"
							bind:value={editedGroupName}
							on:blur={saveGroupTitle}
							on:keydown={handleTitleKeydown}
							use:selectAllText
							maxlength="50"
							class="text-2xl font-bold text-gray-900 border-b-2 outline-none bg-transparent w-full {titleError ? 'border-red-500' : 'border-blue-500'}"
							autofocus
						/>
						{#if titleError}
							<p class="text-xs text-red-500 mt-1">{titleError}</p>
						{/if}
					</div>
				{:else}
					<div class="flex items-center gap-2 group">
						<h2 
							on:click={startEditTitle}
							class="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
						>
							{groupName}
						</h2>
						<button
							on:click={startEditTitle}
							class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
							title="Edit group name"
						>
							<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
					</div>
				{/if}
				<p class="text-sm text-gray-500">
					{isEditingTitle ? 'Press Enter to save, Esc to cancel' : 'Manage your links'}
				</p>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex gap-6 border-b border-gray-200 -mb-px">
			<button
				on:click={() => activeTab = 'links'}
				class="pb-3 px-1 font-medium text-sm transition-colors relative {activeTab === 'links' 
					? 'text-gray-900' 
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Links
				{#if activeTab === 'links'}
					<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
				{/if}
			</button>
			<button
				on:click={() => activeTab = 'layouts'}
				class="pb-3 px-1 font-medium text-sm transition-colors relative {activeTab === 'layouts' 
					? 'text-gray-900' 
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Layouts
				{#if activeTab === 'layouts'}
					<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
				{/if}
			</button>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto">
		{#if activeTab === 'layouts'}
			<div class="py-6">
				<LayoutSelector 
					selectedLayout={layoutType}
					on:select={handleLayoutSelect}
				/>
				
				{#if layoutType === 'grid'}
					<GridLayoutConfig
						config={gridConfig}
						themeHasShadow={themeHasShadow}
						themeHasBorder={themeHasBorder}
						isNeonRecipe={isNeonRecipe}
						on:change={handleGridConfigChange}
					/>
				{:else if layoutType === 'list'}
					<ClassicLayoutConfig
						config={classicConfig}
						themeHasShadow={themeHasShadow}
						themeHasBorder={themeHasBorder}
						isNeonRecipe={isNeonRecipe}
						on:change={handleClassicConfigChange}
					/>
				{:else if layoutType === 'cards'}
					<CardLayoutConfig
						config={cardConfig}
						themeHasShadow={themeHasShadow}
						themeHasBorder={themeHasBorder}
						isNeonRecipe={isNeonRecipe}
						on:change={handleCardConfigChange}
					/>
				{/if}
			</div>
		{:else}
		<div class="py-6 space-y-3">
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
		{/if}
	</div>
</div>
