import { writable } from 'svelte/store';

// Isolated stores for theme preview (won't affect main appearance editor)
export const previewAppearance = writable<any>(null);
export const previewAppearanceState = writable<any>({});
export const previewPage = writable<any>(null);

// Shadow style presets mapping
const SHADOW_PRESETS: Record<string, (shadowColor: string) => string> = {
	none: () => 'none',
	soft: (shadowColor: string) => `0 2px 8px ${shadowColor}26`, // 15% opacity
	medium: (shadowColor: string) => `0 4px 12px ${shadowColor}33`, // 20% opacity
	hard: (shadowColor: string) => `0 6px 16px ${shadowColor}4D`, // 30% opacity
	brutal: (shadowColor: string) => `4px 4px 0px ${shadowColor}`
};

// Block style presets mapping (without shadow - shadow is now separate)
const BLOCK_STYLE_PRESETS: Record<string, any> = {
	solid: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: primaryColor,
		text: blockTextColor,
		border: 'none',
		glow: null,
		blur: null
	}),
	outline: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: 'transparent',
		text: blockTextColor,
		border: `${borderWidth}px solid ${borderColor}`,
		glow: null,
		blur: null
	}),
	glass: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => ({
		fill: 'rgba(255, 255, 255, 1)', // Will be adjusted by opacity logic
		text: blockTextColor,
		border: `${borderWidth}px solid ${borderColor}`,
		glow: null,
		blur: 12
	}),
	neon: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => ({
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
	gradient: (primaryColor: string, borderColor: string, borderWidth: number, blockTextColor: string) => {
		const darken = (hex: string, percent: number) => {
			const num = parseInt(hex.replace('#', ''), 16);
			const r = Math.max(0, ((num >> 16) & 0xff) * (1 - percent / 100));
			const g = Math.max(0, ((num >> 8) & 0xff) * (1 - percent / 100));
			const b = Math.max(0, (num & 0xff) * (1 - percent / 100));
			return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
		};
		return {
			fill: `linear-gradient(135deg, ${primaryColor} 0%, ${darken(primaryColor, 20)} 100%)`,
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
	shadowCustom?: { offsetX: number; offsetY: number; blur: number; spread: number; opacity: number }
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
	const mutedTextColor = resolveRef(semantic?.color?.text?.muted, config) || '#71717a';
	const borderColor = resolveRef(semantic?.color?.border?.default, config) || '#e4e4e7';
	const borderWidth = config.page?.defaults?.borderWidth || 1;
	const blockTextColor = resolveRef(semantic?.color?.block?.text, config) || '#ffffff';
	const shadowColor = resolveRef(tokens?.color?.shadowColor, config) || '#000000';

	// Build block style from preset (without shadow)
	const styleBuilder = BLOCK_STYLE_PRESETS[blockStylePreset] || BLOCK_STYLE_PRESETS.solid;
	let blockStyle = styleBuilder(primaryColor, borderColor, borderWidth, blockTextColor);

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
		if (color.includes('linear-gradient')) {
			// Apply opacity to gradient colors
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
		const applyOpacity = (color: string, opacity: number): string => {
			if (color.startsWith('#')) {
				const hex = color.replace('#', '');
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				return `rgba(${r}, ${g}, ${b}, ${opacity})`;
			}
			return `rgba(0, 0, 0, ${opacity})`;
		};
		shadow = `${shadowCustom.offsetX}px ${shadowCustom.offsetY}px ${shadowCustom.blur}px ${shadowCustom.spread}px ${applyOpacity(shadowColor, shadowCustom.opacity)}`;
	} else {
		// Use preset shadow
		const shadowBuilder = SHADOW_PRESETS[shadowStylePreset] || SHADOW_PRESETS.none;
		shadow = shadowBuilder(shadowColor);
	}

	return {
		tokens: {
			backgroundColor,
			primaryColor,
			textColor,
			mutedTextColor,
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
		}
	};
}
