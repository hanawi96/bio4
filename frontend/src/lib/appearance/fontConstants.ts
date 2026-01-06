// Shared font list for theme editor and appearance page
export interface FontOption {
	name: string;
	category: string;
	value: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
	{ name: 'Inter', category: 'Sans Serif', value: 'Inter, system-ui, -apple-system, sans-serif' },
	{ name: 'Poppins', category: 'Sans Serif', value: 'Poppins, sans-serif' },
	{ name: 'Roboto', category: 'Sans Serif', value: 'Roboto, sans-serif' },
	{ name: 'Open Sans', category: 'Sans Serif', value: 'Open Sans, sans-serif' },
	{ name: 'Montserrat', category: 'Sans Serif', value: 'Montserrat, sans-serif' },
	{ name: 'Lato', category: 'Sans Serif', value: 'Lato, sans-serif' },
	{ name: 'Playfair Display', category: 'Serif', value: 'Playfair Display, serif' },
	{ name: 'Merriweather', category: 'Serif', value: 'Merriweather, serif' },
	{ name: 'Crimson Text', category: 'Serif', value: 'Crimson Text, serif' },
	{ name: 'Space Mono', category: 'Monospace', value: 'Space Mono, monospace' },
	{ name: 'JetBrains Mono', category: 'Monospace', value: 'JetBrains Mono, monospace' },
	{ name: 'Pacifico', category: 'Display', value: 'Pacifico, cursive' },
	{ name: 'System Default', category: 'System', value: 'system-ui, -apple-system, sans-serif' }
];

// Helper to find font by name or value
export function findFont(fontString: string): FontOption | undefined {
	if (!fontString) return undefined;
	
	// Try exact match first
	const exactMatch = AVAILABLE_FONTS.find(f => f.value === fontString);
	if (exactMatch) return exactMatch;
	
	// Try partial match (check if font name is in the string)
	return AVAILABLE_FONTS.find(f => fontString.includes(f.name));
}
