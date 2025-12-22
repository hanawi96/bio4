import { writable, derived, get } from 'svelte/store';
import { page, theme } from './page';
import { api } from '$lib/api.client';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Save status store
export const saveStatus = writable<SaveStatus>('idle');
export const lastSaved = writable<Date | null>(null);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSavedData: string = '';
let isInitialized = false;

// Initialize last saved data (call this after loading data)
export function initializeAutosave() {
	const currentPage = get(page);
	const currentTheme = get(theme);
	if (!currentPage) return;

	lastSavedData = JSON.stringify({
		profile: {
			title: currentPage.title,
			bio: currentPage.bio,
			avatar_url: currentPage.avatar_url
		},
		theme: currentTheme
	});
	isInitialized = true;
}

// Debounced autosave function
export function triggerAutosave(username: string) {
	// Skip if not initialized yet (initial load)
	if (!isInitialized) {
		return;
	}

	// Clear existing timeout
	if (saveTimeout) {
		clearTimeout(saveTimeout);
	}

	// Set saving status
	saveStatus.set('saving');

	// Debounce 1000ms
	saveTimeout = setTimeout(async () => {
		try {
			const currentPage = get(page);
			const currentTheme = get(theme);
			if (!currentPage) return;

			// Serialize current state (profile + appearance)
			const dataToSave = JSON.stringify({
				profile: {
					title: currentPage.title,
					bio: currentPage.bio,
					avatar_url: currentPage.avatar_url
				},
				theme: currentTheme
			});

			// Skip if data hasn't changed
			if (dataToSave === lastSavedData) {
				saveStatus.set('saved');
				setTimeout(() => {
					if (get(saveStatus) === 'saved') {
						saveStatus.set('idle');
					}
				}, 1000);
				return;
			}

			// Save draft (profile + theme)
			await api.saveDraft(username, {
				title: currentPage.title,
				bio: currentPage.bio,
				avatar_url: currentPage.avatar_url,
				theme: currentTheme
			});

			lastSavedData = dataToSave;
			lastSaved.set(new Date());
			saveStatus.set('saved');

			// Reset to idle after 2s
			setTimeout(() => {
				if (get(saveStatus) === 'saved') {
					saveStatus.set('idle');
				}
			}, 2000);
		} catch (error) {
			console.error('Autosave failed:', error);
			saveStatus.set('error');
		}
	}, 1000);
}

// Publish function
export async function publishChanges(username: string): Promise<boolean> {
	try {
		saveStatus.set('saving');
		await api.publishPage(username);
		saveStatus.set('saved');
		return true;
	} catch (error) {
		console.error('Publish failed:', error);
		saveStatus.set('error');
		return false;
	}
}
