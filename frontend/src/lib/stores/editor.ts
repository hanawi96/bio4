import { writable, derived, get } from 'svelte/store';
import { page, groups, blocks, theme } from './page';

// Editor UI state
export const editorState = writable({
	activeTab: 'appearance' as 'appearance' | 'links' | 'blocks' | 'settings',
	previewMode: 'mobile' as 'desktop' | 'mobile',
	selectedGroupId: null as number | null,
	selectedBlockId: null as number | null,
	isSaving: false,
	lastSaved: null as Date | null
});

// Track unsaved changes
export const isDirty = writable(false);

// Mark as dirty when any data changes
page.subscribe(() => isDirty.set(true));
groups.subscribe(() => isDirty.set(true));
blocks.subscribe(() => isDirty.set(true));

// Helper to update page field
export function updatePageField<K extends keyof import('../types').BioPage>(
	field: K,
	value: import('../types').BioPage[K]
) {
	page.update(p => p ? { ...p, [field]: value } : p);
}

// Helper to add new link to group
export function addLinkToGroup(groupId: number, link: Omit<import('../types').Link, 'id' | 'group_id' | 'created_at' | 'updated_at'>) {
	groups.update(gs => gs.map(g => {
		if (g.id === groupId) {
			return {
				...g,
				links: [...g.links, { ...link, id: Date.now(), group_id: groupId } as import('../types').Link]
			};
		}
		return g;
	}));
}

// Helper to update link
export function updateLink(linkId: number, updates: Partial<import('../types').Link>) {
	groups.update(gs => gs.map(g => ({
		...g,
		links: g.links.map(l => l.id === linkId ? { ...l, ...updates } : l)
	})));
}

// Helper to delete link
export function deleteLink(linkId: number) {
	groups.update(gs => gs.map(g => ({
		...g,
		links: g.links.filter(l => l.id !== linkId)
	})));
}

// Helper to reorder links in group
export function reorderLinks(groupId: number, linkIds: number[]) {
	groups.update(gs => gs.map(g => {
		if (g.id === groupId) {
			const reordered = linkIds.map((id, index) => {
				const link = g.links.find(l => l.id === id);
				return link ? { ...link, sort_order: index } : null;
			}).filter(Boolean) as import('../types').Link[];
			return { ...g, links: reordered };
		}
		return g;
	}));
}
