<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.client';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	onMount(() => {
		// Redirect if already logged in
		if ($authStore.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleLogin() {
		if (!email || !password) {
			error = 'Vui lòng nhập đầy đủ thông tin';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await api.login({ email, password });
			authStore.setAuth(response.user, response.token);
			goto('/dashboard');
		} catch (e: any) {
			error = e.message || 'Đăng nhập thất bại';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
				<span class="text-3xl">🔗</span>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Đăng nhập</h1>
			<p class="text-gray-600 mt-2">Chào mừng bạn quay lại!</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if error}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin} class="space-y-5">
				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						on:keypress={handleKeyPress}
						disabled={loading}
						placeholder="your@email.com"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
						required
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Mật khẩu
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						on:keypress={handleKeyPress}
						disabled={loading}
						placeholder="••••••••"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
						required
					/>
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{#if loading}
						<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>Đang đăng nhập...</span>
					{:else}
						<span>Đăng nhập</span>
					{/if}
				</button>
			</form>

			<!-- Register Link -->
			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600">
					Chưa có tài khoản?
					<a href="/register" class="text-blue-600 hover:text-blue-700 font-medium">
						Đăng ký ngay
					</a>
				</p>
			</div>
		</div>

		<!-- Back to Home -->
		<div class="mt-6 text-center">
			<a href="/" class="text-sm text-gray-600 hover:text-gray-900">
				← Về trang chủ
			</a>
		</div>
	</div>
</div>
