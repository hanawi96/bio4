// ============================================
// APPEARANCE ARCHITECTURE TYPES
// ============================================

// ============================================
// THEME CONFIG (Current Schema)
// ============================================

export interface ThemeConfigToken {
	type: 'color' | 'gradient';
	value: string | { from: string; to: string; angle: number };
}

export interface ThemeConfigTokens {
	bg: ThemeConfigToken;
	text: string;
	primary: string;
	surface: string;
	border: string;
	blockBase: string;
	fontFamily: string;
}

export interface ThemeConfigDefaults {
	headerPreset: string;
	blockPreset: string;
	blockStylePreset: string;
}

export interface ThemeConfigPageLayout {
	maxWidth: number;
	pagePadding: number;
	blockGap: number;
	textAlign: 'left' | 'center' | 'right';
}

export interface ThemeConfigPage {
	mode: 'light' | 'dark';
	layout: ThemeConfigPageLayout;
}

export interface ThemeConfigModes {
	dark?: {
		tokens: Partial<ThemeConfigTokens>;
	};
	light?: {
		tokens: Partial<ThemeConfigTokens>;
	};
}

export interface ThemeConfig {
	meta: {
		id: string;
		name: string;
		schemaVersion: number;
		version: string;
	};
	tokens: ThemeConfigTokens;
	defaults: ThemeConfigDefaults;
	page: ThemeConfigPage;
	modes?: ThemeConfigModes;
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
	fontFamily: string;
	
	// Computed
	secondary: string;
	textSecondary: string;
	shadowLevel: 'none' | 'sm' | 'md' | 'lg';
	
	// For backward compatibility (computed from bg token)
	backgroundColor: string;
	textColor: string;
	primaryColor: string;
	borderRadius: number;
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
	coverType?: 'solid' | 'gradient' | 'image'; // Default cover type
	coverValue?: string; // Default cover value (color, gradient CSS, or image URL)
	
	// Avatar settings
	avatarSize: 'sm' | 'md' | 'lg' | 'xl'; // 64px, 80px, 96px, 120px
	avatarShape: 'circle' | 'rounded' | 'square' | 'oval';
	avatarPosition: 'center' | 'overlap'; // overlap = nửa trên cover, nửa dưới
	avatarBorder?: boolean; // Has border or not
	avatarBorderColor?: string; // Border color (default: white)
	
	// Content layout
	contentAlign: 'center' | 'left';
	showBio: boolean;
	bioMaxLines: number;
	
	// Spacing
	spacing: 'compact' | 'comfortable' | 'spacious';
}

// Block Preset - Predefined block/link styles
export interface BlockPreset {
	id: string;
	name: string;
	shape: 'rounded' | 'pill' | 'square';
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
	coverType?: 'solid' | 'gradient' | 'image'; // Type of cover
	coverValue?: string; // Color hex, gradient CSS, or image URL
	avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
	avatarShape?: 'circle' | 'rounded' | 'square' | 'oval';
	avatarPosition?: 'center' | 'overlap';
	avatarBorder?: boolean; // Override border visibility
	avatarBorderColor?: string; // Override border color
	contentAlign?: 'center' | 'left';
	showBio?: boolean;
	spacing?: 'compact' | 'comfortable' | 'spacious';
}

export interface BlockOverrides {
	shape?: 'rounded' | 'pill' | 'square';
	fill?: 'solid' | 'outline' | 'ghost' | 'gradient';
	size?: 'sm' | 'md' | 'lg';
	spacing?: 'compact' | 'comfortable' | 'spacious';
	hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
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
	block: BlockPreset & BlockOverrides;
}
