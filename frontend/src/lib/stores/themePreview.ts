import { writable } from 'svelte/store';

// Isolated stores for theme preview (won't affect main appearance editor)
export const previewAppearance = writable<any>(null);
export const previewAppearanceState = writable<any>({});
export const previewPage = writable<any>(null);

// Block style presets mapping
const BLOCK_STYLE_PRESETS: Record<string, any> = {
	solid: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: primaryColor,
		text: '#ffffff',
		border: 'none',
		shadow: 'none',
		glow: null,
		blur: null
	}),
	soft: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: `${primaryColor}15`, // 15 = ~8% opacity in hex
		text: primaryColor,
		border: `${borderWidth}px solid ${borderColor}`,
		shadow: 'none',
		glow: null,
		blur: null
	}),
	outline: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: 'transparent',
		text: primaryColor,
		border: `${borderWidth}px solid ${borderColor}`,
		shadow: 'none',
		glow: null,
		blur: null
	}),
	glass: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: 'rgba(255, 255, 255, 0.1)',
		text: primaryColor,
		border: `${borderWidth}px solid ${borderColor}`,
		shadow: 'none',
		glow: null,
		blur: 12
	}),
	neon: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: primaryColor,
		text: '#ffffff',
		border: 'none',
		shadow: 'none',
		glow: primaryColor,
		blur: null
	}),
	brutal: (primaryColor: string, borderColor: string, borderWidth: number) => ({
		fill: primaryColor,
		text: '#ffffff',
		border: `${borderWidth}px solid ${borderColor}`,
		shadow: `4px 4px 0 ${borderColor}`,
		glow: null,
		blur: null
	})
};

// Helper to build appearance from theme config
export function buildPreviewAppearance(config: any, blockStylePreset: string = 'solid') {
	if (!config) return null;

	const tokens = config.tokens || {};
	const semantic = config.semantic || {};
	const recipes = config.recipes || {};

	// Resolve refs
	const resolveRef = (value: any, config: any): any => {
		if (typeof value === 'string' && value.startsWith('ref:')) {
			const path = value.replace('ref:', '').split('.');
			let resolved: any = config;
			for (const k of path) {
				resolved = resolved?.[k];
				if (!resolved) break;
			}
			return resolved || value;
		}
		return value;
	};

	// Build tokens
	const backgroundColor = resolveRef(semantic?.color?.surface?.page, config) || '#ffffff';
	const primaryColor = resolveRef(semantic?.color?.primary, config) || '#3b82f6';
	const textColor = resolveRef(semantic?.color?.text?.default, config) || '#000000';
	const mutedTextColor = resolveRef(semantic?.color?.text?.muted, config) || '#71717a';
	const borderColor = resolveRef(semantic?.color?.border?.default, config) || '#e4e4e7';
	const borderWidth = resolveRef(tokens?.border?.width?.default, config) || 1;
	const blockBase = primaryColor;

	// Build block style from preset
	const styleBuilder = BLOCK_STYLE_PRESETS[blockStylePreset] || BLOCK_STYLE_PRESETS.solid;
	const blockStyle = styleBuilder(primaryColor, borderColor, borderWidth);

	return {
		tokens: {
			backgroundColor,
			primaryColor,
			textColor,
			mutedTextColor,
			blockBase,
			fontFamily: tokens?.typography?.fontFamily?.sans || 'Inter, sans-serif'
		},
		theme: { config },
		blockStyle,
		block: {
			borderRadius: 12
		}
	};
}
