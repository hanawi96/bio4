# 📚 Database Quick Reference

## Bảng Tóm Tắt

| # | Bảng | Chức năng | Rows/User | Quan hệ |
|---|------|-----------|-----------|---------|
| 1 | `users` | Tài khoản người dùng | 1 | Parent của tất cả |
| 2 | `bio_pages` | Trang bio công khai | 1 | 1 user → N pages |
| 3 | `theme_presets` | Theme có sẵn | Shared | N pages → 1 theme |
| 4 | `link_groups` | Nhóm links | 2-5 | 1 page → N groups |
| 5 | `links` | Links cụ thể | 6-50 | 1 group → N links |
| 6 | `blocks` | Content blocks | 0-5 | 1 page → N blocks |
| 7 | `assets` | File uploads | 1-10 | 1 user → N assets |

## Cheat Sheet

### 1. users 👤
```
Lưu gì?     Tài khoản, email, password
Dùng khi?   Đăng ký, đăng nhập, profile
Xóa thì?    Cascade delete tất cả data của user
```

### 2. bio_pages 📄
```
Lưu gì?     Trang bio (/:username)
Dùng khi?   Hiển thị trang công khai, chỉnh sửa
Đặc biệt?   settings (published) vs draft_settings (autosave)
```

### 3. theme_presets 🎨
```
Lưu gì?     Theme config (màu, font, spacing)
Dùng khi?   Apply theme, load theme list
Shared?     Tất cả users dùng chung
```

### 4. link_groups 📁
```
Lưu gì?     Nhóm links (sections)
Dùng khi?   Tổ chức links thành sections
Layout?     list | cards | grid
```

### 5. links 🔗
```
Lưu gì?     Link cụ thể (title, url, icon)
Dùng khi?   Thêm/sửa/xóa links
Toggle?     is_active (show/hide)
```

### 6. blocks 🧩
```
Lưu gì?     Content blocks (text, image, video)
Dùng khi?   Thêm content vào trang
Types?      text, image, video, embed, etc.
```

### 7. assets 📎
```
Lưu gì?     Metadata của files (R2)
Dùng khi?   Upload avatar, icons, images
Storage?    Files lưu trên Cloudflare R2
```

## Common Queries

### Get Public Bio Page
```sql
-- Step 1: Get page
SELECT * FROM bio_pages WHERE username = 'demo';

-- Step 2: Get groups
SELECT * FROM link_groups WHERE page_id = 1 ORDER BY sort_order;

-- Step 3: Get links
SELECT * FROM links WHERE group_id IN (1,2,3) AND is_active = 1 ORDER BY sort_order;

-- Step 4: Get blocks
SELECT * FROM blocks WHERE page_id = 1 AND is_visible = 1 ORDER BY sort_order;

-- Step 5: Get theme
SELECT * FROM theme_presets WHERE key = 'minimal';
```

### Autosave
```sql
UPDATE bio_pages 
SET draft_settings = '{"title":"New Title",...}', 
    updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### Publish
```sql
UPDATE bio_pages 
SET settings = draft_settings, 
    status = 'published',
    updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### Add Link
```sql
INSERT INTO links (group_id, title, url, sort_order) 
VALUES (1, 'My Website', 'https://example.com', 0);
```

### Toggle Link Visibility
```sql
UPDATE links SET is_active = 0 WHERE id = 5; -- Hide
UPDATE links SET is_active = 1 WHERE id = 5; -- Show
```

## Field Types

### Status Fields
```
users.is_active:      1 = active, 0 = inactive
links.is_active:      1 = visible, 0 = hidden
blocks.is_visible:    1 = visible, 0 = hidden
bio_pages.status:     'draft' | 'published'
```

### JSON Fields
```
bio_pages.settings:        Published config
bio_pages.draft_settings:  Draft config (autosave)
theme_presets.config:      Theme config
blocks.content:            Block content
```

### Layout Types
```
link_groups.layout_type:   'list' | 'cards' | 'grid'
bio_pages.theme_mode:      'light' | 'dark' | 'compact'
```

### Block Types
```
blocks.type:  'text' | 'image' | 'video' | 'embed' | 'divider' | 'spacer'
```

## Indexes

```
✅ idx_users_email          ON users(email)
✅ idx_pages_user           ON bio_pages(user_id)
✅ idx_pages_username       ON bio_pages(username)
✅ idx_groups_page          ON link_groups(page_id)
✅ idx_links_group          ON links(group_id, sort_order)
✅ idx_blocks_page          ON blocks(page_id, sort_order)
✅ idx_assets_user          ON assets(user_id)
```

## Foreign Keys

```
bio_pages.user_id       → users.id
link_groups.page_id     → bio_pages.id
links.group_id          → link_groups.id
blocks.page_id          → bio_pages.id
assets.user_id          → users.id
bio_pages.theme_preset  → theme_presets.key
```

## Cascade Rules

```
DELETE users
  ├─> DELETE bio_pages
  │    ├─> DELETE link_groups
  │    │    └─> DELETE links
  │    └─> DELETE blocks
  └─> DELETE assets
```

## Data Examples

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "John Doe",
  "is_active": 1
}
```

### Bio Page
```json
{
  "id": 1,
  "username": "johndoe",
  "title": "John Doe",
  "bio": "Developer & Designer",
  "status": "published",
  "theme_preset_key": "minimal",
  "theme_mode": "light",
  "settings": "{...}",
  "draft_settings": "{...}"
}
```

### Link
```json
{
  "id": 1,
  "title": "My Website",
  "url": "https://johndoe.com",
  "icon_url": "https://...",
  "is_active": 1,
  "sort_order": 0
}
```

### Block
```json
{
  "id": 1,
  "type": "text",
  "content": "{\"text\":\"Welcome!\",\"align\":\"center\"}",
  "is_visible": 1,
  "sort_order": 0
}
```

## Tips & Tricks

### 💡 Performance
- Cache public pages (Cloudflare Cache API)
- Use indexes for frequent queries
- Denormalize if needed (link count, view count)

### 💡 Security
- Hash passwords (bcrypt)
- Validate URLs before saving
- Sanitize user input
- Check ownership before update/delete

### 💡 Data Integrity
- Use transactions for multi-table operations
- Validate foreign keys
- Check sort_order uniqueness
- Validate JSON before saving

### 💡 Maintenance
- Clean up unused assets
- Archive inactive users
- Monitor database size
- Backup regularly

## Useful Commands

### Check Table Structure
```sql
PRAGMA table_info(bio_pages);
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bio_pages;
SELECT COUNT(*) FROM links;
```

### Find Orphaned Records
```sql
-- Links without group
SELECT * FROM links WHERE group_id NOT IN (SELECT id FROM link_groups);

-- Groups without page
SELECT * FROM link_groups WHERE page_id NOT IN (SELECT id FROM bio_pages);
```

### Database Size
```sql
SELECT 
  name,
  SUM(pgsize) as size_bytes
FROM dbstat
GROUP BY name
ORDER BY size_bytes DESC;
```

## Migration Commands

### Local
```bash
wrangler d1 execute bio-link-db --local --file=schema.sql
```

### Remote
```bash
wrangler d1 execute bio-link-db --remote --file=schema.sql
```

### Check Migration
```bash
wrangler d1 execute bio-link-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```
