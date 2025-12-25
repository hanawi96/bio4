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
// CORE: Update appearance value
// ============================================

export function updateAppearance(path: string, value: any) {
    console.log('📝 updateAppearance called:', { path, value });
    
    const currentState = get(appearanceState);
    const $themes = get(themes);
    const themesMap = Object.keys($themes).length > 0 ? $themes : { minimal: FALLBACK_THEME };
    
    console.log('📝 currentState before:', currentState.overrides);
    
    const newState = setAppearanceHelper(themesMap, currentState, path, value);
    console.log('📝 newState after:', newState.overrides);
    
    const oldFormat = migrateNewToOld(themesMap, newState);
    console.log('📝 oldFormat to save:', oldFormat);

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
