<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData, setAutosaveTrigger } from '$lib/stores/page';
	import { triggerAutosave, initializeAutosave } from '$lib/stores/autosave';
	import { appearanceState, resetToThemeDefault } from '$lib/stores/appearanceManager';
	import { appearance } from '$lib/stores/appearance';
	import PhoneMockup from '$lib/components/editor/PhoneMockup.svelte';
	import ThemeSection from '$lib/components/editor/sections/ThemeSection.svelte';
	import HeaderSection from '$lib/components/editor/sections/HeaderSection.svelte';
	import BackgroundSection from '$lib/components/editor/sections/BackgroundSection.svelte';
	import AppearanceDebug from '$lib/components/debug/AppearanceDebug.svelte';
	import ResetThemeModal from '$lib/components/modals/ResetThemeModal.svelte';

	export let params = {};
	import BlockStyleSection from '$lib/components/editor/sections/BlockStyleSection.svelte';
	import FontSection from '$lib/components/editor/sections/FontSection.svelte';
	import SpacingSection from '$lib/components/editor/sections/SpacingSection.svelte';
	import PageSettingsSection from '$lib/components/editor/sections/PageSettingsSection.svelte';

	const username = 'demo';
	let loading = true;
	let error = '';
	let activeSection = 'theme';
	let contentContainer: HTMLElement;
	let sidebarCollapsed = false;

	// Reset modal state
	let showResetModal = false;
	let resetting = false;

	// Check if has customizations
	$: hasCustomizations = Object.keys($appearanceState.overrides || {}).length > 0;
	$: themeName = $appearance?.theme?.name || 'Default';
	$: bioUrl = `https://biolink.com/${username}`;

	async function handleResetConfirm() {
		resetting = true;
		try {
			await resetToThemeDefault();
			showResetModal = false;
		} catch (e) {
			console.error('Failed to reset theme:', e);
			alert('Failed to reset theme. Please try again.');
		} finally {
			resetting = false;
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(bioUrl);
			// Optional: Show toast notification
		} catch (e) {
			console.error('Failed to copy:', e);
			// Fallback for older browsers
			const input = document.createElement('input');
			input.value = bioUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
		}
	}

	function openInNewTab() {
		window.open(bioUrl, '_blank', 'noopener,noreferrer');
	}

	// Navigation items with icons
	const navItems = [
		{ 
			id: 'theme', 
			label: 'Themes',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>`
		},
		{ 
			id: 'header', 
			label: 'Header',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
		},
		{ 
			id: 'background', 
			label: 'Background',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
		},
		{ 
			id: 'blocks', 
			label: 'Block Style',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>`
		},
		{ 
			id: 'fonts', 
			label: 'Typography',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>`
		},
		{ 
			id: 'spacing', 
			label: 'Spacing',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>`
		},
		{ 
			id: 'settings', 
			label: 'Page Settings',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
		}
	];

	// Setup autosave trigger
	onMount(async () => {
		try {
			const data = await api.getEditorData(username);
			loadEditorData(data);
			
			// Initialize autosave with current data (prevent initial save)
			initializeAutosave();
			
			// DON'T connect autosave - sections handle their own saves
			// setAutosaveTrigger(() => triggerAutosave(username));
		} catch (e) {
			error = 'Failed to load data';
		} finally {
			loading = false;
			// Setup scroll tracking after DOM is ready
			setTimeout(() => setupScrollTracking(), 100);
		}
	});

	onDestroy(() => {
		// Cleanup autosave trigger
		setAutosaveTrigger(null);
	});

	// Setup scroll listener to track active section (simpler approach)
	function setupScrollTracking() {
		if (!contentContainer) return;

		const handleScroll = () => {
			const scrollTop = contentContainer.scrollTop;
			const viewportHeight = contentContainer.clientHeight;
			const centerPoint = scrollTop + (viewportHeight * 0.3);

			let closestSection = navItems[0].id;
			let closestDistance = Infinity;

			navItems.forEach((item) => {
				const element = document.getElementById(item.id);
				if (element) {
					const elementTop = element.offsetTop - contentContainer.offsetTop;
					const elementHeight = element.offsetHeight;
					const elementCenter = elementTop + (elementHeight / 2);
					const distance = Math.abs(elementCenter - centerPoint);

					if (distance < closestDistance) {
						closestDistance = distance;
						closestSection = item.id;
					}
				}
			});

			if (activeSection !== closestSection) {
				activeSection = closestSection;
			}
		};

		contentContainer.addEventListener('scroll', handleScroll);
		// Initial check
		handleScroll();

		// Cleanup
		return () => contentContainer.removeEventListener('scroll', handleScroll);
	}

	// Smooth scroll to section
	function scrollToSection(sectionId: string) {
		// Set active section immediately for instant highlight
		activeSection = sectionId;
		
		const element = document.getElementById(sectionId);
		if (element && contentContainer) {
			const offsetTop = element.offsetTop - contentContainer.offsetTop - 24;
			contentContainer.scrollTo({
				top: offsetTop,
				behavior: 'smooth'
			});
		}
	}
