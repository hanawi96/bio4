<script lang="ts">
	import { onMount } from 'svelte';
	import { page, groups, theme, DEFAULT_THEME, applyCSSVariables } from '$lib/stores/page';

	let screenElement: HTMLElement;

	// Apply CSS variables directly to DOM when theme changes
	$: if (screenElement && $theme) {
		applyCSSVariables(screenElement, $theme);
	}

	// Initialize with default theme on mount
	onMount(() => {
		if (screenElement) {
			applyCSSVariables(screenElement, $theme || DEFAULT_THEME);
		}
	});
</script>

<!-- Phone Frame -->
<div class="relative scale-125">
	<!-- Phone Shell -->
	<div class="w-[280px] h-[580px] bg-gray-900 rounded-[40px] p-2 shadow-2xl">
		<!-- Screen -->
		<div 
			bind:this={screenElement}
			class="w-full h-full rounded-[36px] overflow-hidden relative"
		>
			<!-- Notch -->
			<div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

			<!-- Content -->
			<div 
				class="w-full h-full overflow-y-auto scrollbar-hide"
				style="background: var(--bg-color); color: var(--text-color); font-family: var(--font-family), sans-serif;"
			>
				<div class="pt-10 pb-8 px-4">
					<!-- Avatar -->
					<div class="flex flex-col items-center mb-6">
						{#if $page?.avatar_url}
							<img 
								src={$page.avatar_url} 
								alt="" 
								class="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-white/20"
							/>
						{:else}
							<div 
								class="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl"
								style="background: var(--primary-color); color: white;"
							>
								{($page?.title || 'U').charAt(0).toUpperCase()}
							</div>
						{/if}
						<h1 class="text-lg font-bold text-center">{$page?.title || 'Your Name'}</h1>
						{#if $page?.bio}
							<p class="text-sm opacity-70 text-center mt-1 px-4">{$page.bio}</p>
						{/if}
					</div>

					<!-- Links -->
					<div class="space-y-3">
						{#each $groups as group}
							{#each group.links.filter(l => l.is_active === 1) as link}
								<a 
									href={link.url}
									target="_blank"
									rel="noopener"
									class="block w-full py-3 px-4 text-center text-sm font-medium rounded-xl transition-transform hover:scale-[1.02]"
									style="
										background: var(--primary-color);
										color: white;
										border-radius: var(--border-radius);
									"
								>
									{link.title}
								</a>
							{/each}
						{:else}
							<div class="text-center py-8 opacity-50">
								<p class="text-sm">No links yet</p>
							</div>
						{/each}
					</div>

					<!-- Footer -->
					<div class="mt-8 text-center">
						<p class="text-xs opacity-40">Made with Bio Link</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Home Indicator -->
	<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
