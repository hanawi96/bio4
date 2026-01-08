import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const apiUrl = env.API_URL || 'http://localhost:8787';
	
	try {
		const res = await fetch(`${apiUrl}/bio/${params.username}`);
		
		if (!res.ok) {
			throw error(404, 'Profile not found');
		}
		
		return res.json();
	} catch (err) {
		console.error('Error loading bio page:', err);
		throw error(500, 'Failed to load profile');
	}
};
