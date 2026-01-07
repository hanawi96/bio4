-- Step 1: Add new columns only
-- Run this first in Cloudflare D1 Console

ALTER TABLE links ADD COLUMN icon_type TEXT DEFAULT 'none';
