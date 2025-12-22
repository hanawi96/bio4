-- Migration: Add Theme V2 support
-- Date: 2024-12-22

-- Add config_v2 column to theme_presets table
-- This will store the full Theme 10/10 JSON structure
ALTER TABLE theme_presets ADD COLUMN config_v2 TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_theme_presets_key ON theme_presets(key);

-- Note: config_v2 will be NULL for old themes (backward compatible)
-- New themes will use config_v2, old themes will continue using config
