<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isOpen = false;
	let groupName = '';
	let inputElement: HTMLInputElement;

	export function open(currentName: string) {
		groupName = currentName;
		isOpen = true;
		setTimeout(() => inputElement?.focus(), 100);
	}

	export function close() {
		isOpen = false;
		groupName = '';
	}

	function handleSubmit() {
		if (groupName.trim()) {
			dispatch('rename', groupName.trim());
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Enter') {
			handleSubmit();
		} else if (e.key === 'Escape') {
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
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-bold text-gray-900">Rename Group</h2>
						<p class="text-sm text-gray-500 mt-0.5">Enter a new name for this group</p>
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
				<label class="block text-sm font-semibold text-gray-700 mb-2">
					Group Name
				</label>
				<input
					bind:this={inputElement}
					bind:value={groupName}
					type="text"
					placeholder="Enter group name..."
					class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
				/>
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
					on:click={handleSubmit}
					disabled={!groupName.trim()}
					class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Save
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
