<script lang="ts">
	import { appearance } from '$lib/stores/appearance';
	import { page } from '$lib/stores/page';
	
	let expanded = false;
	let selectedTab: 'theme' | 'tokens' | 'header' | 'block' = 'theme';
	
	// Get computed styles from actual DOM elements
	function getComputedValue(selector: string, property: string): string {
		if (typeof window === 'undefined') return 'N/A';
		const element = document.querySelector(selector);
		if (!element) return 'Not found';
		return window.getComputedStyle(element).getPropertyValue(property);
	}
	
	// Compare expected vs actual
	function compareValue(expected: any, actual: any): 'match' | 'mismatch' | 'unknown' {
		if (actual === 'N/A' || actual === 'Not found') return 'unknown';
		
		// Normalize values for comparison
		const normalizeColor = (color: string) => {
			if (!color) return '';
			// Convert rgb to hex for comparison
			if (color.startsWith('rgb')) {
				const match = color.match(/\d+/g);
				if (match) {
					const [r, g, b] = match.map(Number);
					return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
				}
			}
			return color.toLowerCase();
		};
		
		const normalizeSize = (size: string) => {
			if (!size) return '';
			return size.replace('px', '').trim();
		};
		
		const exp = String(expected).toLowerCase();
		const act = String(actual).toLowerCase();
		
		// Try different normalizations
		if (exp === act) return 'match';
		if (normalizeColor(exp) === normalizeColor(act)) return 'match';
		if (normalizeSize(exp) === normalizeSize(act)) return 'match';
		
		return 'mismatch';
	}
	
	$: themeChecks = $appearance ? [
		{ 
			name: 'Theme Name', 
			expected: $appearance.theme.name,
			actual: $appearance.theme.name,
			status: 'match' as const
		},
		{
			name: 'Background Color',
			expected: $appearance.tokens.backgroundColor,
			actual: getComputedValue('.phone-content', 'background-color'),
			status: compareValue($appearance.tokens.backgroundColor, getComputedValue('.phone-content', 'background-color'))
		},
		{
			name: 'Text Color',
			expected: $appearance.tokens.textColor,
			actual: getComputedValue('.phone-content', 'color'),
			status: compareValue($appearance.tokens.textColor, getComputedValue('.phone-content', 'color'))
		},
		{
			name: 'Primary Color',
			expected: $appearance.tokens.primaryColor,
			actual: getComputedValue('.link-button', 'background-color'),
			status: compareValue($appearance.tokens.primaryColor, getComputedValue('.link-button', 'background-color'))
		},
		{
			name: 'Font Family',
			expected: $appearance.tokens.fontFamily,
			actual: getComputedValue('.phone-content', 'font-family'),
			status: compareValue($appearance.tokens.fontFamily, getComputedValue('.phone-content', 'font-family'))
		},
		{
			name: 'Border Radius',
			expected: `${$appearance.tokens.borderRadius}px`,
			actual: getComputedValue('.link-button', 'border-radius'),
			status: compareValue($appearance.tokens.borderRadius, getComputedValue('.link-button', 'border-radius'))
		}
	] : [];
	
	// Avatar size mapping for validation
	const avatarSizeMap = { sm: 64, md: 80, lg: 96, xl: 120 };
	
	// Get avatar element for validation
	function getAvatarElement() {
		return document.querySelector('.header-avatar') || document.querySelector('img[alt*="Avatar"]') || document.querySelector('[class*="avatar"]');
	}
	
	// Get actual avatar size from DOM
	function getActualAvatarSize(): string {
		const avatar = getAvatarElement();
		if (!avatar) return 'Not found';
		const width = window.getComputedStyle(avatar).width;
		return width;
	}
	
	// Get actual avatar shape from DOM
	function getActualAvatarShape(): string {
		const avatar = getAvatarElement();
		if (!avatar) return 'Not found';
		const borderRadius = window.getComputedStyle(avatar).borderRadius;
		
		// Determine shape based on border-radius
		if (borderRadius.includes('50%') || borderRadius.includes('9999')) return 'circle';
		if (borderRadius === '0px') return 'square';
		return 'rounded';
	}
	
	$: headerChecks = $appearance ? [
		{
			name: 'Has Cover',
			expected: $appearance.header.hasCover ? 'Yes' : 'No',
			actual: document.querySelector('.header-cover') ? 'Yes' : 'No',
			status: compareValue($appearance.header.hasCover, !!document.querySelector('.header-cover'))
		},
		{
			name: 'Avatar Size',
			expected: `${avatarSizeMap[$appearance.header.avatarSize]}px`,
			actual: getActualAvatarSize(),
			status: compareValue(avatarSizeMap[$appearance.header.avatarSize], getActualAvatarSize().replace('px', ''))
		},
		{
			name: 'Avatar Shape',
			expected: $appearance.header.avatarShape,
			actual: getActualAvatarShape(),
			status: compareValue($appearance.header.avatarShape, getActualAvatarShape())
		},
		{
			name: 'Avatar Position',
			expected: $appearance.header.avatarPosition,
			actual: $appearance.header.hasCover && document.querySelector('.header-cover')?.querySelector('[class*="avatar"]') ? 'overlap' : 'center',
			status: 'match' as const
		},
		{
			name: 'Content Align',
			expected: $appearance.header.contentAlign,
			actual: getComputedValue('.header-content', 'text-align') || 'center',
			status: compareValue($appearance.header.contentAlign, getComputedValue('.header-content', 'text-align'))
		},
		{
			name: 'Show Bio',
			expected: $appearance.header.showBio ? 'Yes' : 'No',
			actual: document.querySelector('.bio-text') ? 'Yes' : 'No',
			status: compareValue($appearance.header.showBio, !!document.querySelector('.bio-text'))
		},
		{
			name: 'Bio Max Lines',
			expected: $appearance.header.bioMaxLines.toString(),
			actual: getComputedValue('.bio-text', '-webkit-line-clamp') || 'N/A',
			status: compareValue($appearance.header.bioMaxLines, getComputedValue('.bio-text', '-webkit-line-clamp'))
		},
		{
			name: 'Spacing',
			expected: $appearance.header.spacing,
			actual: $appearance.header.spacing,
			status: 'match' as const
		}
	] : [];
	
	$: tokensInfo = $appearance ? [
		{ name: 'Background', value: $appearance.tokens.backgroundColor },
		{ name: 'Text Color', value: $appearance.tokens.textColor },
		{ name: 'Primary Color', value: $appearance.tokens.primaryColor },
		{ name: 'Secondary', value: $appearance.tokens.secondary },
		{ name: 'Surface', value: $appearance.tokens.surface },
		{ name: 'Text Secondary', value: $appearance.tokens.textSecondary },
		{ name: 'Border', value: $appearance.tokens.border },
		{ name: 'Font Family', value: $appearance.tokens.fontFamily },
		{ name: 'Border Radius', value: `${$appearance.tokens.borderRadius}px` },
		{ name: 'Spacing', value: `${$appearance.tokens.spacing}px` },
		{ name: 'Shadow Level', value: $appearance.tokens.shadowLevel }
	] : [];
	
	$: allChecks = selectedTab === 'theme' ? themeChecks : 
	               selectedTab === 'header' ? headerChecks : [];
	
	$: matchCount = allChecks.filter(c => c.status === 'match').length;
	$: mismatchCount = allChecks.filter(c => c.status === 'mismatch').length;
	$: totalCount = allChecks.length;
