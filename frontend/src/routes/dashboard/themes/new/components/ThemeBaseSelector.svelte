<script lang="ts">
	import type { ThemePreset } from '$lib/types';

	export let baseThemeKey: string;
	export let themes: ThemePreset[];

	// Category badge colors
	const categoryColors: Record<string, { bg: string; text: string }> = {
		minimal: { bg: 'bg-[#e6f7ed]', text: 'text-[#00aa4f]' },
		modern: { bg: 'bg-purple-100', text: 'text-purple-700' },
		creative: { bg: 'bg-pink-100', text: 'text-pink-700' },
		professional: { bg: 'bg-gray-100', text: 'text-gray-700' },
		default: { bg: 'bg-gray-100', text: 'text-gray-700' }
	};

	function getCategoryColor(category: string) {
		return categoryColors[category] || categoryColors.default;
	}
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Base Theme</h2>
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-3">
			Start from existing theme
		</label>
		
		<div class="grid grid-cols-2 gap-3">
			{#each themes as theme}
				{@const isSelected = baseThemeKey === theme.key}
				{@const colors = getCategoryColor(theme.config?.meta?.category || 'default')}
				<button
					type="button"
					on:click={() => baseThemeKey = theme.key}
					class="group relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] text-left {isSelected 
						? 'border-[#00aa4f] bg-[#e6f7ed]' 
						: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}"
				>
					<!-- Theme Name -->
					<div class="flex items-start justify-between gap-2 mb-2">
						<h3 class="font-semibold text-sm {isSelected ? 'text-[#00aa4f]' : 'text-gray-900'}">
							{theme.name}
						</h3>
						{#if isSelected}
							<svg class="w-5 h-5 text-[#00aa4f] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>

					<!-- Category Badge -->
					{#if theme.config?.meta?.category}
						<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {colors.bg} {colors.text} capitalize">
							{theme.config.meta.category}
						</span>
					{/if}

					<!-- Description (if exists) -->
					{#if theme.config?.meta?.description}
						<p class="text-xs text-gray-500 mt-2 line-clamp-2">
							{theme.config.meta.description}
						</p>
					{/if}
				</button>
			{/each}
		</div>

		<p class="text-xs text-gray-500 mt-3">
			The configuration will be loaded and you can edit it below
		</p>
	</div>
</section>
