import { Hono } from 'hono';
import type { Bindings } from '../types';
import { getPageByUsername, createSubscriber } from '../db';

const app = new Hono<{ Bindings: Bindings }>();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common disposable email domains to block
const DISPOSABLE_DOMAINS = [
	'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
	'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
	'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com'
];

function isDisposableEmail(email: string): boolean {
	const domain = email.split('@')[1]?.toLowerCase();
	return DISPOSABLE_DOMAINS.some(d => domain === d || domain?.endsWith('.' + d));
}

// POST /subscribe/:username - Subscribe to a bio page
app.post('/:username', async (c) => {
	try {
		const username = c.req.param('username');
		const { email } = await c.req.json();

		// Validate email
		if (!email || typeof email !== 'string') {
			return c.json({ error: 'Email is required' }, 400);
		}

		const trimmedEmail = email.trim().toLowerCase();
		
		if (!EMAIL_REGEX.test(trimmedEmail)) {
			return c.json({ error: 'Invalid email format' }, 400);
		}

		// Block disposable emails
		if (isDisposableEmail(trimmedEmail)) {
			return c.json({ error: 'Temporary email addresses are not allowed' }, 400);
		}

		// Get page
		const page = await getPageByUsername(c.env.DB, username);
		if (!page) {
			return c.json({ error: 'Profile not found' }, 404);
		}

		// Get IP address for basic spam prevention
		const ipAddress = c.req.header('cf-connecting-ip') || 
						  c.req.header('x-forwarded-for') || 
						  c.req.header('x-real-ip') || 
						  null;

		// Create subscriber
		try {
			await createSubscriber(c.env.DB, page.id, trimmedEmail, ipAddress || undefined);
			
			return c.json({
				success: true,
				message: 'Successfully subscribed!'
			});
		} catch (error: any) {
			if (error.message === 'EMAIL_ALREADY_SUBSCRIBED') {
				return c.json({ error: 'You are already subscribed!' }, 400);
			}
			throw error;
		}
	} catch (error: any) {
		console.error('Subscribe error:', error);
		return c.json({ error: 'Failed to subscribe. Please try again.' }, 500);
	}
});

export default app;
