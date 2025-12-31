-- Final cleanup: Remove all dead code from recipes
-- 1. Remove recipes.linkGroup.base.paddingX/Y (not used, we use page.layout.blockPadding)
-- 2. Remove recipes.link.base (not used in current implementation)
-- 3. Keep only recipes.linkGroup.variants (used for layout variants)

-- Step 1: Remove recipes.linkGroup.base (dead code)
UPDATE theme_presets
SET config = json_remove(config, '$.recipes.linkGroup.base')
WHERE json_extract(config, '$.recipes.linkGroup.base') IS NOT NULL;

-- Step 2: Remove recipes.link (dead code)
UPDATE theme_presets
SET config = json_remove(config, '$.recipes.link')
WHERE json_extract(config, '$.recipes.link') IS NOT NULL;

-- Step 3: If recipes only has linkGroup.variants, keep it. If empty, remove it.
-- (This will be handled automatically - if recipes becomes empty after removals, we can clean later)
