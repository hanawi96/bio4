<script lang="ts">
	export let activeFilter: 'blur' | 'brightness' | 'grayscale' | null;
	export let onSelect: (filter: 'blur' | 'brightness' | 'grayscale' | null) => void;

	function toggleFilter(filter: 'blur' | 'brightness' | 'grayscale') {
		if (activeFilter === filter) {
			onSelect(null);
		} else {
			onSelect(filter);
		}
	}
</script>

<div class="grid grid-cols-3 gap-2">
	<button
		type="button"
		on:click={() => toggleFilter('blur')}
		class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'blur'
			? 'bg-[#00aa4f] text-white shadow-md'
			: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
	>
		<div class="flex items-center justify-center gap-2">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
				/>
			</svg>
			<span>Blur</span>
		</div>
	</button>
	<button
		type="button"
		on:click={() => toggleFilter('brightness')}
		class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'brightness'
			? 'bg-[#00aa4f] text-white shadow-md'
			: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
	>
		<div class="flex items-center justify-center gap-2">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
			<span>Brightness</span>
		</div>
	</button>
	<button
		type="button"
		on:click={() => toggleFilter('grayscale')}
		class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeFilter === 'grayscale'
			? 'bg-[#00aa4f] text-white shadow-md'
			: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}"
	>
		<div class="flex items-center justify-center gap-2">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
				/>
			</svg>
			<span>Grayscale</span>
		</div>
	</button>
</div>
