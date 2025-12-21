<script lang="ts">
	import PresetPicker from './PresetPicker.svelte';
	import GlobalStylePanel from './GlobalStylePanel.svelte';
	import SectionOverridePanel from './SectionOverridePanel.svelte';

	let activeTab = 'preset'; // preset | global | sections
</script>

<div class="h-full flex flex-col">
	<div class="flex border-b">
		<button 
			class="px-4 py-2 {activeTab === 'preset' ? 'border-b-2 border-blue-500' : ''}"
			on:click={() => activeTab = 'preset'}
		>Preset</button>
		<button 
			class="px-4 py-2 {activeTab === 'global' ? 'border-b-2 border-blue-500' : ''}"
			on:click={() => activeTab = 'global'}
		>Global</button>
		<button 
			class="px-4 py-2 {activeTab === 'sections' ? 'border-b-2 border-blue-500' : ''}"
			on:click={() => activeTab = 'sections'}
		>Sections</button>
	</div>
	
	<div class="flex-1 overflow-y-auto p-6">
		{#if activeTab === 'preset'}
			<PresetPicker />
		{:else if activeTab === 'global'}
			<GlobalStylePanel />
		{:else}
			<SectionOverridePanel sectionId="header" />
		{/if}
	</div>
</div>
