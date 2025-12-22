-- Add default preset references to theme_presets table
ALTER TABLE theme_presets ADD COLUMN default_header_preset_id TEXT DEFAULT 'centered';
ALTER TABLE theme_presets ADD COLUMN default_block_preset_id TEXT DEFAULT 'rounded-solid';

-- Update existing themes with defaults
UPDATE theme_presets SET 
	default_header_preset_id = 'centered',
	default_block_preset_id = 'rounded-solid'
WHERE default_header_preset_id IS NULL;
