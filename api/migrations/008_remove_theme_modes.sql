-- ============================================
-- Migration: Remove dark mode from themes
-- Version: 2.2.1
-- Date: 2024-01-XX
-- ============================================
-- Description: Remove 'modes' field from theme config
-- Each theme now has only one mode (light or dark)
-- ============================================

-- Update minimal theme - remove modes field and update version
-- SQLite doesn't support jsonb operators, so we need to update the entire config
UPDATE theme_presets 
SET config = json_remove(config, '$.modes')
WHERE key = 'minimal';

-- Update version
UPDATE theme_presets
SET config = json_set(config, '$.meta.version', '2.2.1')
WHERE key = 'minimal';

-- Verify the update
SELECT 
    key,
    name,
    json_extract(config, '$.meta.version') as version,
    json_extract(config, '$.modes') as modes
FROM theme_presets
WHERE key = 'minimal';
