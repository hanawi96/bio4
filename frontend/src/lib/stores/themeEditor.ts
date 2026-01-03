import { writable } from 'svelte/store';

interface ThemeEditorState {
	isActive: boolean;
	mode: 'create' | 'edit' | null;
	themeName: string;
	saving: boolean;
	handleSave: (() => Promise<void>) | null;
	handleCancel: (() => void) | null;
}

function createThemeEditorStore() {
	const { subscribe, set, update } = writable<ThemeEditorState>({
		isActive: false,
		mode: null,
		themeName: '',
		saving: false,
		handleSave: null,
		handleCancel: null
	});

	return {
		subscribe,
		activate: (mode: 'create' | 'edit', themeName: string, handleSave: () => Promise<void>, handleCancel: () => void) => {
			update(state => ({
				...state,
				isActive: true,
				mode,
				themeName,
				handleSave,
				handleCancel
			}));
		},
		setSaving: (saving: boolean) => {
			update(state => ({ ...state, saving }));
		},
		deactivate: () => {
			set({
				isActive: false,
				mode: null,
				themeName: '',
				saving: false,
				handleSave: null,
				handleCancel: null
			});
		}
	};
}

export const themeEditor = createThemeEditorStore();
