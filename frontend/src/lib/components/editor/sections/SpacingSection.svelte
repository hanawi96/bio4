<script lang="ts">
	import { theme, DEFAULT_THEME } from '$lib/stores/page';

	const spacingLevels = [
		{ id: 'compact', name: 'Compact', spacing: 8, description: 'Tight spacing' },
		{ id: 'default', name: 'Default', spacing: 16, description: 'Balanced spacing' },
		{ id: 'spacious', name: 'Spacious', spacing: 24, description: 'Generous spacing' }
	];

	$: currentTheme = $theme || DEFAULT_THEME;
	$: selectedSpacing = currentTheme.spacing <= 10 ? 'compact' : currentTheme.spacing >= 20 ? 'spacious' : 'default';

	function selectSpacing(level: typeof spacingLevels[0]) {
		theme.update(t => t ? { ...t, spacing: level.spacing } : { ...DEFAULT_THEME, spacing: level.spacing });
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Block Spacing</h2>
		<p class="text-sm text-gray-500 mt-1">Adjust space between elements</p>
	</div>
	
	<div class="p-6">
		<div class="grid grid-cols-3 gap-3">
			{#each spacingLevels as level}
				<button
					on:click={() => selectSpacing(level)}
					class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedSpacing === level.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
				>
					<!-- Preview -->
					<div class="mb-3 p-3 bg-gray-50 rounded-lg">
						<div class="space-y-{level.spacing === 8 ? '1' : level.spacing === 16 ? '2' : '3'}">
							<div class="h-3 bg-blue-600 rounded"></div>
							<div class="h-3 bg-blue-600 rounded"></div>
							<div class="h-3 bg-blue-600 rounded"></div>
						</div>
					</div>
					<!-- Info -->
					<p class="text-sm font-medium text-gray-900">{level.name}</p>
					<p class="text-xs text-gray-500 mt-1">{level.description}</p>
				</button>
			{/each}
		</div>
	</div>
</section>
