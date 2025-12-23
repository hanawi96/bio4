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
	try {
		const username = c.req.param('username');
		const data = await getFullPageData(c.env.DB, username, true); // useDraft = true

		if (!data) {
			return c.json({ error: 'Page not found' }, 404);
		}

		return c.json(data);
	} catch (error: any) {
		console.error('Error in GET /editor/:username:', error);
		return c.json({ error: error.message || 'Internal server error' }, 500);
	}
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
	const draftData: { profile?: any; appearance?: any; theme_preset_key?: string } = {};

	// Profile data (title, bio, social_links, show_social_icons)
	if (body.title !== undefined || body.bio !== undefined || body.social_links !== undefined || body.show_social_icons !== undefined) {
		const profileData: any = {};
		
		if (body.title !== undefined) profileData.title = body.title;
		if (body.bio !== undefined) profileData.bio = body.bio;
		if (body.social_links !== undefined) profileData.social_links = body.social_links;
		if (body.show_social_icons !== undefined) profileData.show_social_icons = body.show_social_icons;
		
		draftData.profile = profileData;
	}

	// Theme preset key
	if (body.theme_preset_key !== undefined) {
		draftData.theme_preset_key = body.theme_preset_key;
	}

	// Appearance data - Handle both old and new format
	if (body.draft_appearance !== undefined) {
		// New format: full appearance state as JSON string
		draftData.appearance = JSON.parse(body.draft_appearance);
	} else if (body.theme !== undefined || body.themePresetKey !== undefined) {
		// Old format: individual theme fields
		const appearanceData: any = {};
		
		if (body.themePresetKey !== undefined) appearanceData.themePresetKey = body.themePresetKey;
		if (body.theme !== undefined) appearanceData.customTheme = body.theme;
		
		draftData.appearance = appearanceData;
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

	// Publish without cleanup - keep all backgrounds
	await publishDraft(c.env.DB, page.id);

	// TODO: Invalidate cache if using Cloudflare Cache API
	// await c.env.CACHE?.delete(`bio:${username}`);

	return c.json({ success: true });
});

export default app;
