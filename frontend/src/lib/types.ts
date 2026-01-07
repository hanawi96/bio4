// API Response Types (matching backend)

export interface BioPage {
	id: number;
	user_id: number;
	username: string;
	title: string | null;
	bio: string | null;
	avatar_url: string | null;
	status: 'draft' | 'published';
	theme_preset_key: string;
	theme_mode: 'light' | 'dark' | 'compact';
	settings: string;
	draft_appearance: string; // JSON string
	published_appearance: string; // JSON string
	theme?: string; // JSON string (for backward compatibility)
	social_links?: {
		twitter?: string;
		instagram?: string;
		facebook?: string;
		linkedin?: string;
		youtube?: string;
		tiktok?: string;
	};
	show_social_icons?: boolean;
	created_at: string;
	updated_at: string;
}

export interface LinkGroup {
	id: number;
	page_id: number;
	title: string | null;
	layout_type: 'list' | 'carousel' | 'grid' | 'cards';
	layout_config: string | null;
	sort_order: number;
	is_visible?: number;
	links: Link[];
}

export interface Link {
	id: number;
	group_id: number;
	title: string;
	url: string;
	icon_url: string | null; // deprecated
	icon_type: 'none' | 'image' | 'iconify';
	icon_data: string | null;
	sort_order: number;
	is_active: number;
	open_in_new_tab?: number; // 0 = same tab, 1 = new tab
}

export interface Block {
	id: number;
	page_id: number;
	type: string;
	content: string;
	sort_order: number;
	is_visible: number;
}

export interface ThemePreset {
	id: number;
	key: string;
	name: string;
	config: ThemeConfig;
}

export interface ThemeConfig {
	meta: ThemeMeta;
	tokens: ThemeTokens;
	semantic?: ThemeSemantic;
	recipes?: ThemeRecipes;
	page: ThemePage;
	background?: ThemeBackground;
}

export interface ThemeMeta {
	id: string;
	name: string;
	schemaVersion: number;
	version: string;
	author?: string;
	description?: string;
	tier?: 'free' | 'pro';
	category?: string;
}

export interface ThemeTokens {
	color?: {
		[key: string]: any;
	};
	typography?: {
		fontFamily?: any;
		fontSize?: any;
		fontWeight?: any;
		lineHeight?: any;
	};
	space?: Record<string, number>;
	radius?: Record<string, number>;
	// Legacy support
	bg?: { type: 'color' | 'gradient'; value: string | { from: string; to: string; angle: number } };
	text?: any;
	primary?: any;
	surface?: string;
	border?: string;
	blockBase?: string;
	fontFamily?: string;
	shadowColor?: string;
}

export interface ThemeSemantic {
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
		surface?: {
			page?: string;
			card?: string;
			elevated?: string;
			overlay?: string;
		};
		border?: {
			default?: string;
			subtle?: string;
			strong?: string;
		};
	};
	typography?: {
		heading?: any;
		body?: any;
		caption?: any;
	};
}

export interface ThemeRecipes {
	linkItem?: {
		base?: any;
		hover?: any;
		variants?: any;
	};
	linkGroup?: {
		base?: any;
		variants?: any;
	};
	header?: {
		base?: any;
		variants?: any;
	};
	button?: {
		base?: any;
	};
}

// Link Group Layout Config Types
export interface GridLayoutConfig {
	columns: 1 | 2 | 3 | 4;
	aspectRatio: 'square' | 'portrait' | 'landscape';
	showLabels: boolean;
	imagePadding: boolean;
	shadowEnabled?: boolean; // undefined = follow theme, true = force ON, false = force OFF
	borderEnabled?: boolean; // undefined = follow theme, true = force ON, false = force OFF
}

export interface CardLayoutConfig {
	imagePosition: 'left' | 'right' | 'alternate';
	imageSize: 40 | 50 | 60;
	imageAspect: 'square' | 'landscape' | 'portrait';
	showSubtitle: boolean;
	imagePadding: boolean;
	shadowEnabled?: boolean;
	borderEnabled?: boolean;
}

export interface ListLayoutConfig {
	iconPosition: 'left' | 'top' | 'none';
	textAlign: 'left' | 'center' | 'right';
	showSubtitle?: boolean;
	shadowEnabled?: boolean;
	borderEnabled?: boolean;
}

export interface LinkGroupConfigDefaults {
	grid?: GridLayoutConfig;
	cards?: CardLayoutConfig;
	list?: ListLayoutConfig;
}

export interface ThemePage {
	mode: 'light' | 'dark';
	layout: {
		maxWidth: number;
		pagePadding: number;
		blockGap: number;
		textAlign: 'left' | 'center' | 'right';
	};
	defaults?: {
		// v2.2: Reference preset IDs instead of full config
		headerPresetId?: string;
		blockPresetId?: string;
		linkStyle?: string; // 'solid' | 'outline' | 'soft'
		linkGroupLayout?: string; // 'list' | 'cards' | 'grid' | 'carousel'
		linkGroupConfig?: LinkGroupConfigDefaults; // v2.3: Layout config defaults
		
		// Legacy support (v2.0-2.1)
		header?: any;
		linkGroup?: any;
		block?: any;
		textBlock?: any;
		imageBlock?: any;
	};
}

export interface ThemeBackground {
	type?: 'solid' | 'gradient' | 'image' | 'video';
	value?: string; // Color hex | Gradient CSS | Image URL | Video URL
	effects?: {
		blur?: number;
		brightness?: number;
		grayscale?: number;
		overlayColor?: string;
	};
}

// Legacy ThemeConfig (for backward compatibility)
export interface LegacyThemeConfig {
	backgroundColor: string;
	textColor: string;
	primaryColor: string;
	fontFamily: string;
	borderRadius: number;
	spacing: number;
}

// API Response types
export interface EditorData {
	page: BioPage;
	groups: LinkGroup[];
	blocks: Block[];
	theme: ThemeConfig | LegacyThemeConfig | null;
}

export interface PublicBioData extends EditorData {}
