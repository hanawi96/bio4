// ============================================
// APPEARANCE MANAGER STORE - Centralized State Management
// ============================================

import { derived, get } from 'svelte/store';
import { page } from './page';
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
    setBlockPreset as setBlockPresetHelper,
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
    const hasOverrides = Object.keys($state.overrides || {}).length > 0;

    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
    const theme = themesMap[$state.presetKey || 'minimal'];
    const themeDefaults = theme?.config?.defaults;

    const headerChanged = themeDefaults && $state.headerPresetId &&
        $state.headerPresetId !== themeDefaults.headerPreset;
    const blockChanged = themeDefaults && $state.blockPresetId &&
        $state.blockPresetId !== themeDefaults.blockPreset;

    return hasOverrides || headerChanged || blockChanged;
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
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    const newState = resetToPreset(themesMap, presetKey);
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
        await api.saveDraft(username, {
            theme_preset_key: presetKey,
            draft_appearance: JSON.stringify(oldFormat)
        });
    } catch (e) {
        console.error('[appearanceManager] Failed to change theme:', e);
    }
}

// ============================================
// HELPER: Change header preset
// ============================================

export async function changeHeaderPreset(headerPresetId: string) {
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    const newState = setHeaderPresetHelper(currentState, headerPresetId);
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
        console.error('[appearanceManager] Failed to change header preset:', e);
    }
}

// ============================================
// HELPER: Change block preset
// ============================================

export async function changeBlockPreset(blockPresetId: string) {
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };

    const newState = setBlockPresetHelper(currentState, blockPresetId);
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
        console.error('[appearanceManager] Failed to change block preset:', e);
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
    const newState: AppearanceState = {
        presetKey: currentState.presetKey || 'minimal',
        headerPresetId: theme?.defaultHeaderPresetId || theme?.config?.defaults?.headerPreset || 'no-cover',
        blockPresetId: theme?.defaultBlockPresetId || theme?.config?.defaults?.blockPreset || 'rounded-solid',
        overrides: {} // Clear all overrides
    };

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
