// ============================================
// TYPOGRAPHY TOKENS - CENTRALIZED
// ============================================
// Standard typography scales shared across all themes
// These are design system constants that don't need per-theme customization

/**
 * Font Size Scale (in pixels)
 * Fine-grained scale for precise typography control
 */
export const FONT_SIZE_TOKENS = {
    xs: 12,
    '13': 13,
    sm: 14,
    '15': 15,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24
} as const;

export type FontSizeKey = keyof typeof FONT_SIZE_TOKENS;

/**
 * Font Weight Scale
 * Standard font weights for web typography
 */
export const FONT_WEIGHT_TOKENS = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
} as const;

export type FontWeightKey = keyof typeof FONT_WEIGHT_TOKENS;

/**
 * Line Height Scale
 * Standard line heights for web typography
 */
export const LINE_HEIGHT_TOKENS = {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
} as const;

export type LineHeightKey = keyof typeof LINE_HEIGHT_TOKENS;

/**
 * Get font size value by key
 * @param key - Font size key (xs, sm, base, lg, xl, 2xl)
 * @returns Font size in pixels
 */
export function getFontSize(key: FontSizeKey): number {
    return FONT_SIZE_TOKENS[key];
}

/**
 * Get font weight value by key
 * @param key - Font weight key (normal, medium, semibold, bold)
 * @returns Font weight value
 */
export function getFontWeight(key: FontWeightKey): number {
    return FONT_WEIGHT_TOKENS[key];
}

/**
 * Get line height value by key
 * @param key - Line height key (tight, normal, relaxed)
 * @returns Line height value
 */
export function getLineHeight(key: LineHeightKey): number {
    return LINE_HEIGHT_TOKENS[key];
}

/**
 * Resolve font size from ref string
 * @param ref - Reference string like "ref:tokens.typography.fontSize.base"
 * @returns Font size in pixels or undefined if invalid
 */
export function resolveFontSizeRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.typography.fontSize.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.typography.fontSize.', '') as FontSizeKey;
    return FONT_SIZE_TOKENS[key];
}

/**
 * Resolve font weight from ref string
 * @param ref - Reference string like "ref:tokens.typography.fontWeight.bold"
 * @returns Font weight value or undefined if invalid
 */
export function resolveFontWeightRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.typography.fontWeight.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.typography.fontWeight.', '') as FontWeightKey;
    return FONT_WEIGHT_TOKENS[key];
}

/**
 * Resolve line height from ref string
 * @param ref - Reference string like "ref:tokens.typography.lineHeight.normal"
 * @returns Line height value or undefined if invalid
 */
export function resolveLineHeightRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.typography.lineHeight.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.typography.lineHeight.', '') as LineHeightKey;
    return LINE_HEIGHT_TOKENS[key];
}
