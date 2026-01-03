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
 * Block Padding Presets
 * Semantic padding levels for blocks
 */
export const BLOCK_PADDING_PRESETS = {
    tight: { x: 12, y: 8 },
    default: { x: 16, y: 12 },
    spacious: { x: 24, y: 16 }
} as const;

export type BlockPaddingPreset = keyof typeof BLOCK_PADDING_PRESETS;

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
export const BORDER_WIDTH_TOKENS: Record<string, number> = {
    default: 1
};

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
 * Resolve border radius - supports both string keys and numbers
 * @param value - Radius key or number
 * @returns Border radius value in pixels
 */
export function resolveRadius(value: RadiusKey | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value in RADIUS_TOKENS) {
        return RADIUS_TOKENS[value as RadiusKey];
    }
    return RADIUS_TOKENS.lg; // default
}

/**
 * Resolve block gap - supports both string keys and numbers
 * @param value - Block gap preset key or number
 * @returns Block gap value in pixels
 */
export function resolveBlockGap(value: BlockGapPreset | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value in BLOCK_GAP_PRESETS) {
        return BLOCK_GAP_PRESETS[value as BlockGapPreset];
    }
    return BLOCK_GAP_PRESETS.default; // default
}

/**
 * Resolve block padding - supports both string keys and objects
 * @param value - Block padding preset key or {x, y} object
 * @returns Block padding object {x, y}
 */
export function resolveBlockPadding(value: BlockPaddingPreset | {x: number, y: number} | undefined): {x: number, y: number} {
    if (typeof value === 'object' && 'x' in value && 'y' in value) return value;
    if (typeof value === 'string' && value in BLOCK_PADDING_PRESETS) {
        return BLOCK_PADDING_PRESETS[value as BlockPaddingPreset];
    }
    return BLOCK_PADDING_PRESETS.default; // default
}

/**
 * Resolve border width - supports both string keys and numbers
 * @param value - Border width key or number
 * @returns Border width value in pixels
 */
export function resolveBorderWidth(value: BorderWidthKey | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value in BORDER_WIDTH_TOKENS) {
        return BORDER_WIDTH_TOKENS[value as BorderWidthKey];
    }
    return BORDER_WIDTH_TOKENS.default;
}
