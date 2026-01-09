<script lang="ts">
	import { api } from '$lib/api.client';
	import { authStore } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';

	interface Subscriber {
		id: number;
		page_id: number;
		email: string;
		ip_address: string | null;
		created_at: string;
	}

	let loading = true;
	let subscribers: Subscriber[] = [];
	let total = 0;
	let error = '';
	let initialized = false;

	// Reactive: Load when user is ready
	$: if ($authStore.user?.username && !initialized) {
		initialized = true;
		loadSubscribers();
	}

	async function loadSubscribers() {
		loading = true;
		error = '';
		
		try {
			const username = $authStore.user?.username;
			if (!username) {
				error = 'Username not found. Please try refreshing the page.';
				return;
			}

			const data = await api.getSubscribers(username);
			subscribers = data.subscribers;
			total = data.total;
		} catch (e: any) {
			console.error('Failed to load subscribers:', e);
			error = e.message || 'Failed to load subscribers';
			toast.error(error);
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function copyEmails() {
		const emails = subscribers.map(s => s.email).join(', ');
		await navigator.clipboard.writeText(emails);
		toast.success('Emails copied to clipboard!');
	}
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Subscribers</h1>
		<p class="text-gray-500 mt-1">Manage your email subscribers</p>
	</div>

	<!-- Stats Card -->
	<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-gray-500">Total Subscribers</p>
				<p class="text-3xl font-bold text-gray-900 mt-1">{total}</p>
			</div>
			<div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			</div>
		</div>
	</div>

	<!-- Subscribers List -->
	<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
		<!-- Header -->
		<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
			<h2 class="font-semibold text-gray-900">Subscriber List</h2>
			{#if subscribers.length > 0}
				<button
					on:click={copyEmails}
					class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					Copy All Emails
				</button>
			{/if}
		</div>

		<!-- Content -->
		{#if loading}
			<div class="p-12 text-center">
				<div class="inline-block animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full"></div>
				<p class="text-gray-500 mt-4">Loading subscribers...</p>
			</div>
		{:else if error}
			<div class="p-12 text-center">
				<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="text-gray-900 font-medium mt-4">{error}</p>
				<button
					on:click={loadSubscribers}
					class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
				>
					Try Again
				</button>
			</div>
		{:else if subscribers.length === 0}
			<div class="p-12 text-center">
				<svg class="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				<h3 class="text-lg font-medium text-gray-900 mt-4">No subscribers yet</h3>
				<p class="text-gray-500 mt-2">When people subscribe to your page, they'll appear here.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each subscribers as subscriber}
							<tr class="hover:bg-gray-50 transition">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										<span class="text-sm text-gray-900">{subscriber.email}</span>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{formatDate(subscriber.created_at)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{subscriber.ip_address || 'N/A'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
