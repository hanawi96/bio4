<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import QRCode from 'qrcode';

	export let bioUrl: string;
	export let username: string;
	export let avatarUrl: string | null = null;

	const dispatch = createEventDispatcher();

	let qrDataUrl = '';
	let showProfilePicture = true;
	let canvas: HTMLCanvasElement;
	let generating = true;

	onMount(async () => {
		await generateQR();
	});

	async function generateQR() {
		generating = true;
		try {
			// Generate QR code
			qrDataUrl = await QRCode.toDataURL(bioUrl, {
				width: 400,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});
		} catch (error) {
			console.error('Failed to generate QR code:', error);
		} finally {
			generating = false;
		}
	}

	async function downloadQR() {
		const link = document.createElement('a');
		link.download = `${username}-qr-code.png`;
		link.href = qrDataUrl;
		link.click();
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" on:click={handleClose}></div>

<!-- Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in" on:click|stopPropagation>
		<!-- Header -->
		<div class="px-8 pt-8 pb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900">Share QR Code</h2>
			</div>
			<button 
				on:click={handleClose}
				class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="px-8 pb-8">
			<!-- QR Code Display -->
			<div class="relative bg-white rounded-2xl p-6 border-2 border-gray-200 mb-6">
				{#if generating}
					<div class="flex items-center justify-center h-[400px]">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
					</div>
				{:else}
					<div class="relative">
						<img src={qrDataUrl} alt="QR Code" class="w-full h-auto rounded-lg" />
						
						<!-- Profile Picture Overlay -->
						{#if showProfilePicture && avatarUrl}
							<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<div class="w-20 h-20 rounded-full bg-white p-2 shadow-lg">
									<img src={avatarUrl} alt="Profile" class="w-full h-full rounded-full object-cover" />
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Show Profile Picture Toggle -->
			{#if avatarUrl}
				<div class="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
					<span class="text-sm font-medium text-gray-700">Show Profile Picture</span>
					<button
						type="button"
						on:click={() => showProfilePicture = !showProfilePicture}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {showProfilePicture ? 'bg-[#00aa4f]' : 'bg-gray-300'}"
					>
						<span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm {showProfilePicture ? 'translate-x-[22px]' : 'translate-x-0.5'}"></span>
					</button>
				</div>
			{/if}

			<!-- Download Button -->
			<button
				on:click={downloadQR}
				disabled={generating}
				class="w-full px-6 py-4 bg-[#00aa4f] text-white text-base font-semibold rounded-xl hover:bg-[#008f42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				style="box-shadow: 0 2px 8px rgba(0, 170, 79, 0.2);"
			>
				Download QR Code
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
