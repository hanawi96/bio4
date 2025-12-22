import type { 
	PageAppearanceState, 
	ResolvedAppearance, 
	Theme,
	ThemeTokens,
	ThemeConfig,
	HeaderPreset,
	BlockPreset 
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
	// Simple lightness adjustment
	const num = parseInt(hex.replace('#', ''), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
	return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// ============================================
// MAIN RESOLVER
// ============================================

export function resolveAppearance(
	theme: Theme | null,
	pageState: PageAppearanceState
): ResolvedAppearance {
	// Get theme config (from DB theme or customTheme)
	let themeConfig: ThemeConfig;
	let themeName = 'Custom';
	
	if (theme) {
		themeConfig = theme.config;
		themeName = theme.name;
	} else if (pageState.customTheme) {
		themeConfig = pageState.customTheme;
	} else {
		// Fallback default
		themeConfig = {
			backgroundColor: '#ffffff',
			textColor: '#000000',
			primaryColor: '#3b82f6',
			fontFamily: 'Inter, sans-serif',
			borderRadius: 12,
			spacing: 16
		};
	}
	
	const tokens = expandThemeTokens(themeConfig);
	
	// Get header preset
	const defaultHeaderId = theme?.defaultHeaderPresetId || 'no-cover';
	const headerPresetId = pageState.headerStyle?.presetId || defaultHeaderId;
	const headerPreset = HEADER_PRESETS[headerPresetId] || HEADER_PRESETS['no-cover'];
	
	// Get block preset
	const defaultBlockId = theme?.defaultBlockPresetId || 'rounded-solid';
	const blockPresetId = pageState.blockStyle?.presetId || defaultBlockId;
	const blockPreset = BLOCK_PRESETS[blockPresetId] || BLOCK_PRESETS['rounded-solid'];
	
	// Merge: preset + overrides
	const resolvedHeader = {
		...headerPreset,
		...(pageState.headerStyle?.overrides || {})
	};
	
	const resolvedBlock = {
		...blockPreset,
		...(pageState.blockStyle?.overrides || {})
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
// RESET HELPERS
// ============================================

export function resetHeaderToThemeDefault(
	theme: Theme | null,
	pageState: PageAppearanceState
): PageAppearanceState {
	const defaultHeaderId = theme?.defaultHeaderPresetId || 'no-cover';
	
	return {
		...pageState,
		headerStyle: {
			presetId: defaultHeaderId,
			overrides: undefined
		}
	};
}

export function resetBlockToThemeDefault(
	theme: Theme | null,
	pageState: PageAppearanceState
): PageAppearanceState {
	const defaultBlockId = theme?.defaultBlockPresetId || 'rounded-solid';
	
	return {
		...pageState,
		blockStyle: {
			presetId: defaultBlockId,
			overrides: undefined
		}
	};
}

// ============================================
// CHECK IF USING DEFAULTS
// ============================================

export function isHeaderDefault(
	theme: Theme | null,
	pageState: PageAppearanceState
): boolean {
	const defaultHeaderId = theme?.defaultHeaderPresetId || 'no-cover';
	return (
		(!pageState.headerStyle || pageState.headerStyle.presetId === defaultHeaderId) &&
		!pageState.headerStyle?.overrides
	);
}

export function isBlockDefault(
	theme: Theme | null,
	pageState: PageAppearanceState
): boolean {
	const defaultBlockId = theme?.defaultBlockPresetId || 'rounded-solid';
	return (
		(!pageState.blockStyle || pageState.blockStyle.presetId === defaultBlockId) &&
		!pageState.blockStyle?.overrides
	);
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
