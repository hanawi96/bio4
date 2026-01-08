<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import Toast from './Toast.svelte';

	function handleDismiss(id: string) {
		toast.dismiss(id);
	}
</script>

<!-- Toast Container - Bottom Right -->
<div
	class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
	style="max-width: calc(100vw - 3rem);"
>
	{#each $toast as toastItem (toastItem.id)}
		<div class="pointer-events-auto">
			<Toast toast={toastItem} onDismiss={() => handleDismiss(toastItem.id)} />
		</div>
	{/each}
</div>
