// ============================================
// APPEARANCE MANAGER - Centralized Logic
// ============================================

import { HEADER_PRESETS } from './presets';
import { FONT_SIZE_TOKENS } from './typographyTokens';
import type { Theme } from './types';

// ============================================
// NEW APPEARANCE STATE (Flat Structure)
// ============================================

export interface AppearanceState {
    presetKey: string;                    // "minimal", "dark", "gradient"
    overrides: Record<string, any>;       // Flat key-path: { "backgroundColor": "#fff", "header.coverType": "solid" }
    headerPresetId?: string;              // Track current header preset (for getPresetValue)
}

// ============================================
// HELPER: Convert bg token to CSS string (for comparison)
// ============================================

function bgTokenToCss(bgToken: any): string {
    if (!bgToken) return '';
    
    if (bgToken.type === 'color') {
        return bgToken.value as string;
    } else if (bgToken.type === 'gradient') {
        const grad = bgToken.value as { from: string; to: string; angle: number };
        return `linear-gradient(${grad.angle}deg, ${grad.from} 0%, ${grad.to} 100%)`;
    }
    
    return '';
}

// ============================================
// HELPER: Get default header preset ID from theme
// ============================================

function getDefaultHeaderPresetId(theme: Theme | undefined): string {
    if (!theme) return 'no-cover';
    
    // Priority 1: Root level
    if (theme.defaultHeaderPresetId) return theme.defaultHeaderPresetId;
    
    // Priority 2: Config nested
    if (theme.config?.page?.defaults?.headerPresetId) {
        return theme.config.page.defaults.headerPresetId;
    }
    
    return 'no-cover';
}

// ============================================
// HELPER: Get value from preset by path
// ============================================

export function getPresetValue(
    themesMap: Record<string, Theme>,
    presetKey: string,
    path: string,
    headerPresetId?: string
): any {
    const preset = themesMap[presetKey];
    if (!preset) return undefined;

    // Handle different path types
    if (path.startsWith('header.')) {
        // Header preset value
        const headerKey = path.replace('header.', '');
        
        // Special case: titleFontFamily comes from theme config, not header preset
        if (headerKey === 'titleFontFamily') {
            return preset.config?.semantic?.typography?.heading?.fontFamily;
        }
        
        // Special case: avatarType and avatarVideoUrl come from theme config
        if (headerKey === 'avatarType') {
            return preset.config?.page?.defaults?.avatarType || 'image';
        }
        if (headerKey === 'avatarVideoUrl') {
            return preset.config?.page?.defaults?.avatarVideoUrl || '';
        }
        
        const currentHeaderId = headerPresetId || getDefaultHeaderPresetId(preset);
        const headerPreset = HEADER_PRESETS[currentHeaderId];
        return headerPreset?.[headerKey as keyof typeof headerPreset];
    } else if (path === 'headerPresetId') {
        // Header preset ID from theme default
        return getDefaultHeaderPresetId(preset);
    } else if (path.startsWith('block.')) {
        const blockKey = path.replace('block.', '');
        
        if (blockKey === 'stylePreset') {
            return preset.config.page?.defaults?.blockStylePreset || 'solid';
        }
        if (blockKey === 'color') {
            return preset.config?.semantic?.color?.primary;
        }
        if (blockKey === 'textColor') {
            return preset.config?.semantic?.color?.block?.text;
        }
        if (blockKey === 'borderRadius') {
            return preset.config?.page?.defaults?.borderRadius ?? 12;
        }
        if (blockKey === 'padding') {
            return preset.config?.page?.defaults?.padding;
        }
        if (blockKey === 'borderWidth') {
            return preset.config?.page?.defaults?.borderWidth ?? 1;
        }
        if (blockKey === 'shadow') {
            return preset.config?.page?.defaults?.shadowStyle;
        }
        
        return undefined;
    } else if (path.startsWith('page.')) {
        // Page-level settings from theme config
        const pageKey = path.replace('page.', '');
        
        // Typography sizes
        if (pageKey === 'titleFontSize') {
            return preset.config?.semantic?.typography?.heading?.fontSize || preset.config?.page?.defaults?.titleFontSize;
        }
        if (pageKey === 'bioFontSize') {
            return preset.config?.semantic?.typography?.bio?.fontSize || preset.config?.page?.defaults?.bioFontSize;
        }
        if (pageKey === 'linkFontSize') {
            return preset.config?.semantic?.typography?.link?.fontSize || preset.config?.page?.defaults?.linkFontSize;
        }
        if (pageKey === 'subtitleFontSize') {
            return preset.config?.semantic?.typography?.subtitle?.fontSize || preset.config?.page?.defaults?.subtitleFontSize;
        }
        
        // Other page settings
        if (pageKey === 'textAlign') {
            return preset.config?.page?.defaults?.textAlign;
        }
        if (pageKey === 'blockGap') {
            return preset.config?.page?.layout?.blockGap;
        }
        if (pageKey === 'pagePadding') {
            return preset.config?.page?.defaults?.pagePadding;
        }
        if (pageKey === 'socialIconSize') {
            return preset.config?.page?.defaults?.socialIconSize;
        }
        if (pageKey === 'showShareButton') {
            return preset.config?.page?.defaults?.showShareButton;
        }
        if (pageKey === 'showSubscribeButton') {
            return preset.config?.page?.defaults?.showSubscribeButton;
        }
        
        // Link group config
        if (pageKey.startsWith('linkGroupConfig.')) {
            const configPath = pageKey.replace('linkGroupConfig.', '');
            const [layoutType, ...configKeys] = configPath.split('.');
            
            let value = preset.config.page?.defaults?.linkGroupConfig?.[layoutType as 'grid' | 'cards' | 'list'];
            
            // Navigate nested path
            for (const key of configKeys) {
                if (value && typeof value === 'object') {
                    value = value[key as keyof typeof value];
                } else {
                    return undefined;
                }
            }
            
            return value;
        }
        
        return undefined;
    } else if (path === 'backgroundColor') {
        // Background color from theme config (NEW structure)
        const bgType = preset.config?.background?.type;
        const bgValue = preset.config?.background?.value;
        
        if (bgType === 'solid' && bgValue) {
            return bgValue;
        }
        if (bgType === 'gradient' && bgValue) {
            return bgValue;
        }
        
        // Fallback to old token structure
        const bgToken = preset.config.tokens?.bg;
        return bgTokenToCss(bgToken);
    } else if (path.startsWith('background')) {
        // Background effects
        if (path === 'backgroundBlur') {
            return preset.config?.background?.effects?.blur;
        }
        if (path === 'backgroundBrightness') {
            return preset.config?.background?.effects?.brightness;
        }
        if (path === 'backgroundGrayscale') {
            return preset.config?.background?.effects?.grayscale;
        }
        return undefined;
    } else if (path.startsWith('typography.')) {
        // Typography colors
        const typographyKey = path.replace('typography.', '');
        
        if (typographyKey === 'headingColor') {
            return preset.config?.semantic?.color?.text?.default;
        }
        // mutedColor is auto-calculated, no longer stored in config
        
        return undefined;
    } else if (path.startsWith('tokens.')) {
        // Token values
        const tokenKey = path.replace('tokens.', '');
        
        if (tokenKey === 'fontFamily') {
            return preset.config?.tokens?.typography?.fontFamily?.sans || preset.config?.tokens?.fontFamily;
        }
        if (tokenKey === 'text') {
            return preset.config?.semantic?.color?.text?.default;
        }
        
        return undefined;
    } else {
        // Theme config value (fallback)
        return preset.config[path as keyof typeof preset.config];
    }
}