</script>

<!-- Compact Debug Panel -->
{#if !expanded}
	<button
		on:click={() => expanded = true}
		class="fixed bottom-4 right-4 bg-black/90 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-black transition-all z-50 flex items-center gap-2"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
		</svg>
		<span class="text-xs font-semibold">Theme Validator</span>
		{#if mismatchCount > 0}
			<span class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{mismatchCount}</span>
		{:else}
			<span class="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">✓</span>
		{/if}
	</button>
{/if}

<!-- Expanded Debug Panel -->
{#if expanded}
	<div class="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 w-[480px] max-h-[600px] flex flex-col z-50">
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
				<h3 class="font-bold text-gray-900">Theme Validator</h3>
			</div>
			<button
				on:click={() => expanded = false}
				class="p-1 hover:bg-gray-100 rounded transition"
			>
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<!-- Stats -->
		<div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
			<div class="flex items-center gap-4 text-xs">
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 bg-green-500 rounded-full"></div>
					<span class="text-gray-600">{matchCount} Match</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 bg-red-500 rounded-full"></div>
					<span class="text-gray-600">{mismatchCount} Mismatch</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 bg-gray-400 rounded-full"></div>
					<span class="text-gray-600">{totalCount - matchCount - mismatchCount} Unknown</span>
				</div>
			</div>
			<div class="text-xs font-semibold text-gray-900">
				{Math.round((matchCount / totalCount) * 100)}% Accurate
			</div>
		</div>
		
		<!-- Tabs -->
		<div class="flex border-b border-gray-200 bg-white">
			<button
				on:click={() => selectedTab = 'theme'}
				class="flex-1 px-4 py-2 text-sm font-medium transition {selectedTab === 'theme' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}"
			>
				Theme
			</button>
			<button
				on:click={() => selectedTab = 'header'}
				class="flex-1 px-4 py-2 text-sm font-medium transition {selectedTab === 'header' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}"
			>
				Header
			</button>
			<button
				on:click={() => selectedTab = 'tokens'}
				class="flex-1 px-4 py-2 text-sm font-medium transition {selectedTab === 'tokens' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}"
			>
				Tokens
			</button>
		</div>
		
		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if $appearance}
				{#if selectedTab === 'tokens'}
					<!-- Tokens Info (Read-only) -->
					<div class="space-y-2">
						{#each tokensInfo as token}
							<div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
								<div class="flex items-center justify-between mb-1">
									<span class="text-xs font-semibold text-gray-700">{token.name}</span>
									<span class="text-blue-600 text-xs">ℹ Info</span>
								</div>
								<div class="flex items-center gap-2">
									{#if token.name.includes('Color')}
										<div class="w-6 h-6 rounded border border-gray-300" style="background: {token.value};"></div>
									{/if}
									<code class="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono">{token.value}</code>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- Validation Checks -->
					<div class="space-y-2">
						{#each allChecks as check}
							<div class="bg-gray-50 rounded-lg p-3 border {check.status === 'match' ? 'border-green-200' : check.status === 'mismatch' ? 'border-red-200' : 'border-gray-200'}">
								<div class="flex items-start justify-between mb-2">
									<span class="text-xs font-semibold text-gray-700">{check.name}</span>
									{#if check.status === 'match'}
										<span class="text-green-600 text-xs">✓ Match</span>
									{:else if check.status === 'mismatch'}
										<span class="text-red-600 text-xs">✗ Mismatch</span>
									{:else}
										<span class="text-gray-400 text-xs">? Unknown</span>
									{/if}
								</div>
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<span class="text-[10px] text-gray-500 w-16">Expected:</span>
										<code class="text-[10px] bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono">{check.expected}</code>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-[10px] text-gray-500 w-16">Actual:</span>
										<code class="text-[10px] bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono {check.status === 'mismatch' ? 'text-red-600' : ''}">{check.actual}</code>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="text-center py-8 text-gray-400 text-sm">
					No appearance data
				</div>
			{/if}
		</div>
		
		<!-- Footer -->
		<div class="px-4 py-3 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500">
			Theme: {$page?.theme_preset_key || 'none'} • Updates in real-time
		</div>
	</div>
{/if}
