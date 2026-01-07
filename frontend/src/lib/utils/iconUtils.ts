import { tablerIcons } from '$lib/data/tablerIcons';

export interface ParsedIcon {
	type: 'image' | 'icon';
	value: string;
	svg?: string;
}

export type IconType = 'none' | 'image' | 'iconify';

/**
 * Parse icon_url to determine if it's an image URL or icon ID
 * @param iconUrl - The icon_url from database (e.g., "icon:home" or "https://...")
 * @returns Parsed icon object with type and value
 */
export function parseIconUrl(iconUrl: string | null | undefined): ParsedIcon | null {
	if (!iconUrl) return null;

	// Check if it's an icon reference (format: "icon:iconId")
	if (iconUrl.startsWith('icon:')) {
		const iconId = iconUrl.replace('icon:', '');
		const icon = tablerIcons.find(i => i.id === iconId);
		
		return {
			type: 'icon',
			value: iconId,
			svg: icon?.svg
		};
	}

	// Otherwise, it's an image URL
	return {
		type: 'image',
		value: iconUrl
	};
}

/**
 * Get icon SVG by icon ID
 * @param iconId - The icon ID (e.g., "home", "star")
 * @returns SVG string or null if not found
 */
export function getIconSvg(iconId: string): string | null {
	const icon = tablerIcons.find(i => i.id === iconId);
	return icon?.svg || null;
}

/**
 * Check if icon_url is an icon reference
 * @param iconUrl - The icon_url from database
 * @returns true if it's an icon reference
 */
export function isIconReference(iconUrl: string | null | undefined): boolean {
	return !!iconUrl && iconUrl.startsWith('icon:');
}

// NEW: Convert icon type and data to display URL
export function getIconUrl(iconType: IconType, iconData: string | null): string | null {
	if (!iconData) return null;
	
	if (iconType === 'iconify') {
		// Convert 'tabler:brand-github' to 'https://api.iconify.design/tabler/brand-github.svg'
		return `https://api.iconify.design/${iconData.replace(':', '/')}.svg`;
	}
	
	if (iconType === 'image') {
		return iconData; // Direct URL from R2
	}
	
	return null;
}

// NEW: Search icons from Iconify API
export async function searchIconifyIcons(query: string, limit = 64): Promise<string[]> {
	try {
		const res = await fetch(
			`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}&prefixes=tabler,mdi,heroicons,lucide,fa6-brands`
		);
		const data = await res.json();
		return data.icons || [];
	} catch (error) {
		console.error('Failed to search icons:', error);
		return [];
	}
}

// NEW: Get icon collections info
export async function getIconCollections(): Promise<any> {
	try {
		const res = await fetch('https://api.iconify.design/collections');
		return await res.json();
	} catch (error) {
		console.error('Failed to get collections:', error);
		return {};
	}
}
