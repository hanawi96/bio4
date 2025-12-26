<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LinkCard from './LinkCard.svelte';
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
	let fileInput: HTMLInputElement;

	$: isEditMode = editingLink !== null;

	function handleBack() {
		dispatch('back');
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
		editingLink = null;
		if (!showAddForm && iconPreviewUrl) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		resetForm();
	}

	function handleEdit(event: CustomEvent<number>) {
		const linkId = event.detail;
		const link = links.find(l => l.id === linkId);
		if (!link) return;

		showAddForm = false;
		editingLink = link;
		
		// Parse title to headline/subtitle
		const parts = link.title.split(' - ');
		linkHeadline = parts[0];
		linkSubtitle = parts.length > 1 ? parts.slice(1).join(' - ') : '';
		linkUrl = link.url;
		
		// Set existing icon as preview
		if (link.icon_url) {
			iconPreviewUrl = link.icon_url;
		}
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
		if (iconPreviewUrl && iconPreviewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		iconPreviewUrl = '';
	}

	function handleIconClick() {
		fileInput?.click();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;
		
		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}
		
		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('Image size must be less than 5MB');
			return;
		}
		
		// Clean up old preview URL
		if (iconPreviewUrl) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		
		// Store file and create local preview
		iconFile = file;
		iconPreviewUrl = URL.createObjectURL(file);
	}

	function removeIcon() {
		if (iconPreviewUrl) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		iconFile = null;
		iconPreviewUrl = '';
		if (fileInput) fileInput.value = '';
	}

	async function handleSaveLink() {
		if (!linkHeadline.trim() || !linkUrl.trim()) return;

		const normalizedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
		const title = linkSubtitle ? `${linkHeadline} - ${linkSubtitle}` : linkHeadline;
		
		// Upload new icon if file selected
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

		if (isEditMode && editingLink) {
			// Edit mode - use uploaded URL for optimistic UI
			dispatch('updateLink', {
				linkId: editingLink.id,
				title: title.trim(),
				url: normalizedUrl,
				icon_url: uploadedIconUrl || (iconPreviewUrl && !iconPreviewUrl.startsWith('blob:') ? iconPreviewUrl : null)
			});
			
			cancelEdit();
		} else {
			// Add mode - use uploaded URL for optimistic UI
			dispatch('addLink', {
				title: title.trim(),
				url: normalizedUrl,
				icon_url: uploadedIconUrl
			});
			
			showAddForm = false;
		}

		// Clean up blob URLs
		if (iconPreviewUrl && iconPreviewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
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
			<div class="bg-white rounded-xl p-5 space-y-4 border border-gray-200 shadow-sm">
				<!-- Link Text Section -->
				<div>
					<div class="flex items-center gap-2 mb-3">
						<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
						</svg>
						<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Link text</span>
					</div>
					
					<div class="flex gap-3">
						<!-- Image Upload -->
						<div class="flex-shrink-0 text-center">
							<input
								type="file"
								accept="image/*"
								bind:this={fileInput}
								on:change={handleFileSelect}
								class="hidden"
							/>
							
							{#if uploading}
								<div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
									<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
								</div>
							{:else if iconPreviewUrl}
								<div class="relative group">
									<img 
										src={iconPreviewUrl} 
										alt="Link icon preview" 
										class="w-14 h-14 rounded-lg object-cover border border-gray-200"
									/>
									<button
										type="button"
										on:click={removeIcon}
										class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
									>
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							{:else}
								<button
									type="button"
									on:click={handleIconClick}
									class="w-14 h-14 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
									</svg>
								</button>
							{/if}
							<span class="text-xs text-gray-500 mt-1 block">Image</span>
						</div>

						<!-- Text Inputs -->
						<div class="flex-1 space-y-2">
							<input
								type="text"
								bind:value={linkHeadline}
								placeholder="Headline"
								autofocus
								class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
							/>
							<input
								type="text"
								bind:value={linkSubtitle}
								placeholder="Subtitle"
								class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
							/>
						</div>
					</div>
				</div>

				<!-- Action and Website Section - Same Row -->
				<div class="grid grid-cols-2 gap-3">
					<!-- Website Section -->
					<div class="col-span-2">
						<div class="flex items-center gap-2 mb-3">
							<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
							</svg>
							<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</span>
						</div>
						
						<input
							type="text"
							bind:value={linkUrl}
							placeholder="http://"
							class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
						/>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-2 pt-1">
					<button
						on:click={toggleAddForm}
						class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
					>
						Cancel
					</button>
					<button
						on:click={handleSaveLink}
						disabled={!linkHeadline.trim() || !linkUrl.trim()}
						class="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Add Link
					</button>
				</div>
			</div>
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
					<!-- Edit Form Inline -->
					<div class="bg-white rounded-xl p-5 space-y-4 border-2 border-blue-500 shadow-sm">
						<!-- Link Text Section -->
						<div>
							<div class="flex items-center gap-2 mb-3">
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
								</svg>
								<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Link text</span>
							</div>
							
							<div class="flex gap-3">
								<!-- Image Upload -->
								<div class="flex-shrink-0 text-center">
									<input
										type="file"
										accept="image/*"
										bind:this={fileInput}
										on:change={handleFileSelect}
										class="hidden"
									/>
									
									{#if uploading}
										<div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
											<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
										</div>
									{:else if iconPreviewUrl}
										<div class="relative group">
											<img 
												src={iconPreviewUrl} 
												alt="Link icon preview" 
												class="w-14 h-14 rounded-lg object-cover border border-gray-200"
											/>
											<button
												type="button"
												on:click={removeIcon}
												class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
											>
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									{:else}
										<button
											type="button"
											on:click={handleIconClick}
											class="w-14 h-14 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
											</svg>
										</button>
									{/if}
									<span class="text-xs text-gray-500 mt-1 block">Image</span>
								</div>

								<!-- Text Inputs -->
								<div class="flex-1 space-y-2">
									<input
										type="text"
										bind:value={linkHeadline}
										placeholder="Headline"
										autofocus
										class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
									/>
									<input
										type="text"
										bind:value={linkSubtitle}
										placeholder="Subtitle"
										class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
									/>
								</div>
							</div>
						</div>

						<!-- Website Section -->
						<div>
							<div class="flex items-center gap-2 mb-3">
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
								</svg>
								<span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</span>
							</div>
							
							<input
								type="text"
								bind:value={linkUrl}
								placeholder="http://"
								class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition text-sm"
							/>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 pt-1">
							<button
								on:click={cancelEdit}
								class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								on:click={handleSaveLink}
								disabled={!linkHeadline.trim() || !linkUrl.trim()}
								class="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Save
							</button>
						</div>
					</div>
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
