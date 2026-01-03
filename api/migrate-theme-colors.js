#!/usr/bin/env node
/**
 * Migrate theme colors: Move blockText and shadowColor from tokens to semantic
 * This updates all themes in the remote D1 database
 * Usage: node migrate-theme-colors.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting theme color migration...\n');
console.log('📋 Changes:');
console.log('  - Move tokens.color.blockText → semantic.color.block.text');
console.log('  - Move tokens.color.shadowColor → semantic.color.shadow.default');
console.log('  - Remove ref:tokens.color.blockText references\n');

try {
  // Step 1: Fetch all themes
  console.log('📡 Fetching themes from database...');
  const fetchSql = `SELECT id, key, name, config FROM theme_presets`;
  fs.writeFileSync('fetch-themes.sql', fetchSql);
  
  const result = execSync('npx wrangler d1 execute bio-link-db --remote --file=fetch-themes.sql --json', { encoding: 'utf8' });
  fs.unlinkSync('fetch-themes.sql');
  
  // Parse JSON - wrangler may output extra lines, find the JSON array
  let data;
  try {
    // Try direct parse first
    data = JSON.parse(result);
  } catch (e) {
    // If failed, find JSON in output
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('[')) {
        try {
          data = JSON.parse(line);
          break;
        } catch {}
      }
    }
    if (!data) throw new Error('Could not parse wrangler output');
  }
  
  const themes = data[0]?.results || [];
  
  if (themes.length === 0) {
    console.log('⚠️  No themes found in database');
    process.exit(0);
  }
  
  console.log(`✓ Found ${themes.length} theme(s)\n`);
  
  // Step 2: Migrate each theme
  const updates = [];
  
  for (const theme of themes) {
    console.log(`🔄 Migrating: ${theme.name} (${theme.key})`);
    
    let config;
    try {
      config = JSON.parse(theme.config);
    } catch (e) {
      console.log(`  ⚠️  Skipped: Invalid JSON`);
      continue;
    }
    
    let modified = false;
    
    // Check if migration needed
    const hasOldBlockText = config.tokens?.color?.blockText;
    const hasOldShadowColor = config.tokens?.color?.shadowColor;
    const hasRefBlockText = config.semantic?.color?.block?.text?.startsWith?.('ref:tokens.color.blockText');
    
    if (!hasOldBlockText && !hasOldShadowColor && !hasRefBlockText) {
      console.log(`  ✓ Already migrated\n`);
      continue;
    }
    
    // Migrate blockText
    if (hasOldBlockText) {
      if (!config.semantic) config.semantic = {};
      if (!config.semantic.color) config.semantic.color = {};
      if (!config.semantic.color.block) config.semantic.color.block = {};
      
      config.semantic.color.block.text = config.tokens.color.blockText;
      delete config.tokens.color.blockText;
      modified = true;
      console.log(`  ✓ Moved blockText: ${config.semantic.color.block.text}`);
    }
    
    // Migrate shadowColor
    if (hasOldShadowColor) {
      if (!config.semantic) config.semantic = {};
      if (!config.semantic.color) config.semantic.color = {};
      if (!config.semantic.color.shadow) config.semantic.color.shadow = {};
      
      config.semantic.color.shadow.default = config.tokens.color.shadowColor;
      delete config.tokens.color.shadowColor;
      modified = true;
      console.log(`  ✓ Moved shadowColor: ${config.semantic.color.shadow.default}`);
    }
    
    // Fix ref if exists
    if (hasRefBlockText) {
      const blockTextValue = config.tokens?.color?.blockText || '#ffffff';
      config.semantic.color.block.text = blockTextValue;
      modified = true;
      console.log(`  ✓ Fixed ref to direct value: ${blockTextValue}`);
    }
    
    if (modified) {
      const configStr = JSON.stringify(config).replace(/'/g, "''");
      updates.push(`UPDATE theme_presets SET config = '${configStr}' WHERE id = ${theme.id};`);
      console.log(`  ✅ Prepared for update\n`);
    }
  }
  
  if (updates.length === 0) {
    console.log('✅ All themes already migrated!');
    process.exit(0);
  }
  
  // Step 3: Execute updates
  console.log(`📡 Updating ${updates.length} theme(s) in database...\n`);
  const updateSql = updates.join('\n');
  fs.writeFileSync('migrate-themes.sql', updateSql);
  
  execSync('npx wrangler d1 execute bio-link-db --remote --file=migrate-themes.sql', { stdio: 'inherit' });
  fs.unlinkSync('migrate-themes.sql');
  
  console.log(`\n✅ Migration completed successfully!`);
  console.log(`📊 Updated ${updates.length} theme(s)`);
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  if (fs.existsSync('fetch-themes.sql')) fs.unlinkSync('fetch-themes.sql');
  if (fs.existsSync('migrate-themes.sql')) fs.unlinkSync('migrate-themes.sql');
  process.exit(1);
}
