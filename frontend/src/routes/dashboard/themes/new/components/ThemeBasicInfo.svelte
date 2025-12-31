<script lang="ts">
	export let name: string;
	export let description: string;
	export let category: string;
	export let tier: string;
</script>

<section class="card-ios p-6">
	<h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
	<div class="space-y-4">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
				Theme Name *
			</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				required
				class="input-ios"
				placeholder="My Custom Theme"
			/>
		</div>
		<div>
			<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
				Description
			</label>
			<textarea
				id="description"
				bind:value={description}
				rows="2"
				class="input-ios"
				placeholder="A beautiful theme with..."
			></textarea>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
					Category
				</label>
				<select id="category" bind:value={category} class="input-ios">
					<option value="minimal">Minimal</option>
					<option value="dark">Dark</option>
					<option value="gradient">Gradient</option>
					<option value="colorful">Colorful</option>
				</select>
			</div>
			<div>
				<label for="tier" class="block text-sm font-medium text-gray-700 mb-2">
					Tier
				</label>
				<select id="tier" bind:value={tier} class="input-ios">
					<option value="free">Free</option>
					<option value="pro">Pro</option>
				</select>
			</div>
		</div>
	</div>
</section>
