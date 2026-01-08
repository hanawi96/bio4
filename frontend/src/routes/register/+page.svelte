<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.client';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let username = '';
	let loading = false;
	let error = '';

	onMount(() => {
		// Redirect if already logged in
		if ($authStore.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleRegister() {
		if (!email || !password || !confirmPassword || !username) {
			error = 'Vui lòng nhập đầy đủ thông tin';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Mật khẩu xác nhận không khớp';
			return;
		}

		if (password.length < 6) {
			error = 'Mật khẩu phải có ít nhất 6 ký tự';
			return;
		}

		if (username.length < 3) {
			error = 'Link bio phải có ít nhất 3 ký tự';
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			error = 'Link bio chỉ được chứa chữ cái, số, gạch dưới và gạch ngang';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await api.register({
				email,
				password,
				username
			});
			authStore.setAuth(response.user, response.token);
			goto('/dashboard');
		} catch (e: any) {
			error = e.message || 'Đăng ký thất bại';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleRegister();
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
			<h1 class="text-3xl font-bold text-gray-900">Đăng ký</h1>
			<p class="text-gray-600 mt-2">Tạo tài khoản miễn phí của bạn</p>
		</div>

		<!-- Register Form -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if error}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleRegister} class="space-y-5">
				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email <span class="text-red-500">*</span>
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

				<!-- Username (Link Bio) -->
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
						Link Bio <span class="text-red-500">*</span>
					</label>
					<div class="relative">
						<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
							biolink.com/
						</span>
						<input
							id="username"
							type="text"
							bind:value={username}
							on:keypress={handleKeyPress}
							disabled={loading}
							placeholder="yourname"
							class="w-full pl-[110px] pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
							required
						/>
					</div>
					<p class="text-xs text-gray-500 mt-1">
						Chỉ chữ cái, số, gạch dưới và gạch ngang
					</p>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Mật khẩu <span class="text-red-500">*</span>
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
					<p class="text-xs text-gray-500 mt-1">
						Tối thiểu 6 ký tự
					</p>
				</div>

				<!-- Confirm Password -->
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
						Nhập lại mật khẩu <span class="text-red-500">*</span>
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
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
						<span>Đang đăng ký...</span>
					{:else}
						<span>Đăng ký</span>
					{/if}
				</button>
			</form>

			<!-- Login Link -->
			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600">
					Đã có tài khoản?
					<a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
						Đăng nhập
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
