-- Add shadowColor to minimal theme
UPDATE theme_presets 
SET config = json_patch(
    config, 
    '{"tokens": {"color": {"shadowColor": "#000000"}}}'
)
WHERE key = 'minimal';
