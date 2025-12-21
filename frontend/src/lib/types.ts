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
	created_at: string;
	updated_at: string;
}

export interface LinkGroup {
	id: number;
	page_id: number;
	title: string | null;
	layout_type: 'list' | 'cards' | 'grid';
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
	config: ThemeConfig;
}

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
