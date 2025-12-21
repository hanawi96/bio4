<script lang="ts">
	import { page } from '$app/stores';
	
	$: currentPath = $page.url.pathname;
</script>

<div class="min-h-screen bg-gray-50 flex">
	<!-- Left Sidebar -->
	<aside class="w-64 bg-white border-r border-gray-200 fixed h-full">
		<!-- Logo -->
		<div class="h-16 flex items-center px-6 border-b border-gray-200">
			<a href="/" class="flex items-center gap-2">
				<div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
					<span class="text-white text-sm font-bold">B</span>
				</div>
				<span class="text-lg font-bold text-gray-900">Bio Link</span>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="p-4 space-y-1">
			<a 
				href="/dashboard" 
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
				Overview
			</a>

			<a 
				href="/dashboard/editor" 
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/editor' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
				</svg>
				Editor
			</a>

			<a 
				href="/dashboard/links" 
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/links' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
				Links
			</a>

			<a 
				href="/dashboard/appearance" 
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/appearance' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
				</svg>
				Appearance
			</a>

			<a 
				href="/dashboard/analytics" 
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/analytics' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				Analytics
			</a>

			<div class="pt-4 mt-4 border-t border-gray-200">
				<a 
					href="/dashboard/settings" 
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {currentPath === '/dashboard/settings' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					Settings
				</a>
			</div>
		</nav>

		<!-- User Profile (Bottom) -->
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
	</aside>

	<!-- Main Content -->
	<div class="flex-1 ml-64">
		<!-- Top Header -->
		<header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
			<div class="flex items-center gap-4">
				<h1 class="text-lg font-semibold text-gray-900">
					{#if currentPath === '/dashboard'}
						Overview
					{:else if currentPath === '/dashboard/editor'}
						Editor
					{:else if currentPath === '/dashboard/links'}
						Links
					{:else if currentPath === '/dashboard/appearance'}
						Appearance
					{:else if currentPath === '/dashboard/analytics'}
						Analytics
					{:else if currentPath === '/dashboard/settings'}
						Settings
					{/if}
				</h1>
			</div>
			<div class="flex items-center gap-4">
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
				<button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
					Publish
				</button>
			</div>
		</header>

		<!-- Page Content -->
		<main>
			<slot />
		</main>
	</div>
</div>
