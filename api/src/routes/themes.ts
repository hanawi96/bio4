import { Hono } from 'hono';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

// Get all themes
app.get('/', async (c) => {
	try {
		const db = c.env.DB;
		
		const result = await db.prepare(`
			SELECT id, key, name, config, config_v2,
			       default_header_preset_id, default_block_preset_id,
			       created_at
			FROM theme_presets
			ORDER BY id ASC
		`).all();
		
		const themes = result.results.map((row: any) => ({
			id: row.id,
			key: row.key,
			name: row.name,
			config: JSON.parse(row.config),
			config_v2: row.config_v2 ? JSON.parse(row.config_v2) : null,
			defaultHeaderPresetId: row.default_header_preset_id || 'centered',
			defaultBlockPresetId: row.default_block_preset_id || 'rounded-solid',
			created_at: row.created_at
		}));
		
		return c.json({ themes });
	} catch (error: any) {
		console.error('Error fetching themes:', error);
		return c.json({ error: 'Failed to fetch themes' }, 500);
	}
});

// Get single theme by key
app.get('/:key', async (c) => {
	try {
		const key = c.req.param('key');
		const db = c.env.DB;
		
		const result = await db.prepare(`
			SELECT id, key, name, config, config_v2,
			       default_header_preset_id, default_block_preset_id,
			       created_at
			FROM theme_presets
			WHERE key = ?
		`).bind(key).first();
		
		if (!result) {
			return c.json({ error: 'Theme not found' }, 404);
		}
		
		const theme = {
			id: result.id,
			key: result.key,
			name: result.name,
			config: JSON.parse(result.config as string),
			config_v2: result.config_v2 ? JSON.parse(result.config_v2 as string) : null,
			defaultHeaderPresetId: result.default_header_preset_id || 'centered',
			defaultBlockPresetId: result.default_block_preset_id || 'rounded-solid',
			created_at: result.created_at
		};
		
		return c.json({ theme });
	} catch (error: any) {
		console.error('Error fetching theme:', error);
		return c.json({ error: 'Failed to fetch theme' }, 500);
	}
});

export default app;
