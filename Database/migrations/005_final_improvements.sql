-- Migration 005: Cải thiện cuối cùng
-- 1. NOT NULL cho JSON fields
-- 2. UNIQUE(user_id) - 1 user = 1 bio page
-- 3. Index đã có rồi (idx_pages_username)

-- Recreate table với NOT NULL và UNIQUE
CREATE TABLE bio_pages_final (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,  -- ✅ UNIQUE: 1 user = 1 page
    username TEXT UNIQUE NOT NULL,
    
    -- ✅ NOT NULL DEFAULT '{}' - Tránh NULL
    draft_profile TEXT NOT NULL DEFAULT '{}',
    draft_appearance TEXT NOT NULL DEFAULT '{}',
    published_profile TEXT NOT NULL DEFAULT '{}',
    published_appearance TEXT NOT NULL DEFAULT '{}',
    published_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data
INSERT INTO bio_pages_final 
SELECT * FROM bio_pages;

-- Drop old
DROP TABLE bio_pages;

-- Rename
ALTER TABLE bio_pages_final RENAME TO bio_pages;

-- Recreate indexes
CREATE INDEX idx_pages_user ON bio_pages(user_id);
CREATE INDEX idx_pages_username ON bio_pages(username);
CREATE INDEX idx_pages_published_at ON bio_pages(published_at);
