<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isOpen = false;
	let selectedCategory = 'link';
	let searchQuery = '';
	let recentlyUsed: string[] = ['link', 'text', 'image'];

	export function open() {
		isOpen = true;
		selectedCategory = 'link';
		searchQuery = '';
	}

	export function close() {
		isOpen = false;
	}

	const categories = [
		{ 
			id: 'link', 
			name: 'Links', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>', 
			color: 'bg-green-500', 
			section: 'Content',
			description: 'Add clickable links',
			available: true
		},
		{ 
			id: 'text', 
			name: 'Text', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>', 
			color: 'bg-orange-500', 
			section: 'Content',
			description: 'Add headings and paragraphs',
			available: true
		},
		{ 
			id: 'image', 
			name: 'Image', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>', 
			color: 'bg-gray-700', 
			section: 'Content',
			description: 'Upload and display images',
			available: true
		},
		{ 
			id: 'video', 
			name: 'Video', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>', 
			color: 'bg-red-500', 
			section: 'Content',
			description: 'Embed YouTube, TikTok videos',
			available: true
		},
		{ 
			id: 'divider', 
			name: 'Divider', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" /></svg>', 
			color: 'bg-gray-500', 
			section: 'Content',
			description: 'Add visual separators',
			available: true
		},
		{ 
			id: 'social', 
			name: 'Social Links', 
			icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>', 
			color: 'bg-pink-500', 
			section: 'Content',
			description: 'Link to social profiles',
			available: true
		}
	];

	const quickAddItems = [
		{ id: 'link', name: 'Link', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>', shortcut: 'Ctrl+L' },
		{ id: 'text', name: 'Text', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>', shortcut: 'Ctrl+T' },
		{ id: 'image', name: 'Image', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>', shortcut: 'Ctrl+I' }
	];

	const layouts = {
		link: [
			{
				id: 'classic',
				name: 'Classic',
				description: 'Simple stacked links',
				badge: 'Most popular',
				badgeColor: 'bg-green-100 text-green-700'
			},
			{
				id: 'carousel',
				name: 'Carousel',
				description: 'Swipeable link cards',
				badge: null
			},
			{
				id: 'grid',
				name: 'Image Grid',
				description: 'Grid of image links',
				badge: null
			},
			{
				id: 'card',
				name: 'Card',
				description: 'Links with thumbnails',
				badge: null
			}
		],
		text: [
			{
				id: 'heading',
				name: 'Heading',
				description: 'Large title text',
				badge: null
			},
			{
				id: 'paragraph',
				name: 'Paragraph',
				description: 'Body text content',
				badge: null
			}
		],
		image: [
			{
				id: 'column',
				name: 'Column',
				description: 'Vertical stack of images',
				badge: 'Recommended',
				badgeColor: 'bg-gray-100 text-gray-700'
			},
			{
				id: 'carousel',
				name: 'Carousel',
				description: 'Horizontal swipeable gallery',
				badge: null
			},
			{
				id: 'slideshow',
				name: 'Slideshow',
				description: 'Fullscreen presentation style',
				badge: null
			},
			{
				id: 'marquee',
				name: 'Marquee',
				description: 'Infinite scrolling strip',
				badge: 'New',
				badgeColor: 'bg-blue-100 text-blue-700'
			}
		],
		video: [
			{
				id: 'embed',
				name: 'Video Embed',
				description: 'Embedded video player',
				badge: null
			}
		],
		divider: [
			{
				id: 'line',
				name: 'Line',
				description: 'Simple horizontal line',
				badge: null
			},
			{
				id: 'spacer',
				name: 'Spacer',
				description: 'Empty space',
				badge: null
			}
		],
		social: [
			{
				id: 'icons',
				name: 'Icon Bar',
				description: 'Social media icons',
				badge: 'Popular'
			}
		]
	};

	$: filteredCategories = categories.filter(cat => 
		cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		cat.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	$: recentCategories = categories.filter(cat => recentlyUsed.includes(cat.id));

	function selectCategory(categoryId: string) {
		selectedCategory = categoryId;
	}

	function selectLayout(layoutId: string) {
		// Add to recently used
		if (!recentlyUsed.includes(selectedCategory)) {
			recentlyUsed = [selectedCategory, ...recentlyUsed.slice(0, 2)];
		}
		
		dispatch('select', { type: selectedCategory, layout: layoutId });
		close();
	}

	function quickAdd(blockId: string) {
		selectedCategory = blockId;
		// Auto-select first layout
		const firstLayout = layouts[blockId]?.[0];
		if (firstLayout) {
			selectLayout(firstLayout.id);
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" on:click={close}></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[900px] overflow-hidden animate-scale-in flex flex-col">
			<!-- Single Header for entire modal -->
			<div class="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
				<div>
					<h2 class="text-2xl font-bold text-gray-900">Add a block</h2>
					<p class="text-sm text-gray-500 mt-0.5">Choose a block type to add to your bio page</p>
				</div>
				<button on:click={close} class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content: Sidebar + Main Area -->
			<div class="flex flex-1 overflow-hidden">
				<!-- Sidebar -->
				<div class="w-80 bg-gray-50 flex flex-col overflow-hidden">
					<!-- Search Bar -->
					<div class="px-4 pt-4 pb-3">
						<div class="relative">
							<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search blocks..."
								class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>
					</div>

					<!-- Categories -->
					<div class="flex-1 overflow-y-auto py-2">
						{#if searchQuery === ''}
							<!-- Quick Add -->
							<div class="px-4 mb-4">
								<h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Quick Add</h3>
								<div class="space-y-1">
									{#each quickAddItems as item}
										<button
											on:click={() => quickAdd(item.id)}
											class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-white/60 group"
										>
											<span class="text-gray-600">{@html item.icon}</span>
											<span class="text-sm font-medium text-gray-900">{item.name}</span>
											<span class="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.shortcut}</span>
										</button>
									{/each}
								</div>
							</div>

							<!-- Recently Used -->
							{#if recentCategories.length > 0}
								<div class="px-4 mb-4">
									<h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Recently Used</h3>
									<div class="space-y-1">
										{#each recentCategories as category}
											<button
												on:click={() => selectCategory(category.id)}
												class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {selectedCategory === category.id ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
											>
												<div class="w-8 h-8 rounded-lg {category.color} flex items-center justify-center text-white text-base shadow-sm">
													{@html category.icon}
												</div>
												<div class="flex-1 text-left">
													<div class="text-sm font-semibold text-gray-900">{category.name}</div>
												</div>
												<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
												</svg>
											</button>
										{/each}
									</div>
								</div>
							{/if}

							<!-- All Blocks -->
							<div class="px-4 mb-4">
								<h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">All Blocks</h3>
								<div class="space-y-1">
									{#each categories as category}
										<button
											on:click={() => selectCategory(category.id)}
											class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {selectedCategory === category.id ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
										>
											<div class="w-8 h-8 rounded-lg {category.color} flex items-center justify-center text-white text-base shadow-sm">
												{@html category.icon}
											</div>
											<div class="flex-1 text-left">
												<div class="text-sm font-semibold text-gray-900">{category.name}</div>
												<div class="text-xs text-gray-500">{category.description}</div>
											</div>
											<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
											</svg>
										</button>
									{/each}
								</div>
							</div>
						{:else}
							<!-- Search Results -->
							<div class="px-4">
								{#if filteredCategories.length > 0}
									<div class="space-y-1">
										{#each filteredCategories as category}
											<button
												on:click={() => selectCategory(category.id)}
												class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {selectedCategory === category.id ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
											>
												<div class="w-8 h-8 rounded-lg {category.color} flex items-center justify-center text-white text-base shadow-sm">
													{@html category.icon}
												</div>
												<div class="flex-1 text-left">
													<div class="text-sm font-semibold text-gray-900">{category.name}</div>
													<div class="text-xs text-gray-500">{category.description}</div>
												</div>
												<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
												</svg>
											</button>
										{/each}
									</div>
								{:else}
									<div class="text-center py-8">
										<div class="text-4xl mb-2">🔍</div>
										<p class="text-sm font-medium text-gray-900 mb-1">No blocks found</p>
										<p class="text-xs text-gray-500">Try a different search term</p>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<!-- Content Area -->
				<div class="flex-1 flex flex-col bg-white overflow-hidden">
					<!-- Section Title -->
					<div class="px-8 py-4 bg-gray-50 border-b border-gray-200">
						{#if categories.find(c => c.id === selectedCategory)}
							{@const category = categories.find(c => c.id === selectedCategory)}
							<h3 class="text-lg font-bold text-gray-900">{category.name}</h3>
							<p class="text-sm text-gray-500 mt-0.5">{category.description}</p>
						{/if}
					</div>

					<!-- Layouts -->
					<div class="flex-1 overflow-y-auto p-8 bg-white">
						{#if layouts[selectedCategory] && layouts[selectedCategory].length > 0}
							{@const currentLayouts = layouts[selectedCategory]}
							<div class="grid grid-cols-2 gap-6">
								{#each currentLayouts as layout}
									<button
										on:click={() => selectLayout(layout.id)}
										class="group relative rounded-2xl border-2 border-gray-200 hover:border-green-500 transition-all overflow-hidden bg-white hover:shadow-xl"
									>
										<!-- Preview Area -->
										<div class="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center relative">
											{#if selectedCategory === 'link'}
												{#if layout.id === 'classic'}
													<div class="w-full space-y-3">
														<div class="h-12 bg-white rounded-xl shadow-sm"></div>
														<div class="h-12 bg-white rounded-xl shadow-sm"></div>
														<div class="h-12 bg-white rounded-xl shadow-sm"></div>
													</div>
												{:else if layout.id === 'carousel'}
													<div class="flex gap-3 overflow-hidden">
														<div class="w-36 h-36 bg-white rounded-2xl shadow-sm flex-shrink-0"></div>
														<div class="w-36 h-36 bg-white rounded-2xl shadow-sm flex-shrink-0"></div>
													</div>
												{:else if layout.id === 'grid'}
													<div class="grid grid-cols-3 gap-2 w-full">
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
														<div class="aspect-square bg-white rounded-xl shadow-sm"></div>
													</div>
												{:else if layout.id === 'card'}
													<div class="w-full space-y-3">
														<div class="flex gap-3 h-16 bg-white rounded-xl shadow-sm p-3">
															<div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
															<div class="flex-1 space-y-1">
																<div class="h-2 bg-gray-200 rounded w-3/4"></div>
																<div class="h-2 bg-gray-200 rounded w-1/2"></div>
															</div>
														</div>
														<div class="flex gap-3 h-16 bg-white rounded-xl shadow-sm p-3">
															<div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
															<div class="flex-1 space-y-1">
																<div class="h-2 bg-gray-200 rounded w-3/4"></div>
																<div class="h-2 bg-gray-200 rounded w-1/2"></div>
															</div>
														</div>
													</div>
												{/if}
											{:else if selectedCategory === 'text'}
												{#if layout.id === 'heading'}
													<div class="w-full space-y-2">
														<div class="h-8 bg-white rounded-lg shadow-sm"></div>
														<div class="h-6 bg-white/60 rounded-lg w-3/4"></div>
													</div>
												{:else if layout.id === 'paragraph'}
													<div class="w-full space-y-2">
														<div class="h-3 bg-white rounded w-full"></div>
														<div class="h-3 bg-white rounded w-full"></div>
														<div class="h-3 bg-white rounded w-4/5"></div>
														<div class="h-3 bg-white rounded w-full"></div>
														<div class="h-3 bg-white rounded w-3/4"></div>
													</div>
												{/if}
											{:else if selectedCategory === 'image'}
												{#if layout.id === 'column'}
													<div class="w-full space-y-3">
														<div class="w-full h-20 bg-white rounded-xl shadow-sm"></div>
														<div class="w-full h-20 bg-white rounded-xl shadow-sm"></div>
														<div class="w-full h-20 bg-white rounded-xl shadow-sm"></div>
													</div>
												{:else if layout.id === 'carousel'}
													<div class="flex gap-3 overflow-hidden w-full">
														<div class="w-32 h-32 bg-white rounded-xl shadow-sm flex-shrink-0"></div>
														<div class="w-32 h-32 bg-white rounded-xl shadow-sm flex-shrink-0"></div>
														<div class="w-32 h-32 bg-white rounded-xl shadow-sm flex-shrink-0 opacity-50"></div>
													</div>
												{:else if layout.id === 'slideshow'}
													<div class="w-full relative">
														<div class="w-full aspect-video bg-white rounded-xl shadow-lg"></div>
														<div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
															<div class="w-6 h-1.5 bg-white rounded-full"></div>
															<div class="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
															<div class="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
														</div>
														<div class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded">
															1/3
														</div>
													</div>
												{:else if layout.id === 'marquee'}
													<div class="w-full overflow-hidden">
														<div class="flex gap-2 animate-marquee-demo">
															<div class="w-16 h-20 bg-white rounded-lg shadow-sm flex-shrink-0"></div>
															<div class="w-16 h-20 bg-white rounded-lg shadow-sm flex-shrink-0"></div>
															<div class="w-16 h-20 bg-white rounded-lg shadow-sm flex-shrink-0"></div>
															<div class="w-16 h-20 bg-white rounded-lg shadow-sm flex-shrink-0"></div>
														</div>
													</div>
												{/if}
											{:else if selectedCategory === 'video'}
												<div class="w-full aspect-video bg-white rounded-xl shadow-sm flex items-center justify-center">
													<svg class="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
														<path d="M8 5v14l11-7z"/>
													</svg>
												</div>
											{:else if selectedCategory === 'divider'}
												{#if layout.id === 'line'}
													<div class="w-full">
														<div class="h-0.5 bg-white rounded-full shadow-sm"></div>
													</div>
												{:else if layout.id === 'spacer'}
													<div class="w-full h-16 border-2 border-dashed border-white/50 rounded-lg"></div>
												{/if}
											{:else if selectedCategory === 'social'}
												<div class="flex gap-3">
													<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
													<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
													<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
													<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
												</div>
											{/if}

											<!-- Badge -->
											{#if layout.badge}
												<div class="absolute top-3 right-3 px-2 py-1 {layout.badgeColor || 'bg-green-100 text-green-700'} rounded-full text-xs font-semibold">
													{layout.badge}
												</div>
											{/if}
										</div>

										<!-- Info -->
										<div class="px-4 py-4 bg-white border-t border-gray-100">
											<p class="text-sm font-semibold text-gray-900 text-center mb-1">{layout.name}</p>
											<p class="text-xs text-gray-500 text-center">{layout.description}</p>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							<div class="flex items-center justify-center h-full">
								<div class="text-center">
									<div class="text-4xl mb-3">🎨</div>
									<h3 class="text-lg font-bold text-gray-900 mb-2">No layouts available</h3>
									<p class="text-sm text-gray-500 max-w-xs mx-auto">This block type doesn't have any layouts yet.</p>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
	
	@keyframes marquee-demo {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
	
	.animate-marquee-demo {
		animation: marquee-demo 3s linear infinite;
	}
</style>
