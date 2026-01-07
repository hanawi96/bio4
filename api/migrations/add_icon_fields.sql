-- Migration: Add icon_type and icon_data fields to links table
-- Date: 2026-01-07

-- Add new columns for icon management
ALTER TABLE links ADD COLUMN icon_type TEXT DEFAULT 'none';
ALTER TABLE links ADD COLUMN icon_data TEXT;

-- Migrate existing data: if icon_url exists, set icon_type to 'image'
UPDATE links 
SET icon_type = 'image',
    icon_data = icon_url
WHERE icon_url IS NOT NULL AND icon_url != '';

-- Note: icon_url column is kept for backward compatibility
-- but new code should use icon_type and icon_data
