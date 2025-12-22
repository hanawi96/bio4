# 🗂️ Database Schema Diagram

## Sơ Đồ Tổng Quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BIO LINK DATABASE                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     users        │ 👤 Người dùng
├──────────────────┤
│ • id (PK)        │
│ • email          │
│ • password_hash  │
│ • display_name   │
│ • avatar_url     │
│ • is_active      │
└────────┬─────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────────────────────┐
    │                                     │
    ▼                                     ▼
┌──────────────────┐              ┌──────────────────┐
│   bio_pages      │ 📄 Trang Bio │     assets       │ 📎 Files
├──────────────────┤              ├──────────────────┤
│ • id (PK)        │              │ • id (PK)        │
│ • user_id (FK)   │              │ • user_id (FK)   │
│ • username       │              │ • storage_key    │
│ • title          │              │ • url            │
│ • bio            │              │ • mime_type      │
│ • avatar_url     │              │ • size_bytes     │
│ • status         │              └──────────────────┘
│ • theme_preset   │
│ • theme_mode     │
│ • settings       │ ← PUBLISHED
│ • draft_settings │ ← DRAFT ✨
└────────┬─────────┘
         │
         │ 1:N
         │
    ┌────┴──────────────┐
    │                   │
    ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  link_groups     │  │     blocks       │ 🧩 Content
├──────────────────┤  ├──────────────────┤
│ • id (PK)        │  │ • id (PK)        │
│ • page_id (FK)   │  │ • page_id (FK)   │
│ • title          │  │ • type           │
│ • layout_type    │  │ • content (JSON) │
│ • sort_order     │  │ • sort_order     │
└────────┬─────────┘  │ • is_visible     │
         │            └──────────────────┘
         │ 1:N
         │
         ▼
┌──────────────────┐
│      links       │ 🔗 Links
├──────────────────┤
│ • id (PK)        │
│ • group_id (FK)  │
│ • title          │
│ • url            │
│ • icon_url       │
│ • sort_order     │
│ • is_active      │
└──────────────────┘

┌──────────────────┐
│ theme_presets    │ 🎨 Themes
├──────────────────┤
│ • id (PK)        │
│ • key            │
│ • name           │
│ • config (JSON)  │
└──────────────────┘
         │
         │ 1:N
         └──────────> bio_pages
```

## Flow Dữ Liệu

### 📝 Tạo Bio Page Mới

```
User Registration
       │
       ▼
┌─────────────┐
│   INSERT    │
│   users     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   INSERT    │
│  bio_pages  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│   INSERT    │  │   INSERT    │
│ link_groups │  │   blocks    │
└──────┬──────┘  └─────────────┘
       │
       ▼
┌─────────────┐
│   INSERT    │
│    links    │
└─────────────┘
```

### ✏️ Autosave Flow

```
User Edits
    │
    ▼
┌──────────────────────┐
│  Store Update        │
│  (page/theme)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Debounce 1000ms     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  UPDATE bio_pages    │
│  SET draft_settings  │ ← Lưu vào DRAFT
└──────────────────────┘
```

### 🚀 Publish Flow

```
User Clicks "Publish"
         │
         ▼
┌──────────────────────────┐
│  UPDATE bio_pages        │
│  SET settings =          │
│      draft_settings      │ ← Copy DRAFT → PUBLISHED
│  SET status = published  │
└──────────────────────────┘
```

### 👁️ Public View Flow

```
GET /:username
      │
      ▼
┌─────────────────────┐
│ SELECT bio_pages    │
│ WHERE username = ?  │
└──────────┬──────────┘
           │
           ├──────────────────┬──────────────┐
           │                  │              │
           ▼                  ▼              ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ SELECT           │  │ SELECT       │  │ SELECT       │
│ link_groups      │  │ blocks       │  │ theme_preset │
└────────┬─────────┘  └──────────────┘  └──────────────┘
         │
         ▼
