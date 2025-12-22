-- Migration 004: XÓA CÁC CỘT TRÙNG LẶP
-- Chỉ giữ lại: draft_profile, draft_appearance, published_profile, published_appearance, published_at

-- SQLite không support DROP COLUMN trực tiếp
-- Phải recreate table với cấu trúc mới

-- Step 1: Tạo bảng mới với cấu trúc SẠCH
CREATE TABLE bio_pages_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    
    -- ✅ CHỈ GIỮ 4 CỘT NÀY
    draft_profile TEXT DEFAULT '{}',
    draft_appearance TEXT DEFAULT '{}',
    published_profile TEXT DEFAULT '{}',
    published_appearance TEXT DEFAULT '{}',
    published_at DATETIME,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy dữ liệu từ bảng cũ (CHỈ LẤY CỘT MỚI)
INSERT INTO bio_pages_new (
    id, user_id, username,
    draft_profile, draft_appearance,
    published_profile, published_appearance,
    published_at,
    created_at, updated_at
)
SELECT 
    id, user_id, username,
    draft_profile, draft_appearance,
    published_profile, published_appearance,
    published_at,
    created_at, updated_at
FROM bio_pages;

-- Step 3: Xóa bảng cũ
DROP TABLE bio_pages;

-- Step 4: Rename bảng mới
ALTER TABLE bio_pages_new RENAME TO bio_pages;

-- Step 5: Recreate indexes
CREATE INDEX idx_pages_user ON bio_pages(user_id);
CREATE INDEX idx_pages_username ON bio_pages(username);
CREATE INDEX idx_pages_published_at ON bio_pages(published_at);

-- Step 6: Verify
-- SELECT * FROM bio_pages LIMIT 1;
