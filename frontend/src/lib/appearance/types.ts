// ============================================
// APPEARANCE ARCHITECTURE TYPES
// ============================================

import type { BlockStylePresetId, BlockStyleRecipe } from './blockStyles';

// ============================================
// THEME CONFIG (Current Schema)
// ============================================

export interface ThemeConfigToken {
	type: 'color' | 'gradient';
	value: string | { from: string; to: string; angle: number };
}

export interface ThemeConfigTokens {
	bg?: ThemeConfigToken;
	text?: string;
	primary?: string;
	surface?: string;
	border?: string;
	blockBase?: string;
	shadowColor?: string; // Shadow color for brutal style (optional, default: #000000)
	fontFamily?: string;
	color?: Record<string, any>; // Color tokens
	typography?: {
		fontFamily?: Record<string, string>;
		fontSize?: Record<string, number>;
	};
}

export interface ThemeConfigDefaults {
	headerPreset?: string;
	blockPreset?: string;
	blockStylePreset?: BlockStylePresetId;
	blockShadow?: string; // Optional default shadow for blocks
}

export interface ThemeConfigPageLayout {
	maxWidth: number | string; // Support both preset keys (e.g., 'sm') and numbers
	pagePadding: number | string; // Support both preset keys (e.g., 'default') and numbers
	blockGap: number | string; // Support both preset keys (e.g., 'default') and numbers
	textAlign: 'left' | 'center' | 'right';
	blockPadding?: string | { x: number; y: number };
}

export interface ThemeConfigPage {
	mode?: 'light' | 'dark';
	layout: ThemeConfigPageLayout;
	defaults?: Record<string, any>; // Theme-specific defaults (avatarBorderWidth, blockStylePreset, etc.)
}

export interface ThemeConfigSemantic {
	color?: {
		primary?: string;
		primaryHover?: string;
		secondary?: string;
		text?: {
			default?: string;
			muted?: string;
			subtle?: string;
			invert?: string;
		};
		surface?: Record<string, string>;
		border?: Record<string, string>;
		block?: {
			text?: string;
		};
		shadow?: Record<string, string>;
		icon?: Record<string, string>;
	};
	typography?: {
		heading?: {
			fontFamily?: string;
			fontSize?: string | number;
		};
		link?: {
			fontSize?: string | number;
		};
		bio?: {
			fontSize?: string | number;
		};
		subtitle?: {
			fontSize?: string | number;
		};
	};
}

export interface ThemeConfigBackground {
	type?: 'solid' | 'gradient' | 'image' | 'video';
	value?: string | { from: string; to: string; angle: number };
	effects?: {
		blur?: string | number;
		overlayColor?: string;
		brightness?: string | number;
		grayscale?: string | number;
	};
	animation?: {
		enabled?: boolean;
		variant?: string;
		speed?: string;
	};
	particles?: Record<string, any>;
}

export interface ThemeConfig {
	meta: {
		id: string;
		name: string;
		schemaVersion: number;
		version: string;
	};
	tokens: ThemeConfigTokens;
	defaults?: ThemeConfigDefaults;
	page: ThemeConfigPage;
	semantic?: ThemeConfigSemantic;
	background?: ThemeConfigBackground;
}

export interface Theme {
	id: number;
	key: string;
	name: string;
	config: ThemeConfig;
	defaultHeaderPresetId?: string;
	defaultBlockPresetId?: string;
	created_at?: string;
}

// Design Tokens - Computed from ThemeConfig
export interface ThemeTokens {
	// From config.tokens
	bg: ThemeConfigToken;
	text: string;
	primary: string;
	surface: string;
	border: string;
	blockBase: string;
	shadowColor: string;
	fontFamily: string;
	
	// Computed
	secondary: string;
	textSecondary: string;
	mutedTextColor: string;
	shadowLevel: 'none' | 'sm' | 'md' | 'lg';
	
	// For backward compatibility (computed from bg token)
	backgroundColor: string;
	textColor: string;
	primaryColor: string;
	spacing: number;
}

// Header Preset - Predefined header styles
export interface HeaderPreset {
	id: string;
	name: string;
	description: string;
	
	// Cover settings
	hasCover: boolean;
	coverHeight?: 'sm' | 'md' | 'lg' | 'xl'; // 120px, 160px, 200px, 280px
	coverType?: 'solid' | 'gradient' | 'image' | 'video'; // Default cover type
	coverValue?: string; // Default cover value (color, gradient CSS, image URL, or video URL)
	coverVideoPoster?: string; // Video thumbnail/poster image
	
