// ============================================
// TOKEN RESOLVER UTILITY
// ============================================
// Resolves token references like "blockBase@0.14" to actual CSS colors

import type { ThemeTokens } from './types';
import { resolveFontSizeRef, resolveFontWeightRef, resolveLineHeightRef } from './typographyTokens';

// Parse token reference string
// Examples:
//   "blockBase" → { token: "blockBase", opacity: 1 }
//   "blockBase@0.14" → { token: "blockBase", opacity: 0.14 }
//   "transparent" → { token: "transparent", opacity: 1 }
export function parseTokenReference(ref: string): { token: string; opacity: number } {
	if (ref === 'transparent' || ref === 'none') {
		return { token: ref, opacity: 1 };
	}

	const parts = ref.split('@');
	const token = parts[0];
	const opacity = parts[1] ? parseFloat(parts[1]) : 1;

	return { token, opacity };
}

// Resolve token to actual color or shadow value
// Examples:
//   resolveToken("blockBase", tokens) → "#2563EB"
//   resolveToken("blockBase@0.14", tokens) → "rgba(37, 99, 235, 0.14)"
//   resolveToken("0 2px 8px shadowColor@0.15", tokens) → "0 2px 8px rgba(0, 0, 0, 0.15)"
//   resolveToken("ref:tokens.typography.fontSize.base", tokens) → "16"
//   resolveToken("ref:tokens.typography.fontWeight.bold", tokens) → "700"
//   resolveToken("ref:tokens.typography.lineHeight.normal", tokens) → "1.5"
export function resolveToken(ref: string, tokens: ThemeTokens): string {
	// Handle special cases
	if (ref === 'transparent') return 'transparent';
	if (ref === 'none') return 'none';
	
	// Handle direct hex colors (for glass effect)
	if (ref.startsWith('#')) return ref;
	
	// Handle typography fontSize refs
	if (ref.startsWith('ref:tokens.typography.fontSize.')) {
		const fontSize = resolveFontSizeRef(ref);
		return fontSize !== undefined ? String(fontSize) : ref;
	}
	
	// Handle typography fontWeight refs
	if (ref.startsWith('ref:tokens.typography.fontWeight.')) {
		const fontWeight = resolveFontWeightRef(ref);
		return fontWeight !== undefined ? String(fontWeight) : ref;
	}
	
	// Handle typography lineHeight refs
	if (ref.startsWith('ref:tokens.typography.lineHeight.')) {
		const lineHeight = resolveLineHeightRef(ref);
		return lineHeight !== undefined ? String(lineHeight) : ref;
	}
	
	// Handle gradient pattern (will be processed separately)
	if (ref.startsWith('gradient:')) return ref;

	// Check if it's a shadow pattern (contains px and a token reference)
	if (ref.includes('px') && (ref.includes('shadowColor') || ref.includes('blockBase'))) {
		// Parse shadow pattern: "0 2px 8px shadowColor@0.15" or "4px 4px 0px shadowColor"
		return ref.replace(/(\w+)(@[\d.]+)?/g, (match, token, opacity) => {
			if (token === 'shadowColor' || token === 'blockBase') {
				const color = tokens[token as keyof ThemeTokens];
				if (!color || typeof color !== 'string') return match;
				
				if (opacity) {
					const opacityValue = parseFloat(opacity.substring(1));
					return hexToRgba(color, opacityValue);
				}
				return color;
			}
			return match;
		});
	}

	const { token, opacity } = parseTokenReference(ref);

	// Get color from tokens
	let color = tokens[token as keyof ThemeTokens];
	
	// Smart fallback for missing tokens
	if (!color || typeof color !== 'string') {
		// Special fallback for blockText (commonly missing in old themes)
		if (token === 'blockText') {
			color = '#ffffff'; // Default white for block text
		} else {
			console.warn(`[tokenResolver] Token "${token}" not found, using fallback`);
			color = '#000000';
		}
	}

	// If opacity is 1, return as-is
	if (opacity === 1) {
		return color;
	}

	// If color is already rgba/rgb, adjust opacity
	if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
		// Extract RGB values and replace opacity
		const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (match) {
			return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
		}
		// Fallback: return as-is if can't parse
		return color;
	}

	// Convert hex to rgba with opacity
	return hexToRgba(color, opacity);
}

// Convert hex color to rgba
// Examples:
//   hexToRgba("#2563EB", 0.14) → "rgba(37, 99, 235, 0.14)"
export function hexToRgba(hex: string, opacity: number): string {
	// Remove # if present
	hex = hex.replace('#', '');

	// Parse RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Get auto text color based on background (for contrast)
// Returns white for dark backgrounds, black for light backgrounds
export function getAutoTextColor(bgColor: string): string {
	// Remove # if present
	const hex = bgColor.replace('#', '');

	// Parse RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Calculate luminance (perceived brightness)
	// Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	// Return white for dark backgrounds, black for light backgrounds
	return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Resolve "auto" text color based on fill color
export function resolveAutoTextColor(fillRef: string, tokens: ThemeTokens): string {
	// If fill is transparent, use default text color
	if (fillRef === 'transparent') {
		return tokens.text;
	}

	// Resolve fill color
	const fillColor = resolveToken(fillRef, tokens);

	// If fill has opacity, use default text color
	if (fillColor.startsWith('rgba')) {
		return tokens.text;
	}

	// Calculate contrast color
	return getAutoTextColor(fillColor);
}
