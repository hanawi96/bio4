import { writable, derived } from 'svelte/store';
import type { BioPage, LinkGroup, Block, ThemeConfig } from '../types';

// Page data store
export const page = writable<BioPage | null>(null);

// Link groups with links
export const groups = writable<LinkGroup[]>([]);

// Content blocks
export const blocks = writable<Block[]>([]);

// Current theme config
export const theme = writable<ThemeConfig | null>(null);

// Derived: all links flat
export const allLinks = derived(groups, ($groups) => {
	return $groups.flatMap(g => g.links);
});

// Derived: active links only
export const activeLinks = derived(groups, ($groups) => {
	return $groups.flatMap(g => g.links.filter(l => l.is_active === 1));
});

// Derived: visible blocks only
export const visibleBlocks = derived(blocks, ($blocks) => {
	return $blocks.filter(b => b.is_visible === 1).sort((a, b) => a.sort_order - b.sort_order);
});

// Load all data from API response
export function loadEditorData(data: {
	page: BioPage;
	groups: LinkGroup[];
	blocks: Block[];
	theme: ThemeConfig | null;
}) {
	page.set(data.page);
	groups.set(data.groups);
	blocks.set(data.blocks);
	theme.set(data.theme);
}

// Reset all stores
export function resetStores() {
	page.set(null);
	groups.set([]);
	blocks.set([]);
	theme.set(null);
}
