-- Add block padding X/Y to all existing themes
-- Default: paddingX=16px, paddingY=12px (matching current py-3 px-4)
-- Store in page.layout.blockPadding for consistency with blockGap

UPDATE theme_presets
SET config = json_set(
    json_set(
        config,
        '$.page.layout.blockPadding.x',
        16
    ),
    '$.page.layout.blockPadding.y',
    12
)
WHERE json_extract(config, '$.page.layout.blockPadding') IS NULL;
