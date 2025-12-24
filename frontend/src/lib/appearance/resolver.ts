import type { 
	ResolvedAppearance, 
	Theme,
	ThemeTokens,
	ThemeConfig
} from './types';
import { HEADER_PRESETS, BLOCK_PRESETS } from './presets';

// ============================================
// THEME HELPERS
// ============================================

// Expand ThemeConfig to full ThemeTokens
function expandThemeTokens(config: ThemeConfig): ThemeTokens {
	// Compute derived colors
	const isDark = config.backgroundColor.toLowerCase().includes('#1') || 
	               config.backgroundColor.toLowerCase().includes('#0');
	
	return {
		...config,
		// Map to new names
		secondary: adjustColor(config.primaryColor, -20),
		surface: adjustColor(config.backgroundColor, isDark ? 10 : -5),
		textSecondary: adjustColor(config.textColor, isDark ? -30 : 30),
		border: adjustColor(config.backgroundColor, isDark ? 20 : -15),
		shadowLevel: config.spacing > 18 ? 'md' : 'sm'
	};
}

// Simple color adjustment helper
function adjustColor(hex: string, percent: number): string {
	// Handle non-hex colors (gradients, etc)
	if (!hex || !hex.startsWith('#')) {
		return hex || '#000000';
	}
	
	// Simple lightness adjustment
	const num = parseInt(hex.replace('#', ''), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
	return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// ============================================
// MAIN RESOLVER (Supports both old and new format)
// ============================================

export function resolveAppearance(
	theme: Theme | null,
	pageState: any // Accept any format
): ResolvedAppearance {
	// Detect format: new format has 'overrides' at root level
	const isNewFormat = pageState.overrides !== undefined;
	
	// Get theme config
	let themeConfig: ThemeConfig;
	let themeName = 'Custom';
	
	if (isNewFormat) {
		// NEW FORMAT: { themeKey, overrides, headerPresetId, blockPresetId }
		const baseConfig = theme?.config || {
			backgroundColor: '#ffffff',
			textColor: '#000000',
			primaryColor: '#3b82f6',
			fontFamily: 'Inter, sans-serif',
			borderRadius: 12,
			spacing: 16
		};
		
		// Apply theme-level overrides (not header.* or block.*)
		const themeOverrides: any = {};
		Object.entries(pageState.overrides || {}).forEach(([key, value]) => {
			if (!key.startsWith('header.') && !key.startsWith('block.')) {
				themeOverrides[key] = value;
			}
		});
		
		themeConfig = { ...baseConfig, ...themeOverrides };
		themeName = Object.keys(themeOverrides).length > 0 ? 'Custom' : (theme?.name || 'Custom');
	} else {
		// OLD FORMAT: { themeKey, customTheme, headerStyle, blockStyle }
		if (pageState.customTheme) {
			themeConfig = pageState.customTheme;
			themeName = 'Custom';
		} else if (theme) {
			themeConfig = theme.config;
			themeName = theme.name;
		} else {
			themeConfig = {
				backgroundColor: '#ffffff',
				textColor: '#000000',
				primaryColor: '#3b82f6',
				fontFamily: 'Inter, sans-serif',
				borderRadius: 12,
				spacing: 16
			};
		}
	}
	
	const tokens = expandThemeTokens(themeConfig);
	
	// Get header preset
	const defaultHeaderId = theme?.defaultHeaderPresetId || 'no-cover';
	let headerPresetId: string;
	let headerOverrides: any = {};
	
	if (isNewFormat) {
		headerPresetId = pageState.headerPresetId || defaultHeaderId;
		// Extract header.* overrides
		Object.entries(pageState.overrides || {}).forEach(([key, value]) => {
			if (key.startsWith('header.')) {
				headerOverrides[key.replace('header.', '')] = value;
			}
		});
	} else {
		headerPresetId = pageState.headerStyle?.presetId || defaultHeaderId;
		headerOverrides = pageState.headerStyle?.overrides || {};
	}
	
	const headerPreset = HEADER_PRESETS[headerPresetId] || HEADER_PRESETS['no-cover'];
	
	// Get block preset
	const defaultBlockId = theme?.defaultBlockPresetId || 'rounded-solid';
	let blockPresetId: string;
	let blockOverrides: any = {};
	
	if (isNewFormat) {
		blockPresetId = pageState.blockPresetId || defaultBlockId;
		// Extract block.* overrides
		Object.entries(pageState.overrides || {}).forEach(([key, value]) => {
			if (key.startsWith('block.')) {
				blockOverrides[key.replace('block.', '')] = value;
			}
		});
	} else {
		blockPresetId = pageState.blockStyle?.presetId || defaultBlockId;
		blockOverrides = pageState.blockStyle?.overrides || {};
	}
	
	const blockPreset = BLOCK_PRESETS[blockPresetId] || BLOCK_PRESETS['rounded-solid'];
	
	// Merge: preset + overrides
	const resolvedHeader = {
		...headerPreset,
		...headerOverrides
	};
	
	const resolvedBlock = {
		...blockPreset,
		...blockOverrides
	};
	
	return {
		theme: theme || { 
			id: 0, 
			key: 'custom', 
			name: themeName, 
			config: themeConfig 
		},
		tokens,
		header: resolvedHeader,
		block: resolvedBlock
	};
}

// ============================================
// HELPER: Get all available options
// ============================================

export function getAvailableHeaderPresets() {
	return Object.values(HEADER_PRESETS);
}

export function getAvailableBlockPresets() {
	return Object.values(BLOCK_PRESETS);
}
