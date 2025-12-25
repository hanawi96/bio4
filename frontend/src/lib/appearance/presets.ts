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
				fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
			},
			defaults: {
				headerPreset: 'no-cover',
				blockPreset: 'rounded',
				blockStylePreset: 'solid'
			},
			page: {
				mode: 'light',
				layout: {
					maxWidth: 480,
					pagePadding: 16,
					blockGap: 16,
					textAlign: 'center'
				}
			},
			modes: {
				dark: {
					tokens: {
						bg: { type: 'color', value: '#0a0a0a' },
						text: '#ffffff',
						surface: '#171717',
						border: '#404040',
						blockBase: '#60a5fa'
					}
				}
			}
		},
		defaultHeaderPresetId: 'no-cover',
		defaultBlockPresetId: 'rounded-solid'
	},
	'dark': {
		id: 2,
		key: 'dark',
		name: 'Dark',
		config: {
			meta: {
				id: 'preset.dark',
				name: 'Dark',
				schemaVersion: 1,
				version: '1.0.0'
			},
			tokens: {
				bg: { type: 'color', value: '#000000' },
				text: '#ffffff',
				primary: '#60a5fa',
				surface: '#171717',
				border: '#404040',
				blockBase: '#60a5fa',
				fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
			},
			defaults: {
				headerPreset: 'with-cover',
				blockPreset: 'rounded',
				blockStylePreset: 'solid'
			},
			page: {
				mode: 'dark',
				layout: {
					maxWidth: 480,
					pagePadding: 20,
					blockGap: 20,
					textAlign: 'center'
				}
			},
			modes: {
				light: {
					tokens: {
						bg: { type: 'color', value: '#ffffff' },
						text: '#000000',
						surface: '#fafafa',
						border: '#e5e5e5',
						blockBase: '#3b82f6'
					}
				}
			}
		},
		defaultHeaderPresetId: 'with-cover',
		defaultBlockPresetId: 'rounded-solid'
	},
	'gradient': {
		id: 3,
		key: 'gradient',
		name: 'Gradient',
		config: {
			meta: {
				id: 'preset.gradient',
				name: 'Gradient',
				schemaVersion: 1,
				version: '1.0.0'
			},
			tokens: {
				bg: { type: 'gradient', value: { from: '#667eea', to: '#764ba2', angle: 135 } },
				text: '#ffffff',
				primary: '#ffffff',
				surface: 'rgba(255,255,255,0.1)',
				border: 'rgba(255,255,255,0.2)',
				blockBase: '#ffffff',
				fontFamily: 'Poppins, system-ui, -apple-system, sans-serif'
			},
			defaults: {
				headerPreset: 'with-cover',
				blockPreset: 'rounded',
				blockStylePreset: 'solid'
			},
			page: {
				mode: 'light',
				layout: {
					maxWidth: 480,
					pagePadding: 24,
					blockGap: 24,
					textAlign: 'center'
				}
			},
			modes: {
				dark: {
					tokens: {
						bg: { type: 'gradient', value: { from: '#4a5568', to: '#2d3748', angle: 135 } },
						text: '#e2e8f0',
						surface: 'rgba(255,255,255,0.05)',
						border: 'rgba(255,255,255,0.1)',
						blockBase: '#cbd5e0'
					}
				}
			}
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
		coverType: 'image', // Default cover type
		coverValue: '/presets/images/cover-demo.jpg', // Default demo image
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
	},

	'centered-large': {
		id: 'centered-large',
		name: 'Centered Large',
		description: 'Large oval avatar with spacious layout',
		hasCover: false,
		avatarSize: 'xl',
		avatarShape: 'oval',
		avatarPosition: 'center',
		avatarBorder: false,
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 3,
		spacing: 'spacious'
	},

	'avatar-cover': {
		id: 'avatar-cover',
		name: 'Avatar Cover',
		description: 'Full-screen avatar with text overlay',
		hasCover: true, // Use cover system but source from avatar
		coverHeight: 'lg',
		coverType: 'image', // Default cover type
		coverValue: '/presets/images/cover-demo.jpg', // Default demo image
		avatarSize: 'sm', // Hidden, not displayed
		avatarShape: 'circle',
		avatarPosition: 'center',
		avatarBorder: false,
		contentAlign: 'center',
		showBio: true,
		bioMaxLines: 2,
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
