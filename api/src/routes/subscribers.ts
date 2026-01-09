import { Hono } from 'hono';
import type { Bindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { getPageByUsername, getSubscribersByPageId, getSubscriberCount } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /subscribers/:username - Get subscribers list (protected)
app.get('/:username', authMiddleware, async (c) => {
	try {
		const username = c.req.param('username');
		const userId = c.get('userId') as number;

		// Get page
		const page = await getPageByUsername(c.env.DB, username);
		if (!page) {
			return c.json({ error: 'Profile not found' }, 404);
		}

		// Check if user owns this page
		if (page.user_id !== userId) {
			return c.json({ error: 'Unauthorized' }, 403);
		}

		// Get subscribers
		const [subscribersResult, total] = await Promise.all([
			getSubscribersByPageId(c.env.DB, page.id),
			getSubscriberCount(c.env.DB, page.id)
		]);

		return c.json({
			subscribers: subscribersResult.results || [],
			total
		});
	} catch (error: any) {
		console.error('Get subscribers error:', error);
		return c.json({ error: 'Failed to load subscribers' }, 500);
	}
});

export default app;
