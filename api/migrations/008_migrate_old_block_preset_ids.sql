-- Migration: Migrate old block preset IDs to new format
-- Date: 2025-12-30
-- Issue: Old data uses "rounded", "pill", "square" but v2.2 uses "rounded-solid", "pill-outline", etc.

-- Update draft_appearance: rounded → rounded-solid
UPDATE bio_pages
SET draft_appearance = REPLACE(draft_appearance, '"blockPresetId":"rounded"', '"blockPresetId":"rounded-solid"')
WHERE draft_appearance LIKE '%"blockPresetId":"rounded"%';

-- Update draft_appearance: pill → pill-outline
UPDATE bio_pages
SET draft_appearance = REPLACE(draft_appearance, '"blockPresetId":"pill"', '"blockPresetId":"pill-outline"')
WHERE draft_appearance LIKE '%"blockPresetId":"pill"%';

-- Update draft_appearance: square → square-gradient
UPDATE bio_pages
SET draft_appearance = REPLACE(draft_appearance, '"blockPresetId":"square"', '"blockPresetId":"square-gradient"')
WHERE draft_appearance LIKE '%"blockPresetId":"square"%';

-- Update published_appearance: rounded → rounded-solid
UPDATE bio_pages
SET published_appearance = REPLACE(published_appearance, '"blockPresetId":"rounded"', '"blockPresetId":"rounded-solid"')
WHERE published_appearance LIKE '%"blockPresetId":"rounded"%';

-- Update published_appearance: pill → pill-outline
UPDATE bio_pages
SET published_appearance = REPLACE(published_appearance, '"blockPresetId":"pill"', '"blockPresetId":"pill-outline"')
WHERE published_appearance LIKE '%"blockPresetId":"pill"%';

-- Update published_appearance: square → square-gradient
UPDATE bio_pages
SET published_appearance = REPLACE(published_appearance, '"blockPresetId":"square"', '"blockPresetId":"square-gradient"')
WHERE published_appearance LIKE '%"blockPresetId":"square"%';
