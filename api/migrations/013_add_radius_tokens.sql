-- Add radius tokens to all theme presets
-- This migration adds tokens.radius to themes that don't have it yet

-- Update minimal-pro theme
UPDATE theme_presets 
SET config_v2 = json_patch(
  config_v2,
  json('{"tokens": {"radius": {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999}}}')
)
WHERE key = 'minimal-pro' AND json_extract(config_v2, '$.tokens.radius') IS NULL;

-- Update minimal theme
UPDATE theme_presets 
SET config_v2 = json_patch(
  config_v2,
  json('{"tokens": {"radius": {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999}}}')
)
WHERE key = 'minimal' AND json_extract(config_v2, '$.tokens.radius') IS NULL;

-- Update dark theme
UPDATE theme_presets 
SET config_v2 = json_patch(
  config_v2,
  json('{"tokens": {"radius": {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999}}}')
)
WHERE key = 'dark' AND json_extract(config_v2, '$.tokens.radius') IS NULL;

-- Update gradient theme
UPDATE theme_presets 
SET config_v2 = json_patch(
  config_v2,
  json('{"tokens": {"radius": {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999}}}')
)
WHERE key = 'gradient' AND json_extract(config_v2, '$.tokens.radius') IS NULL;
