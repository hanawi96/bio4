-- ============================================
-- MIGRATION 027: Convert Layout Values to Preset Keys
-- ============================================
-- Convert hardcoded layout values to preset keys:
-- - maxWidth: 480 → "sm", 640 → "md", etc.
-- - pagePadding: 16 → "default", 8 → "tight", etc.
-- - avatarBorderWidth: 4 → "default", 2 → "thin", etc.

-- Update maxWidth to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.layout.maxWidth',
    CASE 
        WHEN CAST(json_extract(config, '$.page.layout.maxWidth') AS INTEGER) <= 320 THEN 'xs'
        WHEN CAST(json_extract(config, '$.page.layout.maxWidth') AS INTEGER) <= 480 THEN 'sm'
        WHEN CAST(json_extract(config, '$.page.layout.maxWidth') AS INTEGER) <= 640 THEN 'md'
        WHEN CAST(json_extract(config, '$.page.layout.maxWidth') AS INTEGER) <= 768 THEN 'lg'
        WHEN CAST(json_extract(config, '$.page.layout.maxWidth') AS INTEGER) <= 1024 THEN 'xl'
        ELSE json_extract(config, '$.page.layout.maxWidth') -- Keep custom values
    END
)
WHERE json_extract(config, '$.page.layout.maxWidth') IS NOT NULL
  AND json_type(json_extract(config, '$.page.layout.maxWidth')) = 'integer';

-- Update pagePadding to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.layout.pagePadding',
    CASE 
        WHEN CAST(json_extract(config, '$.page.layout.pagePadding') AS INTEGER) = 0 THEN 'none'
        WHEN CAST(json_extract(config, '$.page.layout.pagePadding') AS INTEGER) <= 8 THEN 'tight'
        WHEN CAST(json_extract(config, '$.page.layout.pagePadding') AS INTEGER) <= 16 THEN 'default'
        WHEN CAST(json_extract(config, '$.page.layout.pagePadding') AS INTEGER) <= 24 THEN 'comfortable'
        WHEN CAST(json_extract(config, '$.page.layout.pagePadding') AS INTEGER) <= 32 THEN 'spacious'
        ELSE json_extract(config, '$.page.layout.pagePadding') -- Keep custom values
    END
)
WHERE json_extract(config, '$.page.layout.pagePadding') IS NOT NULL
  AND json_type(json_extract(config, '$.page.layout.pagePadding')) = 'integer';

-- Update avatarBorderWidth to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.page.defaults.avatarBorderWidth',
    CASE 
        WHEN CAST(json_extract(config, '$.page.defaults.avatarBorderWidth') AS INTEGER) = 0 THEN 'none'
        WHEN CAST(json_extract(config, '$.page.defaults.avatarBorderWidth') AS INTEGER) <= 2 THEN 'thin'
        WHEN CAST(json_extract(config, '$.page.defaults.avatarBorderWidth') AS INTEGER) <= 4 THEN 'default'
        WHEN CAST(json_extract(config, '$.page.defaults.avatarBorderWidth') AS INTEGER) <= 6 THEN 'thick'
        WHEN CAST(json_extract(config, '$.page.defaults.avatarBorderWidth') AS INTEGER) <= 8 THEN 'bold'
        ELSE json_extract(config, '$.page.defaults.avatarBorderWidth') -- Keep custom values
    END
)
WHERE json_extract(config, '$.page.defaults.avatarBorderWidth') IS NOT NULL
  AND json_type(json_extract(config, '$.page.defaults.avatarBorderWidth')) = 'integer';

-- Verify changes
SELECT 
    key,
    name,
    json_extract(config, '$.page.layout.maxWidth') as maxWidth,
    json_extract(config, '$.page.layout.pagePadding') as pagePadding,
    json_extract(config, '$.page.defaults.avatarBorderWidth') as avatarBorderWidth
FROM theme_presets
WHERE key != 'custom'
ORDER BY key;
