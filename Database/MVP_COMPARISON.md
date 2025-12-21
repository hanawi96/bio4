# Schema Comparison: Full vs MVP

## ❌ Bảng BỎ trong MVP (thêm sau khi có users)

### 1. oauth_accounts
**Lý do bỏ**: OAuth phức tạp, MVP dùng email/password đơn giản
**Thêm lại khi**: Có 100+ users, cần social login

### 2. plans + subscriptions
**Lý do bỏ**: Free-only đơn giản hơn, tránh payment integration
**Thêm lại khi**: Cần monetize, có feature Pro

### 3. themes_custom
**Lý do bỏ**: Chỉ dùng presets có sẵn, đủ cho MVP
**Thêm lại khi**: Users yêu cầu custom theme nhiều

### 4. domains + page_routes
**Lý do bỏ**: Username-based routing đơn giản (`/username`)
**Thêm lại khi**: Cần custom domain (Pro feature)

### 5. page_publish_cache
**Lý do bỏ**: Cache ở Workers/CDN level, không cần DB
**Thêm lại khi**: Performance issue với complex pages

### 6. page_access_sessions
**Lý do bỏ**: Password protection không cần trong MVP
**Thêm lại khi**: Users yêu cầu private pages

## ✅ Bảng GIỮ LẠI cho MVP

### Core Tables
- **users**: Auth cơ bản
- **bio_pages**: Core feature (1 page/user)
- **link_groups**: Organize links
- **links**: Main content
- **blocks**: Flexible layout
- **theme_presets**: Built-in themes
- **assets**: Image uploads

## 🎯 Đơn giản hóa

### bio_pages
- Bỏ: locale, access_type, password_hash
- Giữ: username, title, bio, theme, status
- Đơn giản: 1 user = 1 page

### links
- Bỏ: sort_key (dùng sort_order integer)
- Giữ: title, url, icon, is_active

### blocks
- Bỏ: ref_id complexity
- Giữ: type, content JSON, sort_order

## 📊 So sánh

| Feature | Full Schema | MVP Schema |
|---------|-------------|------------|
| Tables | 15 | 8 |
| Auth | Email + OAuth | Email only |
| Plans | Free/Pro | Free only |
| Themes | Preset + Custom | Preset only |
| Domains | System + Custom | Username only |
| Password | Yes | No |
| Complexity | High | Low |

## 🚀 Migration Path

Khi cần scale, thêm dần:
1. OAuth (nếu users yêu cầu)
2. Plans + Subscriptions (khi monetize)
3. Custom domains (Pro feature)
4. Password protection (Pro feature)
5. Custom themes (Advanced users)

MVP này đủ để validate idea và có first users!
