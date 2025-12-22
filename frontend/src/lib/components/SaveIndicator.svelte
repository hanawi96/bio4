<script lang="ts">
	import { saveStatus, lastSaved } from '$lib/stores/autosave';
	import { fade } from 'svelte/transition';

	export let username: string;

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
</div>
