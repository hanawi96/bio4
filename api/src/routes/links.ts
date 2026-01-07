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
async function deleteLinkIconFromR2(storage: R2Bucket, iconType: string | null, iconData: string | null): Promise<void> {
	// Only delete if it's an image type
	if (iconType !== 'image' || !iconData || !iconData.includes('/link-icons/')) return;
	
	try {
		const urlParts = iconData.split('/');
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
		layout_config: body.layout_config,
		sort_order: body.sort_order,
		is_visible: body.is_visible
	});

	return c.json({ success: true });
});

// DELETE /links/groups/:groupId - Delete group
app.delete('/groups/:groupId', async (c) => {
	const groupId = parseInt(c.req.param('groupId'));
	
	// Get all links in this group to delete their icons
	const links = await c.env.DB.prepare(
		'SELECT icon_type, icon_data FROM links WHERE group_id = ?'
	).bind(groupId).all() as { results: { icon_type: string | null; icon_data: string | null }[] };
	
	// Delete all link icons from R2 (only images)
	if (links.results) {
		await Promise.all(
			links.results.map(link => deleteLinkIconFromR2(c.env.STORAGE, link.icon_type, link.icon_data))
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
		icon_type: body.icon_type || 'none',
		icon_data: body.icon_data || null,
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
		'SELECT icon_type, icon_data FROM links WHERE id = ?'
	).bind(linkId).first() as { icon_type: string | null; icon_data: string | null } | null;

	// Delete old icon if changing from image to something else, or changing image URL
	if (body.icon_type !== undefined && oldLink) {
		const isChangingFromImage = oldLink.icon_type === 'image' && body.icon_type !== 'image';
		const isChangingImageUrl = body.icon_type === 'image' && body.icon_data !== undefined && body.icon_data !== oldLink.icon_data;
		
		if (isChangingFromImage || isChangingImageUrl) {
			await deleteLinkIconFromR2(c.env.STORAGE, oldLink.icon_type, oldLink.icon_data);
		}
	}

	await updateLink(c.env.DB, linkId, {
		title: body.title,
		url: body.url,
		icon_url: body.icon_url,
		icon_type: body.icon_type,
		icon_data: body.icon_data,
		sort_order: body.sort_order,
		is_active: body.is_active
	});

	return c.json({ success: true });
});

// DELETE /links/:linkId - Delete link
app.delete('/:linkId', async (c) => {
	const linkId = parseInt(c.req.param('linkId'));
	
	// Get link to check if it has icon
	const link = await c.env.DB.prepare(
		'SELECT icon_type, icon_data FROM links WHERE id = ?'
	).bind(linkId).first() as { icon_type: string | null; icon_data: string | null } | null;
	
	// Delete icon from R2 if it's an image
	if (link) {
		await deleteLinkIconFromR2(c.env.STORAGE, link.icon_type, link.icon_data);
	}
	
	// Delete link from database
	await deleteLink(c.env.DB, linkId);
	return c.json({ success: true });
});

export default app;
