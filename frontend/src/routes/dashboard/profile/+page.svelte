<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, page as pageStore } from '$lib/stores/page';

	const username = 'demo';
	let loading = true;
	let error = '';
	let saving = false;
	let uploadingAvatar = false;
	let fileInput: HTMLInputElement;

	// Form data
	let displayName = '';
	let bio = '';
	let avatarUrl = '';
	let showSocialIcons = true; // Default: show icons
	let socialLinks = {
		twitter: '',
		instagram: '',
		facebook: '',
		linkedin: '',
		youtube: '',
		tiktok: ''
	};

	// Track original values for change detection
	let originalData = {
		displayName: '',
		bio: '',
		showSocialIcons: true,
		socialLinks: {
			twitter: '',
			instagram: '',
			facebook: '',
			linkedin: '',
			youtube: '',
			tiktok: ''
		}
	};

	// Toast
	let toastMessage = '';
	let toastType: 'success' | 'error' = 'success';
	let toastVisible = false;

	// Check if form has changes
	$: hasChanges = 
		displayName !== originalData.displayName ||
		bio !== originalData.bio ||
		showSocialIcons !== originalData.showSocialIcons ||
		socialLinks.twitter !== originalData.socialLinks.twitter ||
		socialLinks.instagram !== originalData.socialLinks.instagram ||
		socialLinks.facebook !== originalData.socialLinks.facebook ||
		socialLinks.linkedin !== originalData.socialLinks.linkedin ||
		socialLinks.youtube !== originalData.socialLinks.youtube ||
		socialLinks.tiktok !== originalData.socialLinks.tiktok;

	onMount(async () => {
		try {
			const data = await api.getEditorData(username);
			loadEditorData(data);
			
			// Load form data
			displayName = data.page.title || '';
			bio = data.page.bio || '';
			avatarUrl = data.page.avatar_url || '';
			showSocialIcons = data.page.show_social_icons ?? true; // Default true
			
			// Load social links from draft_profile if exists
			if (data.page.social_links) {
				socialLinks = {
					twitter: data.page.social_links.twitter || '',
					instagram: data.page.social_links.instagram || '',
					facebook: data.page.social_links.facebook || '',
					linkedin: data.page.social_links.linkedin || '',
					youtube: data.page.social_links.youtube || '',
					tiktok: data.page.social_links.tiktok || ''
				};
			}
			
			// Store original values
			originalData = {
				displayName,
				bio,
				showSocialIcons,
				socialLinks: { ...socialLinks }
			};
		} catch (e) {
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});

	async function handleSave() {
		if (!$pageStore) return;
		
		// Validate
		if (!displayName.trim()) {
			showToast('Display name is required', 'error');
			return;
		}
		
		if (bio.length > 200) {
			showToast('Bio must be 200 characters or less', 'error');
			return;
		}
		
		saving = true;
		try {
			// Clean and validate social links
			const cleanedSocialLinks: any = {};
			
			Object.entries(socialLinks).forEach(([platform, url]) => {
				const trimmedUrl = url.trim();
				if (trimmedUrl) {
					// Remove protocol if exists
					let cleanUrl = trimmedUrl.replace(/^https?:\/\//, '');
					// Remove www. if exists
					cleanUrl = cleanUrl.replace(/^www\./, '');
					// Remove trailing slash
					cleanUrl = cleanUrl.replace(/\/$/, '');
					
					cleanedSocialLinks[platform] = cleanUrl;
				}
			});
			
			// Save to draft
			await api.saveDraft(username, {
				title: displayName.trim(),
				bio: bio.trim(),
				show_social_icons: showSocialIcons,
				social_links: cleanedSocialLinks
			});
			
			// Update original data after successful save
			originalData = {
				displayName,
				bio,
				showSocialIcons,
				socialLinks: { ...socialLinks }
			};
			
			showToast('Changes saved!', 'success');
		} catch (e) {
			console.error('Save failed:', e);
			showToast('Failed to save changes', 'error');
		} finally {
			saving = false;
		}
	}

	async function handleAvatarUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Validate
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			showToast('Invalid file type. Use JPG, PNG, WebP or GIF', 'error');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			showToast('File too large. Max 5MB', 'error');
			return;
		}

		uploadingAvatar = true;
		try {
			const result = await api.uploadAvatar(username, file);
			console.log('Upload result:', result);
			
			// Update local state immediately
			avatarUrl = result.url;
			
			// Update store
			if ($pageStore) {
				$pageStore.avatar_url = result.url;
			}
			
			// Force re-render by adding timestamp to avoid cache
			avatarUrl = `${result.url}?t=${Date.now()}`;
			
			showToast('Avatar updated!', 'success');
		} catch (e: any) {
			console.error('Upload failed:', e);
			showToast(e.message || 'Failed to upload avatar', 'error');
		} finally {
			uploadingAvatar = false;
			// Reset input
			if (target) target.value = '';
		}
	}

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
		setTimeout(() => {
			toastVisible = false;
		}, 3000);
	}
