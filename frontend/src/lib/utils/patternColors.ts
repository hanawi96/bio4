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
 * Optimized for perceptual uniformity and accessibility
 */
export function generatePatternColors(
	bgColor: string,
	patternType: PatternType | string = 'grid'
): PatternColors {
	// Normalize pattern type
	const normalizedType = patternType as PatternType;
	
	// Convert to OKLCH with validation
	const bgOklch = oklch(bgColor);
	
	if (!bgOklch || typeof bgOklch.l !== 'number') {
		// Enhanced fallback for invalid colors
		console.warn(`Invalid color: ${bgColor}, using fallback`);
		return {
			bgColor: '#ffffff',
			inkColor: '#e5e7eb',
			opacity: 0.20
		};
	}
	
	const { l: L, c: C, h: H } = bgOklch;
	
	// Validate color components with tolerance for floating point errors
	if (L < -0.001 || L > 1.001 || C < -0.001) {
		console.warn(`Out of range color values: L=${L}, C=${C}`);
		return {
			bgColor: '#ffffff',
			inkColor: '#e5e7eb',
			opacity: 0.20
		};
	}
	
	// Clamp values to valid range (handle floating point precision)
	const L_clamped = Math.max(0, Math.min(1, L));
	const C_clamped = Math.max(0, C);
	
	// Determine if background is light or dark
	const isLight = L_clamped >= 0.62;
	
	// Calculate adaptive deltaL with enhanced formula
	const baseDelta = 0.10 + 0.22 * Math.abs(L_clamped - 0.55);
	let deltaL = Math.max(0.10, Math.min(0.26, baseDelta));
	
	// ✨ OPTIMIZATION 1: Smooth chroma adjustment
	let C_ink: number;
	if (C_clamped < 0.02) {
		// Achromatic (gray/black/white) - keep chroma at 0
		C_ink = 0;
	} else if (C_clamped > 0.30) {
		// Extreme saturation (neon/fluorescent) - reduce significantly
		C_ink = C_clamped * 0.60;
	} else {
		// Normal chromatic colors - smooth reduction for subtlety
		C_ink = C_clamped * 0.75;
	}
	
	// Calculate ink lightness
	let L_ink = isLight ? L_clamped - deltaL : L_clamped + deltaL;
	L_ink = Math.max(0, Math.min(1, L_ink)); // Clamp to valid range
	
	// Create ink color in OKLCH
	// For achromatic colors (C ≈ 0), don't use hue to avoid color shift
	let inkOklch: { mode: 'oklch'; l: number; c: number; h?: number };
	if (C_clamped < 0.02) {
		// Achromatic (gray/black/white) - no hue
		inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink };
	} else {
		// Chromatic - preserve hue
		inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H || 0 };
	}
	
	let inkColor = formatHex(inkOklch);
	
	// ✨ OPTIMIZATION 2: Adaptive contrast range based on lightness
	let minRatio: number;
	let maxRatio: number;
	
	if (L_clamped > 0.85 || L_clamped < 0.15) {
		// Extreme lightness - need higher contrast
		minRatio = 1.8;
		maxRatio = 3.0;
	} else {
		// Normal lightness - subtle contrast
		minRatio = 1.3;
		maxRatio = 2.8;
	}
	
	// ✨ OPTIMIZATION 3: Proportional adjustment for faster convergence
	let attempts = 0;
	const maxAttempts = 8; // Increased for better accuracy
	
	while (attempts < maxAttempts) {
		const ratio = getContrastRatio(bgColor, inkColor);
		
		if (ratio < minRatio) {
			// Too low contrast - proportional increase
			const deficit = minRatio - ratio;
			deltaL += deficit * 0.04; // Proportional adjustment
			L_ink = isLight ? L_clamped - deltaL : L_clamped + deltaL;
			L_ink = Math.max(0, Math.min(1, L_ink));
			
			// Recreate ink color
			if (C_clamped < 0.02) {
				inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink };
			} else {
				inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H || 0 };
			}
			inkColor = formatHex(inkOklch);
			attempts++;
		} else if (ratio > maxRatio) {
			// Too high contrast - proportional decrease
			const excess = ratio - maxRatio;
			deltaL -= excess * 0.03; // Proportional adjustment
			L_ink = isLight ? L_clamped - deltaL : L_clamped + deltaL;
			L_ink = Math.max(0, Math.min(1, L_ink));
			
			// Recreate ink color
			if (C_clamped < 0.02) {
				inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink };
			} else {
				inkOklch = { mode: 'oklch' as const, l: L_ink, c: C_ink, h: H || 0 };
			}
			inkColor = formatHex(inkOklch);
			attempts++;
		} else {
			// Perfect range - exit early
			break;
		}
	}
	
	// ✨ OPTIMIZATION 4: Enhanced opacity calculation
	let baseOpacity: number;
	if (isLight) {
		// Light backgrounds: 0.25-0.35 range
		baseOpacity = 0.25 + (L_clamped - 0.62) * 0.18;
	} else {
		// Dark backgrounds: 0.20-0.30 range
		baseOpacity = 0.20 + (0.62 - L_clamped) * 0.15;
	}
	
	// Adjust opacity by pattern type with refined multipliers
	const patternMultipliers: Record<PatternType, number> = {
		grid: 0.92,      // Subtle for geometric patterns
		dots: 1.0,       // Balanced
		diagonal: 0.95,  // Slightly subtle
		cross: 0.92,     // Subtle for geometric patterns
		zigzag: 0.96,    // Slightly visible
		organic: 1.08,   // More visible for organic shapes
		noise: 1.18,     // Most visible for texture
		waves: 1.02      // Slightly more than balanced
	};
	
	const opacity = baseOpacity * (patternMultipliers[normalizedType] || 1.0);
	
	return {
		bgColor,
		inkColor,
		opacity: Math.max(0.12, Math.min(0.40, opacity)) // Enhanced range
	};
}
