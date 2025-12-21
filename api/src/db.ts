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

export async function updatePage(
	db: D1Database,
	pageId: number,
	data: Partial<BioPage>
) {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.title !== undefined) {
		fields.push('title = ?');
		values.push(data.title);
	}
	if (data.bio !== undefined) {
		fields.push('bio = ?');
		values.push(data.bio);
	}
	if (data.avatar_url !== undefined) {
		fields.push('avatar_url = ?');
		values.push(data.avatar_url);
	}
	if (data.theme_preset_key !== undefined) {
		fields.push('theme_preset_key = ?');
		values.push(data.theme_preset_key);
	}
	if (data.theme_mode !== undefined) {
		fields.push('theme_mode = ?');
		values.push(data.theme_mode);
	}
	if (data.settings !== undefined) {
		fields.push('settings = ?');
		values.push(data.settings);
	}
	if (data.status !== undefined) {
		fields.push('status = ?');
		values.push(data.status);
	}

	fields.push('updated_at = CURRENT_TIMESTAMP');
	values.push(pageId);

	await db
		.prepare(`UPDATE bio_pages SET ${fields.join(', ')} WHERE id = ?`)
		.bind(...values)
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

// ============ FULL PAGE DATA (for public bio) ============

export async function getFullPageData(db: D1Database, username: string) {
	const page = await getPageByUsername(db, username);
	if (!page) return null;

	const [groupsResult, blocksResult, theme] = await Promise.all([
		getGroupsByPageId(db, page.id),
		getBlocksByPageId(db, page.id),
		getThemePresetByKey(db, page.theme_preset_key)
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

	return {
		page,
		groups,
		blocks: blocksResult.results || [],
		theme: theme ? JSON.parse(theme.config) : null
	};
}
