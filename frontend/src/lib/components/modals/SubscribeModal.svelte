<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let loading: boolean = false;

	const dispatch = createEventDispatcher();
	let email = '';

	function handleSubmit() {
		if (!email || !email.includes('@')) return;
		dispatch('submit', email);
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
				<div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900">Subscribe</h3>
					<p class="text-sm text-gray-500 mt-0.5">Get updates via email</p>
				</div>
			</div>
		</div>

		<!-- Content -->
		<form on:submit|preventDefault={handleSubmit} class="px-6 py-5">
			<label class="block">
				<span class="text-sm font-medium text-gray-700 mb-2 block">Email Address</span>
				<input
					type="email"
					bind:value={email}
					placeholder="your@email.com"
					required
					disabled={loading}
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				/>
			</label>
			<p class="text-xs text-gray-500 mt-2">We'll never share your email with anyone else.</p>
		</form>

		<!-- Footer -->
		<div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
			<button
				type="button"
				on:click={handleCancel}
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				type="submit"
				on:click={handleSubmit}
				disabled={loading || !email}
				class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
			>
				{#if loading}
					<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
				{/if}
				Subscribe
			</button>
		</div>
	</div>
</div>
