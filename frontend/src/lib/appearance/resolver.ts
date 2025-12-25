import type { ResolvedAppearance, Theme, ThemeTokens, ResolvedBlockStyle } from './types';
import { HEADER_PRESETS, BLOCK_PRESETS } from './presets';
import { getBlockStyleRecipe, type BlockStylePresetId } from './blockStyles';
import { resolveToken, resolveAutoTextColor } from './tokenResolver';

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

// Expand ThemeConfig to full ThemeTokens
function expandThemeTokens(config: any): ThemeTokens {
	const tokens = config.tokens || {};
	const layout = config.page?.layout || {};
	const backgroundColor = bgTokenToCSS(tokens.bg);

	// Better dark mode detection
	const isDark = config.page?.mode === 'dark' ||
		backgroundColor.includes('#000') ||
		backgroundColor.includes('#111');

	return {
		bg: tokens.bg || { type: 'color', value: '#ffffff' },
		text: tokens.text || '#000000',
		primary: tokens.primary || '#3b82f6',
		surface: tokens.surface || '#fafafa',
		border: tokens.border || '#e5e5e5',
		blockBase: tokens.blockBase || '#3b82f6',
		shadowColor: tokens.shadowColor || '#000000',
		fontFamily: tokens.fontFamily || 'Inter, sans-serif',
		secondary: adjustColor(tokens.primary || '#3b82f6', -20),
		textSecondary: adjustColor(tokens.text || '#000000', isDark ? -30 : 30),
		shadowLevel: (layout.pagePadding || 16) > 18 ? 'md' : 'sm',
		backgroundColor,
		textColor: tokens.text || '#000000',
		primaryColor: tokens.primary || '#3b82f6',
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
				// Parse gradient to extract colors and angle
				const matches = value.match(/#[0-9a-fA-F]{6}/g);
				const angleMatch = value.match(/(\d+)deg/);
				if (matches && matches.length >= 2) {
					config.tokens.bg = {
						type: 'gradient',
						value: {
							from: matches[0],
							to: matches[1],
							angle: angleMatch ? parseInt(angleMatch[1]) : 135
						}
					};
				} else {
					// Fallback to storing as color with gradient string
					config.tokens.bg = { type: 'color', value };
				}
			} else {
				config.tokens.bg = { type: 'color', value };
			}
			return;
		}
		if (key === 'backgroundVideo') {
			config.backgroundVideo = value;
			return;
		}

		// Handle nested keys (e.g., "tokens.bg")
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

// Resolve block style recipe with theme tokens
function resolveBlockStyle(
	recipeId: BlockStylePresetId,
	tokens: ThemeTokens
): ResolvedBlockStyle {
	const recipe = getBlockStyleRecipe(recipeId);

	// Resolve fill color
	const fill = resolveToken(recipe.fill, tokens);

	// Resolve text color
	let text: string;
	if (recipe.text === 'auto') {
		text = resolveAutoTextColor(recipe.fill, tokens);
	} else {
		text = resolveToken(recipe.text, tokens);
	}

	// Resolve border color (optional)
	const border = recipe.border ? resolveToken(recipe.border, tokens) : undefined;

	// Resolve glow color (optional)
	const glow = recipe.glow ? resolveToken(recipe.glow, tokens) : undefined;

	// Resolve shadow - if it's a token reference, resolve it; otherwise use as-is
	const shadow = recipe.shadow 
		? (recipe.shadow.includes('px') 
			? recipe.shadow 
			: `4px 4px 0px ${resolveToken(recipe.shadow, tokens)}`)
		: undefined;

	return {
		recipe,
		fill,
		text,
		border,
		glow,
		blur: recipe.blur,
		shadow
	};
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
		// NEW FORMAT: { themeKey, overrides, headerPresetId, blockPresetId }
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
	const defaultHeaderId = theme?.defaultHeaderPresetId || themeConfig.defaults?.headerPreset || 'no-cover';
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

	// Resolve block preset
	const defaultBlockId = theme?.defaultBlockPresetId || themeConfig.defaults?.blockPreset || 'rounded-solid';
	const blockPresetId = isNewFormat
		? (pageState.blockPresetId || defaultBlockId)
		: (pageState.blockStyle?.presetId || defaultBlockId);

	const blockOverrides = isNewFormat
		? Object.fromEntries(
			Object.entries(pageState.overrides || {})
				.filter(([key]) => key.startsWith('block.'))
				.map(([key, value]) => [key.replace('block.', ''), value])
		)
		: (pageState.blockStyle?.overrides || {});

	// Resolve block style recipe
	const defaultBlockStyleId = themeConfig.defaults?.blockStylePreset || 'solid';
	const blockStyleId = (blockOverrides.stylePreset || defaultBlockStyleId) as BlockStylePresetId;
	const blockStyle = resolveBlockStyle(blockStyleId, tokens);

	return {
		theme: theme || {
			id: 0,
			key: 'custom',
			name: themeName,
			config: themeConfig
		},
		tokens,
		header: { ...(HEADER_PRESETS[headerPresetId] || HEADER_PRESETS['no-cover']), ...headerOverrides },
		block: { ...(BLOCK_PRESETS[blockPresetId] || BLOCK_PRESETS['rounded-solid']), ...blockOverrides },
		blockStyle
	};
}

// ============================================
// HELPERS
// ============================================

export function getAvailableHeaderPresets() {
	return Object.values(HEADER_PRESETS);
}

export function getAvailableBlockPresets() {
	return Object.values(BLOCK_PRESETS);
}
