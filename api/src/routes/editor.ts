import { Hono } from 'hono';
import type { Bindings } from '../types';
import {
	getPageByUsername,
	saveDraft,
	publishDraft,
	getFullPageData
} from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /editor/:username - Get full editor data (draft)
app.get('/:username', async (c) => {
	const username = c.req.param('username');
	const data = await getFullPageData(c.env.DB, username, true); // useDraft = true

	if (!data) {
		return c.json({ error: 'Page not found' }, 404);
	}

	return c.json(data);
});

// PUT /editor/:username/draft - Save draft (autosave)
app.put('/:username/draft', async (c) => {
	const username = c.req.param('username');
	const body = await c.req.json();

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	// Separate profile and appearance data
	const draftData: { profile?: any; appearance?: any } = {};

	// Profile data
	if (body.title !== undefined || body.bio !== undefined || body.avatar_url !== undefined) {
		draftData.profile = {
			title: body.title,
			bio: body.bio,
			avatar_url: body.avatar_url
		};
	}

	// Appearance data (theme)
	if (body.theme !== undefined || body.themePresetKey !== undefined) {
		draftData.appearance = {
			themePresetKey: body.themePresetKey,
			customTheme: body.theme // Custom theme overrides
		};
	}

	await saveDraft(c.env.DB, page.id, draftData);

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
