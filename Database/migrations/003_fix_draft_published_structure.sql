-- Fix Draft/Published Structure
-- Tách rõ ràng DRAFT và PUBLISHED data

-- Step 1: Thêm các cột mới
ALTER TABLE bio_pages ADD COLUMN draft_profile TEXT DEFAULT '{}';
ALTER TABLE bio_pages ADD COLUMN draft_appearance TEXT DEFAULT '{}';
ALTER TABLE bio_pages ADD COLUMN published_profile TEXT DEFAULT '{}';
ALTER TABLE bio_pages ADD COLUMN published_appearance TEXT DEFAULT '{}';
ALTER TABLE bio_pages ADD COLUMN published_at DATETIME;

-- Step 2: Migrate dữ liệu cũ sang cấu trúc mới
-- Copy title, bio, avatar_url vào published_profile
UPDATE bio_pages SET published_profile = json_object(
  'title', COALESCE(title, ''),
  'bio', COALESCE(bio, ''),
  'avatar_url', COALESCE(avatar_url, ''),
  'username', username
);

-- Copy title, bio, avatar_url vào draft_profile (giống published)
UPDATE bio_pages SET draft_profile = published_profile;

-- Copy settings vào published_appearance
UPDATE bio_pages SET published_appearance = settings;

-- Copy draft_settings vào draft_appearance
UPDATE bio_pages SET draft_appearance = draft_settings;

-- Set published_at cho các page đã published
UPDATE bio_pages SET published_at = updated_at WHERE status = 'published';

-- Step 3: Xóa các cột cũ không dùng nữa
-- SQLite không support DROP COLUMN trực tiếp, phải recreate table
-- Tạm thời giữ lại để backward compatible, sẽ xóa sau

-- Step 4: Tạo index mới
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON bio_pages(published_at);

-- Note: Các cột cũ (title, bio, avatar_url, settings, draft_settings, status) 
-- sẽ được deprecated và xóa trong migration tiếp theo
