import { Hono } from 'hono';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

// Hardcoded header presets (no database needed)
const HEADER_PRESETS = {
	'no-cover': {
		id: 'no-cover',
		key: 'no-cover',
		name: 'No Cover',
		description: 'Simple header without cover image',
		category: 'minimal',
		tier: 'free',
		config: {
			hasCover: false,
			avatarSize: 'lg',
			avatarShape: 'circle',
			avatarPosition: 'center',
			contentAlign: 'center',
			showBio: true,
			spacing: 'comfortable'
		},
		sortOrder: 1
	},
	'with-cover': {
		id: 'with-cover',
		key: 'with-cover',
		name: 'With Cover',
		description: 'Header with cover image and overlapping avatar',
		category: 'standard',
		tier: 'free',
		config: {
			hasCover: true,
			coverHeight: 'md',
			coverType: 'image',
			coverValue: '/presets/images/cover-demo.jpg',
			avatarSize: 'lg',
			avatarShape: 'circle',
			avatarPosition: 'overlap',
			avatarBorder: true,
			avatarBorderColor: '#ffffff',
			contentAlign: 'center',
			showBio: true,
			spacing: 'comfortable'
		},
		sortOrder: 2
	},
	'avatar-cover': {
		id: 'avatar-cover',
		key: 'avatar-cover',
		name: 'Avatar Cover',
		description: 'Full-screen avatar with text overlay',
		category: 'creative',
		tier: 'free',
		config: {
			hasCover: true,
			coverHeight: 'lg',
			coverType: 'image',
			coverValue: '/presets/images/cover-demo.jpg',
			avatarSize: 'sm',
			avatarShape: 'circle',
			avatarPosition: 'center',
			avatarBorder: false,
			contentAlign: 'center',
			showBio: true,
			spacing: 'comfortable'
		},
		sortOrder: 3
	}
};

// Get all header presets
app.get('/', async (c) => {
	try {
		const presets = Object.values(HEADER_PRESETS);
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
		const preset = HEADER_PRESETS[key as keyof typeof HEADER_PRESETS];
		
		if (!preset) {
			return c.json({ error: 'Header preset not found' }, 404);
		}
		
		return c.json({ preset });
	} catch (error: any) {
		console.error('Error fetching header preset:', error);
		return c.json({ error: 'Failed to fetch header preset' }, 500);
	}
});

export default app;
