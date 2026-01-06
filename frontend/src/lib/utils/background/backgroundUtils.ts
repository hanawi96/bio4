import { patterns } from './backgroundConstants';

// Normalize gradient string for comparison
export function normalizeGradient(gradient: string): string {
	if (!gradient) return '';
	return gradient
		.replace(/\s+/g, ' ') // Normalize spaces
		.replace(/\s*,\s*/g, ',') // Remove spaces around commas
		.replace(/\(\s*/g, '(') // Remove space after (
		.replace(/\s*\)/g, ')') // Remove space before )
		.replace(/#([0-9a-fA-F]{6})\s+0%/g, '#$1 0%') // Normalize 0%
		.replace(/#([0-9a-fA-F]{6})\s+100%/g, '#$1 100%') // Normalize 100%
		.toLowerCase()
		.trim();
}

// Parse gradient to extract colors and direction
export function parseGradient(gradient: string): { from: string; to: string; direction: string; type: 'linear' | 'radial' } | null {
	if (!gradient || !gradient.includes('gradient')) return null;
	
	const isRadial = gradient.includes('radial-gradient');
	const type = isRadial ? 'radial' : 'linear';
	
	// Extract colors
	const colorMatches = gradient.match(/#[0-9a-fA-F]{6}/g);
	if (!colorMatches || colorMatches.length < 2) return null;
	
	const from = colorMatches[0];
	const to = colorMatches[1];
	
	// Extract direction (only for linear)
	let direction = '135deg'; // default
	if (!isRadial) {
		const dirMatch = gradient.match(/linear-gradient\(([^,]+),/);
		if (dirMatch && dirMatch[1]) {
			const dir = dirMatch[1].trim();
			if (dir.includes('deg')) {
				direction = dir;
			}
		}
	}
	
	return { from, to, direction, type };
}

// Extract solid color from current background (gradient, solid, pattern, etc.)
export function extractSolidColorFromCurrent(bgValue: string): string {
	// Already solid color
	if (bgValue.match(/^#[0-9a-fA-F]{6}$/)) {
		return bgValue;
	}
	
	// Extract from gradient
	if (bgValue.includes('gradient')) {
		const colorMatch = bgValue.match(/#[0-9a-fA-F]{6}/);
		if (colorMatch) {
			return colorMatch[0];
		}
	}
	
	// Extract from pattern (already has background color)
	if (bgValue.startsWith('background:')) {
		const colorMatch = bgValue.match(/#[0-9a-fA-F]{6}/g);
		if (colorMatch && colorMatch.length > 0) {
			// Last color is usually the background color
			return colorMatch[colorMatch.length - 1];
		}
	}
	
	// Fallback to white
	return '#ffffff';
}

// Generate smart gradient from solid color
export function generateSmartGradient(solidColor: string): { gradient: string; from: string; to: string; direction: string } {
	// Parse hex color to RGB
	const hex = solidColor.replace('#', '');
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	
	// Calculate luminance to determine if color is light or dark
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	
	// Generate darker shade for "to" color
	const darkenFactor = luminance > 0.5 ? 0.6 : 0.7; // Darker for light colors
	const toR = Math.round(r * darkenFactor);
	const toG = Math.round(g * darkenFactor);
	const toB = Math.round(b * darkenFactor);
	
	const toColor = `#${toR.toString(16).padStart(2, '0')}${toG.toString(16).padStart(2, '0')}${toB.toString(16).padStart(2, '0')}`;
	const direction = '135deg';
	const gradient = `linear-gradient(${direction}, ${solidColor} 0%, ${toColor} 100%)`;
	
	return { gradient, from: solidColor, to: toColor, direction };
}

// Get pattern style CSS/SVG
export function getPatternStyle(patternId: string, color: string, bgColor: string): string {
	const pattern = patterns.find(p => p.id === patternId);
	
	if (!pattern) return `background: ${bgColor};`;
	
	if (pattern.svg) {
		// SVG pattern - encode as data URI
		const svg = pattern.svg.replace(/currentColor/g, color);
		const encoded = btoa(svg);
		return `background: url('data:image/svg+xml;base64,${encoded}') repeat, ${bgColor};`;
	} else {
		// CSS pattern
		const css = pattern.css!.replace(/currentColor/g, color);
		return `background: ${css}, ${bgColor}; background-size: ${pattern.size};`;
	}
}
