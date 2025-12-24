// ============================================
// APPEARANCE ARCHITECTURE TYPES
// ============================================

// ============================================
// THEME V2 (10/10 System)
// ============================================

export interface ThemeMetaContract {
	controls: Array<{
		keyPath: string;
		type: 'select' | 'slider' | 'color' | 'toggle' | 'number';
		label: string;
		options?: string[];
		min?: number;
		max?: number;
		step?: number;
		affects?: string[];
	}>;
	constraints?: Record<string, { min?: number; max?: number; enum?: string[] }>;
	notes?: string[];
}

export interface ThemeMeta {
	id: string;
	name: string;
	version: string;
	schemaVersion: number;
	author: string;
	description: string;
	supports: {
		modes?: string[];
		animation?: boolean;
		glass?: boolean;
	};
	tier?: 'free' | 'pro';
	visibility?: 'public' | 'unlisted' | 'private';
	preview?: {
		thumbnailUrl?: string;
		demoUrl?: string;
	};
	contract: ThemeMetaContract;
}

export interface ThemeTokensV2 {
	color: Record<string, any>;
	typography: Record<string, any>;
	space: Record<string, number>;
	radius: Record<string, number>;
	elevation: Record<string, string>;
	motion?: Record<string, any>;
	zIndex?: Record<string, number>;
	breakpoint?: Record<string, string>;
}

export interface ThemeSemantic {
	color: {
		primary: string;
		secondary?: string;
		accent?: string;
		text: {
			default: string;
			muted: string;
			invert: string;
		};
		border: {
			default: string;
		};
		divider?: string;
		surface: {
			page: string;
			card: string;
			overlay?: string;
		};
		danger?: string;
		success?: string;
		warning?: string;
	};
	typography: {
		heading: Record<string, any>;
		body: Record<string, any>;
		caption: Record<string, any>;
		button?: Record<string, any>;
	};
}

export interface ThemeRecipes {
	header: {
		base: {
			hasCover: boolean;
			coverHeight?: 'sm' | 'md' | 'lg';
			avatarSize: 'sm' | 'md' | 'lg' | 'xl';
			avatarShape: 'circle' | 'rounded' | 'square';
			avatarPosition: 'center' | 'overlap';
			contentAlign: 'center' | 'left';
			showBio: boolean;
			bioMaxLines: number;
			spacing: 'compact' | 'comfortable' | 'spacious';
		};
	};
	linkItem: {
		base: {
			shape: 'rounded' | 'pill' | 'square';
			fill: 'solid' | 'outline' | 'ghost' | 'gradient';
			size: 'sm' | 'md' | 'lg';
			radius: string;
			padding: string;
			shadow: string;
			iconPosition?: 'left' | 'right' | 'none';
			hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
		};
	};
	linkGroup: {
		base: {
			gap: string;
		};
		variants: {
			layout: {
				list: { columns: number };
				cards: { columns: number; cardStyle?: string };
				grid: { columns: number };
			};
		};
	};
}

export interface ThemePageLayout {
	maxWidth: number;
	pagePadding: number;
	blockGap: number;
	textAlign: 'left' | 'center' | 'right';
	baseFontSize: 'S' | 'M' | 'L' | 'XL';
	contentAlign?: 'left' | 'center' | 'right';
}

export interface ThemePageDefaults {
	linkGroup: {
		textAlign: 'left' | 'center' | 'right';
		fontSize: 'S' | 'M' | 'L' | 'XL';
		radius: string;
		padding?: string;
		shadow?: string;
		spacing?: 'compact' | 'comfortable' | 'spacious';
	};
	textBlock?: Record<string, any>;
	imageBlock?: Record<string, any>;
	productBlock?: Record<string, any>;
}

export interface ThemePage {
	layout: ThemePageLayout;
	defaults: ThemePageDefaults;
	mode?: 'light' | 'dark' | 'compact';
}

export interface ThemeBackground {
	wallpaper: {
		kind: 'preset' | 'upload';
		assetId: number | string;
		url?: string;
	};
	effects: {
		blur: number;
		dim: number;
		overlayColor: string;
	};
}

export interface ThemeConfigV2 {
	meta: ThemeMeta;
	tokens: ThemeTokensV2;
	semantic: ThemeSemantic;
	recipes: ThemeRecipes;
	page: ThemePage;
	background: ThemeBackground;
	modes?: Record<string, any>;
}

// ============================================
// THEME V1 (Legacy - for backward compatibility)
// ============================================

export interface ThemeConfig {
	backgroundColor: string;
	textColor: string;
	primaryColor: string;
	fontFamily: string;
	borderRadius: number;
	spacing: number;
}

export interface Theme {
	id: number;
	key: string;
	name: string;
	config: ThemeConfig;
	config_v2?: ThemeConfigV2; // New field
	defaultHeaderPresetId?: string;
	defaultBlockPresetId?: string;
	created_at?: string;
}

// Design Tokens - Expanded from ThemeConfig (Legacy V1)
export interface ThemeTokens extends ThemeConfig {
	// Additional computed tokens
	secondary: string;
	surface: string;
	textSecondary: string;
	border: string;
	shadowLevel: 'none' | 'sm' | 'md' | 'lg';
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
