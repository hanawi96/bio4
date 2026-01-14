import { createClient } from '@libsql/client';
import { hashPassword } from './src/utils/auth';

// Load environment variables
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
	console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
	process.exit(1);
}

const db = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});

async function resetDemoPassword() {
	const email = 'demo@gmail.com';
	const newPassword = 'demo123'; // Change this to your desired password
	
	console.log(`Resetting password for ${email}...`);
	
	// Hash new password with updated iterations (10000)
	const passwordHash = hashPassword(newPassword);
	
	// Update user password
	const result = await db.execute({
		sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
		args: [passwordHash, email]
	});
	
	console.log(`Password updated! Rows affected: ${result.rowsAffected}`);
	console.log(`New password: ${newPassword}`);
	console.log(`You can now login with email: ${email}`);
}

resetDemoPassword().catch(console.error);
