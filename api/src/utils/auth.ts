import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { SignJWT, jwtVerify } from 'jose';

const PBKDF2_ITERATIONS = 10000; // Reduced for Cloudflare Workers CPU limits
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

// Hash password using PBKDF2 (synchronous)
export function hashPassword(password: string): string {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const hash = pbkdf2(sha256, password, salt, { c: PBKDF2_ITERATIONS, dkLen: HASH_LENGTH });
	
	// Combine salt + hash and encode as base64
	const combined = new Uint8Array(SALT_LENGTH + HASH_LENGTH);
	combined.set(salt);
	combined.set(hash, SALT_LENGTH);
	
	return btoa(String.fromCharCode(...combined));
}

// Verify password (synchronous)
export function verifyPassword(password: string, hashedPassword: string): boolean {
	try {
		const combined = Uint8Array.from(atob(hashedPassword), c => c.charCodeAt(0));
		const salt = combined.slice(0, SALT_LENGTH);
		const originalHash = combined.slice(SALT_LENGTH);
		
		if (originalHash.length !== HASH_LENGTH) return false;
		
		const hash = pbkdf2(sha256, password, salt, { c: PBKDF2_ITERATIONS, dkLen: HASH_LENGTH });
		
		// Constant-time comparison
		let result = 0;
		for (let i = 0; i < HASH_LENGTH; i++) {
			result |= hash[i] ^ originalHash[i];
		}
		
		return result === 0;
	} catch {
		return false;
	}
}

// Generate JWT token
export async function generateToken(userId: number, secret: string): Promise<string> {
	const secretKey = new TextEncoder().encode(secret);
	
	return await new SignJWT({ userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secretKey);
}

// Verify JWT token
export async function verifyToken(token: string, secret: string): Promise<{ userId: number } | null> {
	try {
		const secretKey = new TextEncoder().encode(secret);
		const { payload } = await jwtVerify(token, secretKey);
		
		return typeof payload.userId === 'number' ? { userId: payload.userId } : null;
	} catch {
		return null;
	}
}
