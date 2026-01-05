<script lang="ts">
	export let showShareButton: boolean;
	export let showSubscribeButton: boolean;
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Page Settings</h2>
	<div class="space-y-4">
		<!-- Show Share Button -->
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h3 class="text-sm font-medium text-gray-900">Show Share Button</h3>
				<p class="text-xs text-gray-500 mt-0.5">Let visitors easily share your profile</p>
			</div>
			<button
				type="button"
				on:click={() => showShareButton = !showShareButton}
				class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 {showShareButton ? 'bg-[#00aa4f] focus:ring-[#00aa4f]' : 'bg-gray-200 focus:ring-gray-300'}"
				style={showShareButton ? 'box-shadow: 0 2px 8px rgba(0, 170, 79, 0.2);' : ''}
				role="switch"
				aria-checked={showShareButton}
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {showShareButton ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</div>

		<!-- Show Subscribe Button -->
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h3 class="text-sm font-medium text-gray-900">Show Subscribe Button</h3>
				<p class="text-xs text-gray-500 mt-0.5">Let visitors subscribe to your mailing list</p>
			</div>
			<button
				type="button"
				on:click={() => showSubscribeButton = !showSubscribeButton}
				class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 {showSubscribeButton ? 'bg-[#00aa4f] focus:ring-[#00aa4f]' : 'bg-gray-200 focus:ring-gray-300'}"
				style={showSubscribeButton ? 'box-shadow: 0 2px 8px rgba(0, 170, 79, 0.2);' : ''}
				role="switch"
				aria-checked={showSubscribeButton}
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {showSubscribeButton ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</div>
	</div>
</section>
