<script>
	import '../app.css';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
	
	// Suppress params warning
	export let params = {};
</script>

<slot />

<!-- Global Toast Container -->
<ToastContainer />
