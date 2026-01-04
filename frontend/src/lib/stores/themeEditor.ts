import { writable } from 'svelte/store';

interface ThemeEditorState {
	isActive: boolean;
	mode: 'create' | 'edit' | null;
	themeName: string;
	saving: boolean;
	handleSave: (() => Promise<void>) | null;
	handleCancel: (() => void) | null;
	handleReset: (() => void) | null;
}

function createThemeEditorStore() {
	const { subscribe, set, update } = writable<ThemeEditorState>({
		isActive: false,
		mode: null,
		themeName: '',
		saving: false,
		handleSave: null,
		handleCancel: null,
		handleReset: null
	});

	return {
		subscribe,
		activate: (
			mode: 'create' | 'edit', 
			themeName: string, 
			handleSave: () => Promise<void>, 
			handleCancel: () => void,
			handleReset?: () => void
		) => {
			update(state => ({
				...state,
				isActive: true,
				mode,
				themeName,
				handleSave,
				handleCancel,
				handleReset: handleReset ?? null
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
				handleCancel: null,
				handleReset: null
			});
		}
	};
}

export const themeEditor = createThemeEditorStore();
