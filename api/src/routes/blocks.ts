import { Hono } from 'hono';
import type { Bindings } from '../types';
import {
	getPageByUsername,
	getBlocksByPageId,
	createBlock,
	updateBlock,
	deleteBlock
} from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// GET /blocks/:username - Get all blocks for a page
app.get('/:username', async (c) => {
	const username = c.req.param('username');
	const page = await getPageByUsername(c.env.DB, username);

	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	const result = await getBlocksByPageId(c.env.DB, page.id);
	return c.json({ blocks: result.results || [] });
});

// POST /blocks/:username - Create new block
app.post('/:username', async (c) => {
	const username = c.req.param('username');
	const body = await c.req.json();

	const page = await getPageByUsername(c.env.DB, username);
	if (!page) {
		return c.json({ error: 'Page not found' }, 404);
	}

	const blockId = await createBlock(c.env.DB, page.id, {
		type: body.type,
		content: body.content ? (typeof body.content === 'string' ? body.content : JSON.stringify(body.content)) : '{}',
		sort_order: body.sort_order
	});

	return c.json({ id: blockId }, 201);
});

// PUT /blocks/:blockId - Update block
app.put('/:blockId', async (c) => {
	const blockId = parseInt(c.req.param('blockId'));
	const body = await c.req.json();

	await updateBlock(c.env.DB, blockId, {
		type: body.type,
		content: body.content ? (typeof body.content === 'string' ? body.content : JSON.stringify(body.content)) : undefined,
		sort_order: body.sort_order,
		is_visible: body.is_visible
	});

	return c.json({ success: true });
});

// DELETE /blocks/:blockId - Delete block
app.delete('/:blockId', async (c) => {
	const blockId = parseInt(c.req.param('blockId'));
	
	// Get block data before deleting to clean up R2 storage
	const block = await c.env.DB.prepare(
		'SELECT type, content FROM blocks WHERE id = ?'
	).bind(blockId).first() as { type: string; content: string } | null;
	
	// Delete block from database
	await deleteBlock(c.env.DB, blockId);
	
	// Clean up R2 storage for image blocks
	if (block && block.type === 'image') {
		try {
			const content = JSON.parse(block.content);
			if (content.images && Array.isArray(content.images)) {
				// Delete all images from R2 in parallel
				const deletePromises = content.images.map((image: any) => {
					if (image.storage_key) {
						return c.env.STORAGE.delete(image.storage_key).catch((err: any) => {
							console.error(`Failed to delete image ${image.storage_key}:`, err);
						});
					}
				});
				await Promise.all(deletePromises);
			}
		} catch (e) {
			console.error('Failed to clean up R2 storage:', e);
			// Don't fail the request if cleanup fails
		}
	}
	
	return c.json({ success: true });
});

export default app;
