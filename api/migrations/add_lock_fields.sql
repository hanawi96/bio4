-- Add lock fields to links table
ALTER TABLE links ADD COLUMN lock_type TEXT DEFAULT 'none';
ALTER TABLE links ADD COLUMN lock_value TEXT DEFAULT NULL;
