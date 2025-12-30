-- ============================================
-- Migration: Migrate all themes to schema v2
-- Version: 2.2.2
-- ============================================
-- Description: Convert dark, gradient, minimal-pro to v2 schema
-- ============================================

-- Update Dark theme to v2
UPDATE theme_presets 
SET config = json('{"meta":{"id":"preset.dark","name":"Dark","schemaVersion":2,"version":"2.2.2","author":"system","description":"Dark theme with blue accents","tier":"free","category":"dark"},"tokens":{"color":{"gray":{"50":"#18181b","100":"#27272a","200":"#3f3f46","300":"#52525b","400":"#71717a","500":"#a1a1aa","600":"#d4d4d8","700":"#e4e4e7","800":"#f4f4f5","900":"#fafafa"},"blue":{"400":"#60a5fa","500":"#3b82f6","600":"#2563eb"},"white":"#ffffff","black":"#000000"},"typography":{"fontFamily":{"sans":"Inter, system-ui, -apple-system, sans-serif"}}},"semantic":{"color":{"primary":"ref:tokens.color.blue.400","primaryHover":"ref:tokens.color.blue.500","text":{"default":"ref:tokens.color.white","muted":"ref:tokens.color.gray.400"},"surface":{"page":"ref:tokens.color.black","card":"ref:tokens.color.gray.50"},"border":{"default":"ref:tokens.color.gray.200"}}},"page":{"layout":{"maxWidth":480,"pagePadding":20,"blockGap":20,"textAlign":"center"},"defaults":{"headerPresetId":"with-cover","blockPresetId":"rounded-solid"}},"background":{"wallpaper":{"kind":"preset","assetId":null,"url":null},"effects":{"blur":0,"dim":0}}}')
WHERE key = 'dark';

-- Update Gradient theme to v2
UPDATE theme_presets 
SET config = json('{"meta":{"id":"preset.gradient","name":"Gradient","schemaVersion":2,"version":"2.2.2","author":"system","description":"Purple gradient background with white text","tier":"free","category":"gradient"},"tokens":{"color":{"purple":{"400":"#a78bfa","500":"#8b5cf6","600":"#7c3aed"},"white":"#ffffff","overlay":{"10":"rgba(255, 255, 255, 0.1)","20":"rgba(255, 255, 255, 0.2)"}},"typography":{"fontFamily":{"sans":"Poppins, system-ui, -apple-system, sans-serif"}}},"semantic":{"color":{"primary":"ref:tokens.color.white","primaryHover":"ref:tokens.color.white","text":{"default":"ref:tokens.color.white","muted":"ref:tokens.color.white"},"surface":{"page":"linear-gradient(135deg, #667eea, #764ba2)","card":"ref:tokens.color.overlay.10"},"border":{"default":"ref:tokens.color.overlay.20"}}},"page":{"layout":{"maxWidth":480,"pagePadding":24,"blockGap":24,"textAlign":"center"},"defaults":{"headerPresetId":"with-cover","blockPresetId":"rounded-solid"}},"background":{"wallpaper":{"kind":"preset","assetId":null,"url":null},"effects":{"blur":0,"dim":0}}}')
WHERE key = 'gradient';

-- Update Minimal Pro theme to v2
UPDATE theme_presets 
SET config = json('{"meta":{"id":"preset.minimal-pro","name":"Minimal Pro","schemaVersion":2,"version":"2.2.2","author":"system","description":"Clean minimal design with blue accents","tier":"pro","category":"minimal"},"tokens":{"color":{"gray":{"50":"#fafafa","100":"#f4f4f5","200":"#e4e4e7","300":"#d4d4d8","400":"#a1a1aa","500":"#71717a","600":"#52525b","700":"#3f3f46","800":"#27272a","900":"#18181b"},"blue":{"400":"#60a5fa","500":"#3b82f6","600":"#2563eb"},"white":"#ffffff","black":"#0a0a0a"},"typography":{"fontFamily":{"sans":"Inter, system-ui, -apple-system, sans-serif"}}},"semantic":{"color":{"primary":"ref:tokens.color.blue.600","primaryHover":"ref:tokens.color.blue.500","text":{"default":"ref:tokens.color.black","muted":"ref:tokens.color.gray.500"},"surface":{"page":"ref:tokens.color.white","card":"ref:tokens.color.gray.50"},"border":{"default":"ref:tokens.color.gray.200"}}},"page":{"layout":{"maxWidth":480,"pagePadding":20,"blockGap":16,"textAlign":"center"},"defaults":{"headerPresetId":"no-cover","blockPresetId":"rounded-solid"}},"background":{"wallpaper":{"kind":"preset","assetId":null,"url":null},"effects":{"blur":0,"dim":0}}}')
WHERE key = 'minimal-pro';

-- Verify all themes are now v2
SELECT 
    key,
    name,
    json_extract(config, '$.meta.schemaVersion') as schema,
    json_extract(config, '$.meta.version') as version,
    json_type(config, '$.semantic') as has_semantic,
    json_type(config, '$.background') as has_background
FROM theme_presets
ORDER BY key;
