-- ============================================
-- MIGRATION 026: Optimize Theme Tokens
-- ============================================
-- Convert hardcoded values to preset keys for:
-- - borderRadius: number → "lg" | "md" | "sm" etc.
-- - borderWidth: number → "default"
-- - blockPadding: {x,y} → "default" | "tight" | "spacious"
-- - blockGap: number → "default" | "compact" | "spacious"
-- Also remove unused elevation tokens

-- Update borderRadius to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.defaults.borderRadius',
    CASE 
        WHEN CAST(json_extract(config, '$.page.defaults.borderRadius') AS INTEGER) = 0 THEN 'none'
        WHEN CAST(json_extract(config, '$.page.defaults.borderRadius') AS INTEGER) <= 4 THEN 'sm'
        WHEN CAST(json_extract(config, '$.page.defaults.borderRadius') AS INTEGER) <= 8 THEN 'md'
        WHEN CAST(json_extract(config, '$.page.defaults.borderRadius') AS INTEGER) <= 12 THEN 'lg'
        WHEN CAST(json_extract(config, '$.page.defaults.borderRadius') AS INTEGER) <= 16 THEN 'xl'
        ELSE 'full'
    END
)
WHERE json_extract(config, '$.page.defaults.borderRadius') IS NOT NULL
  AND json_type(json_extract(config, '$.page.defaults.borderRadius')) = 'integer';

-- Update borderWidth to preset key
UPDATE theme_presets
SET config = json_set(config, '$.page.defaults.borderWidth', 'default')
WHERE json_extract(config, '$.page.defaults.borderWidth') IS NOT NULL
  AND json_type(json_extract(config, '$.page.defaults.borderWidth')) = 'integer';

-- Update blockPadding to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.layout.blockPadding',
    CASE 
        WHEN CAST(json_extract(config, '$.page.layout.blockPadding.x') AS INTEGER) <= 12 THEN 'tight'
        WHEN CAST(json_extract(config, '$.page.layout.blockPadding.x') AS INTEGER) <= 16 THEN 'default'
        ELSE 'spacious'
    END
)
WHERE json_extract(config, '$.page.layout.blockPadding.x') IS NOT NULL
  AND json_type(json_extract(config, '$.page.layout.blockPadding')) = 'object';

-- Update blockGap to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.layout.blockGap',
    CASE 
        WHEN CAST(json_extract(config, '$.page.layout.blockGap') AS INTEGER) <= 8 THEN 'compact'
        WHEN CAST(json_extract(config, '$.page.layout.blockGap') AS INTEGER) <= 16 THEN 'default'
        ELSE 'spacious'
    END
)
WHERE json_extract(config, '$.page.layout.blockGap') IS NOT NULL
  AND json_type(json_extract(config, '$.page.layout.blockGap')) = 'integer';

-- Remove unused elevation tokens
UPDATE theme_presets
SET config = json_remove(config, '$.tokens.elevation')
WHERE json_extract(config, '$.tokens.elevation') IS NOT NULL;
