<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { api } from '$lib/api.client';
	import { loadEditorData } from '$lib/stores/page';
	import PhoneMockup from '$lib/components/editor/PhoneMockup.svelte';
	import ThemeSection from '$lib/components/editor/sections/ThemeSection.svelte';
	import HeaderSection from '$lib/components/editor/sections/HeaderSection.svelte';
	import BackgroundSection from '$lib/components/editor/sections/BackgroundSection.svelte';
	import BlockStyleSection from '$lib/components/editor/sections/BlockStyleSection.svelte';
	import FontSection from '$lib/components/editor/sections/FontSection.svelte';
	import ColorSection from '$lib/components/editor/sections/ColorSection.svelte';
	import ContrastSection from '$lib/components/editor/sections/ContrastSection.svelte';
	import SpacingSection from '$lib/components/editor/sections/SpacingSection.svelte';
	import PageSettingsSection from '$lib/components/editor/sections/PageSettingsSection.svelte';

	const username = 'demo';
	let loading = true;
	let error = '';
	let activeSection = 'theme';
	let contentContainer: HTMLElement;

	// Navigation items
	const navItems = [
		{ id: 'theme', label: 'Themes', icon: '🎭' },
		{ id: 'colors', label: 'Colors', icon: '🎨' },
		{ id: 'fonts', label: 'Fonts', icon: '✍️' },
		{ id: 'contrast', label: 'Text Contrast', icon: '📊' },
		{ id: 'header', label: 'Header', icon: '👤' },
		{ id: 'blocks', label: 'Block Style', icon: '📦' },
		{ id: 'spacing', label: 'Spacing', icon: '📏' },
		{ id: 'background', label: 'Background', icon: '🖼️' },
		{ id: 'settings', label: 'Page Settings', icon: '⚙️' }
	];

	onMount(async () => {
		try {
			const data = await api.getEditorData(username);
			loadEditorData(data);
			setupIntersectionObserver();
		} catch (e) {
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});

	// Setup Intersection Observer to track active section
	function setupIntersectionObserver() {
		if (!contentContainer) return;

		const options = {
			root: contentContainer,
			rootMargin: '-20% 0px -70% 0px',
			threshold: 0
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					activeSection = entry.target.id;
				}
			});
		}, options);

		// Observe all sections
		navItems.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) observer.observe(element);
		});
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
	<aside class="w-56 bg-white border-r border-gray-200 flex-shrink-0">
		<div class="sticky top-0 p-4">
			<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
				Appearance
			</h3>
			<nav class="space-y-1">
				{#each navItems as item}
					<button
						on:click={() => scrollToSection(item.id)}
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all {activeSection === item.id 
							? 'bg-blue-50 text-blue-700' 
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
					>
						<span class="text-lg">{item.icon}</span>
						<span>{item.label}</span>
						{#if activeSection === item.id}
							<div class="ml-auto w-1 h-6 bg-blue-600 rounded-full"></div>
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

					<!-- Color Section -->
					<section id="colors" class="scroll-mt-6">
						<ColorSection />
					</section>

					<!-- Font Section -->
					<section id="fonts" class="scroll-mt-6">
						<FontSection />
					</section>

					<!-- Text Contrast Section -->
					<section id="contrast" class="scroll-mt-6">
						<ContrastSection />
					</section>

					<!-- Header Section -->
					<section id="header" class="scroll-mt-6">
						<HeaderSection />
					</section>

					<!-- Block Style Section -->
					<section id="blocks" class="scroll-mt-6">
						<BlockStyleSection />
					</section>

					<!-- Spacing Section -->
					<section id="spacing" class="scroll-mt-6">
						<SpacingSection />
					</section>

					<!-- Background Section -->
					<section id="background" class="scroll-mt-6">
						<BackgroundSection />
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
	<aside class="w-[440px] bg-white border-l border-gray-200 flex-shrink-0">
		<div class="sticky top-0 h-[calc(100vh-64px)] flex flex-col">
			<!-- Phone Mockup Container -->
			<div class="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
				<PhoneMockup />
			</div>
		</div>
	</aside>
</div>
