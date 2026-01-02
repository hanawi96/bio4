// ============================================
// SPACING TOKENS - CENTRALIZED
// ============================================
// Standard spacing scale shared across all themes
// Based on 4px base unit (common design system practice)

/**
 * Spacing Scale (in pixels)
 * Based on 4px base unit
 */
export const SPACE_TOKENS = {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32
} as const;

export type SpaceKey = keyof typeof SPACE_TOKENS;

/**
 * Block Gap Presets
 * Semantic spacing levels for block gaps
 */
export const BLOCK_GAP_PRESETS = {
    compact: 8,
    default: 16,
    spacious: 24
} as const;

export type BlockGapPreset = keyof typeof BLOCK_GAP_PRESETS;

/**
 * Border Radius Scale (in pixels)
 * Standard border radius values for UI elements
 */
export const RADIUS_TOKENS = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
} as const;

export type RadiusKey = keyof typeof RADIUS_TOKENS;

/**
 * Border Width Tokens (in pixels)
 * Standard border width values
 */
export const BORDER_WIDTH_TOKENS = {
    default: 1
} as const;

export type BorderWidthKey = keyof typeof BORDER_WIDTH_TOKENS;

/**
 * Get spacing value by key
 * @param key - Space key (0, 1, 2, 3, 4, 5, 6, 8)
 * @returns Spacing value in pixels
 */
export function getSpace(key: SpaceKey): number {
    return SPACE_TOKENS[key];
}

/**
 * Get border radius value by key
 * @param key - Radius key (none, sm, md, lg, xl, full)
 * @returns Border radius value in pixels
 */
export function getRadius(key: RadiusKey): number {
    return RADIUS_TOKENS[key];
}

/**
 * Get border width value by key
 * @param key - Border width key (default)
 * @returns Border width value in pixels
 */
export function getBorderWidth(key: BorderWidthKey): number {
    return BORDER_WIDTH_TOKENS[key];
}

/**
 * Resolve spacing from ref string
 * @param ref - Reference string like "ref:tokens.space.4"
 * @returns Spacing value in pixels or undefined if invalid
 */
export function resolveSpaceRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.space.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.space.', '') as SpaceKey;
    return SPACE_TOKENS[key];
}

/**
 * Resolve border radius from ref string
 * @param ref - Reference string like "ref:tokens.radius.lg"
 * @returns Border radius value in pixels or undefined if invalid
 */
export function resolveRadiusRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.radius.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.radius.', '') as RadiusKey;
    return RADIUS_TOKENS[key];
}

/**
 * Resolve border width from ref string
 * @param ref - Reference string like "ref:tokens.border.width.default"
 * @returns Border width value in pixels or undefined if invalid
 */
export function resolveBorderWidthRef(ref: string): number | undefined {
    if (!ref.startsWith('ref:tokens.border.width.')) {
        return undefined;
    }

    const key = ref.replace('ref:tokens.border.width.', '') as BorderWidthKey;
    return BORDER_WIDTH_TOKENS[key];
}
