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
	const draftData: { profile?: any; appearance?: any } = {};

	// Profile data (title, bio, social_links, show_social_icons)
	if (body.title !== undefined || body.bio !== undefined || body.social_links !== undefined || body.show_social_icons !== undefined) {
		const profileData: any = {};
		
		if (body.title !== undefined) profileData.title = body.title;
		if (body.bio !== undefined) profileData.bio = body.bio;
		if (body.social_links !== undefined) profileData.social_links = body.social_links;
		if (body.show_social_icons !== undefined) profileData.show_social_icons = body.show_social_icons;
		
		draftData.profile = profileData;
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

	// Parse appearance to get active background type
	let appearance: any = {};
	try {
		appearance = JSON.parse(page.draft_appearance || '{}');
	} catch (e) {
		console.error('[Publish] Failed to parse draft_appearance:', e);
	}

	const backgrounds = appearance.customTheme?.backgrounds || {};
	const backgroundVideo = appearance.customTheme?.backgroundVideo;
	const backgroundColor = appearance.customTheme?.backgroundColor || '';

	// Determine active background type
	let activeType = 'solid'; // default
	if (backgroundVideo) {
		activeType = 'video';
	} else if (backgroundColor.includes('url(')) {
		activeType = 'image';
	} else if (backgroundColor.includes('gradient')) {
		activeType = 'gradient';
	} else if (backgroundColor.includes('background:')) {
		activeType = 'pattern';
	}

	console.log('[Publish] Active background type:', activeType);
	console.log('[Publish] Backgrounds history:', backgrounds);

	// Delete inactive backgrounds from R2 and clear from DB
	const typesToCleanup = ['image', 'video'].filter(t => t !== activeType);
	
	for (const type of typesToCleanup) {
		const url = backgrounds[type];
		if (!url) continue;
		
		try {
			// Extract storage key from URL
			const urlParts = url.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			
			if (type === 'image' && url.includes('/backgrounds/')) {
				await c.env.STORAGE.delete(`backgrounds/${storageKey}`);
				console.log(`[Publish] Deleted inactive image: backgrounds/${storageKey}`);
			} else if (type === 'video' && url.includes('/background-videos/')) {
				await c.env.STORAGE.delete(`background-videos/${storageKey}`);
				console.log(`[Publish] Deleted inactive video: background-videos/${storageKey}`);
			}
			
			// Clear from history
			backgrounds[type] = '';
			
			// CRITICAL: If backgroundColor contains the deleted URL, reset it
			if (type === 'image' && backgroundColor.includes(url)) {
				// Reset to solid color or gradient from history
				appearance.customTheme.backgroundColor = backgrounds.solid || backgrounds.gradient || '#ffffff';
				console.log(`[Publish] Reset backgroundColor from deleted image URL to:`, appearance.customTheme.backgroundColor);
			}
		} catch (e) {
			console.error(`[Publish] Failed to delete ${type}:`, e);
		}
	}

	// Update appearance with cleaned backgrounds
	if (appearance.customTheme) {
		appearance.customTheme.backgrounds = backgrounds;
		
		// Also clear backgroundVideo if not active
		if (activeType !== 'video' && appearance.customTheme.backgroundVideo) {
			delete appearance.customTheme.backgroundVideo;
		}
	}

	// Save cleaned appearance back to draft before publishing
	await c.env.DB.prepare(
		'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
	).bind(JSON.stringify(appearance), page.id).run();

	console.log('[Publish] Cleaned backgrounds:', backgrounds);

	// Now publish
	await publishDraft(c.env.DB, page.id);

	// TODO: Invalidate cache if using Cloudflare Cache API
	// await c.env.CACHE?.delete(`bio:${username}`);

	return c.json({ success: true });
});

export default app;
