-- Step 3: Migrate existing data
-- Run this after step 1 and 2

UPDATE links 
SET icon_type = 'image',
    icon_data = icon_url
WHERE icon_url IS NOT NULL AND icon_url != '';
