import { Hono } from 'hono';
import type { Bindings } from '../types';
import {
	getPageByUsername,
	getGroupsByPageId,
	getLinksByGroupId,
	createGroup,
	updateGroup,
	deleteGroup,
	createLink,
	updateLink,
	deleteLink
} from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// Helper function to delete link icon from R2
async function deleteLinkIconFromR2(storage: R2Bucket, iconUrl: string | null): Promise<void> {
	if (!iconUrl || !iconUrl.includes('/link-icons/')) return;
	
	try {
		const urlParts = iconUrl.split('/');
		const storageKey = urlParts.slice(urlParts.indexOf('link-icons')).join('/');
		await storage.delete(storageKey);
	} catch (e) {
		console.error('Failed to delete link icon from R2:', e);
	}
}

// ============ GROUPS ============

// GET /links/groups/:username - Get all groups with links
app.get('/groups/:username', async (c) => {
	const username = c.req.param('username');
	const page = await getPageByUsername(c.env.DB, username);

	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	const groupsResult = await getGroupsByPageId(c.env.DB, page.id);
	const groups = await Promise.all(
		(groupsResult.results || []).map(async (group) => {
			const linksResult = await getLinksByGroupId(c.env.DB, group.id);
			return { ...group, links: linksResult.results || [] };
		})
	);

	return c.json({ groups });
});

// POST /links/groups/:username - Create new group
app.post('/groups/:username', async (c) => {
	const username = c.req.param('username');
	const body = await c.req.json();

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	const groupId = await createGroup(c.env.DB, page.id, {
		title: body.title,
		layout_type: body.layout_type,
		sort_order: body.sort_order
	});

	return c.json({ id: groupId }, 201);
});

// PUT /links/groups/:groupId - Update group
app.put('/groups/:groupId', async (c) => {
	const groupId = parseInt(c.req.param('groupId'));
	const body = await c.req.json();

	await updateGroup(c.env.DB, groupId, {
		title: body.title,
		layout_type: body.layout_type,
		sort_order: body.sort_order
	});

	return c.json({ success: true });
});

// DELETE /links/groups/:groupId - Delete group
app.delete('/groups/:groupId', async (c) => {
	const groupId = parseInt(c.req.param('groupId'));
	
	// Get all links in this group to delete their icons
	const links = await c.env.DB.prepare(
		'SELECT icon_url FROM links WHERE group_id = ?'
	).bind(groupId).all() as { results: { icon_url: string | null }[] };
	
	// Delete all link icons from R2
	if (links.results) {
		await Promise.all(
			links.results.map(link => deleteLinkIconFromR2(c.env.STORAGE, link.icon_url))
		);
	}
	
	// Delete group (will cascade delete links)
	await deleteGroup(c.env.DB, groupId);
	return c.json({ success: true });
});


// ============ LINKS ============

// POST /links/:groupId - Create new link
app.post('/:groupId', async (c) => {
	const groupId = parseInt(c.req.param('groupId'));
	const body = await c.req.json();

	if (!body.title || !body.url) {
		return c.json({ error: 'Title and URL are required' }, 400);
	}

	const linkId = await createLink(c.env.DB, groupId, {
		title: body.title,
		url: body.url,
		icon_url: body.icon_url,
		sort_order: body.sort_order
	});

	return c.json({ id: linkId }, 201);
});

// PUT /links/:linkId - Update link
app.put('/:linkId', async (c) => {
	const linkId = parseInt(c.req.param('linkId'));
	const body = await c.req.json();

	// Get old link to check if icon changed
	const oldLink = await c.env.DB.prepare(
		'SELECT icon_url FROM links WHERE id = ?'
	).bind(linkId).first() as { icon_url: string | null } | null;

	// Delete old icon if changed
	if (oldLink?.icon_url && body.icon_url !== oldLink.icon_url) {
		await deleteLinkIconFromR2(c.env.STORAGE, oldLink.icon_url);
	}

	await updateLink(c.env.DB, linkId, {
		title: body.title,
		url: body.url,
		icon_url: body.icon_url,
		sort_order: body.sort_order,
		is_active: body.is_active
	});

	return c.json({ success: true });
});

// DELETE /links/:linkId - Delete link
app.delete('/:linkId', async (c) => {
	const linkId = parseInt(c.req.param('linkId'));
	
	// Get link to check if it has icon_url
	const link = await c.env.DB.prepare(
		'SELECT icon_url FROM links WHERE id = ?'
	).bind(linkId).first() as { icon_url: string | null } | null;
	
	// Delete icon from R2 if exists
	await deleteLinkIconFromR2(c.env.STORAGE, link?.icon_url || null);
	
	// Delete link from database
	await deleteLink(c.env.DB, linkId);
	return c.json({ success: true });
});

export default app;
