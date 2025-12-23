import { formatHex, oklch, rgb } from 'culori';

export type PatternType = 'grid' | 'dots' | 'diagonal' | 'cross' | 'zigzag' | 'organic' | 'noise' | 'waves';

export interface PatternColors {
	bgColor: string;
	inkColor: string;
	opacity: number;
}

/**
 * Calculate relative luminance for contrast ratio
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map(c => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
	const rgb1 = rgb(color1);
	const rgb2 = rgb(color2);
	
	if (!rgb1 || !rgb2) return 1;
	
	const lum1 = getLuminance(rgb1.r * 255, rgb1.g * 255, rgb1.b * 255);
	const lum2 = getLuminance(rgb2.r * 255, rgb2.g * 255, rgb2.b * 255);
	
	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);
	
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate pattern colors from background color using OKLCH color space
 */
export function generatePatternColors(
	bgColor: string,
	patternType: PatternType | string = 'grid'
): PatternColors {
	// Normalize pattern type
	const normalizedType = patternType as PatternType;
	
	// Convert to OKLCH
	const bgOklch = oklch(bgColor);
	
	if (!bgOklch) {
		// Fallback if conversion fails
		return {
			bgColor,
			inkColor: '#000000',
			opacity: 0.15
		};
	}
	
	const { l: L, c: C, h: H } = bgOklch;
	
	// Determine if background is light or dark
	const isLight = L >= 0.62;
	
	// Calculate adaptive deltaL
	const baseDelta = 0.10 + 0.22 * Math.abs(L - 0.55);
	let deltaL = Math.max(0.10, Math.min(0.26, baseDelta));
	
	// Adjust chroma for ink color
	let C_ink: number;
	if (C > 0.12) {
		C_ink = C * 0.85;
	} else {
		C_ink = Math.min(0.12, C + 0.03);
	}
	
	// Calculate ink lightness
	let L_ink = isLight ? L - deltaL : L + deltaL;
	L_ink = Math.max(0, Math.min(1, L_ink)); // Clamp to valid range
	
	// Create ink color in OKLCH
	let inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H };
	let inkColor = formatHex(inkOklch);
	
	// Contrast safety: ensure ratio between 1.5 and 2.4
	let attempts = 0;
	const maxAttempts = 5; // Tăng từ 3 lên 5
	
	while (attempts < maxAttempts) {
		const ratio = getContrastRatio(bgColor, inkColor);
		
		if (ratio < 1.5) {
			// Too low contrast, increase deltaL
			deltaL += 0.03; // Tăng từ 0.02 lên 0.03 để điều chỉnh nhanh hơn
			L_ink = isLight ? L - deltaL : L + deltaL;
			L_ink = Math.max(0, Math.min(1, L_ink));
			inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H };
			inkColor = formatHex(inkOklch);
			attempts++;
		} else if (ratio > 2.4) {
			// Too high contrast, decrease deltaL
			deltaL -= 0.02;
			L_ink = isLight ? L - deltaL : L + deltaL;
			L_ink = Math.max(0, Math.min(1, L_ink));
			inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H };
			inkColor = formatHex(inkOklch);
			attempts++;
		} else {
			// Perfect range
			break;
		}
	}
	
	// Calculate base opacity based on lightness
	let baseOpacity: number;
	if (isLight) {
		baseOpacity = 0.22 + (L - 0.62) * 0.15; // 0.22-0.28 for light backgrounds
	} else {
		baseOpacity = 0.16 + (0.62 - L) * 0.10; // 0.16-0.22 for dark backgrounds
	}
	
	// Adjust opacity by pattern type
	const patternMultipliers: Record<PatternType, number> = {
		grid: 0.9,
		dots: 1.0,
		diagonal: 0.95,
		cross: 0.9,
		zigzag: 0.95,
		organic: 1.05,
		noise: 1.15,
		waves: 1.0
	};
	
	const opacity = baseOpacity * (patternMultipliers[normalizedType] || 1.0);
	
	return {
		bgColor,
		inkColor,
		opacity: Math.max(0.1, Math.min(0.35, opacity)) // Clamp opacity
	};
}