// ============================================
// NORMALIZE HELPERS: Convert to canonical form
// ============================================

// Import centralized tokens instead of duplicating
import { 
    RADIUS_TOKENS, 
    BLOCK_GAP_PRESETS
} from './spacingTokens';

import {
    BLUR_PRESETS,
    BRIGHTNESS_PRESETS,
    GRAYSCALE_PRESETS
} from './effectsTokens';

function normalizeColor(value: any): string | null {
    if (!value || typeof value !== 'string') return null;
    
    // Hex color
    if (value.startsWith('#')) {
        const hex = value.toLowerCase();
        // Expand shorthand: #fff → #ffffff
        if (hex.length === 4) {
            return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex;
    }
    
    // RGB/RGBA: normalize spaces
    if (value.startsWith('rgb')) {
        return value.replace(/\s+/g, '').toLowerCase();
    }
    
    return value;
}

function normalizeGradient(value: string): { type: string; angle: number; colors: string[] } | null {
    if (!value || typeof value !== 'string' || !value.includes('gradient')) return null;
    
    const isRadial = value.includes('radial-gradient');
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/gi;
    const colors = value.match(colorRegex);
    if (!colors || colors.length < 2) return null;
    
    const normalizedColors = colors.map(c => normalizeColor(c) || c);
    
    let angle = 135;
    if (!isRadial) {
        const angleMatch = value.match(/(\d+)deg/);
        if (angleMatch) angle = parseInt(angleMatch[1]);
    }
    
    return { type: isRadial ? 'radial' : 'linear', angle, colors: normalizedColors };
}

function normalizeNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (!value) return null;
    
    // Token lookup - check each map separately to avoid key conflicts
    if (typeof value === 'string') {
        // Check radius tokens (borderRadius)
        if (value in RADIUS_TOKENS) {
            return RADIUS_TOKENS[value as keyof typeof RADIUS_TOKENS];
        }
        
        // Check spacing tokens (blockGap)
        if (value in BLOCK_GAP_PRESETS) {
            return BLOCK_GAP_PRESETS[value as keyof typeof BLOCK_GAP_PRESETS];
        }
        
        // Check effect tokens (blur, brightness, grayscale)
        if (value in BLUR_PRESETS) {
            return BLUR_PRESETS[value as keyof typeof BLUR_PRESETS];
        }
        if (value in BRIGHTNESS_PRESETS) {
            return BRIGHTNESS_PRESETS[value as keyof typeof BRIGHTNESS_PRESETS];
        }
        if (value in GRAYSCALE_PRESETS) {
            return GRAYSCALE_PRESETS[value as keyof typeof GRAYSCALE_PRESETS];
        }
        
        // Check font size tokens
        if (value in FONT_SIZE_TOKENS) {
            return FONT_SIZE_TOKENS[value as keyof typeof FONT_SIZE_TOKENS];
        }
    }
    
    // Token ref: "ref:tokens.typography.fontSize.xl" → 20
    if (typeof value === 'string' && value.startsWith('ref:tokens.typography.fontSize.')) {
        const key = value.replace('ref:tokens.typography.fontSize.', '');
        if (key in FONT_SIZE_TOKENS) {
            return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS];
        }
    }
    
    // CSS value or string number: "20px" → 20, "20" → 20
    if (typeof value === 'string') {
        const num = parseFloat(value.replace('px', '').trim());
        return isNaN(num) ? null : num;
    }
    
    return null;
}

