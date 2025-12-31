-- Create header_presets table if not exists
CREATE TABLE IF NOT EXISTS header_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'standard',
    tier TEXT DEFAULT 'free',
    config TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default header presets
INSERT OR IGNORE INTO header_presets (key, name, description, category, tier, config, sort_order) VALUES
('with-cover', 'With Cover', 'Header with cover image and overlapping avatar', 'standard', 'free', 
'{"hasCover":true,"coverHeight":"md","coverType":"image","coverValue":"/presets/images/cover-demo.jpg","avatarSize":"lg","avatarShape":"circle","avatarPosition":"overlap","avatarBorder":true,"avatarBorderColor":"#ffffff","avatarBorderWidth":4,"contentAlign":"center","showBio":true,"bioMaxLines":3,"spacing":"comfortable"}', 1),

('no-cover', 'No Cover', 'Simple header without cover image', 'standard', 'free',
'{"hasCover":false,"avatarSize":"lg","avatarShape":"circle","avatarPosition":"center","avatarBorder":false,"contentAlign":"center","showBio":true,"bioMaxLines":3,"spacing":"comfortable"}', 2),

('centered-large', 'Centered Large', 'Large oval avatar with spacious layout', 'standard', 'free',
'{"hasCover":false,"avatarSize":"xl","avatarShape":"oval","avatarPosition":"center","avatarBorder":false,"contentAlign":"center","showBio":true,"bioMaxLines":3,"spacing":"spacious"}', 3),

('avatar-cover', 'Avatar Cover', 'Full-screen avatar with text overlay', 'premium', 'pro',
'{"hasCover":true,"coverHeight":"lg","coverType":"image","coverValue":"/presets/images/cover-demo.jpg","avatarSize":"sm","avatarShape":"circle","avatarPosition":"center","avatarBorder":false,"contentAlign":"center","showBio":true,"bioMaxLines":2,"spacing":"comfortable"}', 4);
