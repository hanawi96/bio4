import { derived } from 'svelte/store';
import { page } from './page';
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
		if (!$page) return null;

		try {
			// Parse appearance state
			const appearanceState = JSON.parse($page.draft_appearance || '{}');

			// Get theme key (priority: themeKey in appearance > theme_preset_key in page)
			const themeKey = appearanceState.themeKey || $page.theme_preset_key || 'minimal';

			// O(1) theme lookup
			const theme = THEMES_MAP[themeKey] || THEMES_MAP['minimal'];

			// If theme is selected, remove customTheme to avoid conflict
			if (themeKey && appearanceState.customTheme) {
				delete appearanceState.customTheme;
			}

			// Resolve final appearance
			return resolveAppearance(theme, appearanceState);
		} catch (e) {
			console.error('[appearance store] Failed to resolve:', e);
			return null;
		}
	}
);
