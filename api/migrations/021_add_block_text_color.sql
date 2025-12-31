-- Add blockText color to minimal theme
UPDATE theme_presets 
SET config = json_patch(
    config, 
    '{"tokens": {"color": {"blockText": "#ffffff"}}, "semantic": {"color": {"block": {"text": "ref:tokens.color.blockText"}}}}'
)
WHERE key = 'minimal';
