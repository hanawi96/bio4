<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isOpen = false;
	let groupName = '';
	let linkCount = 0;

	export function open(name: string, count: number) {
		groupName = name;
		linkCount = count;
		isOpen = true;
	}

	export function close() {
		isOpen = false;
		groupName = '';
		linkCount = 0;
	}

	function handleConfirm() {
		dispatch('confirm');
		close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" on:click={close}></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
			<!-- Header -->
			<div class="px-6 py-5 border-b border-gray-200">
				<div class="flex items-start gap-4">
					<div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div class="flex-1">
						<h2 class="text-xl font-bold text-gray-900">Delete Group</h2>
						<p class="text-sm text-gray-500 mt-1">This action cannot be undone</p>
					</div>
					<button on:click={close} class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="px-6 py-6">
				<p class="text-sm text-gray-700 mb-4">
					Are you sure you want to delete <span class="font-semibold text-gray-900">"{groupName}"</span>?
				</p>
				
				{#if linkCount > 0}
					<div class="bg-red-50 border border-red-200 rounded-xl p-4">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<p class="text-sm font-semibold text-red-900">Warning</p>
								<p class="text-sm text-red-700 mt-1">
									This group contains <span class="font-semibold">{linkCount} {linkCount === 1 ? 'link' : 'links'}</span> that will also be permanently deleted.
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
				<button
					on:click={close}
					class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					on:click={handleConfirm}
					class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Delete Group
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
