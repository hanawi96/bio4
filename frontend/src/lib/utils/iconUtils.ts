import { tablerIcons } from '$lib/data/tablerIcons';

export interface ParsedIcon {
	type: 'image' | 'icon';
	value: string;
	svg?: string;
}

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
