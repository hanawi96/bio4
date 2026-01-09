import { Hono } from 'hono';
import type { Bindings } from '../types';
import { registerSchema, loginSchema } from '../schemas/auth';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { getUserByEmail, createUser, createBioPageForUser } from '../db-auth';
import { authMiddleware, type AuthContext } from '../middleware/auth';
import { getPageByUsername } from '../db';

const auth = new Hono<{ Bindings: Bindings }>();

// Helper: Format user response (exclude sensitive data)
const formatUser = (user: any) => ({
	id: user.id,
	email: user.email,
	display_name: user.display_name,
	avatar_url: user.avatar_url,
	username: user.username
});

// POST /auth/register - Đăng ký tài khoản mới
auth.post('/register', async (c) => {
	try {
		const validatedData = registerSchema.parse(await c.req.json());
		
		// Check if email or username already exists
		const [existingUser, existingPage] = await Promise.all([
			getUserByEmail(c.env.DB, validatedData.email),
			getPageByUsername(c.env.DB, validatedData.username)
		]);
		
		if (existingUser) {
			return c.json({ error: 'Email đã được sử dụng' }, 400);
		}
		
		if (existingPage) {
			return c.json({ error: 'Username đã được sử dụng' }, 400);
		}
		
		// Create user with hashed password
		const user = await createUser(c.env.DB, {
			email: validatedData.email,
			password_hash: hashPassword(validatedData.password),
			display_name: validatedData.display_name
		});
		
		// Create bio page for user
		await createBioPageForUser(c.env.DB, user.id, validatedData.username);
		
		// Generate token
		const token = await generateToken(user.id, c.env.JWT_SECRET);
		
		return c.json({
			message: 'Đăng ký thành công',
			token,
			user: {
				...formatUser(user),
				username: validatedData.username
			}
		}, 201);
		
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return c.json({ error: 'Dữ liệu không hợp lệ', details: error.errors }, 400);
		}
		
		console.error('Register error:', error);
		return c.json({ error: 'Lỗi server' }, 500);
	}
});

// POST /auth/login - Đăng nhập
auth.post('/login', async (c) => {
	try {
		const validatedData = loginSchema.parse(await c.req.json());
		
		// Get user with bio_page username
		const user = await c.env.DB
			.prepare(`
				SELECT u.*, b.username
				FROM users u
				LEFT JOIN bio_pages b ON u.id = b.user_id
				WHERE u.email = ?
			`)
			.bind(validatedData.email)
			.first<any>();
		
		if (!user || !verifyPassword(validatedData.password, user.password_hash as string)) {
			return c.json({ error: 'Email hoặc mật khẩu không đúng' }, 401);
		}
		
		if (!user.is_active) {
			return c.json({ error: 'Tài khoản đã bị vô hiệu hóa' }, 403);
		}
		
		// Generate token
		const token = await generateToken(user.id as number, c.env.JWT_SECRET);
		
		return c.json({
			message: 'Đăng nhập thành công',
			token,
			user: {
				...formatUser(user),
				username: user.username
			}
		});
		
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return c.json({ error: 'Dữ liệu không hợp lệ', details: error.errors }, 400);
		}
		
		console.error('Login error:', error);
		return c.json({ error: 'Lỗi server' }, 500);
	}
});

// GET /auth/me - Lấy thông tin user hiện tại (cần token)
auth.get('/me', authMiddleware, async (c: AuthContext) => {
	try {
		const userId = c.get('userId');
		
		// Get user info with bio_page username
		const user = await c.env.DB
			.prepare(`
				SELECT u.id, u.email, u.display_name, u.avatar_url, u.is_active, u.created_at, b.username
				FROM users u
				LEFT JOIN bio_pages b ON u.id = b.user_id
				WHERE u.id = ?
			`)
			.bind(userId)
			.first();
		
		if (!user) {
			return c.json({ error: 'User không tồn tại' }, 404);
		}
		
		return c.json({ user });
		
	} catch (error) {
		console.error('Get me error:', error);
		return c.json({ error: 'Lỗi server' }, 500);
	}
});

export default auth;
