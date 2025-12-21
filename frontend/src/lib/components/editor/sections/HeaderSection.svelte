<script lang="ts">
	let activeTab = 'Minimal';
	const tabs = ['All header', 'Minimal', 'Banner', 'Portrait', 'Shapes'];

	const headerStyles = [
		{ id: 'minimal', name: 'Minimal', preview: 'centered' },
		{ id: 'banner', name: 'Banner', preview: 'banner' },
		{ id: 'portrait', name: 'Portrait', preview: 'portrait' },
		{ id: 'shapes', name: 'Shapes', preview: 'shapes' }
	];

	let selectedStyle = 'minimal';
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Header</h2>
	</div>
	
	<div class="p-6">
		<!-- Tabs -->
		<div class="flex gap-2 mb-6 overflow-x-auto">
			{#each tabs as tab}
				<button 
					class="px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition {activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					on:click={() => activeTab = tab}
				>
					{#if tab === 'All header'}
						<span class="mr-1">+</span>
					{/if}
					{tab}
				</button>
			{/each}
		</div>

		<!-- Header Styles Grid -->
		<div class="grid grid-cols-4 gap-4">
			{#each headerStyles as style}
				<button
					on:click={() => selectedStyle = style.id}
					class="rounded-xl overflow-hidden border-2 transition-all hover:scale-105 {selectedStyle === style.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}"
				>
					<!-- Preview -->
					<div class="aspect-[3/4] bg-gradient-to-b from-green-800 to-green-900 p-4 flex flex-col items-center justify-center">
						{#if style.preview === 'centered'}
							<div class="w-10 h-10 bg-white rounded-full mb-2"></div>
							<div class="text-[8px] text-white font-medium">HANAWI</div>
							<div class="text-[6px] text-white/70 mt-1">Description</div>
							<div class="flex gap-1 mt-2">
								<div class="w-3 h-3 bg-white/30 rounded-full"></div>
								<div class="w-3 h-3 bg-white/30 rounded-full"></div>
								<div class="w-3 h-3 bg-white/30 rounded-full"></div>
							</div>
						{:else if style.preview === 'banner'}
							<div class="w-full h-8 bg-white/20 rounded mb-2"></div>
							<div class="w-8 h-8 bg-white rounded-full mb-1"></div>
							<div class="text-[8px] text-white font-medium">HANAWI</div>
						{:else if style.preview === 'portrait'}
							<div class="w-12 h-16 bg-white/90 rounded mb-2"></div>
							<div class="text-[8px] text-white font-medium">HANAWI</div>
						{:else}
							<div class="w-10 h-10 bg-white rotate-45 mb-2"></div>
							<div class="text-[8px] text-white font-medium">HANAWI</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
</section>
