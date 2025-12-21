import { Hono } from 'hono';
import type { Bindings } from '../types';
import { createAsset } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// POST /upload - Upload image to R2
app.post('/', async (c) => {
	const formData = await c.req.formData();
	const file = formData.get('file') as File;
	const userId = formData.get('user_id') as string;

	if (!file) {
		return c.json({ error: 'No file provided' }, 400);
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return c.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, 400);
	}

	if (file.size > MAX_SIZE) {
		return c.json({ error: 'File too large. Max 5MB' }, 400);
	}

	// Generate unique filename
	const ext = file.name.split('.').pop() || 'jpg';
	const storageKey = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	// Upload to R2
	const arrayBuffer = await file.arrayBuffer();
	await c.env.STORAGE.put(storageKey, arrayBuffer, {
		httpMetadata: {
			contentType: file.type
		}
	});

	// Build public URL
	const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

	// Save to database if user_id provided
	if (userId) {
		await createAsset(c.env.DB, parseInt(userId), {
			storage_key: storageKey,
			url,
			mime_type: file.type,
			size_bytes: file.size
		});
	}

	return c.json({ url, storage_key: storageKey });
});

// DELETE /upload/:storageKey - Delete image from R2
app.delete('/:storageKey', async (c) => {
	const storageKey = c.req.param('storageKey');

	await c.env.STORAGE.delete(storageKey);

	return c.json({ success: true });
});

export default app;
