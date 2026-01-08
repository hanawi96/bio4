// API endpoint
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Get base domain (without protocol)
export const getBaseDomain = () => {
	if (typeof window === 'undefined') return 'localhost:5173';
	return window.location.host;
};

// Get full bio URL
export const getBioUrl = (username: string) => {
	if (typeof window === 'undefined') return `http://localhost:5173/${username}`;
	return `${window.location.protocol}//${window.location.host}/${username}`;
};

// Image limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Layout types
export const LAYOUT_TYPES = ['list', 'cards', 'grid'] as const;

// Theme modes
export const THEME_MODES = ['light', 'dark', 'compact'] as const;

// Block types
export const BLOCK_TYPES = {
	TEXT: 'text',
	IMAGE: 'image',
	SPACER: 'spacer',
	SOCIAL: 'social',
	EMBED: 'embed'
} as const;

// Page status
export const PAGE_STATUS = ['draft', 'published'] as const;
