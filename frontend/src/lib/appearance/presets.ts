import type { Theme, HeaderPreset, BlockPreset } from './types';

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_COVER_IMAGE = '/presets/images/cover-demo.jpg';

// ============================================
// FALLBACK THEME (Used when themes store is not loaded yet)
// ============================================

export const FALLBACK_THEME: Theme = {
	id: 0,
	key: 'minimal',
	name: 'Minimal',
	config: {
		meta: {
			id: 'preset.minimal',
			name: 'Minimal',
			schemaVersion: 1,
			version: '1.0.0'
		},
		tokens: {
			bg: { type: 'color', value: '#ffffff' },
			text: '#000000',
			primary: '#3b82f6',
			surface: '#fafafa',
			border: '#e5e5e5',
			blockBase: '#3b82f6',
			shadowColor: '#000000',
			fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
		},
		defaults: {
			headerPreset: 'no-cover',
			blockPreset: 'rounded',
			blockStylePreset: 'solid',
			blockShadow: 'none'
		},
		page: {
			mode: 'light',
			layout: {
				maxWidth: 'sm' as const,
				pagePadding: 'default' as const,
				blockGap: 16,
				textAlign: 'center'
			}
		}
	},
	defaultHeaderPresetId: 'no-cover',
	defaultBlockPresetId: 'rounded-solid'
};

// ============================================
// HEADER PRESETS
// ============================================

export const HEADER_PRESETS: Record<string, HeaderPreset> = {
	'no-cover': {
		id: 'no-cover',
		name: 'No Cover',
		description: 'Simple header without cover image',
		hasCover: false,
		avatarSize: 'lg',
		avatarShape: 'circle',
		avatarPosition: 'center',
		avatarBorder: false,
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 3,
		spacing: 'comfortable'
	},

	'with-cover': {
		id: 'with-cover',
		name: 'With Cover',
		description: 'Header with cover image and overlapping avatar',
		hasCover: true,
		coverHeight: 'md',
		coverType: 'image',
		coverValue: '/presets/images/cover-demo.jpg',
		avatarSize: 'lg',
		avatarShape: 'circle',
		avatarPosition: 'overlap',
		avatarBorder: true,
		avatarBorderColor: '#ffffff',
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 3,
		spacing: 'comfortable'
	},

	'avatar-cover': {
		id: 'avatar-cover',
		name: 'Avatar Cover',
		description: 'Full-screen avatar with text overlay',
		hasCover: true,
		coverHeight: 'lg',
		coverType: 'image',
		coverValue: '/presets/images/cover-demo.jpg',
		avatarSize: 'sm',
		avatarShape: 'circle',
		avatarPosition: 'center',
		avatarBorder: false,
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 2,
		spacing: 'comfortable'
	},

	inline: {
		id: 'inline',
		name: 'Inline',
		description: 'Avatar and text side by side',
		hasCover: false,
		avatarSize: 'sm',
		avatarShape: 'circle',
		avatarPosition: 'inline-left',
		avatarBorder: false,
		contentAlign: 'left',
		showBio: true,
		bioMaxLines: 2,
		spacing: 'compact'
	},

	split: {
		id: 'split',
		name: 'Split',
		description: 'Avatar on left, content on right',
		hasCover: false,
		avatarSize: 'md',
		avatarShape: 'rounded',
		avatarPosition: 'split-left',
		avatarBorder: false,
		contentAlign: 'left',
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
		borderRadius: 12,
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
		borderRadius: 9999,
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
		borderRadius: 0,
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
		borderRadius: 8,
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
		borderRadius: 9999,
		fill: 'solid',
		size: 'lg',
		iconPosition: 'left',
		spacing: 'spacious',
		hoverEffect: 'scale'
	}
};
