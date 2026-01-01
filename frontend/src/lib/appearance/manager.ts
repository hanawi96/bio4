// ============================================
// APPEARANCE MANAGER - Centralized Logic
// ============================================

import { HEADER_PRESETS } from './presets';
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
        const currentHeaderId = headerPresetId || preset.defaultHeaderPresetId || 'no-cover';
        const headerPreset = HEADER_PRESETS[currentHeaderId];
        return headerPreset?.[headerKey as keyof typeof headerPreset];
    } else if (path.startsWith('block.')) {
        // Block value - stylePreset comes from theme config
        const blockKey = path.replace('block.', '');
        
        if (blockKey === 'stylePreset') {
            return preset.config.page?.defaults?.blockStylePreset || 'solid';
        }
        
        // Other block properties (borderRadius, etc.) have no preset
        return undefined;
    } else if (path.startsWith('page.linkGroupConfig.')) {
        // Link group config value (e.g., 'page.linkGroupConfig.grid.columns')
        const configPath = path.replace('page.linkGroupConfig.', '');
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
    } else if (path === 'backgroundColor') {
        // Special case: Convert bg token to CSS string for comparison
        const bgToken = preset.config.tokens?.bg;
        return bgTokenToCss(bgToken);
    } else {
        // Theme config value
        return preset.config[path as keyof typeof preset.config];
    }
}

// ============================================
// HELPER: Normalize gradient string to comparable format
// ============================================

function normalizeGradient(value: string): string | null {
    if (!value || typeof value !== 'string') return null;
    
    // Already normalized or not a gradient
    if (!value.includes('gradient')) return value;
    
    // Extract gradient type
    const isRadial = value.includes('radial-gradient');
    
    // Extract colors (support both #hex and rgb/rgba)
    const colorRegex = /#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g;
    const colors = value.match(colorRegex);
    if (!colors || colors.length < 2) return value;
    
    // Extract angle for linear gradients
    let angle = 135; // default
    if (!isRadial) {
        const angleMatch = value.match(/(\d+)deg/);
        if (angleMatch) {
            angle = parseInt(angleMatch[1]);
        }
    }
    
    // Normalize to standard format: "type|angle|color1|color2"
    const type = isRadial ? 'radial' : 'linear';
    return `${type}|${angle}|${colors[0]}|${colors[1]}`;
}

// ============================================
// HELPER: Deep equality check with gradient normalization
// ============================================

export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    // Special case: Compare gradient strings
    if (typeof a === 'string' && typeof b === 'string') {
        if (a.includes('gradient') || b.includes('gradient')) {
            const normalizedA = normalizeGradient(a);
            const normalizedB = normalizeGradient(b);
            return normalizedA === normalizedB;
        }
        return a === b;
    }

    // For objects
    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!deepEqual(a[key], b[key])) return false;
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
    const presetValue = getPresetValue(
        themesMap,
        state.presetKey,
        path,
        state.headerPresetId
    );
    const newOverrides = { ...state.overrides };

    // If value is null/undefined, remove from overrides
    if (value === null || value === undefined) {
        delete newOverrides[path];
    } else if (deepEqual(value, presetValue)) {
        // Value matches preset → Remove from overrides
        delete newOverrides[path];
    } else {
        // Value differs from preset → Save to overrides
        newOverrides[path] = value;
    }

    return {
        ...state,
        overrides: newOverrides
    };
}

// ============================================
// HELPER: Check if using custom theme
// ============================================

export function isCustomTheme(themesMap: Record<string, Theme>, state: AppearanceState): boolean {
    // Check 1: Has any overrides
    if (Object.keys(state.overrides).length > 0) {
        return true;
    }
    
    // Check 2: Header preset different from theme default
    const preset = themesMap[state.presetKey];
    const defaultHeaderId = preset?.defaultHeaderPresetId || 'no-cover';
    if (state.headerPresetId && state.headerPresetId !== defaultHeaderId) {
        return true;
    }
    
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
        headerPresetId: preset?.defaultHeaderPresetId || 'no-cover'
    };
}

// ============================================
// HELPER: Change header preset
// ============================================

export function setHeaderPreset(
    state: AppearanceState,
    headerPresetId: string
): AppearanceState {
    // Remove all header.* overrides when changing preset
    const newOverrides: Record<string, any> = {};
    Object.entries(state.overrides).forEach(([path, value]) => {
        if (!path.startsWith('header.')) {
            newOverrides[path] = value;
        }
    });

    return {
        ...state,
        headerPresetId,
        overrides: newOverrides
    };
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
        const headerPresetId = dbState.headerPresetId || preset?.defaultHeaderPresetId || 'no-cover';
        
        return {
            presetKey,
            overrides: dbState.overrides || {},
            headerPresetId
        };
    }
    
    // OLD FORMAT: Need to migrate
    const overrides: Record<string, any> = {};

    // Track preset IDs
    const headerPresetId = dbState.headerStyle?.presetId || preset?.defaultHeaderPresetId || 'no-cover';

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
