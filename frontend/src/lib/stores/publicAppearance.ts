import { derived } from 'svelte/store';
import { page, theme } from './page';
import { resolveAppearance } from '$lib/appearance/resolver';
import { FALLBACK_THEME } from '$lib/appearance/presets';
import type { ResolvedAppearance } from '$lib/appearance/types';
import type { Theme } from '$lib/appearance/types';

/**
 * Public appearance store - uses published_appearance instead of draft_appearance
 * Used for rendering the public bio page
 */
export const publicAppearance = derived<[typeof page, typeof theme], ResolvedAppearance | null>(
	[page, theme],
	([$page, $theme]) => {
		if (!$page) {
			return null;
		}

		try {
			// Parse PUBLISHED appearance state (not draft)
			const appearanceState = JSON.parse($page.published_appearance || '{}');

			// Use theme from API response (already resolved by backend)
			// Wrap it in Theme format if needed
			const themeData: Theme = $theme ? {
				id: 0,
				key: appearanceState.themeKey || 'minimal',
				name: 'Public Theme',
				config: $theme as any // Cast to avoid type mismatch between two ThemeConfig types
			} : FALLBACK_THEME;

			// Resolve final appearance
			const resolved = resolveAppearance(themeData, appearanceState);

			return resolved;
		} catch (e) {
			console.error('[publicAppearance store] Failed to resolve:', e);
			return null;
		}
	}
);
