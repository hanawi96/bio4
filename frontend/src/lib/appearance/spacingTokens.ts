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
export const BORDER_WIDTH_PRESETS = {
    none: 0,
    thin: 1,
    default: 2,
    medium: 3,
    thick: 4
} as const;

export type BorderWidthKey = keyof typeof BORDER_WIDTH_PRESETS;

/**
 * Layout Max Width Presets (in pixels)
 * Standard max width values for page layout
 */
export const MAX_WIDTH_PRESETS = {
    xs: 320,
    sm: 480,
    md: 640,
    lg: 768,
    xl: 1024
} as const;

export type MaxWidthKey = keyof typeof MAX_WIDTH_PRESETS;

/**
 * Page Padding Presets (in pixels)
 * Standard padding values for page container
 */
export const PAGE_PADDING_PRESETS = {
    none: 0,
    tight: 8,
    default: 16,
    comfortable: 24,
    spacious: 32
} as const;

export type PagePaddingKey = keyof typeof PAGE_PADDING_PRESETS;

/**
 * Avatar Border Width Presets (in pixels)
 * Standard border width values for avatar
 */
export const AVATAR_BORDER_WIDTH_PRESETS = {
    none: 0,
    thin: 2,
    default: 4,
    thick: 6,
    bold: 8
} as const;

export type AvatarBorderWidthKey = keyof typeof AVATAR_BORDER_WIDTH_PRESETS;

/**
 * Social Icon Size Presets (in pixels)
 * Standard size values for social media icons
 */
export const SOCIAL_ICON_SIZE_PRESETS = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
} as const;

export type SocialIconSizeKey = keyof typeof SOCIAL_ICON_SIZE_PRESETS;

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
 * @param key - Border width key (none, thin, default, medium, thick)
 * @returns Border width value in pixels
 */
export function getBorderWidth(key: BorderWidthKey): number {
    return BORDER_WIDTH_PRESETS[key];
}

/**
 * Generic resolver for preset tokens
 * @param value - Preset key, number, or undefined
 * @param presets - Preset object
 * @param defaultKey - Default preset key
 * @returns Resolved number value
 */
function resolvePreset<T extends Record<string, number>>(
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
 * Resolve border radius - supports both string keys and numbers
 */
export function resolveRadius(value: RadiusKey | number | undefined): number {
    return resolvePreset(value, RADIUS_TOKENS, 'lg');
}

/**
 * Resolve block gap - supports both string keys and numbers
 */
export function resolveBlockGap(value: BlockGapPreset | number | undefined): number {
    return resolvePreset(value, BLOCK_GAP_PRESETS, 'default');
}

/**
 * Resolve block padding - supports both string keys and objects
 */
export function resolveBlockPadding(value: BlockPaddingPreset | {x: number, y: number} | undefined): {x: number, y: number} {
    if (typeof value === 'object' && 'x' in value && 'y' in value) return value;
    if (typeof value === 'string' && value in BLOCK_PADDING_PRESETS) {
        return BLOCK_PADDING_PRESETS[value];
    }
    return BLOCK_PADDING_PRESETS.default;
}

/**
 * Resolve border width - supports both string keys and numbers
 */
export function resolveBorderWidth(value: BorderWidthKey | number | undefined): number {
    return resolvePreset(value, BORDER_WIDTH_PRESETS, 'default');
}

/**
 * Resolve max width - supports both string keys and numbers
 */
export function resolveMaxWidth(value: MaxWidthKey | number | undefined): number {
    return resolvePreset(value, MAX_WIDTH_PRESETS, 'sm');
}

/**
 * Resolve page padding - supports both string keys and numbers
 */
export function resolvePagePadding(value: PagePaddingKey | number | undefined): number {
    return resolvePreset(value, PAGE_PADDING_PRESETS, 'default');
}

/**
 * Resolve avatar border width - supports both string keys and numbers
 */
export function resolveAvatarBorderWidth(value: AvatarBorderWidthKey | number | undefined): number {
    return resolvePreset(value, AVATAR_BORDER_WIDTH_PRESETS, 'default');
}

/**
 * Resolve social icon size - supports both string keys and numbers
 */
export function resolveSocialIconSize(value: SocialIconSizeKey | number | undefined): number {
    return resolvePreset(value, SOCIAL_ICON_SIZE_PRESETS, 'md');
}
