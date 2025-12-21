import { derived } from 'svelte/store';
import { theme, page } from './page';
import type { ThemeConfig } from '../types';

// Default theme config
export const DEFAULT_THEME: ThemeConfig = {
	backgroundColor: '#ffffff',
	textColor: '#000000',
	primaryColor: '#3b82f6',
	fontFamily: 'Inter',
	borderRadius: 8,
	spacing: 16
};

// Current theme with fallback to default
export const currentTheme = derived(theme, ($theme) => $theme || DEFAULT_THEME);

// Theme mode from page
export const themeMode = derived(page, ($page) => $page?.theme_mode || 'light');

// CSS variables derived from theme
export const cssVars = derived(currentTheme, ($theme) => ({
	'--bg-color': $theme.backgroundColor,
	'--text-color': $theme.textColor,
	'--primary-color': $theme.primaryColor,
	'--font-family': $theme.fontFamily,
	'--border-radius': `${$theme.borderRadius}px`,
	'--spacing': `${$theme.spacing}px`
}));

// CSS string for inline styles
export const cssVarsString = derived(cssVars, ($vars) => 
	Object.entries($vars).map(([k, v]) => `${k}: ${v}`).join('; ')
);
