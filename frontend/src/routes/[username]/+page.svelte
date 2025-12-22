<script lang="ts">
	import BioPreview from '$lib/components/preview/BioPreview.svelte';
	import { loadEditorData } from '$lib/stores/page';
	import type { PageData } from './$types';
	
	export let params = {};
	export let data: PageData;
	
	// Load data into stores
	$: if (data) {
		loadEditorData(data);
	}
</script>

<BioPreview />
