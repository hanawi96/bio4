-- Migration: Create block_presets table
-- Date: 2025-12-30
-- Purpose: Separate block preset definitions from theme config

CREATE TABLE IF NOT EXISTS block_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,                   -- Unique identifier: 'rounded-solid', 'pill-outline', etc.
    name TEXT NOT NULL,                         -- Display name: 'Rounded Solid'
    description TEXT,                           -- Short description for UI
    category TEXT DEFAULT 'basic',              -- 'basic', 'creative', 'professional', 'minimal'
    tier TEXT DEFAULT 'free',                   -- 'free', 'pro' - for premium features
    config TEXT NOT NULL,                       -- JSON: Full BlockPreset configuration
    thumbnail_url TEXT,                         -- Preview image URL (optional)
    is_active INTEGER DEFAULT 1,                -- Enable/disable preset (soft delete)
    sort_order INTEGER DEFAULT 0,               -- Display order in UI
    usage_count INTEGER DEFAULT 0,              -- Track popularity (denormalized for performance)
    created_by INTEGER,                         -- NULL = system preset, user_id = custom preset
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default block presets from presets.ts
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

-- Create index for faster lookups
CREATE INDEX idx_block_presets_key ON block_presets(key);
CREATE INDEX idx_block_presets_active ON block_presets(is_active);
CREATE INDEX idx_block_presets_category ON block_presets(category);
