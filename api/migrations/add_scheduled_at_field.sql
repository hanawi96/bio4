-- Add scheduled_at field to links table
-- This field stores the datetime when the link should become active
-- Format: ISO 8601 datetime string in UTC (e.g., "2026-01-09T15:00:00Z")
-- NULL = no schedule, link is active immediately
ALTER TABLE links ADD COLUMN scheduled_at TEXT DEFAULT NULL;
