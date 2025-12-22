import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Bindings } from './types';

import bioRoutes from './routes/bio';
import editorRoutes from './routes/editor';
import uploadRoutes from './routes/upload';
import linksRoutes from './routes/links';
import blocksRoutes from './routes/blocks';
import themesRoutes from './routes/themes';

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware - Must be before routes
app.use('*', cors({
	origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8787', 'http://127.0.0.1:8787'],
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	exposeHeaders: ['Content-Length'],
	maxAge: 600,
	credentials: true
}));

// Routes
app.route('/bio', bioRoutes);
app.route('/editor', editorRoutes);
app.route('/upload', uploadRoutes);
app.route('/links', linksRoutes);
app.route('/blocks', blocksRoutes);
app.route('/themes', themesRoutes);

// Health check
app.get('/', (c) => c.json({ 
	message: 'Bio Link API',
	version: '1.0.0'
}));

export default app;
