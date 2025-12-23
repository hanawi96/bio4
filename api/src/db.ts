/// <reference types="@cloudflare/workers-types" />
import type { BioPage, LinkGroup, Link, Block, ThemePreset } from './types';

// ============ BIO PAGE ============

export async function getPageByUsername(db: D1Database, username: string) {
	return db
		.prepare('SELECT * FROM bio_pages WHERE username = ?')
		.bind(username)
		.first<BioPage>();
}

export async function getPageById(db: D1Database, pageId: number) {
	return db
		.prepare('SELECT * FROM bio_pages WHERE id = ?')
		.bind(pageId)
		.first<BioPage>();
}

// Save draft (autosave) - Schema V2
export async function saveDraft(
	db: D1Database,
	pageId: number,
	draftData: { profile?: any; appearance?: any }
) {
	const fields: string[] = [];
	const values: any[] = [];

	if (draftData.profile !== undefined) {
		// Get current draft_profile to merge
		const currentPage = await db
			.prepare('SELECT draft_profile FROM bio_pages WHERE id = ?')
			.bind(pageId)
			.first<{ draft_profile: string }>();

		let currentProfile: any = {};
		if (currentPage?.draft_profile) {
			try {
				currentProfile = JSON.parse(currentPage.draft_profile);
			} catch (e) {
				console.error('Failed to parse draft_profile:', e);
			}
		}

		// Filter out undefined values from new data
		const cleanedProfile: any = {};
		Object.entries(draftData.profile).forEach(([key, value]) => {
			if (value !== undefined) {
				cleanedProfile[key] = value;
			}
		});

		// Merge new data with existing data (only defined values)
		const mergedProfile = {
			...currentProfile,
			...cleanedProfile
		};

		fields.push('draft_profile = ?');
		values.push(JSON.stringify(mergedProfile));
	}

	if (draftData.appearance !== undefined) {
		// Get current draft_appearance to merge
		const currentPage = await db
			.prepare('SELECT draft_appearance FROM bio_pages WHERE id = ?')
			.bind(pageId)
			.first<{ draft_appearance: string }>();

		let currentAppearance: any = {};
		if (currentPage?.draft_appearance) {
			try {
				currentAppearance = JSON.parse(currentPage.draft_appearance);
			} catch (e) {
				console.error('Failed to parse draft_appearance:', e);
			}
		}

		// Filter out undefined values from new data
		const cleanedAppearance: any = {};
		Object.entries(draftData.appearance).forEach(([key, value]) => {
			if (value !== undefined) {
				cleanedAppearance[key] = value;
			}
		});

		// Merge new data with existing data (only defined values)
		const mergedAppearance = {
			...currentAppearance,
			...cleanedAppearance
		};

		fields.push('draft_appearance = ?');
		values.push(JSON.stringify(mergedAppearance));
	}

	if (fields.length === 0) return;

	fields.push('updated_at = CURRENT_TIMESTAMP');
	values.push(pageId);

	await db
		.prepare(`UPDATE bio_pages SET ${fields.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

// Publish: copy draft to published - Schema V2
export async function publishDraft(db: D1Database, pageId: number) {
	await db
		.prepare(`
			UPDATE bio_pages 
			SET published_profile = draft_profile,
				published_appearance = draft_appearance,
				published_at = CURRENT_TIMESTAMP,
				updated_at = CURRENT_TIMESTAMP 
			WHERE id = ?
		`)
		.bind(pageId)
		.run();
}


// ============ LINK GROUPS ============

export async function getGroupsByPageId(db: D1Database, pageId: number) {
	return db
		.prepare('SELECT * FROM link_groups WHERE page_id = ? ORDER BY sort_order')
		.bind(pageId)
		.all<LinkGroup>();
}

export async function createGroup(
	db: D1Database,
	pageId: number,
	data: { title?: string; layout_type?: string; sort_order?: number }
) {
	const result = await db
		.prepare(
			'INSERT INTO link_groups (page_id, title, layout_type, sort_order) VALUES (?, ?, ?, ?)'
		)
		.bind(pageId, data.title || null, data.layout_type || 'list', data.sort_order || 0)
		.run();

	return result.meta.last_row_id;
}

export async function updateGroup(
	db: D1Database,
	groupId: number,
	data: { title?: string; layout_type?: string; sort_order?: number }
) {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.title !== undefined) {
		fields.push('title = ?');
		values.push(data.title);
	}
	if (data.layout_type !== undefined) {
		fields.push('layout_type = ?');
		values.push(data.layout_type);
	}
	if (data.sort_order !== undefined) {
		fields.push('sort_order = ?');
		values.push(data.sort_order);
	}

	if (fields.length === 0) return;

	fields.push('updated_at = CURRENT_TIMESTAMP');
	values.push(groupId);

	await db
		.prepare(`UPDATE link_groups SET ${fields.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteGroup(db: D1Database, groupId: number) {
	await db.prepare('DELETE FROM link_groups WHERE id = ?').bind(groupId).run();
}

// ============ LINKS ============

export async function getLinksByGroupId(db: D1Database, groupId: number) {
	return db
		.prepare('SELECT * FROM links WHERE group_id = ? ORDER BY sort_order')
		.bind(groupId)
		.all<Link>();
}

export async function createLink(
	db: D1Database,
	groupId: number,
	data: { title: string; url: string; icon_url?: string; sort_order?: number }
) {
	const result = await db
		.prepare(
			'INSERT INTO links (group_id, title, url, icon_url, sort_order) VALUES (?, ?, ?, ?, ?)'
		)
		.bind(groupId, data.title, data.url, data.icon_url || null, data.sort_order || 0)
		.run();

	return result.meta.last_row_id;
}

export async function updateLink(
	db: D1Database,
	linkId: number,
	data: { title?: string; url?: string; icon_url?: string; sort_order?: number; is_active?: number }
) {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.title !== undefined) {
		fields.push('title = ?');
		values.push(data.title);
	}
	if (data.url !== undefined) {
		fields.push('url = ?');
		values.push(data.url);
	}
	if (data.icon_url !== undefined) {
		fields.push('icon_url = ?');
		values.push(data.icon_url);
	}
	if (data.sort_order !== undefined) {
		fields.push('sort_order = ?');
		values.push(data.sort_order);
	}
	if (data.is_active !== undefined) {
		fields.push('is_active = ?');
		values.push(data.is_active);
	}

	if (fields.length === 0) return;

	fields.push('updated_at = CURRENT_TIMESTAMP');
	values.push(linkId);

	await db
		.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteLink(db: D1Database, linkId: number) {
	await db.prepare('DELETE FROM links WHERE id = ?').bind(linkId).run();
}


// ============ BLOCKS ============

export async function getBlocksByPageId(db: D1Database, pageId: number) {
	return db
		.prepare('SELECT * FROM blocks WHERE page_id = ? ORDER BY sort_order')
		.bind(pageId)
		.all<Block>();
}

export async function createBlock(
	db: D1Database,
	pageId: number,
	data: { type: string; content?: string; sort_order?: number }
) {
	const result = await db
		.prepare(
			'INSERT INTO blocks (page_id, type, content, sort_order) VALUES (?, ?, ?, ?)'
		)
		.bind(pageId, data.type, data.content || '{}', data.sort_order || 0)
		.run();

	return result.meta.last_row_id;
}

export async function updateBlock(
	db: D1Database,
	blockId: number,
	data: { type?: string; content?: string; sort_order?: number; is_visible?: number }
) {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.type !== undefined) {
		fields.push('type = ?');
		values.push(data.type);
	}
	if (data.content !== undefined) {
		fields.push('content = ?');
		values.push(data.content);
	}
	if (data.sort_order !== undefined) {
		fields.push('sort_order = ?');
		values.push(data.sort_order);
	}
	if (data.is_visible !== undefined) {
		fields.push('is_visible = ?');
		values.push(data.is_visible);
	}

	if (fields.length === 0) return;

	fields.push('updated_at = CURRENT_TIMESTAMP');
	values.push(blockId);

	await db
		.prepare(`UPDATE blocks SET ${fields.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteBlock(db: D1Database, blockId: number) {
	await db.prepare('DELETE FROM blocks WHERE id = ?').bind(blockId).run();
}

// ============ THEME PRESETS ============

export async function getThemePresets(db: D1Database) {
	return db.prepare('SELECT * FROM theme_presets').all<ThemePreset>();
}

export async function getThemePresetByKey(db: D1Database, key: string) {
	return db
		.prepare('SELECT * FROM theme_presets WHERE key = ?')
		.bind(key)
		.first<ThemePreset>();
}

// ============ ASSETS ============

export async function createAsset(
	db: D1Database,
	userId: number,
	data: { storage_key: string; url: string; mime_type?: string; size_bytes?: number }
) {
	const result = await db
		.prepare(
			'INSERT INTO assets (user_id, storage_key, url, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)'
		)
		.bind(userId, data.storage_key, data.url, data.mime_type || null, data.size_bytes || null)
		.run();

	return result.meta.last_row_id;
}

export async function deleteAsset(db: D1Database, assetId: number) {
	await db.prepare('DELETE FROM assets WHERE id = ?').bind(assetId).run();
}

// ============ FULL PAGE DATA (for editor & public) ============

export async function getFullPageData(db: D1Database, username: string, useDraft = false) {
	const page = await getPageByUsername(db, username);
	if (!page) return null;

	// Parse profile data
	const profileData = useDraft
		? (page.draft_profile ? JSON.parse(page.draft_profile) : {})
		: (page.published_profile ? JSON.parse(page.published_profile) : {});

	// Parse appearance data
	const appearanceData = useDraft
		? (page.draft_appearance ? JSON.parse(page.draft_appearance) : {})
		: (page.published_appearance ? JSON.parse(page.published_appearance) : {});

	// Get theme: custom theme from appearance or preset
	let theme = null;
	if (appearanceData.customTheme) {
		// User has customized theme
		theme = appearanceData.customTheme;
	} else if (appearanceData.themePresetKey) {
		// Load from preset
		const preset = await getThemePresetByKey(db, appearanceData.themePresetKey);
		theme = preset ? JSON.parse(preset.config) : null;
	}

	// Get groups, blocks
	const [groupsResult, blocksResult] = await Promise.all([
		getGroupsByPageId(db, page.id),
		getBlocksByPageId(db, page.id)
	]);

	// Get links for each group
	const groups = await Promise.all(
		(groupsResult.results || []).map(async (group: LinkGroup) => {
			const linksResult = await getLinksByGroupId(db, group.id);
			return {
				...group,
				links: linksResult.results || []
			};
		})
	);

	// Merge profile data into page object
	const pageWithProfile = {
		...page,
		title: profileData.title ?? null,
		bio: profileData.bio ?? null,
		avatar_url: profileData.avatar_url ?? null,
		social_links: profileData.social_links ?? null,
		show_social_icons: profileData.show_social_icons ?? true, // Default true
		draft_appearance: page.draft_appearance, // Include raw JSON for frontend
		published_appearance: page.published_appearance
	};

	return {
		page: pageWithProfile,
		groups,
		blocks: blocksResult.results || [],
		theme
	};
}
