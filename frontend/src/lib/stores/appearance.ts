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
		if (!$page) {
			console.log('[appearance store] No page data');
			return null;
		}

		try {
			console.log('[appearance store] Page changed, resolving appearance...');
			console.log('[appearance store] draft_appearance:', $page.draft_appearance);
			
			// Parse appearance state
			const appearanceState = JSON.parse($page.draft_appearance || '{}');
			console.log('[appearance store] Parsed appearanceState:', appearanceState);

			// Get theme key (priority: themeKey in appearance > theme_preset_key in page)
			const themeKey = appearanceState.themeKey || $page.theme_preset_key || 'minimal';
			console.log('[appearance store] Using themeKey:', themeKey);

			// O(1) theme lookup
			const theme = THEMES_MAP[themeKey] || THEMES_MAP['minimal'];
			console.log('[appearance store] Theme from THEMES_MAP:', theme);

			// If customTheme exists, use it (don't delete it!)
			if (appearanceState.customTheme) {
				console.log('[appearance store] Has customTheme, will use it:', appearanceState.customTheme);
			}

			// Resolve final appearance
			const resolved = resolveAppearance(theme, appearanceState);
			console.log('[appearance store] Resolved appearance:', resolved);
			console.log('[appearance store] Resolved tokens.backgroundColor:', resolved?.tokens?.backgroundColor);
			
			return resolved;
		} catch (e) {
			console.error('[appearance store] Failed to resolve:', e);
			return null;
		}
	}
);
