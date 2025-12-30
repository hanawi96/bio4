-- ============================================
-- Migration: Sync default_header_preset_id and default_block_preset_id
-- Version: 2.2.3
-- ============================================
-- Description: Ensure database columns match config JSON values
-- ============================================

-- Update all themes to sync preset IDs from config
UPDATE theme_presets 
SET 
    default_header_preset_id = COALESCE(
        json_extract(config, '$.page.defaults.headerPresetId'),
        default_header_preset_id,
        'no-cover'
    ),
    default_block_preset_id = COALESCE(
        json_extract(config, '$.page.defaults.blockPresetId'),
        default_block_preset_id,
        'rounded-solid'
    )
WHERE json_extract(config, '$.page.defaults') IS NOT NULL;

-- Verify sync
SELECT 
    id,
    key,
    name,
    default_header_preset_id as db_header,
    json_extract(config, '$.page.defaults.headerPresetId') as config_header,
    default_block_preset_id as db_block,
    json_extract(config, '$.page.defaults.blockPresetId') as config_block,
    CASE 
        WHEN default_header_preset_id = json_extract(config, '$.page.defaults.headerPresetId') 
        THEN '✓ Synced'
        ELSE '✗ Mismatch'
    END as status
FROM theme_presets
ORDER BY id;
