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

// DELETE /upload/* - Delete image from R2 (supports nested paths like block-images/xxx.jpg)
app.delete('/*', async (c) => {
	try {
		// Get the full path after /upload/
		const fullPath = c.req.path.replace('/upload/', '');
		
		if (!fullPath) {
			return c.json({ error: 'Storage key is required' }, 400);
		}
		
		await c.env.STORAGE.delete(fullPath);
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

// POST /upload/cover/:username - Upload cover image
app.post('/cover/:username', async (c) => {
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

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete old cover from R2 if exists
		const oldCoverValue = draftAppearance.headerStyle?.overrides?.coverValue;
		if (oldCoverValue && oldCoverValue.startsWith('http')) {
			const urlParts = oldCoverValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			if (storageKey && oldCoverValue.includes('/covers/')) {
				try {
					await c.env.STORAGE.delete(`covers/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete old cover:', e);
				}
			}
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'jpg';
		const storageKey = `covers/${username}-${Date.now()}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		// Update draft_appearance with new cover
		if (!draftAppearance.headerStyle) {
			draftAppearance.headerStyle = {};
		}
		if (!draftAppearance.headerStyle.overrides) {
			draftAppearance.headerStyle.overrides = {};
		}
		
		draftAppearance.headerStyle.overrides.coverType = 'image';
		draftAppearance.headerStyle.overrides.coverValue = url;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Cover upload error:', error);
		return c.json({ error: 'Cover upload failed' }, 500);
	}
});

// DELETE /upload/cover/:username - Remove cover image
app.delete('/cover/:username', async (c) => {
	try {
		const username = c.req.param('username');

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete from R2 if exists
		const coverValue = draftAppearance.headerStyle?.overrides?.coverValue;
		if (coverValue && coverValue.startsWith('http')) {
			const urlParts = coverValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			if (storageKey && coverValue.includes('/covers/')) {
				try {
					await c.env.STORAGE.delete(`covers/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete cover:', e);
				}
			}
		}

		// Reset to gradient
		if (draftAppearance.headerStyle?.overrides) {
			draftAppearance.headerStyle.overrides.coverType = 'gradient';
			draftAppearance.headerStyle.overrides.coverValue = 'linear-gradient(135deg, #667eea, #764ba2)';
		}

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Cover remove error:', error);
		return c.json({ error: 'Cover remove failed' }, 500);
	}
});

// POST /upload/cover-video/:username - Upload cover video
app.post('/cover-video/:username', async (c) => {
	try {
		const username = c.req.param('username');
		const formData = await c.req.formData();
		const fileEntry = formData.get('file');

		if (!fileEntry || typeof fileEntry === 'string') {
			return c.json({ error: 'No file provided' }, 400);
		}

		const file = fileEntry as File;

		// Validate video type
		const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
		if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
			return c.json({ error: 'Invalid file type. Allowed: MP4, WebM' }, 400);
		}

		// Max 20MB for video
		const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
		if (file.size > MAX_VIDEO_SIZE) {
			return c.json({ error: 'File too large. Max 20MB' }, 400);
		}

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete old video from R2 if exists
		const oldVideoValue = draftAppearance.headerStyle?.overrides?.coverValue;
		if (oldVideoValue && oldVideoValue.startsWith('http') && oldVideoValue.includes('/cover-videos/')) {
			const urlParts = oldVideoValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`cover-videos/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete old video:', e);
			}
		}

		// Delete old poster if exists
		const oldPosterValue = draftAppearance.headerStyle?.overrides?.coverVideoPoster;
		if (oldPosterValue && oldPosterValue.startsWith('http') && oldPosterValue.includes('/cover-posters/')) {
			const urlParts = oldPosterValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`cover-posters/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete old poster:', e);
			}
		}

		// Generate unique filename for video
		const ext = file.name.split('.').pop() || 'mp4';
		const videoStorageKey = `cover-videos/${username}-${Date.now()}.${ext}`;

		// Upload video to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(videoStorageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL for video
		const videoUrl = `${c.env.R2_PUBLIC_URL}/${videoStorageKey}`;

		// For poster, we'll use a placeholder for now (in production, extract first frame)
		// Simple approach: use a default poster or let browser generate one
		const posterUrl = ''; // Browser will generate poster from video

		// Update draft_appearance with new video
		if (!draftAppearance.headerStyle) {
			draftAppearance.headerStyle = {};
		}
		if (!draftAppearance.headerStyle.overrides) {
			draftAppearance.headerStyle.overrides = {};
		}
		
		draftAppearance.headerStyle.overrides.coverType = 'video';
		draftAppearance.headerStyle.overrides.coverValue = videoUrl;
		draftAppearance.headerStyle.overrides.coverVideoPoster = posterUrl;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ videoUrl, posterUrl, storage_key: videoStorageKey });
	} catch (error) {
		console.error('Video upload error:', error);
		return c.json({ error: 'Video upload failed' }, 500);
	}
});

// DELETE /upload/cover-video/:username - Remove cover video
app.delete('/cover-video/:username', async (c) => {
	try {
		const username = c.req.param('username');

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete video from R2 if exists
		const videoValue = draftAppearance.headerStyle?.overrides?.coverValue;
		if (videoValue && videoValue.startsWith('http') && videoValue.includes('/cover-videos/')) {
			const urlParts = videoValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`cover-videos/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete video:', e);
			}
		}

		// Delete poster from R2 if exists
		const posterValue = draftAppearance.headerStyle?.overrides?.coverVideoPoster;
		if (posterValue && posterValue.startsWith('http') && posterValue.includes('/cover-posters/')) {
			const urlParts = posterValue.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`cover-posters/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete poster:', e);
			}
		}

		// Clear video values
		if (draftAppearance.headerStyle?.overrides) {
			delete draftAppearance.headerStyle.overrides.coverType;
			delete draftAppearance.headerStyle.overrides.coverValue;
			delete draftAppearance.headerStyle.overrides.coverVideoPoster;
		}

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Video removal error:', error);
		return c.json({ error: 'Video removal failed' }, 500);
	}
});

// POST /upload/background/:username - Upload background image
app.post('/background/:username', async (c) => {
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

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete old background from R2 if exists
		const oldBgValue = draftAppearance.customTheme?.backgroundColor;
		if (oldBgValue && oldBgValue.includes('url(')) {
			const urlMatch = oldBgValue.match(/url\(['"]?([^'"]+)['"]?\)/);
			if (urlMatch) {
				const oldUrl = urlMatch[1];
				const urlParts = oldUrl.split('/');
				const storageKey = urlParts[urlParts.length - 1];

				if (storageKey && oldUrl.includes('/backgrounds/')) {
					try {
						await c.env.STORAGE.delete(`backgrounds/${storageKey}`);
					} catch (e) {
						console.error('Failed to delete old background:', e);
					}
				}
			}
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'jpg';
		const storageKey = `backgrounds/${username}-${Date.now()}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		// Update draft_appearance with new background
		if (!draftAppearance.customTheme) {
			draftAppearance.customTheme = {};
		}
		
		draftAppearance.customTheme.backgroundColor = `url('${url}')`;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Background upload error:', error);
		return c.json({ error: 'Background upload failed' }, 500);
	}
});

// DELETE /upload/background/:username - Remove background image
app.delete('/background/:username', async (c) => {
	try {
		const username = c.req.param('username');

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete from R2 if exists
		const bgValue = draftAppearance.customTheme?.backgroundColor;
		if (bgValue && bgValue.includes('url(')) {
			const urlMatch = bgValue.match(/url\(['"]?([^'"]+)['"]?\)/);
			if (urlMatch) {
				const oldUrl = urlMatch[1];
				const urlParts = oldUrl.split('/');
				const storageKey = urlParts[urlParts.length - 1];

				if (storageKey && oldUrl.includes('/backgrounds/')) {
					try {
						await c.env.STORAGE.delete(`backgrounds/${storageKey}`);
					} catch (e) {
						console.error('Failed to delete background:', e);
					}
				}
			}
		}

		// Reset to white
		if (!draftAppearance.customTheme) {
			draftAppearance.customTheme = {};
		}
		draftAppearance.customTheme.backgroundColor = '#ffffff';

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Background remove error:', error);
		return c.json({ error: 'Background remove failed' }, 500);
	}
});

// POST /upload/link-icon - Upload link icon to R2
app.post('/link-icon', async (c) => {
	try {
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

		// Generate unique filename with link-icons folder
		const ext = file.name.split('.').pop() || 'jpg';
		const storageKey = `link-icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Link icon upload error:', error);
		return c.json({ error: 'Link icon upload failed' }, 500);
	}
});

// POST /upload/block-image - Upload image for image blocks
app.post('/block-image', async (c) => {
	try {
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

		// Generate unique filename with block-images folder
		const ext = file.name.split('.').pop() || 'jpg';
		const storageKey = `block-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Block image upload error:', error);
		return c.json({ error: 'Block image upload failed' }, 500);
	}
});

// POST /upload/background-video/:username - Upload background video
app.post('/background-video/:username', async (c) => {
	try {
		const username = c.req.param('username');
		const formData = await c.req.formData();
		const fileEntry = formData.get('file');

		if (!fileEntry || typeof fileEntry === 'string') {
			return c.json({ error: 'No file provided' }, 400);
		}

		const file = fileEntry as File;

		// Validate video types
		const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
		if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
			return c.json({ error: 'Invalid file type. Allowed: MP4, WebM' }, 400);
		}

		const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
		if (file.size > MAX_VIDEO_SIZE) {
			return c.json({ error: 'File too large. Max 20MB' }, 400);
		}

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete old video from R2 if exists
		const oldVideoUrl = draftAppearance.customTheme?.backgroundVideo;
		if (oldVideoUrl) {
			const urlParts = oldVideoUrl.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			if (storageKey && oldVideoUrl.includes('/background-videos/')) {
				try {
					await c.env.STORAGE.delete(`background-videos/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete old video:', e);
				}
			}
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'mp4';
		const storageKey = `background-videos/${username}-${Date.now()}.${ext}`;

		// Upload to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(storageKey, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Build public URL
		const url = `${c.env.R2_PUBLIC_URL}/${storageKey}`;

		// Update draft_appearance with new video
		if (!draftAppearance.customTheme) {
			draftAppearance.customTheme = {};
		}
		
		draftAppearance.customTheme.backgroundVideo = url;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ url, storage_key: storageKey });
	} catch (error) {
		console.error('Background video upload error:', error);
		return c.json({ error: 'Background video upload failed' }, 500);
	}
});

// DELETE /upload/background-video/:username - Remove background video
app.delete('/background-video/:username', async (c) => {
	try {
		const username = c.req.param('username');

		// Get page with draft_appearance
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete from R2 if exists
		const videoUrl = draftAppearance.customTheme?.backgroundVideo;
		if (videoUrl) {
			const urlParts = videoUrl.split('/');
			const storageKey = urlParts[urlParts.length - 1];

			if (storageKey && videoUrl.includes('/background-videos/')) {
				try {
					await c.env.STORAGE.delete(`background-videos/${storageKey}`);
				} catch (e) {
					console.error('Failed to delete video:', e);
				}
			}
		}

		// Remove video URL
		if (draftAppearance.customTheme) {
			delete draftAppearance.customTheme.backgroundVideo;
		}

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Background video remove error:', error);
		return c.json({ error: 'Background video remove failed' }, 500);
	}
});

// POST /upload/avatar-video/:username - Upload avatar video
app.post('/avatar-video/:username', async (c) => {
	try {
		const username = c.req.param('username');
		const formData = await c.req.formData();
		const fileEntry = formData.get('file');

		if (!fileEntry || typeof fileEntry === 'string') {
			return c.json({ error: 'No file provided' }, 400);
		}

		const file = fileEntry as File;

		// Validate video type
		const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
		if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
			return c.json({ error: 'Invalid file type. Allowed: MP4, WebM' }, 400);
		}

		// Max 10MB for avatar video
		const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
		if (file.size > MAX_VIDEO_SIZE) {
			return c.json({ error: 'File too large. Max 10MB' }, 400);
		}

		// Get page
		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		// Parse draft appearance
		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete old avatar video if exists
		const oldVideoUrl = draftAppearance.headerStyle?.overrides?.avatarVideoUrl;
		if (oldVideoUrl && oldVideoUrl.startsWith('http') && oldVideoUrl.includes('/avatar-videos/')) {
			const urlParts = oldVideoUrl.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`avatar-videos/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete old avatar video:', e);
			}
		}

		// Generate unique filename
		const ext = file.name.split('.').pop() || 'mp4';
		const videoStorageKey = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

		// Upload video to R2
		const arrayBuffer = await file.arrayBuffer();
		await c.env.STORAGE.put(`avatar-videos/${videoStorageKey}`, arrayBuffer, {
			httpMetadata: {
				contentType: file.type
			}
		});

		const videoUrl = `${c.env.R2_PUBLIC_URL}/avatar-videos/${videoStorageKey}`;

		// Update draft appearance
		if (!draftAppearance.headerStyle) draftAppearance.headerStyle = {};
		if (!draftAppearance.headerStyle.overrides) draftAppearance.headerStyle.overrides = {};
		
		draftAppearance.headerStyle.overrides.avatarType = 'video';
		draftAppearance.headerStyle.overrides.avatarVideoUrl = videoUrl;

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ videoUrl, storage_key: videoStorageKey });
	} catch (error) {
		console.error('Avatar video upload error:', error);
		return c.json({ error: 'Avatar video upload failed' }, 500);
	}
});

// DELETE /upload/avatar-video/:username - Remove avatar video
app.delete('/avatar-video/:username', async (c) => {
	try {
		const username = c.req.param('username');

		const page = await c.env.DB.prepare(
			'SELECT id, draft_appearance FROM bio_pages WHERE username = ?'
		).bind(username).first() as { id: number; draft_appearance: string } | null;

		if (!page) {
			return c.json({ error: 'Page not found' }, 404);
		}

		let draftAppearance: any = {};
		try {
			draftAppearance = JSON.parse(page.draft_appearance || '{}');
		} catch (e) {
			console.error('Failed to parse draft_appearance:', e);
		}

		// Delete video from R2
		const videoUrl = draftAppearance.headerStyle?.overrides?.avatarVideoUrl;
		if (videoUrl && videoUrl.startsWith('http') && videoUrl.includes('/avatar-videos/')) {
			const urlParts = videoUrl.split('/');
			const storageKey = urlParts[urlParts.length - 1];
			try {
				await c.env.STORAGE.delete(`avatar-videos/${storageKey}`);
			} catch (e) {
				console.error('Failed to delete avatar video:', e);
			}
		}

		// Clear avatar video values
		if (draftAppearance.headerStyle?.overrides) {
			delete draftAppearance.headerStyle.overrides.avatarType;
			delete draftAppearance.headerStyle.overrides.avatarVideoUrl;
		}

		await c.env.DB.prepare(
			'UPDATE bio_pages SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
		).bind(JSON.stringify(draftAppearance), page.id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Avatar video removal error:', error);
		return c.json({ error: 'Avatar video removal failed' }, 500);
	}
});

export default app;
