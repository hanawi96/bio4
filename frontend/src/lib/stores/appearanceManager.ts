// ============================================
// APPEARANCE MANAGER STORE - Centralized State Management
// ============================================

import { derived, get } from 'svelte/store';
import { page } from './page';
import { api } from '$lib/api.client';
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
let isUpdating = false; // Prevent reactive loops

// ============================================
// DERIVED: Current appearance state (from page store)
// ============================================

export const appearanceState = derived<typeof page, AppearanceState>(
    page,
    ($page) => {
        if (!$page?.draft_appearance) {
            // Default state
            return resetToPreset('minimal');
        }

        try {
            const oldState = JSON.parse($page.draft_appearance);
            // Migrate old format to new format
            return migrateOldToNew(oldState);
        } catch (e) {
            console.error('[appearanceManager] Failed to parse draft_appearance:', e);
            return resetToPreset('minimal');
        }
    }
);

// ============================================
// DERIVED: Is using custom theme?
// ============================================

export const isCustom = derived(appearanceState, ($state) => {
    return isCustomTheme($state);
});

// ============================================
// CORE: Update appearance value
// ============================================

export async function updateAppearance(path: string, value: any) {
    if (isUpdating) return;
    isUpdating = true;

    try {
        const currentState = get(appearanceState);
        const newState = setAppearanceHelper(currentState, path, value);

        // Convert to old format for DB
        const oldFormat = migrateNewToOld(newState);

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
                console.log('[appearanceManager] Saved:', path, '=', value);
            } catch (e) {
                console.error('[appearanceManager] Failed to save:', e);
            }
        }, 300);
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 100);
    }
}

// ============================================
// HELPER: Change theme preset
// ============================================

export async function changeThemePreset(presetKey: string) {
    if (isUpdating) return;
    isUpdating = true;

    try {
        const newState = resetToPreset(presetKey);
        const oldFormat = migrateNewToOld(newState);

        // Update page store
        page.update(p => {
            if (!p) return p;
            return {
                ...p,
                theme_preset_key: presetKey,
                draft_appearance: JSON.stringify(oldFormat)
            };
        });

        // Save to API
        await api.saveDraft(username, {
            theme_preset_key: presetKey,
            draft_appearance: JSON.stringify(oldFormat)
        });

        console.log('[appearanceManager] Changed theme preset to:', presetKey);
    } catch (e) {
        console.error('[appearanceManager] Failed to change theme:', e);
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 100);
    }
}

// ============================================
// HELPER: Change header preset
// ============================================

export async function changeHeaderPreset(headerPresetId: string) {
    if (isUpdating) return;
    isUpdating = true;

    try {
        const currentState = get(appearanceState);
        const newState = setHeaderPresetHelper(currentState, headerPresetId);
        const oldFormat = migrateNewToOld(newState);

        // Update page store
        page.update(p => {
            if (!p) return p;
            return {
                ...p,
                draft_appearance: JSON.stringify(oldFormat)
            };
        });

        // Save to API
        await api.saveDraft(username, {
            draft_appearance: JSON.stringify(oldFormat)
        });

        console.log('[appearanceManager] Changed header preset to:', headerPresetId);
    } catch (e) {
        console.error('[appearanceManager] Failed to change header preset:', e);
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 100);
    }
}

// ============================================
// HELPER: Change block preset
// ============================================

export async function changeBlockPreset(blockPresetId: string) {
    if (isUpdating) return;
    isUpdating = true;

    try {
        const currentState = get(appearanceState);
        const newState = setBlockPresetHelper(currentState, blockPresetId);
        const oldFormat = migrateNewToOld(newState);

        // Update page store
        page.update(p => {
            if (!p) return p;
            return {
                ...p,
                draft_appearance: JSON.stringify(oldFormat)
            };
        });

        // Save to API
        await api.saveDraft(username, {
            draft_appearance: JSON.stringify(oldFormat)
        });

        console.log('[appearanceManager] Changed block preset to:', blockPresetId);
    } catch (e) {
        console.error('[appearanceManager] Failed to change block preset:', e);
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 100);
    }
}

// ============================================
// HELPER: Get resolved value
// ============================================

export function getValue(path: string): any {
    const state = get(appearanceState);
    return getResolvedValue(state, path);
}
