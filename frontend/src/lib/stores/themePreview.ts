import { writable } from 'svelte/store';
import { getGradientColors, type GradientPreset } from '$lib/utils/colorUtils';
import { resolveBorderWidth } from '$lib/appearance/spacingTokens';
import { SHADOW_RECIPES, type ShadowStylePreset } from '$lib/appearance/blockStyles';

// Isolated stores for theme preview (won't affect main appearance editor)
export const previewAppearance = writable<any>(null);
export const previewAppearanceState = writable<any>({});
export const previewPage = writable<any>(null);

// Block style presets mapping (simplified - recipes are in blockStyles.ts)
const BLOCK_STYLE_PRESETS: Record<string, any> = {
	solid: (primaryColor: string, blockTextColor: string) => ({
		fill: primaryColor,
		text: blockTextColor,
		border: 'none',
		glow: null,
		blur: null
	}),
	outline: (borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: 'transparent',
		text: blockTextColor,
		border: `${borderWidth}px solid ${borderColor}`,
		glow: null,
		blur: null
	}),
	glass: (borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: 'rgba(255, 255, 255, 1)', // Will be adjusted by opacity logic
		text: blockTextColor,
		border: `${borderWidth}px solid ${borderColor}`,
		glow: null,
		blur: 10
	}),
	neon: (primaryColor: string, blockTextColor: string) => ({
		fill: primaryColor,
		text: blockTextColor,
		border: 'none',
		glow: primaryColor,
		blur: null
	}),
	brutal: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: primaryColor,
		text: blockTextColor,
		border: `${borderWidth}px solid ${borderColor}`,
		glow: null,
		blur: null
	}),
	gradient: (primaryColor: string, blockTextColor: string, gradientPreset: GradientPreset) => {
		const gradient = getGradientColors(primaryColor, gradientPreset);
		return {
			fill: gradient.css,
			text: blockTextColor,
			border: 'none',
			glow: null,
			blur: null
		};
	}
};

// Helper to build appearance from theme config
export function buildPreviewAppearance(
	config: any,
	blockStylePreset: string = 'solid',
	shadowStylePreset: string = 'none',
	blockOpacity: number = 100,
	shadowCustom?: { offsetX: number; offsetY: number; blur: number; spread: number; opacity: number },
	gradientPreset: GradientPreset = 'diagonal-dark'
) {
	if (!config) return null;

	const tokens = config.tokens || {};
	const semantic = config.semantic || {};

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
	// mutedTextColor removed - auto-calculated from textColor with 60% opacity
	const borderColor = resolveRef(semantic?.color?.border?.default, config) || '#e4e4e7';
	const borderWidth = resolveBorderWidth(config.page?.defaults?.borderWidth);
	const blockTextColor = resolveRef(semantic?.color?.block?.text, config) || '#ffffff';
	const shadowColor = resolveRef(semantic?.color?.shadow?.default, config) || '#000000';
	
	// Typography colors - auto-calculate muted from heading
	const headingColor = textColor;
	const mutedColor = (() => {
		if (!textColor) return 'rgba(0, 0, 0, 0.85)';
		if (textColor.startsWith('#')) {
			const hex = textColor.replace('#', '');
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgba(${r}, ${g}, ${b}, 0.85)`;
		}
		if (textColor.startsWith('rgb')) {
			const match = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
			if (match) {
				const [, r, g, b] = match;
				return `rgba(${r}, ${g}, ${b}, 0.85)`;
			}
		}
		return textColor;
	})();

	// Build block style from preset
	const styleBuilder = BLOCK_STYLE_PRESETS[blockStylePreset] || BLOCK_STYLE_PRESETS.solid;
	let blockStyle: any;
	
	switch (blockStylePreset) {
		case 'solid':
		case 'neon':
			blockStyle = styleBuilder(primaryColor, blockTextColor);
			break;
		case 'outline':
		case 'glass':
			blockStyle = styleBuilder(borderColor, borderWidth, blockTextColor);
			break;
		case 'brutal':
			blockStyle = styleBuilder(primaryColor, borderColor, borderWidth, blockTextColor);
			break;
		case 'gradient':
			blockStyle = styleBuilder(primaryColor, blockTextColor, gradientPreset);
			break;
		default:
			blockStyle = styleBuilder(primaryColor, blockTextColor);
	}

	// Apply opacity to fill
	const applyOpacity = (color: string, opacity: number): string => {
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
		if (color.includes('gradient')) {
			// Apply opacity to all gradient types (linear, radial, conic)
			return color.replace(/#[0-9a-fA-F]{6}/g, (hex) => applyOpacity(hex, opacity));
		}
		return color;
	};

	if (blockStylePreset === 'glass') {
		// Glass: Map blockOpacity (0-100) to glass range (10-35)
		const glassOpacity = Math.max(10, Math.min(35, 10 + (blockOpacity / 100) * 25));
		blockStyle = {
			...blockStyle,
			fill: applyOpacity(blockStyle.fill, glassOpacity)
		};
	} else if (blockStylePreset !== 'outline') {
		// Other styles: Apply blockOpacity normally (except outline which is transparent)
		blockStyle = {
			...blockStyle,
			fill: applyOpacity(blockStyle.fill, blockOpacity)
		};
	}

	// Build shadow separately (but not for Neon - it has glow instead)
	let shadow: string;
	if (blockStylePreset === 'neon') {
		shadow = 'none';
	} else if (shadowStylePreset === 'custom' && shadowCustom) {
		// Use custom shadow values with theme shadowColor
		const hexToRgba = (color: string, opacity: number): string => {
			if (color.startsWith('#')) {
				const hex = color.replace('#', '');
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, ${opacity})`;
			}
			return `rgba(0, 0, 0, ${opacity})`;
		};
		shadow = `${shadowCustom.offsetX}px ${shadowCustom.offsetY}px ${shadowCustom.blur}px ${shadowCustom.spread}px ${hexToRgba(shadowColor, shadowCustom.opacity)}`;
	} else {
		// Use centralized shadow recipes
		const recipe = SHADOW_RECIPES[shadowStylePreset as ShadowStylePreset] || SHADOW_RECIPES.none;
		shadow = recipe.value.replace(/shadowColor(@[\d.]+)?/g, (_, opacity) => {
			if (!opacity) return shadowColor;
			const opacityValue = parseFloat(opacity.substring(1));
			if (shadowColor.startsWith('#')) {
				const hex = shadowColor.replace('#', '');
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
			}
			return shadowColor;
		});
	}

	return {
		tokens: {
			backgroundColor,
			primaryColor,
			textColor,
			mutedTextColor: mutedColor, // Auto-calculated
			blockBase: primaryColor,
			fontFamily: tokens?.typography?.fontFamily?.sans || 'Inter, sans-serif'
		},
		theme: { config },
		blockStyle: {
			...blockStyle,
			shadow // Add shadow to blockStyle
		},
		block: {
			borderRadius: 12
		},
		textColor,
		mutedTextColor: mutedColor, // Auto-calculated
		typography: {
			headingColor,
			mutedColor
		}
	};
}
