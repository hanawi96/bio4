import { API_BASE_URL } from '$lib/constants';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`${API_BASE_URL}/bio/${params.username}`);
	
	if (!res.ok) {
		throw error(404, 'Profile not found');
	}
	
	return res.json();
};
