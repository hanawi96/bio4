import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
	id: number;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	username?: string | null;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
}

const STORAGE_KEY = 'auth_token';

function createAuthStore() {
	const initialState: AuthState = {
		user: null,
		token: null,
		isAuthenticated: false,
		loading: true
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		// Initialize auth from localStorage
		init: () => {
			if (!browser) return;
			
			const token = localStorage.getItem(STORAGE_KEY);
			if (token) {
				update(state => ({ ...state, token, loading: false }));
			} else {
				update(state => ({ ...state, loading: false }));
			}
		},

		// Set authenticated user
		setAuth: (user: User, token: string) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, token);
			}
			set({
				user,
				token,
				isAuthenticated: true,
				loading: false
			});
		},

		// Set user info (after token verification)
		setUser: (user: User) => {
			update(state => ({
				...state,
				user,
				isAuthenticated: true,
				loading: false
			}));
		},

		// Clear auth
		logout: () => {
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
			set({
				user: null,
				token: null,
				isAuthenticated: false,
				loading: false
			});
		},

		// Get token
		getToken: (): string | null => {
			if (!browser) return null;
			return localStorage.getItem(STORAGE_KEY);
		},

		// Get username
		getUsername: (): string | null => {
			let username: string | null = null;
			subscribe(state => {
				username = state.user?.username || null;
			})();
			return username;
		}
	};
}

export const authStore = createAuthStore();
