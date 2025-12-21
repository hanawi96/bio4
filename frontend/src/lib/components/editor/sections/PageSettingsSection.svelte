<script lang="ts">
	let showShareButton = true;
	let showSubscribeButton = false;
	let hideBranding = false;
</script>

<section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
	<div class="px-6 py-4 border-b border-gray-100">
		<h2 class="font-semibold text-gray-900">Page Settings</h2>
		<p class="text-sm text-gray-500 mt-1">Configure additional page features</p>
	</div>
	
	<div class="p-6 space-y-6">
		<!-- Show Share Button -->
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h3 class="text-sm font-semibold text-gray-900">Show Share Button</h3>
				<p class="text-sm text-gray-500 mt-0.5">Let visitors easily share your profile</p>
			</div>
			<button
				on:click={() => showShareButton = !showShareButton}
				class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {showShareButton ? 'bg-blue-600' : 'bg-gray-200'}"
				role="switch"
				aria-checked={showShareButton}
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {showShareButton ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</div>

		<!-- Show Subscribe Button -->
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h3 class="text-sm font-semibold text-gray-900">Show Subscribe Button</h3>
				<p class="text-sm text-gray-500 mt-0.5">Let visitors subscribe to your mailing list</p>
			</div>
			<button
				on:click={() => showSubscribeButton = !showSubscribeButton}
				class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {showSubscribeButton ? 'bg-blue-600' : 'bg-gray-200'}"
				role="switch"
				aria-checked={showSubscribeButton}
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {showSubscribeButton ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</div>

		<!-- Hide Branding (Pro) -->
		<div class="flex items-start justify-between gap-4 opacity-60">
			<div class="flex-1">
				<div class="flex items-center gap-2">
					<h3 class="text-sm font-semibold text-gray-900">Hide Beacons logo and footer</h3>
					<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full">
						<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						Pro
					</span>
				</div>
				<p class="text-sm text-gray-500 mt-0.5">Remove "Made with Bio Link" branding</p>
			</div>
			<button
				disabled
				class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200"
				role="switch"
				aria-checked={hideBranding}
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"
				></span>
			</button>
		</div>
	</div>
</section>