</script>

<div class="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
	<div class="max-w-3xl mx-auto px-8">
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
		{:else if error}
			<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
		{:else}
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-gray-900">Profile</h1>
				<p class="text-gray-500 mt-1">Manage your personal information and social links</p>
			</div>

			<div class="space-y-6">
				<!-- Avatar Section -->
				<section class="bg-white rounded-xl border border-gray-200 p-6">
					<h2 class="font-semibold text-gray-900 mb-4">Profile Picture</h2>
					<div class="flex items-center gap-6">
						{#if uploadingAvatar}
							<div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-100">
								<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
							</div>
						{:else if avatarUrl}
							<img src={avatarUrl} alt="Avatar" class="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100" />
						{:else}
							<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-gray-100">
								<span class="text-3xl text-white font-bold">{displayName.charAt(0).toUpperCase() || 'U'}</span>
							</div>
						{/if}
						<div class="flex-1">
							<input 
								type="file"
								accept="image/*"
								bind:this={fileInput}
								on:change={handleAvatarUpload}
								class="hidden"
							/>
							<button 
								on:click={() => fileInput.click()}
								disabled={uploadingAvatar}
								class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
							>
								{uploadingAvatar ? 'Uploading...' : (avatarUrl ? 'Change Avatar' : 'Upload Photo')}
							</button>
							<p class="text-xs text-gray-500 mt-2">JPG, PNG, WebP or GIF. Max 5MB.</p>
						</div>
					</div>
				</section>

				<!-- Basic Info Section -->
				<section class="bg-white rounded-xl border border-gray-200 p-6">
					<h2 class="font-semibold text-gray-900 mb-4">Basic Information</h2>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Display Name <span class="text-red-500">*</span>
							</label>
							<input 
								type="text"
								bind:value={displayName}
								placeholder="Your name"
								maxlength="100"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
							/>
							<p class="text-xs text-gray-500 mt-1">This is how your name will appear on your bio page</p>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Bio
							</label>
							<textarea 
								bind:value={bio}
								rows="4"
								maxlength="200"
								placeholder="Tell people about yourself..."
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition"
							></textarea>
							
<div class="flex justify-between items-center mt-1">
								<p class="text-xs text-gray-500">Keep it short and memorable</p>
								<span class="text-xs text-gray-400">{bio.length}/200</span>
							</div>
						</div>
					</div>
				</section>

				<!-- Social Links Section -->
				<section class="bg-white rounded-xl border border-gray-200 p-6">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h2 class="font-semibold text-gray-900">Social Links</h2>
							<p class="text-sm text-gray-500 mt-1">Connect your social media accounts</p>
						</div>
						
						<!-- Toggle Switch -->
						<label class="flex items-center gap-3 cursor-pointer">
							<span class="text-sm font-medium text-gray-700">Show icons on bio page</span>
							<div class="relative">
								<input 
									type="checkbox" 
									bind:checked={showSocialIcons}
									class="sr-only peer"
								/>
								<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
							</div>
						</label>
					</div>
					
					<div class="space-y-4">
						<!-- Twitter -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.twitter}
									placeholder="twitter.com/username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>

						<!-- Instagram -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.instagram}
									placeholder="instagram.com/username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>

						<!-- Facebook -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.facebook}
									placeholder="facebook.com/username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>

						<!-- LinkedIn -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.linkedin}
									placeholder="linkedin.com/in/username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>

						<!-- YouTube -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.youtube}
									placeholder="youtube.com/@username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>

						<!-- TikTok -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
								</svg>
							</div>
							<div class="flex-1">
								<input 
									type="text"
									bind:value={socialLinks.tiktok}
									placeholder="tiktok.com/@username"
									class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								/>
							</div>
						</div>
					</div>
				</section>

				<!-- Save Button -->
				<div class="flex items-center justify-between pt-4">
					{#if hasChanges && !saving}
						<p class="text-sm text-amber-600 flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
							</svg>
							You have unsaved changes
						</p>
					{:else}
						<p class="text-sm text-gray-500">All changes saved</p>
					{/if}
					<button 
						on:click={handleSave}
						disabled={saving || !displayName.trim() || !hasChanges}
						class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Toast Notification -->
{#if toastVisible}
	<div class="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
		<div class="px-6 py-4 rounded-lg shadow-lg {toastType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center gap-3">
			{#if toastType === 'success'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			{/if}
			<span class="font-medium">{toastMessage}</span>
		</div>
	</div>
{/if}
