# 📊 Phân Tích Database Schema

## Tổng Quan

Database có **7 bảng chính** + 2 bảng hệ thống:

### Bảng Chính (7)
1. `users` - Quản lý người dùng
2. `bio_pages` - Trang bio của user
3. `theme_presets` - Theme có sẵn
4. `link_groups` - Nhóm links
5. `links` - Links trong từng nhóm
6. `blocks` - Content blocks linh hoạt
7. `assets` - File uploads (images)

### Bảng Hệ Thống (2)
- `_cf_KV` - Cloudflare internal
- `sqlite_sequence` - SQLite auto-increment tracking

---

## 📋 Chi Tiết Từng Bảng

### 1. 👤 `users` - Quản Lý Người Dùng

**Chức năng:** Lưu thông tin tài khoản người dùng

**Cấu trúc:**
```sql
id                INTEGER PRIMARY KEY AUTOINCREMENT
email             TEXT UNIQUE NOT NULL          -- Email đăng nhập
password_hash     TEXT NOT NULL                 -- Mật khẩu đã hash
display_name      TEXT                          -- Tên hiển thị
avatar_url        TEXT                          -- URL avatar
is_active         INTEGER DEFAULT 1             -- Trạng thái active (1=active, 0=inactive)
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_users_email` trên `email` - Tìm kiếm nhanh khi login

**Quan hệ:**
- 1 user → nhiều bio_pages (1:N)
- 1 user → nhiều assets (1:N)

**Use cases:**
- Đăng ký tài khoản
- Đăng nhập
- Quản lý profile
- Soft delete (set is_active = 0)

---

### 2. 📄 `bio_pages` - Trang Bio

**Chức năng:** Trang bio link công khai của user (giống Linktree)

**Cấu trúc:**
```sql
id                INTEGER PRIMARY KEY AUTOINCREMENT
user_id           INTEGER NOT NULL              -- FK → users.id
username          TEXT UNIQUE NOT NULL          -- Username công khai (URL: /:username)
title             TEXT                          -- Tiêu đề trang
bio               TEXT                          -- Mô tả ngắn
avatar_url        TEXT                          -- Avatar trang bio
status            TEXT DEFAULT 'draft'          -- 'draft' | 'published'
theme_preset_key  TEXT DEFAULT 'minimal'        -- FK → theme_presets.key
theme_mode        TEXT DEFAULT 'light'          -- 'light' | 'dark' | 'compact'
settings          TEXT DEFAULT '{}'             -- JSON: Published settings
draft_settings    TEXT DEFAULT '{}'             -- JSON: Draft settings (autosave) ✨ NEW
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_pages_user` trên `user_id` - Tìm pages của user
- `idx_pages_username` trên `username` - Tìm page công khai

**Quan hệ:**
- N bio_pages → 1 user (N:1)
- 1 bio_page → nhiều link_groups (1:N)
- 1 bio_page → nhiều blocks (1:N)
- N bio_pages → 1 theme_preset (N:1)

**Use cases:**
- Tạo trang bio mới
- Chỉnh sửa appearance (autosave vào draft_settings)
- Publish (copy draft_settings → settings)
- Hiển thị trang công khai (/:username)
- Preview realtime

**Đặc biệt:**
- `settings`: Dữ liệu PUBLISHED (visitor thấy)
- `draft_settings`: Dữ liệu DRAFT (autosave, chỉ owner thấy)

---

### 3. 🎨 `theme_presets` - Theme Có Sẵn

**Chức năng:** Lưu các theme preset có sẵn (minimal, modern, colorful, etc.)

**Cấu trúc:**
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
key         TEXT UNIQUE NOT NULL              -- Theme key (vd: 'minimal', 'modern')
name        TEXT NOT NULL                     -- Tên hiển thị
config      TEXT NOT NULL                     -- JSON: Theme config
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Config JSON Example:**
```json
{
  "backgroundColor": "#ffffff",
  "textColor": "#000000",
  "primaryColor": "#3b82f6",
  "fontFamily": "Inter",
  "borderRadius": 8,
  "spacing": 16
}
```

