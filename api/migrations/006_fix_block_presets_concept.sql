-- Migration: Fix block_presets concept - separate recipes from presets
-- Date: 2025-12-30
-- Issue: Confused "Block Style Recipes" (styling formulas) with "Block Presets" (shape configs)
-- Solution: Keep block_presets for shape/layout, recipes stay in frontend code

-- Clear existing data (wrong concept)
DELETE FROM block_presets;

-- Insert correct block presets (shape + layout combinations)
-- These are LAYOUT presets, not styling recipes
INSERT INTO block_presets (key, name, description, category, tier, config, sort_order) VALUES
-- Basic shapes with default styling
('rounded-default', 'Rounded', 'Rounded corners, medium size', 'basic', 'free',
 '{"id":"rounded-default","name":"Rounded","shape":"rounded","borderRadius":12,"size":"md","iconPosition":"left","spacing":"comfortable","hoverEffect":"lift"}',
 1),

('pill-default', 'Pill', 'Fully rounded pill shape', 'basic', 'free',
 '{"id":"pill-default","name":"Pill","shape":"pill","borderRadius":9999,"size":"md","iconPosition":"left","spacing":"comfortable","hoverEffect":"scale"}',
 2),

('square-default', 'Square', 'Sharp square corners', 'basic', 'free',
 '{"id":"square-default","name":"Square","shape":"square","borderRadius":0,"size":"md","iconPosition":"left","spacing":"comfortable","hoverEffect":"none"}',
 3),

-- Size variants
('rounded-compact', 'Rounded Compact', 'Rounded with compact spacing', 'minimal', 'free',
 '{"id":"rounded-compact","name":"Rounded Compact","shape":"rounded","borderRadius":8,"size":"sm","iconPosition":"left","spacing":"compact","hoverEffect":"lift"}',
 4),

('pill-large', 'Pill Large', 'Large pill with spacious layout', 'creative', 'free',
 '{"id":"pill-large","name":"Pill Large","shape":"pill","borderRadius":9999,"size":"lg","iconPosition":"left","spacing":"spacious","hoverEffect":"scale"}',
 5);

-- Note: Block Style Recipes (solid, soft, outline, glass, neon, brutal) 
-- are NOT stored in database - they are styling formulas in frontend code
-- Users select: Block Preset (shape/layout) + Block Style Recipe (colors/effects)
