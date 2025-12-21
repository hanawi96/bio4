<script lang="ts">
	import { api } from '$lib/api.client';
	import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '$lib/constants';

	export let value: string = '';
	export let label: string = 'Upload Image';
	
	let uploading = false;
	let error = '';

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		error = '';
		
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			error = 'Invalid file type';
			return;
		}
		
		if (file.size > MAX_IMAGE_SIZE) {
			error = 'File too large (max 5MB)';
			return;
		}

		try {
			uploading = true;
			const result = await api.uploadImage(file);
			value = result.url;
		} catch (e) {
			error = 'Upload failed';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="space-y-2">
	<label class="text-sm font-medium">{label}</label>
	
	{#if value}
		<div class="relative w-32 h-32">
			<img src={value} alt="Preview" class="w-full h-full object-cover rounded" />
			<button 
				on:click={() => value = ''}
				class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"
			>×</button>
		</div>
	{/if}
	
	<input 
		type="file" 
		accept="image/*"
		on:change={handleUpload}
		disabled={uploading}
		class="block w-full text-sm"
	/>
	
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
	
	{#if uploading}
		<p class="text-sm text-gray-500">Uploading...</p>
	{/if}
</div>
