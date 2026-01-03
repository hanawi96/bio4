import type { ResolvedAppearance, Theme, ThemeTokens, ResolvedBlockStyle } from './types';
import { HEADER_PRESETS } from './presets';
import { getBlockStyleRecipe, resolveShadowValue, type BlockStylePresetId, type ShadowStylePreset } from './blockStyles';
import { resolveToken, resolveAutoTextColor } from './tokenResolver';
import { resolveRadius, resolveBlockGap, resolveBlockPadding, resolveBorderWidth, resolveMaxWidth, resolvePagePadding } from './spacingTokens';
import { get } from 'svelte/store';
import { headerPresets } from '$lib/stores/headerPresets';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_CONFIG = {
	meta: { id: 'default', name: 'Default', schemaVersion: 1, version: '1.0.0' },
	tokens: {
		bg: { type: 'color' as const, value: '#ffffff' },
		text: '#000000',
		primary: '#3b82f6',
		surface: '#fafafa',
		border: '#e5e5e5',
		blockBase: '#3b82f6',
		fontFamily: 'Inter, sans-serif'
	},
	defaults: {
		headerPreset: 'no-cover',
		blockPreset: 'rounded',
		blockStylePreset: 'solid',
		blockShadow: 'none'
	},
	page: {
		mode: 'light' as const,
		layout: {
			maxWidth: 480,
			pagePadding: 16,
			blockGap: 16,
			textAlign: 'center' as const
		}
	}
};

// ============================================
// THEME HELPERS
// ============================================

// Convert bg token to CSS string
function bgTokenToCSS(bgToken: any): string {
	if (!bgToken) return '#ffffff';

	if (bgToken.type === 'color') {
		// Check if value is a pattern (starts with "background:")
		if (typeof bgToken.value === 'string' && bgToken.value.startsWith('background:')) {
			// Return pattern as-is (it already contains full CSS)
			return bgToken.value;
		}
		return bgToken.value;
	}

	if (bgToken.type === 'gradient' && typeof bgToken.value === 'object') {
		const { from, to, angle = 135 } = bgToken.value;
		return `linear-gradient(${angle}deg, ${from}, ${to})`;
	}

	return '#ffffff';
}

