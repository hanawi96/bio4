-- Add is_visible column to link_groups table
ALTER TABLE link_groups ADD COLUMN is_visible INTEGER DEFAULT 1 NOT NULL;

-- Update existing groups to be visible by default
UPDATE link_groups SET is_visible = 1 WHERE is_visible IS NULL;
