#!/usr/bin/env node
/**
 * Update theme config in remote D1 database
 * Usage: node update-theme-simple.js [theme-key]
 * Example: node update-theme-simple.js minimal
 */

const fs = require('fs');
const { execSync } = require('child_process');

const themeKey = process.argv[2] || 'minimal';
const themeFile = `migrations/${themeKey}-theme-v2.2-refactored.json`;

console.log(`🚀 Updating theme: ${themeKey}\n`);

try {
  // Read theme config
  if (!fs.existsSync(themeFile)) {
    console.error(`❌ Theme file not found: ${themeFile}`);
    process.exit(1);
  }

  const themeConfig = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const configStr = JSON.stringify(themeConfig).replace(/'/g, "''");
  const sql = `UPDATE theme_presets SET config = '${configStr}' WHERE key = '${themeKey}'`;

  // Write SQL file
  fs.writeFileSync('update-theme.sql', sql);

  // Execute update
  console.log('📡 Executing update on remote database...\n');
  execSync('npx wrangler d1 execute bio-link-db --remote --file=update-theme.sql', { stdio: 'inherit' });

  // Cleanup
  fs.unlinkSync('update-theme.sql');

  console.log(`\n✅ Theme "${themeKey}" updated successfully!`);
} catch (error) {
  console.error('❌ Update failed:', error.message);
  if (fs.existsSync('update-theme.sql')) fs.unlinkSync('update-theme.sql');
  process.exit(1);
}

