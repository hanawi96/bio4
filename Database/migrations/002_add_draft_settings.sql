-- Add draft_settings column for autosave functionality
-- This allows separate DRAFT and PUBLISHED states

ALTER TABLE bio_pages ADD COLUMN draft_settings TEXT DEFAULT '{}';

-- Update existing rows to copy settings to draft_settings
UPDATE bio_pages SET draft_settings = settings WHERE draft_settings = '{}';
