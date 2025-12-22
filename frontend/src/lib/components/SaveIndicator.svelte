<script lang="ts">
	import { saveStatus, lastSaved, publishChanges } from '$lib/stores/autosave';
	import { fade } from 'svelte/transition';

	export let username: string;

	let showPublishSuccess = false;

	async function handlePublish() {
		const success = await publishChanges(username);
		if (success) {
			showPublishSuccess = true;
			setTimeout(() => showPublishSuccess = false, 3000);
		}
	}

	$: statusText = {
		idle: '',
		saving: 'Đang lưu...',
		saved: 'Đã lưu',
		error: 'Lỗi lưu'
	}[$saveStatus];

	$: statusColor = {
		idle: 'text-gray-400',
		saving: 'text-blue-600',
		saved: 'text-green-600',
		error: 'text-red-600'
	}[$saveStatus];
</script>

<div class="flex items-center gap-4">
	<!-- Save Status -->
	{#if $saveStatus !== 'idle'}
		<div class="flex items-center gap-2 {statusColor}" transition:fade={{ duration: 200 }}>
			{#if $saveStatus === 'saving'}
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			{:else if $saveStatus === 'saved'}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
			{:else if $saveStatus === 'error'}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			{/if}
			<span class="text-sm font-medium">{statusText}</span>
		</div>
	{/if}

	<!-- Publish Button -->
	<button
		on:click={handlePublish}
		disabled={$saveStatus === 'saving'}
		class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
	>
		Xuất bản
	</button>

	<!-- Publish Success Toast -->
	{#if showPublishSuccess}
		<div 
			class="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
			transition:fade={{ duration: 200 }}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
			<span class="font-medium">Đã xuất bản thành công!</span>
		</div>
	{/if}
</div>
