-- Migration: Add linkIconShape to theme configs
-- This updates existing themes to include the new linkIconShape field

-- Update minimal theme
UPDATE theme_presets 
SET config = json_set(config, '$.page.defaults.linkIconShape', 'rounded')
WHERE key = 'minimal' 
  AND json_extract(config, '$.page.defaults.linkIconShape') IS NULL;

-- Update any other themes that don't have linkIconShape
UPDATE theme_presets 
SET config = json_set(config, '$.page.defaults.linkIconShape', 'rounded')
WHERE json_extract(config, '$.page.defaults') IS NOT NULL
  AND json_extract(config, '$.page.defaults.linkIconShape') IS NULL;
