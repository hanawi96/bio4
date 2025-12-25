// ============================================
// TOKEN RESOLVER UTILITY
// ============================================
// Resolves token references like "blockBase@0.14" to actual CSS colors

import type { ThemeConfigTokens } from './types';

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

// Resolve token to actual color
// Examples:
//   resolveToken("blockBase", tokens) → "#2563EB"
//   resolveToken("blockBase@0.14", tokens) → "rgba(37, 99, 235, 0.14)"
export function resolveToken(ref: string, tokens: ThemeConfigTokens): string {
	const { token, opacity } = parseTokenReference(ref);

	// Handle special cases
	if (token === 'transparent') return 'transparent';
	if (token === 'none') return 'none';

	// Get color from tokens
	const color = tokens[token as keyof ThemeConfigTokens];
	if (!color || typeof color !== 'string') {
		console.warn(`[tokenResolver] Token "${token}" not found, using fallback`);
		return '#000000';
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
export function resolveAutoTextColor(fillRef: string, tokens: ThemeConfigTokens): string {
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

// Resolve shadow with shadowColor token (for hard shadows)
// Examples:
//   resolveShadow("4px 4px 0px #000000", "#ff0000") → "4px 4px 0px #ff0000"
//   resolveShadow("0 4px 6px rgba(0,0,0,0.1)", "#ff0000") → "0 4px 6px rgba(0,0,0,0.1)"
export function resolveShadow(shadow: string | undefined, shadowColor: string): string {
	if (!shadow || shadow === 'none') return 'none';
	
	// If it's a hard shadow (4px 4px 0px), replace the color with shadowColor token
	if (shadow.includes('4px 4px 0px')) {
		return `4px 4px 0px ${shadowColor}`;
	}
	
	return shadow;
}
