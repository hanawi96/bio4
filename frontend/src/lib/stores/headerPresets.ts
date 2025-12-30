import { writable } from 'svelte/store';
import { api } from '$lib/api.client';
import type { HeaderPreset } from '$lib/appearance/types';

// Store for header presets loaded from database
export const headerPresets = writable<Record<string, HeaderPreset>>({});

// Load header presets from API
export async function loadHeaderPresets() {
    try {
        const result = await api.getHeaderPresets();
        const presetsMap: Record<string, HeaderPreset> = {};

        result.presets.forEach((preset: any) => {
            presetsMap[preset.key] = preset.config;
        });

        headerPresets.set(presetsMap);
        return true;
    } catch (error) {
        console.error('[headerPresets] Failed to load:', error);
        return false;
    }
}
