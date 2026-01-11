<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	export let title = 'Confirm Action';
	export let message = 'Are you sure you want to proceed?';
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';
	export let variant: 'danger' | 'warning' | 'info' = 'danger';
	export let icon: 'trash' | 'warning' | 'info' | 'restore' = 'warning';
	export let warningMessage: string | null = null;

	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}

	function handleConfirm() {
		dispatch('confirm');
		close();
	}

	function handleCancel() {
		dispatch('cancel');
		close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			handleCancel();
		} else if (e.key === 'Enter') {
			handleConfirm();
		}
	}

	// Icon and color mappings
	$: iconColor = variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue';
	$: buttonColor = variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue';
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div class="modal-backdrop" on:click={handleCancel}></div>

	<!-- Modal -->
	<div class="modal-container">
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<div class="modal-header-content">
					<div class="modal-icon modal-icon-{iconColor}">
						{#if icon === 'trash'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						{:else if icon === 'warning'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						{:else if icon === 'restore'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						{:else}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<div class="flex-1">
						<h2 class="modal-title">{title}</h2>
						<p class="modal-subtitle">This action cannot be undone</p>
					</div>
					<button on:click={handleCancel} class="modal-close-btn">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="modal-body">
				<p class="modal-message">{@html message}</p>
				
				{#if warningMessage}
					<div class="modal-warning modal-warning-{iconColor}">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<p class="modal-warning-title">Warning</p>
								<p class="modal-warning-text">{@html warningMessage}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button on:click={handleCancel} class="modal-btn-cancel">
					{cancelText}
				</button>
				<button on:click={handleConfirm} class="modal-btn-confirm modal-btn-confirm-{buttonColor}">
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
