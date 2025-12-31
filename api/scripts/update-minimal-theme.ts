// Script to update minimal theme with linkIconShape field
// Usage: npx tsx api/scripts/update-minimal-theme.ts

import { readFileSync } from 'fs';
import { resolve } from 'path';

const CLOUDFLARE_API_URL = process.env.API_URL || 'http://localhost:8787';

async function updateMinimalTheme() {
	try {
		// Read updated theme JSON
		const themeJson = readFileSync(resolve('api/migrations/minimal-theme-v2.2-refactored.json'), 'utf-8');
		const config = JSON.parse(themeJson);
		
		console.log('📦 Updating minimal theme with linkIconShape...');
		console.log('   linkIconShape:', config.page?.defaults?.linkIconShape);
		
		// Since there's no UPDATE endpoint, we need to:
		// 1. Delete the theme (will fail if in use)
		// 2. Re-create with new config
		
		console.log('\n🗑️  Attempting to delete old theme...');
		const deleteResponse = await fetch(`${CLOUDFLARE_API_URL}/themes/minimal`, {
			method: 'DELETE'
		});
		
		if (!deleteResponse.ok) {
			const error = await deleteResponse.json();
			if (error.error?.includes('currently in use')) {
				console.log('⚠️  Theme is in use. Will create with different key and you can switch manually.');
				// Create with temporary key
				const tempKey = 'minimal-updated';
				console.log(`\n📝 Creating theme with key: ${tempKey}`);
				
				const createResponse = await fetch(`${CLOUDFLARE_API_URL}/themes`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						key: tempKey,
						name: config.meta.name + ' (Updated)',
						config,
						description: config.meta.description,
						category: config.meta.category,
						tier: config.meta.tier
					})
				});
				
				if (!createResponse.ok) {
					const createError = await createResponse.json();
					throw new Error(createError.error || 'Failed to create theme');
				}
				
				const result = await createResponse.json();
				console.log('✅ Theme created successfully!');
				console.log(`   Key: ${result.key}`);
				console.log(`   ID: ${result.id}`);
				console.log('\n💡 To use this theme:');
				console.log('   1. Go to /dashboard/appearance');
				console.log(`   2. Select theme: ${config.meta.name} (Updated)`);
				console.log('   3. After testing, you can delete the old minimal theme');
				return;
			}
			throw new Error(error.error || 'Failed to delete theme');
		}
		
		console.log('✅ Old theme deleted');
		
		// Re-create theme
		console.log('\n📝 Creating updated theme...');
		const createResponse = await fetch(`${CLOUDFLARE_API_URL}/themes`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				key: 'minimal',
				name: config.meta.name,
				config,
				description: config.meta.description,
				category: config.meta.category,
				tier: config.meta.tier
			})
		});
		
		if (!createResponse.ok) {
			const error = await createResponse.json();
			throw new Error(error.error || 'Failed to create theme');
		}
		
		const result = await createResponse.json();
		console.log('✅ Theme updated successfully!');
		console.log(`   Key: ${result.key}`);
		console.log(`   ID: ${result.id}`);
		console.log('\n💡 The minimal theme now includes linkIconShape field!');
		
	} catch (error: any) {
		console.error('❌ Failed to update theme:', error.message);
		process.exit(1);
	}
}

updateMinimalTheme();
