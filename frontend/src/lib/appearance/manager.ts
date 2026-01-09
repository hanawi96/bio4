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
    if (!theme) {
        console.log('[getDefaultHeaderPresetId] No theme provided, returning no-cover');
        return 'no-cover';
    }
    
    // Priority 1: Root level defaultHeaderPresetId
    if (theme.defaultHeaderPresetId) {
        console.log('[getDefaultHeaderPresetId] Found root level:', theme.defaultHeaderPresetId);
        return theme.defaultHeaderPresetId;
    }
    
    // Priority 2: Config page defaults headerPresetId
    if (theme.config?.page?.defaults?.headerPresetId) {
        console.log('[getDefaultHeaderPresetId] Found nested config:', theme.config.page.defaults.headerPresetId);
        return theme.config.page.defaults.headerPresetId;
    }
    
    // Fallback
    console.log('[getDefaultHeaderPresetId] No default found, returning no-cover');
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
        
        const currentHeaderId = headerPresetId || getDefaultHeaderPresetId(preset);
        const headerPreset = HEADER_PRESETS[currentHeaderId];
        return headerPreset?.[headerKey as keyof typeof headerPreset];
    } else if (path === 'headerPresetId') {
        // Header preset ID from theme default
        return getDefaultHeaderPresetId(preset);
    } else if (path.startsWith('block.')) {
        // Block value - stylePreset comes from theme config
        const blockKey = path.replace('block.', '');
        
        console.log('[getPresetValue] Block path:', { blockKey, presetKey });
        
        if (blockKey === 'stylePreset') {
            return preset.config.page?.defaults?.blockStylePreset || 'solid';
        }
        
        // Block colors
        if (blockKey === 'color') {
            return preset.config?.semantic?.color?.primary;
        }
        if (blockKey === 'textColor') {
            return preset.config?.semantic?.color?.block?.text;
        }
        
        // Other block properties from theme config (stored in page.defaults, not tokens.block)
        // Provide fallback values if theme doesn't specify
        if (blockKey === 'borderRadius') {
            const value = preset.config?.page?.defaults?.borderRadius ?? 12; // Default 12px
            console.log('[getPresetValue] borderRadius from theme:', value);
            return value;
        }
        if (blockKey === 'padding') {
            const value = preset.config?.page?.defaults?.padding;
            console.log('[getPresetValue] padding from theme:', value);
            return value;
        }
        if (blockKey === 'borderWidth') {
            const value = preset.config?.page?.defaults?.borderWidth ?? 1; // Default 1px
            console.log('[getPresetValue] borderWidth from theme:', value);
            return value;
        }
        if (blockKey === 'shadow') {
            return preset.config?.page?.defaults?.shadowStyle;
        }
        
        console.log('[getPresetValue] Block property not found:', blockKey);
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
        if (typographyKey === 'mutedColor') {
            return preset.config?.semantic?.color?.text?.muted;
        }
        
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

// BorderRadius token mapping (match Theme Editor)
const BORDER_RADIUS_TOKENS: Record<string, number> = {
    'none': 0,
    'sm': 4,
    'md': 8,
    'lg': 12,
    'xl': 16,
    'full': 9999
};

// BlockGap token mapping
const BLOCK_GAP_TOKENS: Record<string, number> = {
    'compact': 8,
    'default': 16,
    'spacious': 24
};

// Blur token mapping
const BLUR_TOKENS: Record<string, number> = {
    'none': 0,
    'subtle': 10,
    'medium': 20,
    'strong': 35,
    'extreme': 60
};

// Brightness token mapping
const BRIGHTNESS_TOKENS: Record<string, number> = {
    'darkest': 50,
    'dark': 75,
    'normal': 100,
    'bright': 125,
    'brightest': 150
};

// Grayscale token mapping
const GRAYSCALE_TOKENS: Record<string, number> = {
    'none': 0,
    'subtle': 25,
    'medium': 50,
    'strong': 75,
    'full': 100
};

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
    if (!value || typeof value !== 'string') return null;
    if (!value.includes('gradient')) return null;
    
    const isRadial = value.includes('radial-gradient');
    
    // Extract colors (support #hex, #shorthand, rgb, rgba)
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/gi;
    const colors = value.match(colorRegex);
    if (!colors || colors.length < 2) return null;
    
    // Normalize colors
    const normalizedColors = colors.map(c => normalizeColor(c) || c);
    
    // Extract angle for linear gradients
    let angle = 135; // default
    if (!isRadial) {
        const angleMatch = value.match(/(\d+)deg/);
        if (angleMatch) {
            angle = parseInt(angleMatch[1]);
        }
    }
    
    return {
        type: isRadial ? 'radial' : 'linear',
        angle,
        colors: normalizedColors
    };
}

function normalizeNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (!value) return null;
    
    // BorderRadius token: "sm" → 8
    if (typeof value === 'string' && value in BORDER_RADIUS_TOKENS) {
        return BORDER_RADIUS_TOKENS[value];
    }
    
    // BlockGap token: "compact" → 8
    if (typeof value === 'string' && value in BLOCK_GAP_TOKENS) {
        return BLOCK_GAP_TOKENS[value];
    }
    
    // Blur token: "none" → 0
    if (typeof value === 'string' && value in BLUR_TOKENS) {
        return BLUR_TOKENS[value];
    }
    
    // Brightness token: "normal" → 100
    if (typeof value === 'string' && value in BRIGHTNESS_TOKENS) {
        return BRIGHTNESS_TOKENS[value];
    }
    
    // Grayscale token: "none" → 0
    if (typeof value === 'string' && value in GRAYSCALE_TOKENS) {
        return GRAYSCALE_TOKENS[value];
    }
    
    // FontSize token: "xl" → 20
    if (typeof value === 'string' && value in FONT_SIZE_TOKENS) {
        return FONT_SIZE_TOKENS[value as keyof typeof FONT_SIZE_TOKENS];
    }
    
    // Token ref: "ref:tokens.typography.fontSize.xl" → 20
    if (typeof value === 'string' && value.startsWith('ref:tokens.typography.fontSize.')) {
        const key = value.replace('ref:tokens.typography.fontSize.', '');
        if (key in FONT_SIZE_TOKENS) {
            return FONT_SIZE_TOKENS[key as keyof typeof FONT_SIZE_TOKENS];
        }
    }
    
    // CSS value: "20px" → 20, or string number: "20" → 20
    if (typeof value === 'string') {
        const cleaned = value.replace('px', '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    
    return null;
}

// ============================================
// HELPER: Normalize value for comparison
// ============================================

function normalizeFontFamily(value: any): string | null {
    if (!value || typeof value !== 'string') return null;
    
    // Extract first font name only (before first comma)
    // "Inter, system-ui, sans-serif" → "inter"
    // "Poppins, sans-serif" → "poppins"
    const firstFont = value.split(',')[0].trim().toLowerCase();
    
    // Remove quotes if present
    return firstFont.replace(/['"]/g, '');
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
    console.log('[setAppearance] Called with:', { path, value });
    
    const presetValue = getPresetValue(
        themesMap,
        state.presetKey,
        path,
        state.headerPresetId
    );
    
    console.log('[setAppearance] Preset value:', presetValue);
    console.log('[setAppearance] Normalized user value:', normalizeValue(value));
    console.log('[setAppearance] Normalized preset value:', normalizeValue(presetValue));
    console.log('[setAppearance] Values equal?', deepEqual(value, presetValue));
    
    const newOverrides = { ...state.overrides };

    // If value is null/undefined, remove from overrides
    if (value === null || value === undefined) {
        console.log('[setAppearance] Value is null/undefined, removing override');
        delete newOverrides[path];
    } else if (deepEqual(value, presetValue)) {
        // Value matches preset → Remove from overrides
        console.log('[setAppearance] Value matches preset, removing override');
        delete newOverrides[path];
    } else {
        // Value differs from preset → Save to overrides
        console.log('[setAppearance] Value differs from preset, saving override');
        newOverrides[path] = value;
    }

    console.log('[setAppearance] Before cleanup, overrides:', newOverrides);

    // Clean up: Remove any other overrides that now match preset values
    // This handles cases where theme changed and old overrides now match new theme
    Object.keys(newOverrides).forEach(key => {
        const keyPresetValue = getPresetValue(themesMap, state.presetKey, key, state.headerPresetId);
        const matches = deepEqual(newOverrides[key], keyPresetValue);
        
        if (key !== path) { // Only log for other keys to reduce noise
            console.log('[setAppearance] Cleanup check:', { key, value: newOverrides[key], presetValue: keyPresetValue, matches });
        }
        
        if (matches) {
            console.log('[setAppearance] Cleanup: removing matching override:', key);
            delete newOverrides[key];
        }
    });

    console.log('[setAppearance] Final overrides:', newOverrides);

    return {
        ...state,
        overrides: newOverrides
    };
}

// ============================================
// HELPER: Check if using custom theme
// ============================================

export function isCustomTheme(themesMap: Record<string, Theme>, state: AppearanceState): boolean {
    console.log('[isCustomTheme] Checking customization...');
    console.log('[isCustomTheme] State:', { 
        presetKey: state.presetKey, 
        headerPresetId: state.headerPresetId,
        overridesCount: Object.keys(state.overrides).length,
        overrides: state.overrides
    });
    
    // Check 1: Check if any override actually differs from theme default
    const hasRealOverrides = Object.entries(state.overrides).some(([path, value]) => {
        const presetValue = getPresetValue(themesMap, state.presetKey, path, state.headerPresetId);
        const isDifferent = !deepEqual(value, presetValue);
        if (isDifferent) {
            console.log('[isCustomTheme] Override differs:', { path, value, presetValue });
        }
        return isDifferent;
    });
    
    console.log('[isCustomTheme] Has real overrides:', hasRealOverrides);
    
    if (hasRealOverrides) {
        return true;
    }
    
    // Check 2: Header preset different from theme default
    const preset = themesMap[state.presetKey];
    const defaultHeaderId = getDefaultHeaderPresetId(preset);
    const headerDifferent = state.headerPresetId && state.headerPresetId !== defaultHeaderId;
    
    console.log('[isCustomTheme] Header check:', {
        currentHeaderId: state.headerPresetId,
        defaultHeaderId,
        isDifferent: headerDifferent
    });
    
    if (headerDifferent) {
        return true;
    }
    
    console.log('[isCustomTheme] Result: NOT custom');
    return false;
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
    console.log('[setHeaderPreset] Changing header preset to:', headerPresetId);
    console.log('[setHeaderPreset] Current state:', state);
    
    const preset = themesMap[state.presetKey];
    const defaultHeaderId = getDefaultHeaderPresetId(preset);
    const isReturningToDefault = headerPresetId === defaultHeaderId;
    
    // Remove all header.* overrides when changing preset
    const newOverrides: Record<string, any> = {};
    Object.entries(state.overrides).forEach(([path, value]) => {
        if (!path.startsWith('header.')) {
            newOverrides[path] = value;
        } else {
            console.log('[setHeaderPreset] Removing header override:', path);
        }
    });

    const newState = {
        ...state,
        headerPresetId,
        overrides: newOverrides
    };

    console.log('[setHeaderPreset] Before cleanup, overrides:', newState.overrides);

    // Clean up: Remove any remaining overrides that match new preset values
    Object.keys(newState.overrides).forEach(key => {
        const presetValue = getPresetValue(themesMap, newState.presetKey, key, headerPresetId);
        const currentValue = newState.overrides[key];
        const matches = deepEqual(currentValue, presetValue);
        
        console.log('[setHeaderPreset] Checking override:', { 
            key, 
            currentValue, 
            presetValue, 
            matches 
        });
        
        if (matches) {
            console.log('[setHeaderPreset] Removing matching override:', key);
            delete newState.overrides[key];
        }
    });
    
    // Special cleanup: If returning to default header and only backgroundColor override remains,
    // remove it too (likely leftover from previous customization)
    if (isReturningToDefault) {
        const remainingKeys = Object.keys(newState.overrides);
        if (remainingKeys.length === 1 && remainingKeys[0] === 'backgroundColor') {
            console.log('[setHeaderPreset] Removing orphaned backgroundColor override when returning to default');
            delete newState.overrides.backgroundColor;
        }
    }

    console.log('[setHeaderPreset] Final state:', newState);
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
