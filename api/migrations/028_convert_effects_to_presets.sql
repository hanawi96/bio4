-- ============================================
-- MIGRATION 028: Convert Visual Effects to Preset Keys
-- ============================================
-- Convert hardcoded effect values to preset keys:
-- - blur: 0 → "none", 5 → "subtle", 10 → "medium", etc.
-- - brightness: 50 → "darkest", 75 → "dark", 100 → "normal", etc.
-- - grayscale: 0 → "none", 25 → "subtle", 50 → "medium", etc.

-- Update blur to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.background.effects.blur',
    CASE 
        WHEN CAST(json_extract(config, '$.background.effects.blur') AS INTEGER) = 0 THEN 'none'
        WHEN CAST(json_extract(config, '$.background.effects.blur') AS INTEGER) <= 5 THEN 'subtle'
        WHEN CAST(json_extract(config, '$.background.effects.blur') AS INTEGER) <= 10 THEN 'medium'
        WHEN CAST(json_extract(config, '$.background.effects.blur') AS INTEGER) <= 20 THEN 'strong'
        WHEN CAST(json_extract(config, '$.background.effects.blur') AS INTEGER) <= 40 THEN 'extreme'
        ELSE json_extract(config, '$.background.effects.blur') -- Keep custom values
    END
)
WHERE json_extract(config, '$.background.effects.blur') IS NOT NULL
  AND json_type(json_extract(config, '$.background.effects.blur')) = 'integer';

-- Update brightness to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.background.effects.brightness',
    CASE 
        WHEN CAST(json_extract(config, '$.background.effects.brightness') AS INTEGER) <= 50 THEN 'darkest'
        WHEN CAST(json_extract(config, '$.background.effects.brightness') AS INTEGER) <= 75 THEN 'dark'
        WHEN CAST(json_extract(config, '$.background.effects.brightness') AS INTEGER) <= 100 THEN 'normal'
        WHEN CAST(json_extract(config, '$.background.effects.brightness') AS INTEGER) <= 125 THEN 'bright'
        WHEN CAST(json_extract(config, '$.background.effects.brightness') AS INTEGER) <= 150 THEN 'brightest'
        ELSE json_extract(config, '$.background.effects.brightness') -- Keep custom values
    END
)
WHERE json_extract(config, '$.background.effects.brightness') IS NOT NULL
  AND json_type(json_extract(config, '$.background.effects.brightness')) = 'integer';

-- Update grayscale to preset keys
UPDATE theme_presets
SET config = json_set(
    config,
    '$.background.effects.grayscale',
    CASE 
        WHEN CAST(json_extract(config, '$.background.effects.grayscale') AS INTEGER) = 0 THEN 'none'
        WHEN CAST(json_extract(config, '$.background.effects.grayscale') AS INTEGER) <= 25 THEN 'subtle'
        WHEN CAST(json_extract(config, '$.background.effects.grayscale') AS INTEGER) <= 50 THEN 'medium'
        WHEN CAST(json_extract(config, '$.background.effects.grayscale') AS INTEGER) <= 75 THEN 'strong'
        WHEN CAST(json_extract(config, '$.background.effects.grayscale') AS INTEGER) <= 100 THEN 'full'
        ELSE json_extract(config, '$.background.effects.grayscale') -- Keep custom values
    END
)
WHERE json_extract(config, '$.background.effects.grayscale') IS NOT NULL
  AND json_type(json_extract(config, '$.background.effects.grayscale')) = 'integer';

-- Verify changes
SELECT 
    key,
    name,
    json_extract(config, '$.background.effects.blur') as blur,
    json_extract(config, '$.background.effects.brightness') as brightness,
    json_extract(config, '$.background.effects.grayscale') as grayscale
FROM theme_presets
WHERE key != 'custom'
ORDER BY key;