**Quan hệ:**
- 1 theme_preset → nhiều bio_pages (1:N)

**Use cases:**
- Load danh sách themes
- Apply theme cho bio page
- Tạo theme mới (admin)

---

### 4. 📁 `link_groups` - Nhóm Links

**Chức năng:** Tổ chức links thành các nhóm (sections)

**Cấu trúc:**
```sql
id           INTEGER PRIMARY KEY AUTOINCREMENT
page_id      INTEGER NOT NULL                 -- FK → bio_pages.id
title        TEXT                             -- Tiêu đề nhóm (vd: "Social Media")
layout_type  TEXT DEFAULT 'list'              -- 'list' | 'cards' | 'grid'
sort_order   INTEGER DEFAULT 0                -- Thứ tự hiển thị
created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_groups_page` trên `page_id` - Tìm groups của page

**Quan hệ:**
- N link_groups → 1 bio_page (N:1)
- 1 link_group → nhiều links (1:N)

**Use cases:**
- Tạo section mới (vd: "My Links", "Social Media")
- Đổi layout (list/cards/grid)
- Sắp xếp thứ tự sections
- Xóa section (cascade delete links)

**Cascade Delete:**
- Xóa bio_page → xóa tất cả link_groups
- Xóa link_group → xóa tất cả links trong group

---

### 5. 🔗 `links` - Links

**Chức năng:** Các link cụ thể trong từng group

**Cấu trúc:**
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
group_id    INTEGER NOT NULL                  -- FK → link_groups.id
title       TEXT NOT NULL                     -- Tiêu đề link
url         TEXT NOT NULL                     -- URL đích
icon_url    TEXT                              -- Icon/logo của link
sort_order  INTEGER DEFAULT 0                 -- Thứ tự trong group
is_active   INTEGER DEFAULT 1                 -- Hiển thị hay ẩn (1=show, 0=hide)
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_links_group` trên `(group_id, sort_order)` - Tìm và sort links

**Quan hệ:**
- N links → 1 link_group (N:1)

**Use cases:**
- Thêm link mới
- Chỉnh sửa link (title, url, icon)
- Ẩn/hiện link (toggle is_active)
- Sắp xếp thứ tự links
- Xóa link

**Cascade Delete:**
- Xóa link_group → xóa tất cả links

---

### 6. 🧩 `blocks` - Content Blocks

**Chức năng:** Các content block linh hoạt (text, image, video, embed, etc.)

**Cấu trúc:**
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
page_id     INTEGER NOT NULL                  -- FK → bio_pages.id
type        TEXT NOT NULL                     -- Block type: 'text', 'image', 'video', 'embed'
content     TEXT DEFAULT '{}'                 -- JSON: Block content
sort_order  INTEGER DEFAULT 0                 -- Thứ tự hiển thị
is_visible  INTEGER DEFAULT 1                 -- Hiển thị hay ẩn (1=show, 0=hide)
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_blocks_page` trên `(page_id, sort_order)` - Tìm và sort blocks

**Content JSON Examples:**

**Text Block:**
```json
{
  "text": "Welcome to my page!",
  "align": "center",
  "fontSize": 16
}
```

**Image Block:**
```json
{
  "url": "https://...",
  "alt": "My image",
  "width": "100%"
}
```

**Video Block:**
```json
{
  "url": "https://youtube.com/...",
  "provider": "youtube"
}
```

**Quan hệ:**
- N blocks → 1 bio_page (N:1)

**Use cases:**
- Thêm text, image, video vào trang
- Chỉnh sửa content
- Ẩn/hiện block
- Sắp xếp thứ tự blocks
- Xóa block

**Cascade Delete:**
- Xóa bio_page → xóa tất cả blocks

---

### 7. 📎 `assets` - File Uploads

