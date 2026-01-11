import { Hono } from 'hono';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

// Get all themes
app.get('/', async (c) => {
	try {
		const db = c.env.DB;

		const result = await db.prepare(`
			SELECT id, key, name, config,
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
			SELECT id, key, name, config,
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

// Create new theme
app.post('/', async (c) => {
	try {
		const body = await c.req.json();
		const { key, name, config, description, category, tier } = body;

		// Validation
		if (!key || !name || !config) {
			return c.json({ error: 'Missing required fields: key, name, config' }, 400);
		}

		const db = c.env.DB;

		// Check if key already exists
		const existing = await db.prepare('SELECT id FROM theme_presets WHERE key = ?').bind(key).first();
		if (existing) {
			return c.json({ error: 'Theme key already exists' }, 409);
		}

		// Extract default preset IDs from config
		const defaultHeaderPresetId = config.page?.defaults?.headerPresetId || 'no-cover';
		const defaultBlockPresetId = config.page?.defaults?.blockStylePreset || 'solid';

		// Insert theme with preset IDs
		const result = await db.prepare(`
			INSERT INTO theme_presets (
				key, name, config, description, category, tier,
				default_header_preset_id, default_block_preset_id
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			key,
			name,
			JSON.stringify(config),
			description || null,
			category || 'minimal',
			tier || 'free',
			defaultHeaderPresetId,
			defaultBlockPresetId
		).run();

		return c.json({
			success: true,
			id: Number(result.meta.last_row_id),
			key
		}, 201);
	} catch (error: any) {
		console.error('Error creating theme:', error);
		return c.json({ error: 'Failed to create theme' }, 500);
	}
});

// Update theme
app.put('/:key', async (c) => {
	try {
		const key = c.req.param('key');
		const body = await c.req.json();
		const { name, config, description, category, tier } = body;

		// Validation
		if (!name || !config) {
			return c.json({ error: 'Missing required fields: name, config' }, 400);
		}

		const db = c.env.DB;

		// Check if theme exists
		const theme = await db.prepare('SELECT id FROM theme_presets WHERE key = ?').bind(key).first();
		if (!theme) {
			return c.json({ error: 'Theme not found' }, 404);
		}

		// Extract default preset IDs from config
		const defaultHeaderPresetId = config.page?.defaults?.headerPresetId || 'no-cover';
		const defaultBlockPresetId = config.page?.defaults?.blockStylePreset || 'solid';

		// Update theme
		await db.prepare(`
			UPDATE theme_presets 
			SET name = ?, config = ?, description = ?, category = ?, tier = ?,
			    default_header_preset_id = ?, default_block_preset_id = ?
			WHERE key = ?
		`).bind(
			name,
			JSON.stringify(config),
			description || null,
			category || 'minimal',
			tier || 'free',
			defaultHeaderPresetId,
			defaultBlockPresetId,
			key
		).run();

		return c.json({ success: true, key });
	} catch (error: any) {
		console.error('Error updating theme:', error);
		return c.json({ error: 'Failed to update theme' }, 500);
	}
});

// Delete theme
app.delete('/:key', async (c) => {
	try {
		const key = c.req.param('key');
		const db = c.env.DB;

		// Check if theme exists
		const theme = await db.prepare('SELECT id FROM theme_presets WHERE key = ?').bind(key).first();
		if (!theme) {
			return c.json({ error: 'Theme not found' }, 404);
		}

		// Check if theme is being used by any page
		const usedBy = await db.prepare('SELECT COUNT(*) as count FROM bio_pages WHERE theme_preset_key = ?').bind(key).first();
		if (usedBy && (usedBy as any).count > 0) {
			return c.json({ error: 'Cannot delete theme that is currently in use' }, 400);
		}

		// Delete theme
		await db.prepare('DELETE FROM theme_presets WHERE key = ?').bind(key).run();

		return c.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting theme:', error);
		return c.json({ error: 'Failed to delete theme' }, 500);
	}
});

export default app;
