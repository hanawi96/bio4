/// <reference types="@cloudflare/workers-types" />
import type { User } from './types';

// ============ USER OPERATIONS ============

export async function getUserByEmail(db: D1Database, email: string) {
	return db
		.prepare('SELECT * FROM users WHERE email = ?')
		.bind(email)
		.first<User>();
}

export async function createUser(
	db: D1Database,
	data: {
		email: string;
		password_hash: string;
		display_name?: string;
	}
): Promise<User> {
	const result = await db
		.prepare(
			'INSERT INTO users (email, password_hash, display_name, is_active) VALUES (?, ?, ?, ?) RETURNING *'
		)
		.bind(data.email, data.password_hash, data.display_name || null, 1)
		.first<User>();

	return result!;
}

export async function createBioPageForUser(
	db: D1Database,
	userId: number,
	username: string
) {
	const result = await db
		.prepare(
			'INSERT INTO bio_pages (user_id, username, draft_profile, draft_appearance, published_profile, published_appearance, published_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
		)
		.bind(
			userId,
			username,
			JSON.stringify({ title: username, bio: '', avatar_url: null }),
			JSON.stringify({ themePresetKey: 'minimal', overrides: {} }),
			JSON.stringify({ title: username, bio: '', avatar_url: null }),
			JSON.stringify({ themePresetKey: 'minimal', overrides: {} })
		)
		.run();

	return result.meta.last_row_id;
}
