<script lang="ts">
	import { page } from '$lib/stores/page';
</script>

<div class="flex flex-col items-center gap-4 p-8">
	{#if $page?.avatar_url}
		<img 
			src={$page.avatar_url} 
			alt={$page.title || 'Avatar'}
			class="w-24 h-24 rounded-full object-cover"
		/>
	{:else}
		<div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
			<span class="text-2xl text-gray-400">👤</span>
		</div>
	{/if}
	
	<h1 class="text-2xl font-bold">{$page?.title || 'Your Name'}</h1>
	
	{#if $page?.bio}
		<p class="text-center max-w-md opacity-80">{$page.bio}</p>
	{/if}
</div>