// Simple color adjustment helper
function adjustColor(hex: string, percent: number): string {
	if (!hex || !hex.startsWith('#')) return hex || '#000000';

	const num = parseInt(hex.replace('#', ''), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
	return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// Resolve semantic token reference (v2 schema)
function resolveSemanticToken(ref: string, config: any): string | null {
	if (!ref || !ref.startsWith('ref:')) return ref;

	const path = ref.replace('ref:', '').split('.');
	let value: any = config;

	for (const key of path) {
		value = value?.[key];
		if (value === undefined) return null;
	}

	// Recursive resolve if value is also a reference
	if (typeof value === 'string' && value.startsWith('ref:')) {
		return resolveSemanticToken(value, config);
	}

	return value;
}

// Detect dark mode from background color
function isDarkBackground(bgColor: string): boolean {
	return bgColor.includes('#000') || bgColor.includes('#18181b') || bgColor.includes('#111');
}

// Expand ThemeConfig to full ThemeTokens
function expandThemeTokens(config: any): ThemeTokens {
	const tokens = config.tokens || {};
	const semantic = config.semantic || {};
	const layout = config.page?.layout || {};
	const schemaVersion = config.meta?.schemaVersion || 1;

	let backgroundColor: string;
	let text: string;
	let primary: string;
	let surface: string;
	let border: string;
	let blockBase: string;
	let fontFamily: string;

	// Schema v2: Use semantic tokens
	if (schemaVersion === 2) {
		backgroundColor = resolveSemanticToken(semantic.color?.surface?.page, config) || '#ffffff';
		text = resolveSemanticToken(semantic.color?.text?.default, config) || '#000000';
		primary = resolveSemanticToken(semantic.color?.primary, config) || '#3b82f6';
		surface = resolveSemanticToken(semantic.color?.surface?.card, config) || '#fafafa';
		border = resolveSemanticToken(semantic.color?.border?.default, config) || '#e5e5e5';
		blockBase = primary; // Use primary as blockBase for v2
		fontFamily = resolveSemanticToken(semantic.typography?.body?.fontFamily, config) ||
			tokens.typography?.fontFamily?.sans || 'Inter, sans-serif';
	} else {
		// Schema v1: Use flat tokens (legacy)
		backgroundColor = bgTokenToCSS(tokens.bg);
		text = tokens.text || '#000000';
		primary = tokens.primary || '#3b82f6';
		surface = tokens.surface || '#fafafa';
		border = tokens.border || '#e5e5e5';
		fontFamily = tokens.fontFamily || 'Inter, sans-serif';

		// Extract blockBase - handle both string and object formats
		if (tokens.blockBase) {
			blockBase = typeof tokens.blockBase === 'string'
				? tokens.blockBase
				: tokens.blockBase.value || '#3b82f6';
		} else {
			blockBase = '#3b82f6';
		}
	}

	const isDark = isDarkBackground(backgroundColor);

	return {
		bg: schemaVersion === 2
			? { type: 'color', value: backgroundColor }
			: tokens.bg || { type: 'color', value: '#ffffff' },
		text,
		primary,
		surface,
		border,
		blockBase,
		shadowColor: tokens.shadowColor || '#000000',
		fontFamily,
		secondary: adjustColor(primary, -20),
		textSecondary: adjustColor(text, isDark ? -30 : 30),
		mutedTextColor: schemaVersion === 2 
			? (resolveSemanticToken(semantic.color?.text?.muted, config) || text)
			: (tokens.mutedTextColor || adjustColor(text, isDark ? -30 : 30)),
		shadowLevel: (layout.pagePadding || 16) > 18 ? 'md' : 'sm',
		backgroundColor,
		textColor: text,
		primaryColor: primary,
		spacing: layout.pagePadding || 16
	};
}

// Deep merge overrides into config
function applyOverrides(baseConfig: any, overrides: Record<string, any>): any {
	const config = JSON.parse(JSON.stringify(baseConfig));

	Object.entries(overrides).forEach(([key, value]) => {
		// Map old keys to new structure
		if (key === 'backgroundColor') {
			// Check if it's a pattern (starts with "background:")
			if (typeof value === 'string' && value.startsWith('background:')) {
				// Pattern format - store as-is in tokens.bg
				config.tokens.bg = { type: 'color', value };
				return;
			}

			// Detect type from value
			if (value.includes('gradient')) {
				// Just store the full gradient string as-is
				// The bgTokenToCSS function will handle it correctly
				config.tokens.bg = { type: 'color', value };
			} else {
				config.tokens.bg = { type: 'color', value };
			}
			return;
		}
		if (key === 'backgroundVideo') {
			config.backgroundVideo = value;
			return;
		}

		// Handle nested keys (e.g., "tokens.bg", "tokens.blockBase", "page.blockGap")
		const keys = key.split('.');
		let target = config;
		for (let i = 0; i < keys.length - 1; i++) {
			if (!target[keys[i]]) target[keys[i]] = {};
			target = target[keys[i]];
		}
		target[keys[keys.length - 1]] = value;
	});

	return config;
}

// Convert old format to new
function convertOldFormat(customTheme: any): any {
	return {
		meta: { id: 'custom', name: 'Custom', schemaVersion: 1, version: '1.0.0' },
		tokens: {
			bg: { type: 'color', value: customTheme.backgroundColor || '#ffffff' },
			text: customTheme.textColor || '#000000',
			primary: customTheme.primaryColor || '#3b82f6',
			surface: '#fafafa',
			border: '#e5e5e5',
			blockBase: customTheme.primaryColor || '#3b82f6',
			fontFamily: customTheme.fontFamily || 'Inter, sans-serif'
		},
		defaults: {
			headerPreset: 'no-cover',
			blockPreset: 'rounded',
			blockStylePreset: 'solid'
		},
		page: {
			mode: 'light',
			layout: {
				maxWidth: 480,
				pagePadding: customTheme.spacing || 16,
				blockGap: customTheme.borderRadius || 12,
				textAlign: 'center'
			}
		}
	};
}

// ============================================
// BLOCK STYLE RESOLVER
// ============================================

// Helper: Apply opacity to color
function applyOpacity(color: string, opacity: number): string {
	if (opacity >= 100) return color;
	if (!color) return color;

	if (color.startsWith('rgba(')) {
		return color.replace(/[\d.]+\)$/, `${opacity / 100})`);
	}
	if (color.startsWith('rgb(')) {
		return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity / 100})`);
	}
	if (color.startsWith('#')) {
		const hex = color.replace('#', '');
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
	}
	if (color.includes('linear-gradient')) {
		return color.replace(/#[0-9a-fA-F]{6}/g, (hex) => applyOpacity(hex, opacity));
	}
	return color;
}

// Resolve block style recipe with theme tokens
function resolveBlockStyle(
	recipeId: BlockStylePresetId,
	tokens: ThemeTokens,
	overrides?: Record<string, any>,
	themeConfig?: any
): ResolvedBlockStyle {
	const recipe = getBlockStyleRecipe(recipeId);

	// Resolve fill color
	let fill = resolveToken(recipe.fill, tokens);

	// Resolve text color
	let text: string;
	if (recipe.text === 'auto') {
		text = resolveAutoTextColor(recipe.fill, tokens);
	} else {
		text = resolveToken(recipe.text, tokens);
	}

	// Resolve border (optional) - format as CSS border string
	let border: string | undefined;
	if (recipe.border && recipe.border !== 'none') {
		const borderColor = resolveToken(recipe.border, tokens);
		if (borderColor && borderColor !== 'none') {
			const borderWidth = resolveBorderWidth(themeConfig?.page?.defaults?.borderWidth);
			border = `${borderWidth}px solid ${borderColor}`;
		}
	}

	// Resolve glow color (optional)
	const glow = recipe.glow ? resolveToken(recipe.glow, tokens) : undefined;

	// Resolve shadow - from override only (shadow is not part of recipe)
	const shadow = overrides?.shadow || undefined;

	// Get blockOpacity from theme config or overrides
	const blockOpacity = (overrides?.opacity as number) 
		?? (themeConfig?.page?.defaults?.blockOpacity as number)
		?? 100;

	// Apply opacity to fill
	if (recipeId === 'glass') {
		// Glass: Map blockOpacity (0-100) to glass range (10-35)
		// Formula: glassOpacity = 10 + (blockOpacity / 100) * 25
		const glassOpacity = Math.max(10, Math.min(35, 10 + (blockOpacity / 100) * 25));
		fill = applyOpacity(fill, glassOpacity);
	} else if (recipeId !== 'outline' && blockOpacity < 100) {
		// Other styles: Apply blockOpacity normally (except outline which is transparent)
		fill = applyOpacity(fill, blockOpacity);
	}

	const result = {
		recipe,
		fill,
		text,
		border,
		glow,
		blur: recipe.blur,
		shadow,
		opacity: blockOpacity
	};
	
	return result;
}

// ============================================
// MAIN RESOLVER
// ============================================

export function resolveAppearance(
	theme: Theme | null,
	pageState: any
): ResolvedAppearance {
	const isNewFormat = pageState.overrides !== undefined;
	let themeConfig: any;
	let themeName = 'Custom';

	if (isNewFormat) {
		// NEW FORMAT: { themeKey, overrides, headerPresetId }
		const baseConfig = theme?.config || DEFAULT_CONFIG;

		// Filter theme-level overrides (not header.* or block.*)
		const themeOverrides: Record<string, any> = {};
		Object.entries(pageState.overrides || {}).forEach(([key, value]) => {
			if (!key.startsWith('header.') && !key.startsWith('block.')) {
				themeOverrides[key] = value;
			}
		});

		themeConfig = applyOverrides(baseConfig, themeOverrides);
		themeName = Object.keys(themeOverrides).length > 0 ? 'Custom' : (theme?.name || 'Custom');
	} else {
		// OLD FORMAT: { themeKey, customTheme, headerStyle, blockStyle }
		if (pageState.customTheme) {
			themeConfig = convertOldFormat(pageState.customTheme);
			themeName = 'Custom';
		} else {
			themeConfig = theme?.config || DEFAULT_CONFIG;
			themeName = theme?.name || 'Default';
		}
	}

	const tokens = expandThemeTokens(themeConfig);

	// Resolve header preset
	const defaultHeaderId = theme?.defaultHeaderPresetId
		|| themeConfig.page?.defaults?.headerPresetId
		|| themeConfig.defaults?.headerPreset
		|| 'no-cover';
	const headerPresetId = isNewFormat
		? (pageState.headerPresetId || defaultHeaderId)
		: (pageState.headerStyle?.presetId || defaultHeaderId);

	const headerOverrides = isNewFormat
		? Object.fromEntries(
			Object.entries(pageState.overrides || {})
				.filter(([key]) => key.startsWith('header.'))
				.map(([key, value]) => [key.replace('header.', ''), value])
		)
		: (pageState.headerStyle?.overrides || {});

	// Get header preset from store (with fallback to hardcoded)
	const $headerPresets = get(headerPresets);
	const headerPresetsMap = Object.keys($headerPresets).length > 0 ? $headerPresets : HEADER_PRESETS;

	// Resolve block overrides
	const blockOverrides = isNewFormat
		? Object.fromEntries(
			Object.entries(pageState.overrides || {})
				.filter(([key]) => key.startsWith('block.'))
				.map(([key, value]) => [key.replace('block.', ''), value])
		)
		: (pageState.blockStyle?.overrides || {});

	// Build custom shadow if shadowStyle is 'custom'
	const shadowStyle = themeConfig.page?.defaults?.shadowStyle;
	const shadowCustom = themeConfig.page?.defaults?.shadowCustom;
	if (shadowStyle === 'custom' && shadowCustom) {
		// Build shadow from custom values
		const shadowColor = tokens.shadowColor || '#000000';
		const applyOpacityToShadow = (color: string, opacity: number): string => {
			if (color.startsWith('#')) {
				const hex = color.replace('#', '');
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, ${opacity})`;
			}
			return `rgba(0, 0, 0, ${opacity})`;
		};
		blockOverrides.shadow = `${shadowCustom.offsetX}px ${shadowCustom.offsetY}px ${shadowCustom.blur}px ${shadowCustom.spread}px ${applyOpacityToShadow(shadowColor, shadowCustom.opacity)}`;
	} else if (shadowStyle && shadowStyle !== 'none' && shadowStyle !== 'custom') {
		// Use centralized shadow recipes
		blockOverrides.shadow = resolveShadowValue(shadowStyle as ShadowStylePreset, tokens.shadowColor || '#000000');
	}

	// Resolve block style recipe
	const defaultBlockStyleId = themeConfig.page?.defaults?.blockStylePreset
		|| themeConfig.defaults?.blockStylePreset
		|| 'solid';
	const blockStyleId = (blockOverrides.stylePreset || defaultBlockStyleId) as BlockStylePresetId;
	const blockStyle = resolveBlockStyle(blockStyleId, tokens, blockOverrides, themeConfig);

	// Resolve page layout
	const pageLayout = {
		maxWidth: resolveMaxWidth(
			(pageState.overrides?.['page.maxWidth'] as any)
			?? themeConfig.page?.layout?.maxWidth
		),
		pagePadding: resolvePagePadding(
			(pageState.overrides?.['page.pagePadding'] as any)
			?? themeConfig.page?.layout?.pagePadding
		),
		blockGap: resolveBlockGap(
			pageState.overrides?.['page.blockGap']
			?? themeConfig.page?.layout?.blockGap
		),
		textAlign: (pageState.overrides?.['page.textAlign'] as 'left' | 'center' | 'right')
			?? themeConfig.page?.layout?.textAlign
			?? 'center',
		linkIconShape: (pageState.overrides?.['page.linkIconShape'] as 'square' | 'rounded' | 'circle')
			?? themeConfig.page?.defaults?.linkIconShape
			?? 'rounded'
	};

	// Resolve block config using centralized tokens
	const blockConfig = {
		borderRadius: resolveRadius(
			(blockOverrides.borderRadius as any)
			?? themeConfig.page?.defaults?.borderRadius
		),
		shape: 'rounded' as const,
		padding: resolveBlockPadding(
			themeConfig.page?.layout?.blockPadding
		),
		borderWidth: resolveBorderWidth(
			themeConfig.page?.defaults?.borderWidth
		)
	};

	return {
		theme: theme || {
			id: 0,
			key: 'custom',
			name: themeName,
			config: themeConfig
		},
		tokens,
		header: { ...(headerPresetsMap[headerPresetId] || headerPresetsMap['no-cover'] || HEADER_PRESETS['no-cover']), ...headerOverrides },
		page: pageLayout,
		block: blockConfig,
		blockStyle
	};
}

// ============================================
// HELPERS
// ============================================

export function getAvailableHeaderPresets() {
	return Object.values(HEADER_PRESETS);
}
