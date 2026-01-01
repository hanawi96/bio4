<script lang="ts">
	export let selectedHeaderPreset: string;
	export let selectedBlockStyle: string;
	export let selectedShadowStyle: string;
	export let blockBorderRadiusType: string;
	export let textAlign: string;
	export let maxWidth: number;
	export let pagePadding: number;
	export let blockGap: number;
	export let blockPaddingX: number;
	export let blockPaddingY: number;
	export let fontFamily: string;
	export let headingFontSize: string;
	export let primaryColor: string;
	export let textColor: string;
	export let borderColor: string;
	export let borderWidth: number;
	export let bgType: 'solid' | 'gradient' | 'image';
	export let bgSolidColor: string;
	export let bgGradientFrom: string;
	export let bgGradientTo: string;
	export let bgGradientDirection: string;
	export let bgImageUrl: string;
	export let configJson: string;
</script>

<div class="mb-4 bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono max-h-[400px] overflow-y-auto">
	<div class="space-y-3">
		<!-- Header -->
		<div>
			<div class="text-blue-400 font-bold mb-1">HEADER</div>
			<div class="pl-2 space-y-0.5">
				<div>Preset: <span class="text-green-400">{selectedHeaderPreset}</span></div>
			</div>
		</div>

		<!-- Block Style -->
		<div>
			<div class="text-blue-400 font-bold mb-1">BLOCK STYLE</div>
			<div class="pl-2 space-y-0.5">
				<div>Style: <span class="text-green-400">{selectedBlockStyle}</span></div>
				<div>Shadow: <span class="text-green-400">{selectedShadowStyle}</span></div>
				<div>Radius: <span class="text-green-400">{blockBorderRadiusType}</span></div>
			</div>
		</div>

		<!-- Layout -->
		<div>
			<div class="text-blue-400 font-bold mb-1">LAYOUT</div>
			<div class="pl-2 space-y-0.5">
				<div>Text Align: <span class="text-green-400">{textAlign}</span></div>
				<div>Max Width: <span class="text-green-400">{maxWidth}px</span></div>
				<div>Padding: <span class="text-green-400">{pagePadding}px</span></div>
				<div>Block Gap: <span class="text-green-400">{blockGap}px</span></div>
				<div>Block Padding X: <span class="text-green-400">{blockPaddingX}px</span></div>
				<div>Block Padding Y: <span class="text-green-400">{blockPaddingY}px</span></div>
			</div>
		</div>

		<!-- Typography -->
		<div>
			<div class="text-blue-400 font-bold mb-1">TYPOGRAPHY</div>
			<div class="pl-2 space-y-0.5">
				<div>Font: <span class="text-green-400">{fontFamily.split(',')[0]}</span></div>
				<div>Heading Size: <span class="text-green-400">{headingFontSize}</span></div>
			</div>
		</div>

		<!-- Colors -->
		<div>
			<div class="text-blue-400 font-bold mb-1">COLORS</div>
			<div class="pl-2 space-y-0.5">
				<div class="flex items-center gap-2">
					<span>Primary:</span>
					<div class="w-4 h-4 rounded border border-gray-600" style="background: {primaryColor}"></div>
					<span class="text-green-400">{primaryColor}</span>
				</div>
				<div class="flex items-center gap-2">
					<span>Text:</span>
					<div class="w-4 h-4 rounded border border-gray-600" style="background: {textColor}"></div>
					<span class="text-green-400">{textColor}</span>
				</div>
				<div class="flex items-center gap-2">
					<span>Border:</span>
					<div class="w-4 h-4 rounded border border-gray-600" style="background: {borderColor}"></div>
					<span class="text-green-400">{borderColor}</span>
				</div>
				<div>Border Width: <span class="text-green-400">{borderWidth}px</span></div>
			</div>
		</div>

		<!-- Background -->
		<div>
			<div class="text-blue-400 font-bold mb-1">BACKGROUND</div>
			<div class="pl-2 space-y-0.5">
				<div>Type: <span class="text-green-400">{bgType}</span></div>
				{#if bgType === 'solid'}
					<div class="flex items-center gap-2">
						<span>Color:</span>
						<div class="w-4 h-4 rounded border border-gray-600" style="background: {bgSolidColor}"></div>
						<span class="text-green-400">{bgSolidColor}</span>
					</div>
				{:else if bgType === 'gradient'}
					<div class="flex items-center gap-2">
						<span>From:</span>
						<div class="w-4 h-4 rounded border border-gray-600" style="background: {bgGradientFrom}"></div>
						<span class="text-green-400">{bgGradientFrom}</span>
					</div>
					<div class="flex items-center gap-2">
						<span>To:</span>
						<div class="w-4 h-4 rounded border border-gray-600" style="background: {bgGradientTo}"></div>
						<span class="text-green-400">{bgGradientTo}</span>
					</div>
					<div>Direction: <span class="text-green-400">{bgGradientDirection}</span></div>
				{:else if bgType === 'image'}
					<div>URL: <span class="text-green-400 break-all">{bgImageUrl ? bgImageUrl.substring(0, 40) + '...' : 'none'}</span></div>
				{/if}
			</div>
		</div>

		<!-- Config Check -->
		<div>
			<div class="text-yellow-400 font-bold mb-1">CONFIG SAVED</div>
			<div class="pl-2 space-y-0.5 text-[10px]">
				{#if configJson}
					{@const config = JSON.parse(configJson)}
					<div>✓ page.defaults.headerPresetId: <span class="text-green-400">{config.page?.defaults?.headerPresetId}</span></div>
					<div>✓ page.defaults.blockStylePreset: <span class="text-green-400">{config.page?.defaults?.blockStylePreset}</span></div>
					<div>✓ page.defaults.shadowStyle: <span class="text-green-400">{config.page?.defaults?.shadowStyle}</span></div>
					<div>✓ page.layout.textAlign: <span class="text-green-400">{config.page?.layout?.textAlign}</span></div>
					<div>✓ page.layout.maxWidth: <span class="text-green-400">{config.page?.layout?.maxWidth}</span></div>
					<div>✓ semantic.color.surface.page: <span class="text-green-400">{config.semantic?.color?.surface?.page?.substring(0, 30)}{config.semantic?.color?.surface?.page?.length > 30 ? '...' : ''}</span></div>
				{/if}
			</div>
		</div>
	</div>
</div>
