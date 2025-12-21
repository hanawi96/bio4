<script lang="ts">
	import { groups } from '$lib/stores/page';
</script>

<div class="flex flex-col gap-6 px-8 max-w-2xl mx-auto">
	{#each $groups as group}
		{#if group.title}
			<h3 class="text-sm font-semibold opacity-60 uppercase tracking-wide">{group.title}</h3>
		{/if}
		
		<div class="flex flex-col gap-3">
			{#each group.links.filter(l => l.is_active === 1) as link}
				<a 
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="block px-6 py-4 text-center rounded-lg border-2 hover:scale-[1.02] transition-transform"
					style="border-color: var(--primary-color); border-radius: var(--border-radius)"
				>
					{#if link.icon_url}
						<img src={link.icon_url} alt="" class="w-5 h-5 inline-block mr-2" />
					{/if}
					{link.title}
				</a>
			{/each}
		</div>
	{:else}
		<p class="text-center opacity-50 py-8">No links yet</p>
	{/each}
</div>
