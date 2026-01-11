/**
 * Parse markdown text to HTML
 * Supports: headings (# to ######), bold (**), italic (*), links, highlight (==), divider (---)
 */
export function parseMarkdown(text: string, textAlign: string = 'center'): string {
	if (!text) return '';
	
	const lines = text.split('\n');
	const parsed = lines.map(line => parseLine(line.trim(), textAlign)).filter(Boolean);
	
	return parsed.join('');
}

// Heading configuration: [level, fontSize, fontWeight, lineHeight, margin]
const HEADING_STYLES = [
	[28, 700, 1.2, '16px 0 8px 0'],  // H1
	[22, 600, 1.3, '12px 0 6px 0'],  // H2
	[18, 600, 1.4, '10px 0 4px 0'],  // H3
	[16, 600, 1.4, '8px 0 4px 0'],   // H4
	[15, 600, 1.5, '8px 0 4px 0'],   // H5
	[14, 600, 1.5, '6px 0 3px 0']    // H6
] as const;

function parseLine(line: string, textAlign: string): string {
	if (!line) return '<br>';
	
	// Divider: ---
	if (line === '---') {
		return '<hr style="border: none; border-top: 1px solid currentColor; opacity: 0.2; margin: 16px 0;">';
	}
	
	// Check headings (H6 to H1 - longest match first)
	for (let level = 6; level >= 1; level--) {
		const prefix = '#'.repeat(level);
		if (line.startsWith(prefix) && (line[level] === ' ' || line[level] === undefined || line.length === level)) {
			const content = parseInline(line.slice(level).trim());
			const [fontSize, fontWeight, lineHeight, margin] = HEADING_STYLES[level - 1];
			return `<h${level} style="text-align: ${textAlign}; font-size: ${fontSize}px !important; font-weight: ${fontWeight} !important; line-height: ${lineHeight} !important; margin: ${margin} !important;">${content}</h${level}>`;
		}
	}
	
	// Normal paragraph
	const content = parseInline(line);
	return `<p style="text-align: ${textAlign}; font-size: 16px; line-height: 1.6; margin: 8px 0;">${content}</p>`;
}

function parseInline(text: string): string {
	return text
		// Links: [text](url)
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>')
		// Highlight: ==text==
		.replace(/==([^=]+)==/g, '<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 2px;">$1</mark>')
		// Bold: **text**
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		// Italic: *text*
		.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/**
 * Get plain text preview (remove markdown syntax)
 */
export function getTextPreview(text: string, maxLength: number = 60): string {
	if (!text) return '';
	
	// Remove markdown syntax
	const plain = text
		.replace(/^#{1,6}\s*/gm, '') // Remove headings (1-6 hashes)
		.replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
		.replace(/\*([^*]+)\*/g, '$1') // Remove italic
		.replace(/==([^=]+)==/g, '$1') // Remove highlight
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
		.replace(/---/g, '') // Remove dividers
		.replace(/\n+/g, ' ') // Replace newlines with space
		.trim();
	
	if (plain.length <= maxLength) return plain;
	return plain.slice(0, maxLength) + '...';
}
