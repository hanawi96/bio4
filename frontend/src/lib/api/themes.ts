/**
 * Theme API Client
 * Fetch themes from database
 */

import type { Theme } from '$lib/appearance/types';

const API_BASE = 'http://localhost:8787';

/**
 * Fetch all themes from API
 */
export async function fetchThemes(): Promise<Theme[]> {
	try {
		const response = await fetch(`${API_BASE}/themes`);
		if (!response.ok) {
			throw new Error(`Failed to fetch themes: ${response.statusText}`);
		}
		const data = await response.json();
		return data.themes || [];
	} catch (error) {
		console.error('Error fetching themes:', error);
		return [];
	}
}

/**
 * Fetch single theme by key
 */
export async function fetchThemeByKey(key: string): Promise<Theme | null> {
	try {
		const response = await fetch(`${API_BASE}/themes/${key}`);
		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`Failed to fetch theme: ${response.statusText}`);
		}
		const data = await response.json();
		return data.theme || null;
	} catch (error) {
		console.error(`Error fetching theme ${key}:`, error);
		return null;
	}
}

/**
 * Create themes map for O(1) lookup
 */
export function createThemesMap(themes: Theme[]): Record<string, Theme> {
	return themes.reduce((map, theme) => {
		map[theme.key] = theme;
		return map;
	}, {} as Record<string, Theme>);
}
