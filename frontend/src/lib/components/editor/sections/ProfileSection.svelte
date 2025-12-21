<script lang="ts">
	import { page } from '$lib/stores/page';

	function updateField(field: string, value: any) {
		page.update(p => p ? { ...p, [field]: value } : p);
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
		<h2 class="font-semibold text-gray-900">Profile</h2>
		<a href="#" class="text-sm text-blue-600 hover:text-blue-700">Edit profile</a>
	</div>
	
	<div class="p-6">
		<div class="flex items-center gap-4">
			<!-- Avatar -->
			{#if $page?.avatar_url}
				<img src={$page.avatar_url} alt="" class="w-16 h-16 rounded-full object-cover" />
			{:else}
				<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
					<span class="text-2xl text-white">{($page?.title || 'U').charAt(0).toUpperCase()}</span>
				</div>
			{/if}
			
			<!-- Info -->
			<div class="flex-1">
				<input 
					type="text"
					value={$page?.title || ''}
					on:input={(e) => updateField('title', e.currentTarget.value)}
					placeholder="Your name"
					class="text-lg font-semibold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 w-full"
				/>
				<input 
					type="text"
					value={$page?.bio || ''}
					on:input={(e) => updateField('bio', e.currentTarget.value)}
					placeholder="Add a bio..."
					class="text-sm text-gray-500 bg-transparent border-0 p-0 focus:ring-0 w-full mt-1"
				/>
			</div>
		</div>
	</div>
</section>
