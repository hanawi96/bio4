<script lang="ts">
	import { theme } from '$lib/stores/page';
	import { DEFAULT_THEME } from '$lib/stores/appearance';

	const contrastLevels = [
		{ id: 'soft', name: 'Soft', textColor: '#6b7280', description: 'Subtle, easy on eyes' },
		{ id: 'default', name: 'Default', textColor: '#374151', description: 'Balanced contrast' },
		{ id: 'strong', name: 'Strong', textColor: '#111827', description: 'High readability' }
	];

	let selectedContrast = 'default';

	function selectContrast(level: typeof contrastLevels[0]) {
		selectedContrast = level.id;
		theme.update(t => t ? { ...t, textColor: level.textColor } : { ...DEFAULT_THEME, textColor: level.textColor });
	}
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Text Contrast</h2>
		<p class="text-sm text-gray-500 mt-1">Adjust text readability</p>
	</div>
	
	<div class="p-6">
		<div class="grid grid-cols-3 gap-3">
			{#each contrastLevels as level}
				<button
					on:click={() => selectContrast(level)}
					class="p-4 rounded-xl border-2 transition-all hover:scale-105 {selectedContrast === level.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
				>
					<!-- Preview -->
					<div class="mb-3 p-3 bg-white rounded-lg border border-gray-100">
						<div 
							class="text-2xl font-bold mb-1"
							style="color: {level.textColor};"
						>
							Aa
						</div>
						<div 
							class="text-xs"
							style="color: {level.textColor}; opacity: 0.7;"
						>
							Sample text
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
