import { Hono } from 'hono';
import type { Bindings } from '../types';
import { getThemePresets, getThemePresetByKey } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /themes - Get all theme presets
app.get('/', async (c) => {
	const result = await getThemePresets(c.env.DB);
	
	const themes = (result.results || []).map(theme => ({
		...theme,
		config: JSON.parse(theme.config)
	}));

	return c.json({ themes });
});

// GET /themes/:key - Get single theme preset
app.get('/:key', async (c) => {
	const key = c.req.param('key');
	const theme = await getThemePresetByKey(c.env.DB, key);

	if (!theme) {
		return c.json({ error: 'Theme not found' }, 404);
	}

	return c.json({
		...theme,
		config: JSON.parse(theme.config)
	});
});

export default app;
