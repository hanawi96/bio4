-- Add border width to all existing themes
-- Default: 1px for all themes

UPDATE theme_presets
SET config = json_set(
    config,
    '$.semantic.border.width',
    1
)
WHERE json_extract(config, '$.semantic.border.width') IS NULL;
