-- ============================================
-- Migration: Remove dark mode from ALL themes
-- Version: 2.2.1
-- ============================================
-- Description: Remove 'modes' field from all theme configs
-- Each theme now has only one mode
-- ============================================

-- Remove modes from all themes
UPDATE theme_presets 
SET config = json_remove(config, '$.modes')
WHERE json_extract(config, '$.modes') IS NOT NULL;

-- Update version for all themes
UPDATE theme_presets
SET config = json_set(config, '$.meta.version', '2.2.1');

-- Verify the update
SELECT 
    key,
    name,
    json_extract(config, '$.meta.version') as version,
    CASE 
        WHEN json_extract(config, '$.modes') IS NULL THEN 'No' 
        ELSE 'Yes' 
    END as has_modes
FROM theme_presets
ORDER BY key;
