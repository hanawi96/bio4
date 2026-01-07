export type IconType = 'none' | 'image' | 'iconify';

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

	// Image always uses object-cover, no padding
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
