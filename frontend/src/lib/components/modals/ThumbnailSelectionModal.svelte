<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function selectUpload() {
		dispatch('select', { type: 'upload' });
	}

	function selectIcon() {
		dispatch('select', { type: 'icon' });
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" on:click={handleCancel}></div>

<!-- Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in" on:click|stopPropagation>
		<!-- Header -->
		<div class="px-8 pt-8 pb-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold text-gray-900">Select thumbnail image</h2>
			<button 
				on:click={handleCancel}
				class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Options -->
		<div class="px-8 pb-8 space-y-4">
			<!-- Option 1: Upload -->
			<button
				on:click={selectUpload}
				class="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
			>
				<div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
					<svg class="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
				</div>
				<span class="flex-1 text-left text-lg font-semibold text-gray-900">Upload your own</span>
				<svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>

			<!-- Option 2: Icons -->
			<button
				on:click={selectIcon}
				class="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
			>
				<div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
					<svg class="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
					</svg>
				</div>
				<span class="flex-1 text-left text-lg font-semibold text-gray-900">Choose from Tabler Icons</span>
				<svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</div>
</div>

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
