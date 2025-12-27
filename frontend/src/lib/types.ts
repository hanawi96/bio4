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
	links: Link[];
}

export interface Link {
	id: number;
	group_id: number;
	title: string;
	url: string;
	icon_url: string | null;
	sort_order: number;
	is_active: number;
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
	config: {
		meta: {
			id: string;
			name: string;
			schemaVersion: number;
			version: string;
		};
		tokens: {
			bg: { type: 'color' | 'gradient'; value: string | { from: string; to: string; angle: number } };
			text: string;
			primary: string;
			surface: string;
			border: string;
			blockBase: string;
			fontFamily: string;
		};
		defaults: {
			headerPreset: string;
			blockPreset: string;
			blockStylePreset: string;
		};
		page: {
			mode: 'light' | 'dark';
			layout: {
				maxWidth: number;
				pagePadding: number;
				blockGap: number;
				textAlign: 'left' | 'center' | 'right';
			};
		};
		modes?: {
			dark?: {
				tokens: any;
			};
			light?: {
				tokens: any;
			};
		};
	};
}

// Legacy ThemeConfig (for backward compatibility)
export interface ThemeConfig {
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
	theme: ThemeConfig | null;
}

export interface PublicBioData extends EditorData {}
