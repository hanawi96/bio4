import type { Theme, HeaderPreset, BlockPreset } from './types';

// ============================================
// DEFAULT THEMES (Map for O(1) lookup)
// ============================================

export const THEMES_MAP: Record<string, Theme> = {
	'minimal': {
		id: 1,
		key: 'minimal',
		name: 'Minimal',
		config: {
			backgroundColor: '#ffffff',
			textColor: '#000000',
			primaryColor: '#3b82f6',
			fontFamily: 'Inter',
			borderRadius: 8,
			spacing: 16
		},
		defaultHeaderPresetId: 'no-cover',
		defaultBlockPresetId: 'rounded-solid'
	},
	'dark': {
		id: 2,
		key: 'dark',
		name: 'Dark',
		config: {
			backgroundColor: '#1a1a1a',
			textColor: '#ffffff',
			primaryColor: '#60a5fa',
			fontFamily: 'Inter',
			borderRadius: 12,
			spacing: 20
		},
		defaultHeaderPresetId: 'with-cover',
		defaultBlockPresetId: 'rounded-solid'
	},
	'gradient': {
		id: 3,
		key: 'gradient',
		name: 'Gradient',
		config: {
			backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			textColor: '#ffffff',
			primaryColor: '#ffffff',
			fontFamily: 'Poppins',
			borderRadius: 16,
			spacing: 24
		},
		defaultHeaderPresetId: 'with-cover',
		defaultBlockPresetId: 'pill-outline'
	}
};

// Array for iteration (theme selector)
export const DEFAULT_THEMES: Theme[] = Object.values(THEMES_MAP);

// ============================================
// HEADER PRESETS
// ============================================

export const HEADER_PRESETS: Record<string, HeaderPreset> = {
	'with-cover': {
		id: 'with-cover',
		name: 'With Cover',
		description: 'Header with cover image and overlapping avatar',
		hasCover: true,
		coverHeight: 'md',
		avatarSize: 'lg',
		avatarShape: 'circle',
		avatarPosition: 'overlap',
		avatarBorder: true, // Has border to stand out on cover
		avatarBorderColor: '#ffffff',
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 3,
		spacing: 'comfortable'
	},

	'no-cover': {
		id: 'no-cover',
		name: 'No Cover',
		description: 'Simple header without cover image',
		hasCover: false,
		avatarSize: 'lg',
		avatarShape: 'circle',
		avatarPosition: 'center',
		avatarBorder: false, // No border for clean look
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 3,
		spacing: 'comfortable'
	}
};

// ============================================
// BLOCK PRESETS
// ============================================

export const BLOCK_PRESETS: Record<string, BlockPreset> = {
	'rounded-solid': {
		id: 'rounded-solid',
		name: 'Rounded Solid',
		shape: 'rounded',
		fill: 'solid',
		size: 'md',
		iconPosition: 'left',
		spacing: 'comfortable',
		hoverEffect: 'lift'
	},

	'pill-outline': {
		id: 'pill-outline',
		name: 'Pill Outline',
		shape: 'pill',
		fill: 'outline',
		size: 'md',
		iconPosition: 'left',
		spacing: 'comfortable',
		hoverEffect: 'scale'
	},

	'square-gradient': {
		id: 'square-gradient',
		name: 'Square Gradient',
		shape: 'square',
		fill: 'gradient',
		size: 'lg',
		iconPosition: 'right',
		spacing: 'spacious',
		hoverEffect: 'glow'
	},

	ghost: {
		id: 'ghost',
		name: 'Ghost',
		shape: 'rounded',
		fill: 'ghost',
		size: 'sm',
		iconPosition: 'none',
		spacing: 'compact',
		hoverEffect: 'none'
	},

	bold: {
		id: 'bold',
		name: 'Bold',
		shape: 'pill',
		fill: 'solid',
		size: 'lg',
		iconPosition: 'left',
		spacing: 'spacious',
		hoverEffect: 'scale'
	}
};