</script>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
</style>

<div class="flex h-[calc(100vh-64px)] bg-gray-50">
	<!-- Left Sidebar Navigation -->
	<aside class="{sidebarCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300">
		<div class="sticky top-0 p-4">
			<!-- Header with Toggle -->
			<div class="flex items-center justify-between mb-3 {sidebarCollapsed ? '' : 'px-3'}">
				{#if !sidebarCollapsed}
					<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
						Appearance
					</h3>
				{/if}
				<button
					on:click={() => sidebarCollapsed = !sidebarCollapsed}
					class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors {sidebarCollapsed ? 'mx-auto' : ''}"
					title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					<svg class="w-4 h-4 transition-transform duration-300 {sidebarCollapsed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					</svg>
				</button>
			</div>

			<nav class="space-y-1">
				{#each navItems as item}
					<button
						on:click={() => scrollToSection(item.id)}
						class="w-full flex items-center {sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-lg text-sm font-medium transition-all {activeSection === item.id 
							? 'bg-blue-50 text-blue-700' 
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
						title={sidebarCollapsed ? item.label : ''}
					>
						<div class="flex items-center gap-3">
							<span class="flex-shrink-0">
								{@html item.icon}
							</span>
							{#if !sidebarCollapsed}
								<span>{item.label}</span>
							{/if}
						</div>
						{#if activeSection === item.id && !sidebarCollapsed}
							<div class="w-1 h-6 bg-blue-600 rounded-full"></div>
						{/if}
					</button>
				{/each}
			</nav>
		</div>
	</aside>

	<!-- Middle: Content Area (Scrollable) -->
	<div class="flex-1 overflow-y-auto scrollbar-hide" bind:this={contentContainer}>
		<div class="max-w-3xl mx-auto p-8">
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				</div>
			{:else if error}
				<div class="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
			{:else}
				<!-- Info Banner -->
				<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-8">
					<div class="flex items-start gap-3">
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
							</svg>
						</div>
						<div class="flex-1">
							<h4 class="text-sm font-semibold text-gray-900 mb-1">Customize Your Bio Page</h4>
							<p class="text-sm text-gray-600">
								Use the navigation menu to jump between sections. All changes are previewed in real-time.
							</p>
						</div>
					</div>
				</div>

				<!-- Sections -->
				<div class="space-y-8">
					<!-- Theme Section -->
					<section id="theme" class="scroll-mt-6">
						<ThemeSection />
					</section>

					<!-- Header Section -->
					<section id="header" class="scroll-mt-6">
						<HeaderSection />
					</section>

					<!-- Background Section -->
					<section id="background" class="scroll-mt-6">
						<BackgroundSection />
					</section>

					<!-- Block Style Section -->
					<section id="blocks" class="scroll-mt-6">
						<BlockStyleSection />
					</section>

					<!-- Font Section -->
					<section id="fonts" class="scroll-mt-6">
						<FontSection />
					</section>

					<!-- Spacing Section -->
					<section id="spacing" class="scroll-mt-6">
						<SpacingSection />
					</section>

					<!-- Page Settings Section -->
					<section id="settings" class="scroll-mt-6">
						<PageSettingsSection />
					</section>
				</div>

				<!-- Bottom Spacer -->
				<div class="h-20"></div>
			{/if}
		</div>
	</div>

	<!-- Right: Preview (Sticky) -->
	<aside class="w-[520px] bg-white border-l border-gray-200 flex-shrink-0">
		<div class="sticky top-0 h-[calc(100vh-64px)] flex flex-col">
			<!-- Selected Domain Section (Fixed at top) -->
			<div class="p-6 pb-4">
				<p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Selected Domain</p>
				
				<div class="flex items-center gap-2">
					<!-- URL Display (Shorter) -->
					<div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1">
						<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						<span class="text-sm font-medium text-gray-900 truncate">biolink.com/{username}</span>
					</div>

					<!-- Copy Button -->
					<button 
						on:click={copyLink}
						class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						title="Copy link"
					>
						<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</button>

					<!-- External Link Button -->
					<button 
						on:click={openInNewTab}
						class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						title="Open in new tab"
					>
						<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</button>

					<!-- Reset Button (only show when has customizations) -->
					{#if hasCustomizations}
						<button 
							on:click={() => showResetModal = true}
							class="px-3 py-2 border border-orange-300 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium flex items-center gap-1.5"
							title="Reset to theme default"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Reset
						</button>
					{/if}

					<!-- Share Button -->
					<button class="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
						SHARE
					</button>
				</div>
			</div>

			<!-- Phone Mockup Container -->
			<div class="flex-1 flex items-center justify-center px-6 pb-6">
				<PhoneMockup />
			</div>
		</div>
	</aside>

	<!-- Debug Panel -->
	<AppearanceDebug />
</div>

<!-- Reset Theme Modal -->
{#if showResetModal}
	<ResetThemeModal
		themeName={themeName}
		loading={resetting}
		on:confirm={handleResetConfirm}
		on:cancel={() => showResetModal = false}
	/>
{/if}
