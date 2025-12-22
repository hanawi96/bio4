import { Hono } from 'hono';
import type { Bindings } from '../types';
import { getFullPageData } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /bio/:username - Public bio page data (published)
app.get('/:username', async (c) => {
	const username = c.req.param('username');
	const data = await getFullPageData(c.env.DB, username, false); // useDraft = false (published)

	if (!data) {
		return c.json({ error: 'Profile not found' }, 404);
	}

	// Check if published
	if (!data.page.published_at) {
		return c.json({ error: 'Profile not found' }, 404);
	}

	return c.json(data);
});

export default app;
