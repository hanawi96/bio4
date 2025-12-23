<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { themes } from '$lib/stores/themes';
	import { publishChanges, saveStatus } from '$lib/stores/autosave';
	
	// Load themes on mount
	onMount(() => {
		themes.load();
	});
	
	// Suppress params warning
	export let params = {};
	
	$: currentPath = $page.url.pathname;
	let sidebarCollapsed = false;
	let publishing = false;
	let showPublishSuccess = false;

	async function handlePublish() {
		if (publishing) return;
		
		publishing = true;
		try {
			const success = await publishChanges('demo');
			if (success) {
				showPublishSuccess = true;
				setTimeout(() => showPublishSuccess = false, 3000);
			}
		} finally {
			publishing = false;
		}
	}

	// Button text based on status
	$: buttonText = publishing ? 'Publishing...' : $saveStatus === 'saving' ? 'Saving...' : 'Publish';
	$: buttonDisabled = publishing || $saveStatus === 'saving';
</script>

<div class="min-h-screen bg-gray-50 flex">
	<!-- Left Sidebar -->
	<aside class="{sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 fixed h-full transition-all duration-300">
		<!-- Logo with Toggle -->
		<div class="h-16 flex items-center justify-between {sidebarCollapsed ? 'px-4' : 'px-6'} border-b border-gray-200">
			<a href="/" class="flex items-center gap-2">
				<div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
					<span class="text-white text-sm font-bold">B</span>
				</div>
				{#if !sidebarCollapsed}
					<span class="text-lg font-bold text-gray-900">Bio Link</span>
				{/if}
			</a>
			<button
				on:click={() => sidebarCollapsed = !sidebarCollapsed}
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
				title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<svg class="w-4 h-4 transition-transform duration-300 {sidebarCollapsed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				</svg>
			</button>
		</div>

		<!-- Navigation -->
		<nav class="p-4 space-y-1">

			<a 
				href="/dashboard" 
				class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				title={sidebarCollapsed ? 'Overview' : ''}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
				{#if !sidebarCollapsed}
					<span>Overview</span>
				{/if}
			</a>

			<a 
				href="/dashboard/profile" 
				class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/profile' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				title={sidebarCollapsed ? 'Profile' : ''}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
				{#if !sidebarCollapsed}
					<span>Profile</span>
				{/if}
			</a>

			<a 
				href="/dashboard/bio" 
				class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/bio' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				title={sidebarCollapsed ? 'My Bio' : ''}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
				</svg>
				{#if !sidebarCollapsed}
					<span>My Bio</span>
				{/if}
			</a>

			<a 
				href="/dashboard/appearance" 
				class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/appearance' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				title={sidebarCollapsed ? 'Appearance' : ''}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
				</svg>
				{#if !sidebarCollapsed}
					<span>Appearance</span>
				{/if}
			</a>

			<a 
				href="/dashboard/analytics" 
				class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/analytics' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				title={sidebarCollapsed ? 'Analytics' : ''}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				{#if !sidebarCollapsed}
					<span>Analytics</span>
				{/if}
			</a>

			<div class="pt-4 mt-4 border-t border-gray-200">
				<a 
					href="/dashboard/settings" 
					class="flex items-center {sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/settings' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
					title={sidebarCollapsed ? 'Settings' : ''}
				>
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{#if !sidebarCollapsed}
						<span>Settings</span>
					{/if}
				</a>
			</div>
		</nav>

		<!-- User Profile (Bottom) -->
		{#if !sidebarCollapsed}
			<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
						<span class="text-gray-500">👤</span>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate">Demo User</p>
						<p class="text-xs text-gray-500 truncate">demo@example.com</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white flex justify-center">
				<div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
					<span class="text-gray-500">👤</span>
				</div>
			</div>
		{/if}
	</aside>

	<!-- Main Content -->
	<div class="flex-1 transition-all duration-300 {sidebarCollapsed ? 'ml-20' : 'ml-64'}">
		<!-- Top Header -->
		<header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
			<div class="flex items-center gap-4">
				<h1 class="text-lg font-semibold text-gray-900">
					{#if currentPath === '/dashboard'}
						Overview
					{:else if currentPath === '/dashboard/profile'}
						Profile
					{:else if currentPath === '/dashboard/bio'}
						My Bio
					{:else if currentPath === '/dashboard/appearance'}
						Appearance
					{:else if currentPath === '/dashboard/analytics'}
						Analytics
					{:else if currentPath === '/dashboard/settings'}
						Settings
					{/if}
				</h1>
			</div>
			<div class="flex items-center gap-3">
				<!-- Save Status Indicator -->
				{#if $saveStatus === 'saved'}
					<div class="flex items-center gap-2 text-green-600 text-sm">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="font-medium">Saved</span>
					</div>
				{:else if $saveStatus === 'error'}
					<div class="flex items-center gap-2 text-red-600 text-sm">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
						<span class="font-medium">Error</span>
					</div>
				{/if}

				<a 
					href="/demo" 
					target="_blank" 
					class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
					</svg>
					View Page
				</a>
				<button 
					on:click={handlePublish}
					disabled={buttonDisabled}
					class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
				>
					{#if publishing || $saveStatus === 'saving'}
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					{/if}
					{buttonText}
				</button>
			</div>
		</header>

		<!-- Publish Success Toast -->
		{#if showPublishSuccess}
			<div 
				class="fixed top-20 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
				<span class="font-medium">Published successfully!</span>
			</div>
		{/if}

		<!-- Page Content -->
		<main>
			<slot />
		</main>
	</div>
</div>
