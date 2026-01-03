#!/usr/bin/env node
/**
 * Update theme in remote database from theme-demo.json
 * This is simpler than fetching and migrating
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Updating theme from theme-demo.json\n');

try {
  // Read theme-demo.json
  const themeFile = 'migrations/theme-demo.json';
  if (!fs.existsSync(themeFile)) {
    console.error(`❌ File not found: ${themeFile}`);
    process.exit(1);
  }

  const themeConfig = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
  const themeName = themeConfig.meta?.name || 'Theme 1';
  const themeKey = themeConfig.meta?.id?.replace('preset.', '') || 'theme-1';
  
  console.log(`📦 Theme: ${themeName}`);
  console.log(`🔑 Key: ${themeKey}\n`);
  
  // Verify new structure
  const hasNewBlockText = !!themeConfig.semantic?.color?.block?.text;
  const hasNewShadowColor = !!themeConfig.semantic?.color?.shadow?.default;
  const hasOldBlockText = !!themeConfig.tokens?.color?.blockText;
  const hasOldShadowColor = !!themeConfig.tokens?.color?.shadowColor;
  
  console.log('📋 Structure check:');
  console.log(`  semantic.color.block.text: ${hasNewBlockText ? '✓' : '✗'}`);
  console.log(`  semantic.color.shadow.default: ${hasNewShadowColor ? '✓' : '✗'}`);
  console.log(`  tokens.color.blockText: ${hasOldBlockText ? '✗ (should be removed)' : '✓'}`);
  console.log(`  tokens.color.shadowColor: ${hasOldShadowColor ? '✗ (should be removed)' : '✓'}\n`);
  
  if (!hasNewBlockText || !hasNewShadowColor) {
    console.error('❌ theme-demo.json has not been migrated yet!');
    console.error('   Please update theme-demo.json first.');
    process.exit(1);
  }
  
  if (hasOldBlockText || hasOldShadowColor) {
    console.error('❌ theme-demo.json still has old structure!');
    console.error('   Please remove tokens.color.blockText and tokens.color.shadowColor');
    process.exit(1);
  }
  
  // Escape single quotes for SQL
  const configStr = JSON.stringify(themeConfig).replace(/'/g, "''");
  const sql = `UPDATE theme_presets SET config = '${configStr}' WHERE key = '${themeKey}'`;
  
  // Write SQL file
  fs.writeFileSync('update-theme.sql', sql);
  
  // Execute update
  console.log('📡 Updating remote database...\n');
  execSync('npx wrangler d1 execute bio-link-db --remote --file=update-theme.sql', { stdio: 'inherit' });
  
  // Cleanup
  fs.unlinkSync('update-theme.sql');
  
  console.log(`\n✅ Theme "${themeName}" updated successfully!`);
  console.log(`\n📊 Summary:`);
  console.log(`  ✓ blockText moved to semantic.color.block.text`);
  console.log(`  ✓ shadowColor moved to semantic.color.shadow.default`);
  console.log(`  ✓ Old tokens.color references removed`);
  
} catch (error) {
  console.error('\n❌ Update failed:', error.message);
  if (fs.existsSync('update-theme.sql')) fs.unlinkSync('update-theme.sql');
  process.exit(1);
}
