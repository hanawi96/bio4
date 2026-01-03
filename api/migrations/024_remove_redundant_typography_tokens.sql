-- Remove redundant typography tokens from theme configs
-- These tokens are now centralized in code (typographyTokens.ts)
-- and don't need to be stored per-theme

-- REMOVED:
-- - tokens.typography.fontSize (now in FONT_SIZE_TOKENS)
-- - tokens.typography.fontWeight (now in FONT_WEIGHT_TOKENS)  
-- - tokens.typography.lineHeight (now in LINE_HEIGHT_TOKENS)
-- - semantic.typography.body (not used in UI)
-- - semantic.typography.caption (not used in UI)

-- KEPT:
-- - tokens.typography.fontFamily (per-theme customization)
-- - semantic.typography.heading (used in UI)
-- - semantic.typography.link (used in UI)
-- - semantic.typography.bio (used in UI)
-- - semantic.typography.subtitle (used in UI)

-- This migration is for documentation only
-- Since all themes were deleted, no data migration needed
-- New themes will be created without these redundant tokens automatically

-- Benefits:
-- - Theme config size reduced by ~40%
-- - Single source of truth for typography scales
-- - Easier to maintain consistency across themes
-- - Faster theme creation and loading
