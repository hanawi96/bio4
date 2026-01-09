// ============================================
// APPEARANCE MANAGER STORE - Centralized State Management
// ============================================

import { derived, get } from 'svelte/store';
import { page, groups } from './page';
import { themes } from './themes';
import { api } from '$lib/api.client';
import { FALLBACK_THEME } from '$lib/appearance/presets';
import {
    type AppearanceState,
    setAppearance as setAppearanceHelper,
    isCustomTheme,
    getResolvedValue,
    resetToPreset,
    setHeaderPreset as setHeaderPresetHelper,
    migrateOldToNew,
    migrateNewToOld
} from '$lib/appearance/manager';

// ============================================
// INTERNAL STATE
// ============================================

const username = 'demo'; // TODO: Get from auth context
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================
// DERIVED: Current appearance state (from page store)
// ============================================

export const appearanceState = derived<typeof page, AppearanceState>(
    page,
    ($page) => {
        if (!$page?.draft_appearance) {
            const $themes = get(themes);
            const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
            return resetToPreset(themesMap, 'minimal');
        }

        try {
            const oldState = JSON.parse($page.draft_appearance);
            const $themes = get(themes);
            const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
            return migrateOldToNew(themesMap, oldState);
        } catch (e) {
            console.error('[appearanceManager] Failed to parse draft_appearance:', e);
            const $themes = get(themes);
            const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
            return resetToPreset(themesMap, 'minimal');
        }
    }
);

// ============================================
// DERIVED: Is using custom theme?
// ============================================

export const isCustom = derived([appearanceState, themes], ([$state, $themes]) => {
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
    return isCustomTheme(themesMap, $state);
});

// ============================================
// DERIVED: Has customizations (overrides or preset changes)
// ============================================

export const hasCustomizations = derived([appearanceState, themes], ([$state, $themes]) => {
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
    
    // Use isCustomTheme which now does deep comparison
    return isCustomTheme(themesMap, $state);
});

// ============================================
// CORE: Update appearance value
// ============================================

export function updateAppearance(path: string, value: any) {
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    const newState = setAppearanceHelper(themesMap, currentState, path, value);
    const oldFormat = migrateNewToOld(themesMap, newState);

    // Optimistic update: Update page store immediately
    page.update(p => {
        if (!p) return p;
        return {
            ...p,
            draft_appearance: JSON.stringify(oldFormat)
        };
    });

    // Debounced save to API
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        try {
            await api.saveDraft(username, {
                draft_appearance: JSON.stringify(oldFormat)
            });
        } catch (e) {
            console.error('[appearanceManager] Failed to save:', e);
        }
    }, 300);
}

// ============================================
// HELPER: Change theme preset
// ============================================

export async function changeThemePreset(presetKey: string) {
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    // If selecting the same theme, keep overrides (don't reset)
    const newState = presetKey === currentState.presetKey
        ? { ...currentState, presetKey } // Keep current overrides
        : resetToPreset(themesMap, presetKey); // Reset overrides when switching to different theme

    const oldFormat = migrateNewToOld(themesMap, newState);

    page.update(p => {
        if (!p) return p;
        return {
            ...p,
            theme_preset_key: presetKey,
            draft_appearance: JSON.stringify(oldFormat)
        };
    });

    try {
        // Save theme change
        await api.saveDraft(username, {
            theme_preset_key: presetKey,
            draft_appearance: JSON.stringify(oldFormat)
        });
        
        // Only reset groups if actually switching to a different theme
        if (presetKey !== currentState.presetKey) {
            const $groups = get(groups);
            const resetPromises = $groups.map(group => 
                api.updateGroup(group.id, { 
                    layout_type: null,
                    layout_config: null 
                })
            );
            await Promise.all(resetPromises);
            
            // Update local store
            groups.update(g => g.map(group => ({ 
                ...group, 
                layout_type: null,
                layout_config: null 
            })));
            
            console.log('[appearanceManager] Reset all group layout_type and layout_config to apply theme defaults');
        }
    } catch (e) {
        console.error('[appearanceManager] Failed to change theme:', e);
    }
}

// ============================================
// HELPER: Change header preset
// ============================================

export async function changeHeaderPreset(headerPresetId: string) {
    console.log('[changeHeaderPreset] Called with:', headerPresetId);
    
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    console.log('[changeHeaderPreset] Current state before change:', currentState);

    const newState = setHeaderPresetHelper(themesMap, currentState, headerPresetId);
    
    console.log('[changeHeaderPreset] New state after change:', newState);
    
    const oldFormat = migrateNewToOld(themesMap, newState);

    page.update(p => {
        if (!p) return p;
        return {
            ...p,
            draft_appearance: JSON.stringify(oldFormat)
        };
    });

    try {
        await api.saveDraft(username, {
            draft_appearance: JSON.stringify(oldFormat)
        });
        console.log('[changeHeaderPreset] Saved successfully');
    } catch (e) {
        console.error('[appearanceManager] Failed to change header preset:', e);
    }
}

// ============================================
// HELPER: Get resolved value
// ============================================

export function getValue(path: string): any {
    const state = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
    return getResolvedValue(themesMap, state, path);
}

// ============================================
// HELPER: Reset to theme default (clear all overrides)
// ============================================

export async function resetToThemeDefault() {
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    // Reset to theme defaults (clear overrides AND reset preset IDs)
    const theme = themesMap[currentState.presetKey || 'minimal'];
    
    // Use resetToPreset helper which has consistent logic
    const newState = resetToPreset(themesMap, currentState.presetKey || 'minimal');

    const oldFormat = migrateNewToOld(themesMap, newState);

    page.update(p => {
        if (!p) return p;
        return {
            ...p,
            draft_appearance: JSON.stringify(oldFormat)
        };
    });

    try {
        await api.saveDraft(username, {
            draft_appearance: JSON.stringify(oldFormat)
        });
    } catch (e) {
        console.error('[appearanceManager] Failed to reset theme:', e);
        throw e;
    }
}
