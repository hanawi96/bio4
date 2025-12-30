-- Migration: Sync block_presets with frontend presets.ts
-- Date: 2025-12-30
-- Purpose: Match database presets with hardcoded BLOCK_PRESETS in presets.ts

-- Clear existing data
DELETE FROM block_presets;

-- Insert presets matching frontend/src/lib/appearance/presets.ts
INSERT INTO block_presets (key, name, description, category, tier, config, sort_order) VALUES
('rounded-solid', 'Rounded Solid', 'Rounded corners with solid fill', 'basic', 'free',
 '{"id":"rounded-solid","name":"Rounded Solid","shape":"rounded","borderRadius":12,"fill":"solid","size":"md","iconPosition":"left","spacing":"comfortable","hoverEffect":"lift"}',
 1),

('pill-outline', 'Pill Outline', 'Pill shape with outline border', 'basic', 'free',
 '{"id":"pill-outline","name":"Pill Outline","shape":"pill","borderRadius":9999,"fill":"outline","size":"md","iconPosition":"left","spacing":"comfortable","hoverEffect":"scale"}',
 2),

('square-gradient', 'Square Gradient', 'Square shape with gradient fill', 'creative', 'free',
 '{"id":"square-gradient","name":"Square Gradient","shape":"square","borderRadius":0,"fill":"gradient","size":"lg","iconPosition":"right","spacing":"spacious","hoverEffect":"glow"}',
 3),

('ghost', 'Ghost', 'Minimal ghost style', 'minimal', 'free',
 '{"id":"ghost","name":"Ghost","shape":"rounded","borderRadius":8,"fill":"ghost","size":"sm","iconPosition":"none","spacing":"compact","hoverEffect":"none"}',
 4),

('bold', 'Bold', 'Bold pill style with emphasis', 'creative', 'free',
 '{"id":"bold","name":"Bold","shape":"pill","borderRadius":9999,"fill":"solid","size":"lg","iconPosition":"left","spacing":"spacious","hoverEffect":"scale"}',
 5);
