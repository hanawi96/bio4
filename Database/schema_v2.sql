-- Bio Link Database Schema V2 (FIXED DRAFT/PUBLISHED)

-- Users (không đổi)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Bio Pages (FIXED: Tách rõ DRAFT và PUBLISHED)
CREATE TABLE IF NOT EXISTS bio_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    
    -- ✅ DRAFT DATA (autosave liên tục)
    draft_profile TEXT DEFAULT '{}',        -- JSON: {title, bio, avatar_url}
    draft_appearance TEXT DEFAULT '{}',     -- JSON: {theme, colors, fonts, etc.}
    
    -- ✅ PUBLISHED DATA (chỉ update khi publish)
    published_profile TEXT DEFAULT '{}',    -- JSON: {title, bio, avatar_url}
    published_appearance TEXT DEFAULT '{}', -- JSON: {theme, colors, fonts, etc.}
    published_at DATETIME,                  -- Timestamp của lần publish cuối
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_pages_user ON bio_pages(user_id);
CREATE INDEX idx_pages_username ON bio_pages(username);
CREATE INDEX idx_pages_published_at ON bio_pages(published_at);

-- Theme Presets (không đổi)
CREATE TABLE IF NOT EXISTS theme_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    config TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Link Groups (không đổi)
CREATE TABLE IF NOT EXISTS link_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    title TEXT,
    layout_type TEXT DEFAULT 'list',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES bio_pages(id) ON DELETE CASCADE
);

CREATE INDEX idx_groups_page ON link_groups(page_id);

-- Links (không đổi)
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES link_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_links_group ON links(group_id, sort_order);

-- Blocks (không đổi)
CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES bio_pages(id) ON DELETE CASCADE
);

CREATE INDEX idx_blocks_page ON blocks(page_id, sort_order);

-- Assets (không đổi)
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT DEFAULT 'image',
    storage_key TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assets_user ON assets(user_id);
