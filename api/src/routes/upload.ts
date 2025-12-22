import { Hono } from 'hono';
import type { Bindings } from '../types';
import { createAsset } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// POST /upload - Upload image to R2
app.post('/', async (c) => {
	try {
		const formData = await c.req.formData();
		const fileEntry = formData.get('file');
		const userId = formData.get('user_id') as string;

		if (!fileEntry || typeof fileEntry === 'string') {
			return c.json({ error: 'No file provided' }, 400);
		}

		const file = fileEntry as File;

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
	} catch (error) {
		console.error('Upload error:', error);
		return c.json({ error: 'Upload failed' }, 500);
	}
});

// DELETE /upload/:storageKey - Delete image from R2
app.delete('/:storageKey', async (c) => {
	try {
		const storageKey = c.req.param('storageKey');
		await c.env.STORAGE.delete(storageKey);
		return c.json({ success: true });
	} catch (error) {
		console.error('Delete error:', error);
		return c.json({ error: 'Delete failed' }, 500);
	}
});

// POST /upload/avatar/:username - Upload avatar and save immediately
app.post('/avatar/:username', async (c) => {
	try {
		const username = c.req.param('username');
		const formData = await c.req.formData();
		const fileEntry = formData.get('file');

		if (!fileEntry || typeof fileEntry === 'string') {
			return c.json({ error: 'No file provided' }, 400);
		}

		const file = fileEntry as File;

		if (!ALLOWED_TYPES.includes(file.type)) {
			return c.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, 400);
		}

		if (file.size > MAX_SIZE) {
			return c.json({ error: 'File too large. Max 5MB' }, 400);
		}

		// Get page with draft_profile
		const page = await c.env.DB.prepare(
			'SELECT id, draft_profile FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_profile: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft profile
		let draftProfile: any = {};
		try {
			draftProfile = JSON.parse(page.draft_profile || '{}');
		} catch (e) {
			console.error('Failed to parse draft_profile:', e);
		}

		// Delete old avatar from R2 if exists
		if (draftProfile.avatar_url) {
			// Extract storage key from full URL
			const urlParts = draftProfile.avatar_url.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			// Only delete if it's in avatars folder
			if (storageKey && draftProfile.avatar_url.includes('/avatars/')) {
				try {
					await c.env.STORAGE.delete(`avatars/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete old avatar:', e);
				}
			}
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'jpg';
		const storageKey = `avatars/${username}-${Date.now()}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		// Update draft_profile with new avatar_url
		draftProfile.avatar_url = url;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_profile = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftProfile), page.id).run();

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Avatar upload error:', error);
		return c.json({ error: 'Avatar upload failed' }, 500);
	}
});

// DELETE /upload/avatar/:username - Remove avatar
app.delete('/avatar/:username', async (c) => {
	try {
		const username = c.req.param('username');

		// Get page with draft_profile
		const page = await c.env.DB.prepare(
			'SELECT id, draft_profile FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_profile: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft profile
		let draftProfile: any = {};
		try {
			draftProfile = JSON.parse(page.draft_profile || '{}');
		} catch (e) {
			console.error('Failed to parse draft_profile:', e);
		}

		// Delete from R2 if exists
		if (draftProfile.avatar_url) {
			// Extract storage key from full URL
			const urlParts = draftProfile.avatar_url.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			if (storageKey && draftProfile.avatar_url.includes('/avatars/')) {
				try {
					await c.env.STORAGE.delete(`avatars/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete avatar:', e);
				}
			}
		}

		// Remove avatar_url from draft_profile
		draftProfile.avatar_url = null;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_profile = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftProfile), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Avatar remove error:', error);
		return c.json({ error: 'Avatar remove failed' }, 500);
	}
});

export default app;