function normalizeFontFamily(value: any): string | null {
    if (!value || typeof value !== 'string') return null;
    
    // Extract first font name only: "Inter, system-ui, sans-serif" → "inter"
    return value.split(',')[0].trim().toLowerCase().replace(/['"]/g, '');
}

function normalizeValue(value: any): any {
    if (value === null || value === undefined) return value;
    
    // Try gradient first (most specific)
    if (typeof value === 'string' && value.includes('gradient')) {
        return normalizeGradient(value);
    }
    
    // Try color
    if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return normalizeColor(value);
    }
    
    // Try font family (contains comma or ends with serif/sans-serif)
    if (typeof value === 'string' && (value.includes(',') || value.includes('serif'))) {
        return normalizeFontFamily(value);
    }
    
    // Try number (fontSize, borderRadius, spacing, etc)
    const num = normalizeNumber(value);
    if (num !== null) return num;
    
    // Return as-is
    return value;
}

// ============================================
// HELPER: Deep equality check with normalization
// ============================================

export function deepEqual(a: any, b: any): boolean {
    const normA = normalizeValue(a);
    const normB = normalizeValue(b);
    
    // Primitive comparison
    if (normA === normB) return true;
    if (normA == null || normB == null) return false;
    if (typeof normA !== typeof normB) return false;

    // Object comparison (for gradients, etc)
    if (typeof normA === 'object' && typeof normB === 'object') {
        const keysA = Object.keys(normA);
        const keysB = Object.keys(normB);
        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!deepEqual(normA[key], normB[key])) return false;
        }
        return true;
    }

    return false;
}

// ============================================
// CORE: Set appearance value
// ============================================

export function setAppearance(
    themesMap: Record<string, Theme>,
    state: AppearanceState,
    path: string,
    value: any
): AppearanceState {
    const presetValue = getPresetValue(themesMap, state.presetKey, path, state.headerPresetId);
    const newOverrides = { ...state.overrides };

    // Remove override if value matches preset or is null
    if (value === null || value === undefined || deepEqual(value, presetValue)) {
        delete newOverrides[path];
    } else {
        newOverrides[path] = value;
    }

    // Cleanup: Remove overrides that match preset values
    Object.keys(newOverrides).forEach(key => {
        if (key !== path) {
            const keyPresetValue = getPresetValue(themesMap, state.presetKey, key, state.headerPresetId);
            if (deepEqual(newOverrides[key], keyPresetValue)) {
                delete newOverrides[key];
            }
        }
    });

    return { ...state, overrides: newOverrides };
}

// ============================================
// HELPER: Check if using custom theme
// ============================================

export function isCustomTheme(themesMap: Record<string, Theme>, state: AppearanceState): boolean {
    // Check if any override differs from theme default
    const hasRealOverrides = Object.entries(state.overrides).some(([path, value]) => {
        const presetValue = getPresetValue(themesMap, state.presetKey, path, state.headerPresetId);
        return !deepEqual(value, presetValue);
    });
    
    if (hasRealOverrides) return true;
    
    // Check if header preset differs from theme default
    const preset = themesMap[state.presetKey];
    const defaultHeaderId = getDefaultHeaderPresetId(preset);
    
    return !!(state.headerPresetId && state.headerPresetId !== defaultHeaderId);
}

