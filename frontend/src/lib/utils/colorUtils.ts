// Color manipulation utilities using HSL color space

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		}
		: { r: 0, g: 0, b: 0 };
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
	return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	h /= 360;
	s /= 100;
	l /= 100;

	let r, g, b;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return { r: r * 255, g: g * 255, b: b * 255 };
}

// Darken color by percentage
export function darken(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.l = Math.max(0, hsl.l - percent);
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Lighten color by percentage
export function lighten(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.l = Math.min(100, hsl.l + percent);
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Saturate color by percentage
export function saturate(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.s = Math.min(100, hsl.s + percent);
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Desaturate color by percentage
export function desaturate(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.s = Math.max(0, hsl.s - percent);
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Get complementary color (opposite on color wheel)
export function complementary(hex: string): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.h = (hsl.h + 180) % 360;
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Get analogous color (adjacent on color wheel)
export function analogous(hex: string, degrees: number): string {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.h = (hsl.h + degrees + 360) % 360;
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Get triadic colors (3 colors evenly spaced on color wheel)
function getTriadic(hex: string): { color1: string; color2: string; color3: string } {
	return {
		color1: hex,
		color2: analogous(hex, 120),
		color3: analogous(hex, 240)
	};
}

// Get split-complementary colors
function getSplitComplementary(hex: string): { main: string; side1: string; side2: string } {
	const comp = complementary(hex);
	return {
		main: hex,
		side1: analogous(comp, -30),
		side2: analogous(comp, 30)
	};
}

// Blend two colors
function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);
	const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
	const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
	const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
	return rgbToHex(r, g, b);
}

// Gradient preset types - 16 unique presets (8 linear + 4 radial + 4 conic)
export type GradientPreset =
	| 'diagonal-dark' | 'vertical-fade' | 'horizontal-flow' | 'sunset-glow'
	| 'ocean-deep' | 'forest-path' | 'royal-luxury' | 'fire-blaze'
	| 'spotlight' | 'cosmic-burst' | 'aurora' | 'nebula'
	| 'spin' | 'vortex' | 'prism' | 'kaleidoscope';

// Generate gradient colors and CSS based on preset - MESH-STYLE GRADIENTS
export function getGradientColors(baseColor: string, preset: GradientPreset): { start: string; middle: string; end: string; css: string } {
	let start: string, middle: string, end: string, css: string;

	switch (preset) {
		// MESH GRADIENTS - Multiple radial gradients stacked for organic blend
		case 'diagonal-dark': {
			// Dark corners with bright center - like image 1
			const triadic = getTriadic(baseColor);
			const c1 = lighten(saturate(triadic.color1, 20), 15);
			const c2 = saturate(analogous(baseColor, 30), 25);
			const c3 = darken(triadic.color2, 25);
			const c4 = darken(desaturate(triadic.color3, 10), 30);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 20% 20%, ${c4} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${c3} 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${c2} 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, ${lighten(c1, 10)} 0%, transparent 50%), linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'vertical-fade': {
			// Smooth top to bottom with side accents
			const split = getSplitComplementary(baseColor);
			const c1 = lighten(saturate(split.main, 15), 20);
			const c2 = blendColors(split.main, split.side1, 0.5);
			const c3 = darken(split.side1, 18);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 30% 10%, ${lighten(c1, 8)} 0%, transparent 40%), radial-gradient(circle at 70% 90%, ${darken(c3, 5)} 0%, transparent 40%), linear-gradient(180deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'horizontal-flow': {
			// Left to right with center glow
			const c1 = lighten(analogous(baseColor, -30), 15);
			const c2 = saturate(baseColor, 12);
			const c3 = darken(analogous(baseColor, 30), 15);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 50% 50%, ${lighten(c2, 10)} 0%, transparent 35%), radial-gradient(ellipse at 0% 50%, ${c1} 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, ${c3} 0%, transparent 50%), linear-gradient(90deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'sunset-glow': {
			// Warm sunset with multiple color spots
			const triadic = getTriadic(baseColor);
			const c1 = lighten(saturate(triadic.color1, 25), 12);
			const c2 = saturate(analogous(baseColor, 35), 30);
			const c3 = darken(analogous(baseColor, 50), 10);
			const c4 = saturate(analogous(baseColor, -20), 20);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 70% 30%, ${c2} 0%, transparent 40%), radial-gradient(circle at 30% 70%, ${c4} 0%, transparent 45%), radial-gradient(ellipse at 90% 60%, ${c3} 0%, transparent 50%), linear-gradient(135deg, ${c1} 0%, ${c2} 40%, ${c3} 100%)`;
			break;
		}

		case 'ocean-deep': {
			// Deep blue with cyan highlights - like image 2
			const split = getSplitComplementary(baseColor);
			const c1 = lighten(saturate(analogous(baseColor, -40), 20), 22);
			const c2 = saturate(blendColors(split.main, split.side2, 0.6), 15);
			const c3 = darken(saturate(split.side2, 12), 25);
			const c4 = lighten(analogous(baseColor, -30), 18);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 15% 15%, ${c4} 0%, transparent 45%), radial-gradient(circle at 85% 85%, ${darken(c3, 8)} 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, ${c2} 0%, transparent 55%), linear-gradient(180deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)`;
			break;
		}

		case 'forest-path': {
			// Natural green blend with depth
			const c1 = lighten(analogous(baseColor, -20), 12);
			const c2 = saturate(blendColors(baseColor, analogous(baseColor, 20), 0.5), 10);
			const c3 = darken(analogous(baseColor, 25), 20);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 40% 40%, ${lighten(c1, 8)} 0%, transparent 40%), radial-gradient(circle at 80% 20%, ${c2} 0%, transparent 45%), radial-gradient(circle at 20% 80%, ${darken(c3, 5)} 0%, transparent 40%), linear-gradient(90deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'royal-luxury': {
			// Rich purple/gold blend
			const triadic = getTriadic(baseColor);
			const c1 = saturate(lighten(triadic.color1, 15), 22);
			const c2 = saturate(blendColors(triadic.color1, triadic.color3, 0.4), 18);
			const c3 = darken(saturate(triadic.color3, 15), 18);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 25% 25%, ${lighten(c1, 10)} 0%, transparent 40%), radial-gradient(circle at 75% 75%, ${c3} 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, ${c2} 0%, transparent 50%), linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'fire-blaze': {
			// Intense warm with hot spots
			const c1 = lighten(saturate(analogous(baseColor, -25), 40), 20);
			const c2 = saturate(blendColors(baseColor, analogous(baseColor, 20), 0.3), 35);
			const c3 = darken(analogous(baseColor, 15), 15);
			const c4 = saturate(analogous(baseColor, -15), 38);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 60% 40%, ${c4} 0%, transparent 35%), radial-gradient(circle at 30% 70%, ${c2} 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, ${lighten(c1, 5)} 0%, transparent 45%), linear-gradient(45deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'spotlight': {
			// Center spotlight with dark edges
			const triadic = getTriadic(baseColor);
			const c1 = lighten(saturate(triadic.color1, 22), 28);
			const c2 = blendColors(triadic.color1, triadic.color2, 0.4);
			const c3 = darken(triadic.color2, 22);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 50% 50%, ${c1} 0%, ${c2} 40%, ${c3} 100%)`;
			break;
		}

		case 'cosmic-burst': {
			// Space burst with multiple colors
			const split = getSplitComplementary(baseColor);
			const c1 = saturate(lighten(split.main, 18), 28);
			const c2 = blendColors(split.side1, split.side2, 0.5);
			const c3 = darken(blendColors(split.side1, split.main, 0.7), 20);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(circle at 50% 50%, ${c1} 0%, transparent 30%), radial-gradient(circle at 30% 30%, ${lighten(c2, 10)} 0%, transparent 40%), radial-gradient(circle at 70% 70%, ${c2} 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${c2} 20%, ${c3} 100%)`;
			break;
		}

		case 'aurora': {
			// Northern lights effect
			const triadic = getTriadic(baseColor);
			const c1 = lighten(saturate(triadic.color2, 25), 22);
			const c2 = blendColors(triadic.color1, triadic.color2, 0.6);
			const c3 = darken(analogous(triadic.color1, 40), 15);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(ellipse at 50% 0%, ${c1} 0%, transparent 50%), radial-gradient(ellipse at 30% 20%, ${lighten(c2, 8)} 0%, transparent 45%), radial-gradient(ellipse at 70% 20%, ${c2} 0%, transparent 45%), linear-gradient(180deg, ${lighten(c1, 5)} 0%, ${c2} 50%, ${c3} 100%)`;
			break;
		}

		case 'nebula': {
			// Deep space nebula
			const split = getSplitComplementary(baseColor);
			const c1 = saturate(lighten(split.side1, 18), 25);
			const c2 = blendColors(split.main, split.side1, 0.5);
			const c3 = darken(saturate(split.main, 10), 22);
			start = c1;
			middle = c2;
			end = c3;
			css = `radial-gradient(ellipse at 50% 100%, ${c1} 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${lighten(c2, 10)} 0%, transparent 40%), radial-gradient(circle at 60% 80%, ${c2} 0%, transparent 40%), linear-gradient(180deg, ${c3} 0%, ${c2} 50%, ${c1} 100%)`;
			break;
		}

		case 'spin': {
			// Smooth conic spin
			const triadic = getTriadic(baseColor);
			const c1 = lighten(triadic.color1, 12);
			const c2 = saturate(triadic.color2, 15);
			const c3 = darken(triadic.color3, 10);
			start = c1;
			middle = c2;
			end = c3;
			css = `conic-gradient(from 0deg at center, ${c1}, ${c2}, ${c3}, ${c1})`;
			break;
		}

		case 'vortex': {
			// Twisted vortex
			const split = getSplitComplementary(baseColor);
			const c1 = saturate(lighten(split.main, 10), 20);
			const c2 = blendColors(split.side1, split.side2, 0.5);
			const c3 = darken(split.side2, 12);
			start = c1;
			middle = c2;
			end = c3;
			css = `conic-gradient(from 45deg at center, ${c1}, ${c2}, ${c3}, ${c1})`;
			break;
		}

		case 'prism': {
			// Rainbow prism
			const triadic = getTriadic(baseColor);
			const c1 = lighten(saturate(triadic.color1, 20), 15);
			const c2 = saturate(triadic.color2, 25);
			const c3 = saturate(triadic.color3, 20);
			start = c1;
			middle = c2;
			end = c3;
			css = `conic-gradient(from 90deg at center, ${c1}, ${c2}, ${c3}, ${c1})`;
			break;
		}

		case 'kaleidoscope': {
			// Complex kaleidoscope
			const triadic = getTriadic(baseColor);
			const c1 = saturate(triadic.color1, 28);
			const c2 = saturate(blendColors(triadic.color2, triadic.color3, 0.5), 25);
			const c3 = saturate(triadic.color3, 22);
			start = c1;
			middle = c2;
			end = c3;
			css = `conic-gradient(from 180deg at center, ${c1}, ${c2}, ${c3}, ${c2}, ${c1})`;
			break;
		}

		default:
			start = baseColor;
			middle = baseColor;
			end = darken(baseColor, 20);
			css = `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
	}

	return { start, middle, end, css };
}

// Get preset name
export function getGradientPresetName(preset: GradientPreset): string {
	const names: Record<GradientPreset, string> = {
		'diagonal-dark': 'Diagonal',
		'vertical-fade': 'Vertical',
		'horizontal-flow': 'Horizontal',
		'sunset-glow': 'Sunset',
		'ocean-deep': 'Ocean',
		'forest-path': 'Forest',
		'royal-luxury': 'Royal',
		'fire-blaze': 'Fire',
		'spotlight': 'Spotlight',
		'cosmic-burst': 'Cosmic',
		'aurora': 'Aurora',
		'nebula': 'Nebula',
		'spin': 'Spin',
		'vortex': 'Vortex',
		'prism': 'Prism',
		'kaleidoscope': 'Kaleidoscope'
	};
	return names[preset];
}

// Get preset description
export function getGradientPresetDescription(preset: GradientPreset): string {
	const descriptions: Record<GradientPreset, string> = {
		'diagonal-dark': 'Classic diagonal fade',
		'vertical-fade': 'Top to bottom',
		'horizontal-flow': 'Left to right',
		'sunset-glow': 'Warm diagonal',
		'ocean-deep': 'Deep vertical',
		'forest-path': 'Natural horizontal',
		'royal-luxury': 'Rich diagonal',
		'fire-blaze': 'Intense angle',
		'spotlight': 'Center radial',
		'cosmic-burst': 'Space radial',
		'aurora': 'Top radial',
		'nebula': 'Bottom radial',
		'spin': 'Circular spin',
		'vortex': 'Twisted spin',
		'prism': 'Rainbow spin',
		'kaleidoscope': 'Multi-spin'
	};
	return descriptions[preset];
}
