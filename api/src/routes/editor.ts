import { Hono } from 'hono';
import type { Bindings } from '../types';
import { 
	getPageByUsername, 
	updatePage, 
	saveDraft,
	publishDraft,
	getGroupsByPageId,
	getLinksByGroupId,
	getBlocksByPageId,
	getThemePresetByKey
} from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /editor/:username - Get full editor data
app.get('/:username', async (c) => {
	const username = c.req.param('username');
	const page = await getPageByUsername(c.env.DB, username);

	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	// Get all related data
	const [groupsResult, blocksResult, theme] = await Promise.all([
		getGroupsByPageId(c.env.DB, page.id),
		getBlocksByPageId(c.env.DB, page.id),
		getThemePresetByKey(c.env.DB, page.theme_preset_key)
	]);

	// Get links for each group
	const groups = await Promise.all(
		(groupsResult.results || []).map(async (group) => {
			const linksResult = await getLinksByGroupId(c.env.DB, group.id);
			return {
				...group,
				links: linksResult.results || []
			};
		})
	);

	return c.json({
		page,
		groups,
		blocks: blocksResult.results || [],
		theme: theme ? JSON.parse(theme.config) : null
	});
});

// PUT /editor/:username - Update page settings
app.put('/:username', async (c) => {
	const username = c.req.param('username');
	const body = await c.req.json();

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	await updatePage(c.env.DB, page.id, {
		title: body.title,
		bio: body.bio,
		avatar_url: body.avatar_url,
		theme_preset_key: body.theme_preset_key,
		theme_mode: body.theme_mode,
		settings: body.settings ? JSON.stringify(body.settings) : undefined,
		status: body.status
	});

	return c.json({ success: true });
});

// PUT /editor/:username/draft - Save draft (autosave)
app.put('/:username/draft', async (c) => {
	const username = c.req.param('username');
	const body = await c.req.json();

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	await saveDraft(c.env.DB, page.id, body);

	return c.json({ success: true });
});

// POST /editor/:username/publish - Publish draft
app.post('/:username/publish', async (c) => {
	const username = c.req.param('username');

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	await publishDraft(c.env.DB, page.id);

	// TODO: Invalidate cache if using Cloudflare Cache API
	// await c.env.CACHE?.delete(`bio:${username}`);

	return c.json({ success: true });
});

export default app;
