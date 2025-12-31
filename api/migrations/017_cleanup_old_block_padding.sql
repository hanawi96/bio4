-- Remove old blockPadding from semantic.spacing (moved to page.layout)
-- Clean up orphaned data from previous migration

UPDATE theme_presets
SET config = json_remove(config, '$.semantic.spacing.blockPadding')
WHERE json_extract(config, '$.semantic.spacing.blockPadding') IS NOT NULL;
