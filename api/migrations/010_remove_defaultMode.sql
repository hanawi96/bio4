-- ============================================
-- Migration: Remove defaultMode from theme meta
-- Version: 2.2.2
-- ============================================
-- Description: Remove 'meta.defaultMode' field
-- ============================================

-- Remove defaultMode from all themes
UPDATE theme_presets 
SET config = json_remove(config, '$.meta.defaultMode')
WHERE json_extract(config, '$.meta.defaultMode') IS NOT NULL;

-- Update version
UPDATE theme_presets
SET config = json_set(config, '$.meta.version', '2.2.2');

-- Verify the update
SELECT 
    key,
    name,
    json_extract(config, '$.meta.version') as version,
    json_extract(config, '$.meta.defaultMode') as defaultMode
FROM theme_presets
ORDER BY key;
