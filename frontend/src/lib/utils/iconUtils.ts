export type IconType = 'none' | 'image' | 'iconify' | 'giphy';

// Layout types for icon display
export type IconLayout = 'list-left' | 'list-top' | 'grid' | 'card' | 'editor';

// Icon display configuration
export interface IconDisplayConfig {
	objectFit: 'cover' | 'contain';
	padding: string; // Tailwind padding class
}

// Get icon display style based on type and layout
export function getIconDisplayStyle(iconType: IconType, layout: IconLayout): IconDisplayConfig {
	const isIconify = iconType === 'iconify';

	// Image and GIF always use object-cover, no padding
	if (!isIconify) {
		return { objectFit: 'cover', padding: '' };
	}

	// Iconify uses object-contain with layout-specific padding
	const paddingMap: Record<IconLayout, string> = {
		'list-left': 'p-1',   // 32x32 container, small padding
		'list-top': 'p-1.5', // 40x40 container, medium padding
		'grid': 'p-4',       // Full width container, large padding
		'card': 'p-3',       // % width container, medium-large padding
		'editor': 'p-3'      // 96x96 preview, large padding
	};

	return {
		objectFit: 'contain',
		padding: paddingMap[layout]
	};
}

// Get CSS classes for icon image element
export function getIconClasses(iconType: IconType, layout: IconLayout, baseClasses = ''): string {
	const config = getIconDisplayStyle(iconType, layout);
	const fitClass = config.objectFit === 'cover' ? 'object-cover' : 'object-contain';
	return `${baseClasses} ${fitClass} ${config.padding}`.trim();
}

// Convert icon type and data to display URL
export function getIconUrl(iconType: IconType, iconData: string | null, iconColor?: string | null): string | null {
	if (!iconData) return null;

	if (iconType === 'iconify') {
		// Convert 'tabler:brand-github' to 'https://api.iconify.design/tabler/brand-github.svg'
		const baseUrl = `https://api.iconify.design/${iconData.replace(':', '/')}.svg`;
		
		// Append color parameter if provided (remove # from hex)
		if (iconColor) {
			const colorParam = iconColor.startsWith('#') ? iconColor.slice(1) : iconColor;
			return `${baseUrl}?color=%23${colorParam}`;
		}
		
		return baseUrl;
	}

	if (iconType === 'image') {
		return iconData; // Direct URL from R2
	}

	if (iconType === 'giphy') {
		// Giphy ID to CDN URL
		return `https://i.giphy.com/media/${iconData}/200w.gif`;
	}

	return null;
}

// Search icons from Iconify API
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

// Preset colors for icon color picker
export const ICON_COLOR_PRESETS = [
	{ name: 'Black', value: '#000000' },
	{ name: 'White', value: '#ffffff' },
	{ name: 'Gray', value: '#6b7280' },
	{ name: 'Red', value: '#ef4444' },
	{ name: 'Orange', value: '#f97316' },
	{ name: 'Yellow', value: '#eab308' },
	{ name: 'Green', value: '#22c55e' },
	{ name: 'Blue', value: '#3b82f6' },
	{ name: 'Purple', value: '#a855f7' },
	{ name: 'Pink', value: '#ec4899' },
];
