<script lang="ts">
	import { page as pageStore } from '$lib/stores/page';
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Settings</h1>
		<p class="text-gray-500 mt-1">Manage your account and preferences</p>
	</div>

	<div class="space-y-6">
		<!-- Account Section -->
		<div class="bg-white rounded-xl border border-gray-200">
			<div class="p-6 border-b border-gray-100">
				<h2 class="font-semibold text-gray-900">Account</h2>
			</div>
			<div class="p-6 space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
					<div class="flex items-center gap-2">
						<span class="text-gray-500">biolink.com/</span>
						<input 
							type="text" 
							value={$pageStore?.username || ''}
							disabled
							class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
						/>
					</div>
					<p class="text-xs text-gray-400 mt-1">Username cannot be changed</p>
				</div>
			</div>
		</div>

		<!-- Page Settings -->
		<div class="bg-white rounded-xl border border-gray-200">
			<div class="p-6 border-b border-gray-100">
				<h2 class="font-semibold text-gray-900">Page Settings</h2>
			</div>
			<div class="p-6 space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900">Page Status</p>
						<p class="text-sm text-gray-500">Make your page visible to everyone</p>
					</div>
					<span class="px-3 py-1 text-sm rounded-full {$pageStore?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
						{$pageStore?.status || 'draft'}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900">Theme Mode</p>
						<p class="text-sm text-gray-500">Current theme appearance</p>
					</div>
					<span class="text-gray-600">{$pageStore?.theme_mode || 'light'}</span>
				</div>
			</div>
		</div>

		<!-- Danger Zone -->
		<div class="bg-white rounded-xl border border-red-200">
			<div class="p-6 border-b border-red-100">
				<h2 class="font-semibold text-red-600">Danger Zone</h2>
			</div>
			<div class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900">Delete Page</p>
						<p class="text-sm text-gray-500">Permanently delete your bio page</p>
					</div>
					<button class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
						Delete
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