	// Avatar settings
	avatarSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'; // 48px, 64px, 80px, 96px, 120px, 100%
	avatarShape: 'circle' | 'rounded' | 'square' | 'oval' | 'portrait' | 'landscape';
	avatarPosition: 'center' | 'overlap';
	avatarBorder?: boolean; // Has border or not
	avatarBorderColor?: string; // Border color (default: white)
	
	// Content layout
	contentAlign: 'center' | 'left';
	showBio: boolean;
	
	// Spacing
	spacing: 'compact' | 'comfortable' | 'spacious';
}

// Block Preset - Predefined block/link styles
export interface BlockPreset {
	id: string;
	name: string;
	shape: 'rounded' | 'pill' | 'square';
	borderRadius?: number; // Border radius in px (optional, overrides shape default)
	fill: 'solid' | 'outline' | 'ghost' | 'gradient';
	size: 'sm' | 'md' | 'lg';
	iconPosition: 'left' | 'right' | 'none';
	spacing: 'compact' | 'comfortable' | 'spacious';
	hoverEffect: 'lift' | 'scale' | 'glow' | 'none';
}

// User Overrides - Whitelist only
export interface HeaderOverrides {
	hasCover?: boolean;
	coverHeight?: 'sm' | 'md' | 'lg' | 'xl';
	coverType?: 'solid' | 'gradient' | 'image' | 'video'; // Type of cover
	coverValue?: string; // Color hex, gradient CSS, image URL, or video URL
	coverVideoPoster?: string; // Video thumbnail/poster image
	avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
	avatarShape?: 'circle' | 'rounded' | 'square' | 'oval' | 'portrait' | 'landscape';
	avatarPosition?: 'center' | 'overlap';
	avatarBorder?: boolean; // Override border visibility
	avatarBorderColor?: string; // Override border color
	contentAlign?: 'center' | 'left';
	showBio?: boolean;
	spacing?: 'compact' | 'comfortable' | 'spacious';
}

export interface BlockOverrides {
	shape?: 'rounded' | 'pill' | 'square';
	borderRadius?: number; // Override border radius in px
	fill?: 'solid' | 'outline' | 'ghost' | 'gradient';
	size?: 'sm' | 'md' | 'lg';
	spacing?: 'compact' | 'comfortable' | 'spacious';
	hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
	stylePreset?: BlockStylePresetId; // Override block style recipe
}

// Page Appearance State - What we save to DB (draft_appearance/published_appearance)
export interface PageAppearanceState {
	// Theme selection
	themeKey?: string; // Reference to theme_presets.key
	customTheme?: ThemeConfig; // For backward compatibility or custom themes
	
	// Header & Block styles
	headerStyle?: {
		presetId: string;
		overrides?: HeaderOverrides;
	};
	blockStyle?: {
		presetId: string;
		overrides?: BlockOverrides;
	};
	
	appearanceVersion?: number;
}

// Resolved Appearance - Final computed config for rendering
export interface ResolvedAppearance {
	theme: Theme;
	tokens: ThemeTokens;
	header: HeaderPreset & HeaderOverrides;
	page: {
		maxWidth: number;
		pagePadding: number;
		blockGap: number;
		textAlign: 'left' | 'center' | 'right';
		linkIconShape: 'square' | 'rounded' | 'circle';
	};
	block: {
		borderRadius: number;
		shape: string;
		padding: { x: number; y: number };
		borderWidth: number;
	};
	blockStyle: ResolvedBlockStyle; // Resolved block style with actual colors
	textColor: string; // Main text color (for headings, titles)
	mutedTextColor: string; // Muted text color (for subtitles, descriptions)
	typography: {
		headingColor: string;
		mutedColor: string;
	};
}

// Resolved Block Style - Recipe resolved with theme tokens
export interface ResolvedBlockStyle {
	recipe: BlockStyleRecipe; // Original recipe
	fill: string; // Resolved CSS color (rgba, hex, etc.)
	text: string; // Resolved text color
	border?: string; // Resolved border color
	glow?: string; // Resolved glow color
	blur?: number; // Blur amount
	shadow?: string; // Hard shadow
	opacity?: number; // Block opacity (0-100)
}
