// Script to import theme from JSON file to database
// Usage: npx tsx api/scripts/import-theme.ts <theme-file-path>

import { readFileSync } from 'fs';
import { resolve } from 'path';

const CLOUDFLARE_API_URL = process.env.API_URL || 'http://localhost:8787';

async function importTheme(filePath: string) {
	try {
		// Read theme JSON
		const fullPath = resolve(filePath);
		const themeJson = readFileSync(fullPath, 'utf-8');
		const config = JSON.parse(themeJson);
		
		// Extract metadata
		const name = config.meta?.name || 'Unnamed Theme';
		const key = config.meta?.id?.replace('preset.', '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const description = config.meta?.description || '';
		const category = config.meta?.category || 'minimal';
		const tier = config.meta?.tier || 'free';
		
		console.log(`Importing theme: ${name} (${key})`);
		console.log(`Category: ${category}, Tier: ${tier}`);
		
		// Create theme via API
		const response = await fetch(`${CLOUDFLARE_API_URL}/themes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				key,
				name,
				config,
				description,
				category,
				tier
			})
		});
		
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to import theme');
		}
		
		const result = await response.json();
		console.log('✓ Theme imported successfully!');
		console.log(`  ID: ${result.id}`);
		console.log(`  Key: ${result.key}`);
		
	} catch (error: any) {
		console.error('✗ Failed to import theme:', error.message);
		process.exit(1);
	}
}

// Get file path from command line
const filePath = process.argv[2];
if (!filePath) {
	console.error('Usage: npx tsx api/scripts/import-theme.ts <theme-file-path>');
	console.error('Example: npx tsx api/scripts/import-theme.ts api/migrations/themes/new_theme.json');
	process.exit(1);
}

importTheme(filePath);
