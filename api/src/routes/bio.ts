import { Hono } from 'hono';
import type { Bindings } from '../types';
import { getFullPageData } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /bio/:username - Public bio page data
app.get('/:username', async (c) => {
	const username = c.req.param('username');
	const data = await getFullPageData(c.env.DB, username);

	if (!data) {
		return c.json({ error: 'Profile not found' }, 404);
	}

	// Only return published pages for public access
	if (data.page.status !== 'published') {
		return c.json({ error: 'Profile not found' }, 404);
	}

	return c.json(data);
});

export default app;
