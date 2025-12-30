import { writable } from 'svelte/store';
import { api } from '$lib/api.client';
import type { BlockPreset } from '$lib/appearance/types';

// Store for block presets loaded from database
export const blockPresets = writable<Record<string, BlockPreset>>({});

// Load block presets from API
export async function loadBlockPresets() {
    try {
        const result = await api.getBlockPresets();
        const presetsMap: Record<string, BlockPreset> = {};

        result.presets.forEach((preset: any) => {
            presetsMap[preset.key] = preset.config;
        });

        blockPresets.set(presetsMap);
        return true;
    } catch (error) {
        console.error('[blockPresets] Failed to load:', error);
        return false;
    }
}
