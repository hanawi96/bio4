-- Migration: Add icon_type and icon_data fields to links table
-- Run this directly in Cloudflare D1 Console
-- Date: 2026-01-07

-- Step 1: Add new columns for icon management
ALTER TABLE links ADD COLUMN icon_type TEXT DEFAULT 'none';
ALTER TABLE links ADD COLUMN icon_data TEXT;

-- Step 2: Migrate existing data (if icon_url exists, set icon_type to 'image')
UPDATE links 
SET icon_type = 'image',
    icon_data = icon_url
WHERE icon_url IS NOT NULL AND icon_url != '';

-- Step 3: Verify the changes
SELECT id, title, icon_url, icon_type, icon_data FROM links LIMIT 5;
