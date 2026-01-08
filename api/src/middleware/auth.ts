import { Context, Next } from 'hono';
import type { Bindings } from '../types';
import { verifyToken } from '../utils/auth';

// Extend Hono context to include userId
export type AuthContext = Context<{ Bindings: Bindings; Variables: { userId: number } }>;

// Middleware to verify JWT token
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
	const authHeader = c.req.header('Authorization');
	
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized - Token không hợp lệ' }, 401);
	}
	
	const token = authHeader.substring(7); // Remove 'Bearer ' prefix
	const payload = await verifyToken(token, c.env.JWT_SECRET);
	
	if (!payload) {
		return c.json({ error: 'Unauthorized - Token không hợp lệ hoặc đã hết hạn' }, 401);
	}
	
	// Set userId in context
	c.set('userId', payload.userId);
	
	await next();
}
