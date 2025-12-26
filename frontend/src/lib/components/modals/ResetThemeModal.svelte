<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let themeName: string = 'Default';
	export let loading: boolean = false;

	const dispatch = createEventDispatcher();

	function handleConfirm() {
		dispatch('confirm');
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
	<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
		<!-- Header -->
		<div class="px-6 py-5 border-b border-gray-200">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
					<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900">Reset to Theme Default</h3>
					<p class="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="px-6 py-5">
			<p class="text-gray-700 leading-relaxed">
				Are you sure you want to reset all customizations and restore the <span class="font-semibold text-gray-900">{themeName}</span> theme to its default settings?
			</p>
			<div class="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
				<div class="flex items-start gap-2">
					<svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
					</svg>
					<div class="flex-1">
						<p class="text-sm font-medium text-orange-900">All changes will be lost</p>
						<p class="text-xs text-orange-700 mt-1">Colors, fonts, spacing, header, and block customizations will be removed.</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
			<button
				on:click={handleCancel}
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				on:click={handleConfirm}
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
			>
				{#if loading}
					<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
				{/if}
				Reset Theme
			</button>
		</div>
	</div>
</div>
