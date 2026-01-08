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
			
			console.log('[publicAppearance store] published_appearance:', $page.published_appearance);
			console.log('[publicAppearance store] appearanceState:', appearanceState);
			console.log('[publicAppearance store] theme from API:', $theme);

			// Use theme from API response (already resolved by backend)
			// Wrap it in Theme format if needed
			const themeData: Theme = $theme ? {
				id: 0,
				key: appearanceState.themeKey || 'minimal',
				name: 'Public Theme',
				config: $theme as any // Cast to avoid type mismatch between two ThemeConfig types
			} : FALLBACK_THEME;

			console.log('[publicAppearance store] themeData.config.meta:', themeData.config?.meta);

			// Resolve final appearance
			const resolved = resolveAppearance(themeData, appearanceState);

			console.log('[publicAppearance store] resolved.tokens.backgroundColor:', resolved.tokens.backgroundColor);
			console.log('[publicAppearance store] resolved.theme.config.tokens.bg:', resolved.theme.config?.tokens?.bg);

			return resolved;
		} catch (e) {
			console.error('[publicAppearance store] Failed to resolve:', e);
			return null;
		}
	}
);
