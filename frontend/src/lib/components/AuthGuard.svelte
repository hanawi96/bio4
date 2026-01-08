<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { api } from '$lib/api.client';

	onMount(async () => {
		authStore.init();
		const token = authStore.getToken();
		
		if (!token) {
			goto('/login');
			return;
		}

		try {
			const response = await api.getMe();
			authStore.setUser(response.user);
		} catch (error) {
			authStore.logout();
			goto('/login');
		}
	});
</script>

<slot />
