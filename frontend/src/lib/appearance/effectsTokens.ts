// ============================================
// VISUAL EFFECTS TOKENS - CENTRALIZED
// ============================================
// Standard visual effect presets for backgrounds and elements

/**
 * Blur Amount Presets (in pixels)
 * Standard blur values for background effects
 */
export const BLUR_PRESETS = {
	none: 0,
	subtle: 10,
	medium: 20,
	strong: 35,
	extreme: 60
} as const;

export type BlurKey = keyof typeof BLUR_PRESETS;

/**
 * Brightness Presets (percentage)
 * Standard brightness adjustment values
 */
export const BRIGHTNESS_PRESETS = {
	darkest: 50,
	dark: 75,
	normal: 100,
	bright: 125,
	brightest: 150
} as const;

export type BrightnessKey = keyof typeof BRIGHTNESS_PRESETS;

/**
 * Grayscale Presets (percentage)
 * Standard grayscale filter values
 */
export const GRAYSCALE_PRESETS = {
	none: 0,
	subtle: 25,
	medium: 50,
	strong: 75,
	full: 100
} as const;

export type GrayscaleKey = keyof typeof GRAYSCALE_PRESETS;

/**
 * Opacity Scale (0-100)
 * Standard opacity values for overlays and elements
 */
export const OPACITY_PRESETS = {
	transparent: 0,
	faint: 10,
	light: 20,
	medium: 50,
	heavy: 80,
	opaque: 100
} as const;

export type OpacityKey = keyof typeof OPACITY_PRESETS;

/**
 * Generic resolver for effect presets
 */
function resolveEffectPreset<T extends Record<string, number>>(
	value: keyof T | number | undefined,
	presets: T,
	defaultKey: keyof T
): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string' && value in presets) {
		return presets[value];
	}
	return presets[defaultKey];
}

/**
 * Resolve blur amount - supports both string keys and numbers
 */
export function resolveBlur(value: BlurKey | number | undefined): number {
	return resolveEffectPreset(value, BLUR_PRESETS, 'none');
}

/**
 * Resolve brightness - supports both string keys and numbers
 */
export function resolveBrightness(value: BrightnessKey | number | undefined): number {
	return resolveEffectPreset(value, BRIGHTNESS_PRESETS, 'normal');
}

/**
 * Resolve grayscale - supports both string keys and numbers
 */
export function resolveGrayscale(value: GrayscaleKey | number | undefined): number {
	return resolveEffectPreset(value, GRAYSCALE_PRESETS, 'none');
}

/**
 * Resolve opacity - supports both string keys and numbers
 */
export function resolveOpacity(value: OpacityKey | number | undefined): number {
	return resolveEffectPreset(value, OPACITY_PRESETS, 'opaque');
}