// ============================================
// HELPER: Get resolved value (preset + overrides)
// ============================================

export function getResolvedValue(themesMap: Record<string, Theme>, state: AppearanceState, path: string): any {
    // Priority 1: Check overrides
    if (path in state.overrides) {
        return state.overrides[path];
    }

    // Priority 2: Get from preset
    return getPresetValue(
        themesMap,
        state.presetKey,
        path,
        state.headerPresetId
    );
}

// ============================================
// HELPER: Reset to preset (clear all overrides)
// ============================================

export function resetToPreset(themesMap: Record<string, Theme>, presetKey: string): AppearanceState {
    const preset = themesMap[presetKey];
    return {
        presetKey,
        overrides: {},
        headerPresetId: getDefaultHeaderPresetId(preset)
    };
}

// ============================================
// HELPER: Change header preset
// ============================================

export function setHeaderPreset(
    themesMap: Record<string, Theme>,
    state: AppearanceState,
    headerPresetId: string
): AppearanceState {
    const preset = themesMap[state.presetKey];
    const defaultHeaderId = getDefaultHeaderPresetId(preset);
    const isReturningToDefault = headerPresetId === defaultHeaderId;
    
    // Remove all header.* overrides
    const newOverrides: Record<string, any> = {};
    Object.entries(state.overrides).forEach(([path, value]) => {
        if (!path.startsWith('header.')) {
            newOverrides[path] = value;
        }
    });

    const newState = { ...state, headerPresetId, overrides: newOverrides };

    // Cleanup: Remove overrides matching new preset
    Object.keys(newState.overrides).forEach(key => {
        const presetValue = getPresetValue(themesMap, newState.presetKey, key, headerPresetId);
        if (deepEqual(newState.overrides[key], presetValue)) {
            delete newState.overrides[key];
        }
    });
    
    // Special cleanup for orphaned backgroundColor
    if (isReturningToDefault) {
        const remainingKeys = Object.keys(newState.overrides);
        if (remainingKeys.length === 1 && remainingKeys[0] === 'backgroundColor') {
            delete newState.overrides.backgroundColor;
        }
    }

    return newState;
}

// ============================================
// MIGRATION: Convert DB format to internal state (NEW FORMAT)
// ============================================

export function migrateOldToNew(themesMap: Record<string, Theme>, dbState: any): AppearanceState {
    // Support both old and new format from DB
    const presetKey = dbState.themeKey || 'minimal';
    const preset = themesMap[presetKey];
    
    // NEW FORMAT: Already flat
    if (dbState.overrides !== undefined) {
        const headerPresetId = dbState.headerPresetId || getDefaultHeaderPresetId(preset);
        
        return {
            presetKey,
            overrides: dbState.overrides || {},
            headerPresetId
        };
    }
    
    // OLD FORMAT: Need to migrate
    const overrides: Record<string, any> = {};

    // Track preset IDs
    const headerPresetId = dbState.headerStyle?.presetId || getDefaultHeaderPresetId(preset);

    // Migrate customTheme fields
    if (dbState.customTheme) {
        const presetConfig: any = preset?.config || {};

        // Check each field in customTheme
        Object.entries(dbState.customTheme).forEach(([key, value]) => {
            // Skip special fields
            if (key === 'backgrounds' || key === 'backgroundVideo') return;

            // Only add to overrides if different from preset
            if (!deepEqual(value, presetConfig[key])) {
                overrides[key] = value;
            }
        });

        // Handle backgroundVideo separately
        if (dbState.customTheme.backgroundVideo) {
            overrides['backgroundVideo'] = dbState.customTheme.backgroundVideo;
        }
    }

    // Migrate headerStyle.overrides
    if (dbState.headerStyle?.overrides) {
        Object.entries(dbState.headerStyle.overrides).forEach(([key, value]) => {
            overrides[`header.${key}`] = value;
        });
    }

    // Migrate blockStyle.overrides
    if (dbState.blockStyle?.overrides) {
        Object.entries(dbState.blockStyle.overrides).forEach(([key, value]) => {
            overrides[`block.${key}`] = value;
        });
    }

    return {
        presetKey,
        overrides,
        headerPresetId
    };
}

// ============================================
// MIGRATION: Convert new format to DB format (NEW FORMAT)
// ============================================

export function migrateNewToOld(themesMap: Record<string, Theme>, newState: AppearanceState): any {
    const dbState: any = {
        themeKey: newState.presetKey,
        overrides: newState.overrides,
        headerPresetId: newState.headerPresetId
    };
    
    return dbState;
}
