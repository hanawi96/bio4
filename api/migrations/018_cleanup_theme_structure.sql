-- Cleanup theme structure for consistency
-- 1. Move border.width from semantic to tokens
-- 2. Remove dead code: recipes.link.base.paddingX/Y
-- 3. Remove empty semantic.spacing

-- Step 1: Move border.width to tokens
UPDATE theme_presets
SET config = json_set(
    config,
    '$.tokens.border.width.default',
    COALESCE(json_extract(config, '$.semantic.border.width'), 1)
)
WHERE json_extract(config, '$.tokens.border.width.default') IS NULL;

-- Step 2: Remove old semantic.border.width
UPDATE theme_presets
SET config = json_remove(config, '$.semantic.border.width')
WHERE json_extract(config, '$.semantic.border.width') IS NOT NULL;

-- Step 3: Remove semantic.border if empty (only has width)
UPDATE theme_presets
SET config = json_remove(config, '$.semantic.border')
WHERE json_extract(config, '$.semantic.border') = '{"width":1}'
   OR json_extract(config, '$.semantic.border') = '{}';

-- Step 4: Remove empty semantic.spacing
UPDATE theme_presets
SET config = json_remove(config, '$.semantic.spacing')
WHERE json_extract(config, '$.semantic.spacing') = '{}'
   OR json_extract(config, '$.semantic.spacing') IS NULL;

-- Step 5: Remove dead code recipes.link.base.paddingX/Y
UPDATE theme_presets
SET config = json_remove(
    json_remove(
        config,
        '$.recipes.link.base.paddingX'
    ),
    '$.recipes.link.base.paddingY'
)
WHERE json_extract(config, '$.recipes.link.base.paddingX') IS NOT NULL
   OR json_extract(config, '$.recipes.link.base.paddingY') IS NOT NULL;
