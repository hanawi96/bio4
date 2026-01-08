<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let lockType: 'code' | 'password' = 'code';
	export let linkTitle = '';
	
	const dispatch = createEventDispatcher();
	
	let inputValue = '';
	let error = '';
	let isVerifying = false;

	function close() {
		isOpen = false;
		inputValue = '';
		error = '';
		isVerifying = false;
		dispatch('close');
	}

	async function handleSubmit() {
		if (!inputValue.trim()) {
			error = lockType === 'code' ? 'Vui lòng nhập code' : 'Vui lòng nhập password';
			return;
		}

		isVerifying = true;
		error = '';
		
		dispatch('verify', { value: inputValue.trim() });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSubmit();
		} else if (e.key === 'Escape') {
			close();
		}
	}

	// Reset when modal opens
	$: if (isOpen) {
		inputValue = '';
		error = '';
		isVerifying = false;
	}

	// Allow parent to set error
	export function setError(msg: string) {
		error = msg;
		isVerifying = false;
	}

	export function setVerifying(value: boolean) {
		isVerifying = value;
	}
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		on:click={close}
	>
		<div 
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in"
			on:click={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-bold text-gray-900">🔒 Link bị khóa</h3>
						<p class="text-xs text-gray-500 mt-0.5">Nhập {lockType === 'code' ? 'code' : 'password'} để truy cập</p>
					</div>
				</div>
				<button
					on:click={close}
					class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Link Title -->
			{#if linkTitle}
				<div class="mb-4 p-3 bg-gray-50 rounded-lg">
					<p class="text-sm text-gray-600 font-medium truncate">{linkTitle}</p>
				</div>
			{/if}

			<!-- Input -->
			<div class="mb-4">
				<label class="block text-sm font-semibold text-gray-700 mb-2">
					{lockType === 'code' ? 'Code' : 'Password'}
				</label>
				{#if lockType === 'password'}
					<input
						type="password"
						bind:value={inputValue}
						on:keydown={handleKeydown}
						placeholder="Nhập password"
						class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
						disabled={isVerifying}
						autofocus
					/>
				{:else}
					<input
						type="text"
						bind:value={inputValue}
						on:keydown={handleKeydown}
						placeholder="Nhập code (VD: SALE2024)"
						class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
						disabled={isVerifying}
						autofocus
					/>
				{/if}
				{#if error}
					<p class="text-xs text-red-500 mt-2">{error}</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex gap-3">
				<button
					on:click={close}
					class="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
					disabled={isVerifying}
				>
					Hủy
				</button>
				<button
					on:click={handleSubmit}
					class="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isVerifying}
				>
					{isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
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

	.animate-scale-in {
		animation: scale-in 0.15s ease-out;
	}
</style>
