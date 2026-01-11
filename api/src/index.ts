import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Bindings } from './types';
import { createTursoClient, wrapTursoClient } from './turso';

import bioRoutes from './routes/bio';
import editorRoutes from './routes/editor';
import uploadRoutes from './routes/upload';
import linksRoutes from './routes/links';
import blocksRoutes from './routes/blocks';
import themesRoutes from './routes/themes';
import headerPresetsRoutes from './routes/header-presets';
import authRoutes from './routes/auth';
import subscribeRoutes from './routes/subscribe';
import subscribersRoutes from './routes/subscribers';

const app = new Hono<{ Bindings: Bindings }>();

// Cache Turso client per environment
let cachedClient: any = null;
let cachedEnvKey: string = '';

// Middleware to inject Turso client as DB
app.use('*', async (c, next) => {
	try {
		// Create cache key from credentials
		const envKey = `${c.env.TURSO_DATABASE_URL}:${c.env.TURSO_AUTH_TOKEN?.substring(0, 20)}`;
		
		// Reuse client if same environment
		if (!cachedClient || cachedEnvKey !== envKey) {
			console.log('[Turso] Creating new client...');
			cachedClient = createTursoClient(c.env);
			cachedEnvKey = envKey;
		}
		
		const wrappedClient = wrapTursoClient(cachedClient) as any;
		
		// Set in both context and env for compatibility
		c.set('DB', wrappedClient);
		c.env.DB = wrappedClient; // Override env.DB to use Turso instead of D1
		
		await next();
	} catch (error) {
		console.error('[Turso] Middleware error:', error);
		return c.json({ error: 'Database connection failed' }, 500);
	}
});

// CORS middleware - Must be before routes
app.use('*', cors({
	origin: (origin) => {
		// Allow all localhost/127.0.0.1 origins regardless of port
		if (!origin) return '*'; // Allow requests with no origin (like mobile apps or curl)
		
		const allowedOrigins = [
			'http://localhost:5173',
			'http://127.0.0.1:5173',
			'http://localhost:8787',
			'http://127.0.0.1:8787',
			'http://[::1]:5173', // IPv6 localhost
			'http://[::1]:8787'
		];
		
		if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
			return origin;
		}
		return null;
	},
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	exposeHeaders: ['Content-Length'],
	maxAge: 600,
	credentials: true
}));

// Routes
app.route('/auth', authRoutes);
app.route('/bio', bioRoutes);
app.route('/editor', editorRoutes);
app.route('/upload', uploadRoutes);
app.route('/links', linksRoutes);
app.route('/blocks', blocksRoutes);
app.route('/themes', themesRoutes);
app.route('/header-presets', headerPresetsRoutes);
app.route('/subscribe', subscribeRoutes);
app.route('/subscribers', subscribersRoutes);

// Health check
app.get('/', (c) => c.json({ 
	message: 'Bio Link API',
	version: '1.0.0'
}));

export default app;
