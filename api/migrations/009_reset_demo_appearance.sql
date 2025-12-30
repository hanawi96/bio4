-- Reset demo user appearance to clean state
UPDATE bio_pages 
SET draft_appearance = '{"themeKey":"minimal","overrides":{},"headerPresetId":"no-cover","blockPresetId":"rounded-solid"}'
WHERE username = 'demo';
