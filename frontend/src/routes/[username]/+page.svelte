<script lang="ts">
	import { loadEditorData } from '$lib/stores/page';
	import PublicBioPage from '$lib/components/public/PublicBioPage.svelte';
	import type { PageData } from './$types';
	
	export let params = {};
	export let data: PageData;
	
	// Load data into stores
	$: if (data) {
		loadEditorData(data);
	}
</script>

<PublicBioPage />