┌──────────────────┐
│ SELECT links     │
│ WHERE is_active  │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  Render Page     │
└──────────────────┘
```

## 🔐 Cascade Delete

```
DELETE users
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
DELETE bio_pages   DELETE assets
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
DELETE link_groups  DELETE blocks
    │
    ▼
DELETE links
```

## 📊 Data Size Estimates

### Typical Bio Page

```
1 User
  └─ 1 Bio Page
      ├─ 2-5 Link Groups
      │   └─ 3-10 Links per group (total: 6-50 links)
      ├─ 0-5 Blocks
      └─ 1 Theme Preset (reference)

Total rows per user: ~15-60 rows
```

### Storage

```
users:          ~500 bytes/row
bio_pages:      ~2KB/row (with JSON)
link_groups:    ~200 bytes/row
links:          ~300 bytes/row
blocks:         ~1KB/row (with JSON)
assets:         ~200 bytes/row (metadata only, files in R2)
theme_presets:  ~1KB/row (shared)

Estimated per user: ~10-30 KB (database only)
```

## 🎯 Key Features

### ✅ Implemented

- ✅ User authentication
- ✅ Bio page management
- ✅ Link groups & links
- ✅ Content blocks
- ✅ Theme presets
- ✅ File uploads (R2)
- ✅ Draft/Published states ✨
- ✅ Autosave ✨
- ✅ Soft delete (users, links, blocks)
- ✅ Sort ordering
- ✅ Cascade deletes

### 🔮 Future Enhancements

- 📊 Analytics (click tracking)
- 🌐 Custom domains
- 💎 Premium subscriptions
- 📱 QR codes
- 🔗 Short URLs
- 📧 Email capture
- 🎨 Custom CSS
- 🔌 Integrations (Zapier, etc.)

## 💡 Design Decisions

### JSON Fields

**Tại sao dùng JSON?**
- Linh hoạt: Không cần alter table khi thêm field mới
- Settings: Mỗi theme có config khác nhau
- Blocks: Mỗi block type có content khác nhau
- Draft/Published: Dễ dàng so sánh và copy

### Separate Draft/Published

**Tại sao tách riêng?**
- User có thể chỉnh sửa thoải mái mà không ảnh hưởng trang public
- Autosave không làm thay đổi trang public
- Có thể preview trước khi publish
- Rollback dễ dàng (giữ published version)

### Soft Delete

**Tại sao không xóa hẳn?**
- Recovery: Có thể khôi phục nếu xóa nhầm
- Analytics: Giữ lại data để phân tích
- Audit: Biết được ai xóa gì khi nào

### Indexes

**Tại sao index những field này?**
- `email`: Login lookup (rất thường xuyên)
- `username`: Public page lookup (rất thường xuyên)
- `user_id`, `page_id`, `group_id`: Foreign key joins
- `sort_order`: Ordering queries

## 🔍 Query Patterns

### Most Common Queries

1. **Get public bio page** (90% traffic)
   ```sql
   SELECT * FROM bio_pages WHERE username = ?
   ```

2. **Get user's links** (90% traffic)
   ```sql
   SELECT * FROM links 
   WHERE group_id IN (SELECT id FROM link_groups WHERE page_id = ?)
   AND is_active = 1
   ORDER BY sort_order
   ```

3. **Autosave** (frequent)
   ```sql
   UPDATE bio_pages 
   SET draft_settings = ? 
   WHERE id = ?
   ```

4. **Publish** (occasional)
   ```sql
   UPDATE bio_pages 
   SET settings = draft_settings, status = 'published' 
   WHERE id = ?
   ```

### Optimization Tips

- ✅ Index on `username` (public lookups)
- ✅ Index on `(group_id, sort_order)` (link ordering)
- ✅ Composite index on `(page_id, sort_order)` (blocks ordering)
- 🔄 Consider caching public pages (Cloudflare Cache API)
- 🔄 Consider denormalizing link count for analytics
