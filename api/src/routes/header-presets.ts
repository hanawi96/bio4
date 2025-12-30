import { Hono } from 'hono';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

// Get all header presets
app.get('/', async (c) => {
	try {
		const db = c.env.DB;
		
		const result = await db.prepare(`
			SELECT id, key, name, description, category, tier,
			       config, thumbnail_url, sort_order, created_at
			FROM header_presets
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC
		`).all();
		
		const presets = result.results.map((row: any) => ({
			id: row.id,
			key: row.key,
			name: row.name,
			description: row.description,
			category: row.category,
			tier: row.tier,
			config: JSON.parse(row.config),
			thumbnailUrl: row.thumbnail_url,
			sortOrder: row.sort_order,
			createdAt: row.created_at
		}));
		
		return c.json({ presets });
	} catch (error: any) {
		console.error('Error fetching header presets:', error);
		return c.json({ error: 'Failed to fetch header presets' }, 500);
	}
});

// Get single header preset by key
app.get('/:key', async (c) => {
	try {
		const key = c.req.param('key');
		const db = c.env.DB;
		
		const result = await db.prepare(`
			SELECT id, key, name, description, category, tier,
			       config, thumbnail_url, sort_order, created_at
			FROM header_presets
			WHERE key = ? AND is_active = 1
		`).bind(key).first();
		
		if (!result) {
			return c.json({ error: 'Header preset not found' }, 404);
		}
		
		const preset = {
			id: result.id,
			key: result.key,
			name: result.name,
			description: result.description,
			category: result.category,
			tier: result.tier,
			config: JSON.parse(result.config as string),
			thumbnailUrl: result.thumbnail_url,
			sortOrder: result.sort_order,
			createdAt: result.created_at
		};
		
		return c.json({ preset });
	} catch (error: any) {
		console.error('Error fetching header preset:', error);
		return c.json({ error: 'Failed to fetch header preset' }, 500);
	}
});

export default app;
