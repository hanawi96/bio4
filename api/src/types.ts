/// <reference types="@cloudflare/workers-types" />

// Cloudflare bindings
export type Bindings = {
	DB: D1Database;
	STORAGE: R2Bucket;
	R2_PUBLIC_URL: string;
};

// Database types
export interface User {
	id: number;
	email: string;
	password_hash: string;
	display_name: string | null;
	avatar_url: string | null;
	is_active: number;
	created_at: string;
	updated_at: string;
}

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

export interface ThemePreset {
	id: number;
	key: string;
	name: string;
	config: string;
	created_at: string;
}

export interface LinkGroup {
	id: number;
	page_id: number;
	title: string | null;
	layout_type: 'list' | 'cards' | 'grid';
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface Link {
	id: number;
	group_id: number;
	title: string;
	url: string;
	icon_url: string | null;
	sort_order: number;
	is_active: number;
	created_at: string;
	updated_at: string;
}

export interface Block {
	id: number;
	page_id: number;
	type: string;
	content: string;
	sort_order: number;
	is_visible: number;
	created_at: string;
	updated_at: string;
}

export interface Asset {
	id: number;
	user_id: number;
	type: string;
	storage_key: string;
	url: string;
	mime_type: string | null;
	size_bytes: number | null;
	created_at: string;
}