**Chức năng:** Quản lý file uploads (images) lưu trên Cloudflare R2

**Cấu trúc:**
```sql
id           INTEGER PRIMARY KEY AUTOINCREMENT
user_id      INTEGER NOT NULL                 -- FK → users.id
type         TEXT DEFAULT 'image'             -- Asset type: 'image', 'video', 'file'
storage_key  TEXT NOT NULL                    -- R2 storage key
url          TEXT NOT NULL                    -- Public URL
mime_type    TEXT                             -- MIME type (image/jpeg, etc.)
size_bytes   INTEGER                          -- File size
created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Index:**
- `idx_assets_user` trên `user_id` - Tìm assets của user

**Quan hệ:**
- N assets → 1 user (N:1)

**Use cases:**
- Upload avatar
- Upload link icons
- Upload block images
- Upload background images
- Quản lý storage quota
- Xóa file không dùng

**Cascade Delete:**
- Xóa user → xóa tất cả assets

**Storage:**
- Files lưu trên Cloudflare R2
- `storage_key`: Key trong R2 bucket
- `url`: Public URL để access

---

## 🔗 Sơ Đồ Quan Hệ

```
users (1) ──────┬──────> (N) bio_pages
                │
                └──────> (N) assets

bio_pages (1) ──┬──────> (N) link_groups
                │
                └──────> (N) blocks

link_groups (1) ───────> (N) links

theme_presets (1) ─────> (N) bio_pages
```

## 🎯 Cascade Delete Rules

```
DELETE user
  └─> DELETE bio_pages
       ├─> DELETE link_groups
       │    └─> DELETE links
       └─> DELETE blocks
  └─> DELETE assets
```

## 📊 Thống Kê Database

**Tổng số bảng:** 7 bảng chính + 2 bảng hệ thống

**Indexes:** 7 indexes
- 1 trên users
- 2 trên bio_pages
- 1 trên link_groups
- 1 trên links
- 1 trên blocks
- 1 trên assets

**Foreign Keys:** 6 relationships
- users → bio_pages
- users → assets
- bio_pages → link_groups
- bio_pages → blocks
- link_groups → links
- theme_presets → bio_pages

## 🚀 Use Cases Chính

### 1. Tạo Bio Page Mới
```
1. User đăng ký → INSERT users
2. Tạo page → INSERT bio_pages
3. Tạo default group → INSERT link_groups
4. Thêm links → INSERT links
```

### 2. Chỉnh Sửa Appearance (Autosave)
```
1. User chỉnh màu/font → UPDATE bio_pages.draft_settings
2. Debounce 1s → Auto save
3. Preview realtime
```

### 3. Publish Changes
```
1. User bấm "Xuất bản"
2. Copy draft_settings → settings
3. UPDATE bio_pages.status = 'published'
4. Invalidate cache
```

### 4. Hiển Thị Trang Công Khai
```
1. GET /:username
2. SELECT bio_pages WHERE username = ?
3. SELECT link_groups WHERE page_id = ?
4. SELECT links WHERE group_id IN (...)
5. SELECT blocks WHERE page_id = ?
6. Render page
```

## 💡 Tối Ưu & Best Practices

### Indexes
✅ Đã có indexes trên:
- Foreign keys (user_id, page_id, group_id)
- Unique fields (email, username, theme key)
- Sort fields (sort_order)

### JSON Fields
- `settings`, `draft_settings`: Lưu config linh hoạt
- `content`: Lưu block content đa dạng
- `config`: Lưu theme config

### Soft Delete
- `is_active` trong users
- `is_active` trong links
- `is_visible` trong blocks

### Timestamps
- Tất cả bảng có `created_at`
- Bảng có thể update có `updated_at`

## 🔮 Mở Rộng Tương Lai

Có thể thêm:
- `analytics` - Tracking clicks
- `custom_domains` - Custom domain cho bio page
- `subscriptions` - Premium features
- `templates` - Page templates
- `integrations` - Third-party integrations
