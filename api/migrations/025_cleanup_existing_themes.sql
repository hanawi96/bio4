-- Cleanup existing themes in remote database
-- Remove redundant tokens and fix background structure

-- Step 1: Remove redundant typography tokens
UPDATE theme_presets 
SET config = json_remove(
  json_remove(
    json_remove(
      json_remove(
        json_remove(config, '$.tokens.typography.fontSize'),
        '$.tokens.typography.fontWeight'
      ),
      '$.tokens.typography.lineHeight'
    ),
    '$.semantic.typography.body'
  ),
  '$.semantic.typography.caption'
)
WHERE json_extract(config, '$.tokens.typography.fontSize') IS NOT NULL
   OR json_extract(config, '$.tokens.typography.fontWeight') IS NOT NULL
   OR json_extract(config, '$.tokens.typography.lineHeight') IS NOT NULL
   OR json_extract(config, '$.semantic.typography.body') IS NOT NULL
   OR json_extract(config, '$.semantic.typography.caption') IS NOT NULL;

-- Step 2: Remove background.wallpaper (dead code)
UPDATE theme_presets
SET config = json_remove(config, '$.background.wallpaper')
WHERE json_extract(config, '$.background.wallpaper') IS NOT NULL;

-- Step 3: Remove background.effects.dim (not used)
UPDATE theme_presets
SET config = json_remove(config, '$.background.effects.dim')
WHERE json_extract(config, '$.background.effects.dim') IS NOT NULL;

-- Step 4: Migrate background.videoUrl to new structure (background.type + background.value)
-- For themes that have videoUrl but not the new structure
UPDATE theme_presets
SET config = json_set(
  json_set(
    json_remove(config, '$.background.videoUrl'),
    '$.background.type',
    'video'
  ),
  '$.background.value',
  json_extract(config, '$.background.videoUrl')
)
WHERE json_extract(config, '$.background.videoUrl') IS NOT NULL
  AND json_extract(config, '$.background.type') IS NULL;

-- Step 5: Migrate semantic.color.surface.page to background structure
-- For themes with gradient/image in surface.page but no background.type
UPDATE theme_presets
SET config = CASE
  -- Gradient background
  WHEN json_extract(config, '$.semantic.color.surface.page') LIKE '%gradient%' THEN
    json_set(
      json_set(config, '$.background.type', 'gradient'),
      '$.background.value',
      json_extract(config, '$.semantic.color.surface.page')
    )
  -- Image background
  WHEN json_extract(config, '$.semantic.color.surface.page') LIKE 'url(%' THEN
    json_set(
      json_set(config, '$.background.type', 'image'),
      '$.background.value',
      REPLACE(REPLACE(json_extract(config, '$.semantic.color.surface.page'), 'url(''', ''), ''')', '')
    )
  -- Solid color (keep as is)
  ELSE
    json_set(
      json_set(config, '$.background.type', 'solid'),
      '$.background.value',
      json_extract(config, '$.semantic.color.surface.page')
    )
END
WHERE json_extract(config, '$.background.type') IS NULL;

-- Step 6: Ensure background.effects exists with proper structure
UPDATE theme_presets
SET config = json_set(
  json_set(
    json_set(
      json_set(
        config,
        '$.background.effects.blur',
        COALESCE(json_extract(config, '$.background.effects.blur'), 0)
      ),
      '$.background.effects.brightness',
      COALESCE(json_extract(config, '$.background.effects.brightness'), 100)
    ),
    '$.background.effects.grayscale',
    COALESCE(json_extract(config, '$.background.effects.grayscale'), 0)
  ),
  '$.background.effects.overlayColor',
  COALESCE(json_extract(config, '$.background.effects.overlayColor'), 'ref:tokens.color.overlay.10')
)
WHERE json_extract(config, '$.background') IS NOT NULL;

-- Step 7: Update semantic.color.surface.page to be fallback color only
UPDATE theme_presets
SET config = json_set(
  config,
  '$.semantic.color.surface.page',
  CASE
    WHEN json_extract(config, '$.background.type') = 'solid' THEN
      json_extract(config, '$.background.value')
    ELSE
      '#000000'
  END
)
WHERE json_extract(config, '$.background.type') IS NOT NULL;

-- Verification query (run this to check results):
-- SELECT 
--   key,
--   json_extract(config, '$.background.type') as bg_type,
--   json_extract(config, '$.background.value') as bg_value,
--   json_extract(config, '$.tokens.typography.fontSize') as has_fontSize,
--   json_extract(config, '$.background.wallpaper') as has_wallpaper
-- FROM theme_presets;
