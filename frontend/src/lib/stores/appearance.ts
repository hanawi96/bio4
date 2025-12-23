import { derived, get } from 'svelte/store';
import { page } from './page';
import { themes } from './themes';
import { resolveAppearance } from '$lib/appearance/resolver';
import { THEMES_MAP } from '$lib/appearance/presets';
import type { ResolvedAppearance } from '$lib/appearance/types';

/**
 * Derived store that automatically resolves appearance from page state
 * Tracks all changes: theme, colors, fonts, spacing, header, blocks, etc.
 */
export const appearance = derived<typeof page, ResolvedAppearance | null>(
	page,
	($page) => {
		if (!$page) {
			return null;
		}

		try {
			// Parse appearance state
			const appearanceState = JSON.parse($page.draft_appearance || '{}');

			// Get theme key
			const themeKey = appearanceState.themeKey || $page.theme_preset_key || 'minimal';

			// Get theme from loaded themes store (priority) or fallback to THEMES_MAP
			const $themes = get(themes);
			const theme = $themes[themeKey] || THEMES_MAP[themeKey] || THEMES_MAP['minimal'];

			// Resolve final appearance
			const resolved = resolveAppearance(theme, appearanceState);
			
			return resolved;
		} catch (e) {
			console.error('[appearance store] Failed to resolve:', e);
			return null;
		}
	}
);
