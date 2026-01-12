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

// Generate smart gradient from solid color (2 or 3 colors)
export function generateSmartGradient(solidColor: string, includeMiddle: boolean = false): { gradient: string; from: string; to: string; middle?: string; direction: string } {
	// Parse hex color to RGB
	const hex = solidColor.replace('#', '');
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	
	// Calculate luminance to determine if color is light or dark
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	
	// Calculate hue for complementary/analogous color generation
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	
	let hue = 0;
	if (delta !== 0) {
		if (max === r) {
			hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
		} else if (max === g) {
			hue = ((b - r) / delta + 2) / 6;
		} else {
			hue = ((r - g) / delta + 4) / 6;
		}
	}
	
	const saturation = max === 0 ? 0 : delta / max;
	const value = max / 255;
	
	// Helper to convert HSV to RGB
	const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		
		let rOut: number, gOut: number, bOut: number;
		switch (i % 6) {
			case 0: [rOut, gOut, bOut] = [v, t, p]; break;
			case 1: [rOut, gOut, bOut] = [q, v, p]; break;
			case 2: [rOut, gOut, bOut] = [p, v, t]; break;
			case 3: [rOut, gOut, bOut] = [p, q, v]; break;
			case 4: [rOut, gOut, bOut] = [t, p, v]; break;
			case 5: [rOut, gOut, bOut] = [v, p, q]; break;
			default: [rOut, gOut, bOut] = [0, 0, 0];
		}
		
		return [Math.round(rOut * 255), Math.round(gOut * 255), Math.round(bOut * 255)];
	};
	
	// Helper to convert RGB to hex
	const rgbToHex = (r: number, g: number, b: number): string => {
		const rHex = Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, '0');
		const gHex = Math.max(0, Math.min(255, Math.round(g))).toString(16).padStart(2, '0');
		const bHex = Math.max(0, Math.min(255, Math.round(b))).toString(16).padStart(2, '0');
		return `#${rHex}${gHex}${bHex}`;
	};
	
	const direction = '135deg';
	
	if (!includeMiddle) {
		// 2-color gradient: original + darker shade
		const darkenFactor = luminance > 0.5 ? 0.6 : 0.7;
		const toR = Math.round(r * darkenFactor);
		const toG = Math.round(g * darkenFactor);
		const toB = Math.round(b * darkenFactor);
		
		const toColor = rgbToHex(toR, toG, toB);
		const gradient = `linear-gradient(${direction}, ${solidColor} 0%, ${toColor} 100%)`;
		
		return { gradient, from: solidColor, to: toColor, direction };
	} else {
		// 3-color gradient: original + analogous/complementary + darker
		// Middle color: shift hue slightly (analogous) and adjust saturation
		const middleHue = (hue + 0.08) % 1; // Shift hue by ~30 degrees
		const middleSat = Math.min(saturation * 1.2, 1); // Increase saturation slightly
		const middleVal = luminance > 0.5 ? value * 0.85 : value * 1.1; // Adjust brightness
		
		const [middleR, middleG, middleB] = hsvToRgb(middleHue, middleSat, middleVal);
		const middleColor = rgbToHex(middleR, middleG, middleB);
		
		// To color: darker shade with slight hue shift
		const toHue = (hue + 0.05) % 1;
		const toSat = saturation * 0.9;
		const toVal = luminance > 0.5 ? value * 0.6 : value * 0.7;
		
		const [toR, toG, toB] = hsvToRgb(toHue, toSat, toVal);
		const toColor = rgbToHex(toR, toG, toB);
		
		const gradient = `linear-gradient(${direction}, ${solidColor} 0%, ${middleColor} 50%, ${toColor} 100%)`;
		
		return { gradient, from: solidColor, middle: middleColor, to: toColor, direction };
	}
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
