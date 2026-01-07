-- Migration: Add icon_color field to links table
-- Run this directly in Cloudflare D1 Console
-- Date: 2026-01-07

-- Add icon_color column for storing icon color (hex format)
ALTER TABLE links ADD COLUMN icon_color TEXT;

-- Verify the changes
SELECT id, title, icon_type, icon_data, icon_color FROM links LIMIT 5;
