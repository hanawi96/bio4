import { writable } from 'svelte/store';
import { api } from '$lib/api.client';
import type { Theme } from '$lib/appearance/types';

function createThemesStore() {
	const { subscribe, set } = writable<Record<string, Theme>>({});
	
	return {
		subscribe,
		load: async () => {
			try {
				const result = await api.getThemes();
				const themesMap: Record<string, Theme> = {};
				result.themes.forEach(theme => {
					themesMap[theme.key] = theme;
				});
				set(themesMap);
				return themesMap;
			} catch (e) {
				console.error('[themes store] Failed to load:', e);
				return {};
			}
		}
	};
}

export const themes = createThemesStore();
