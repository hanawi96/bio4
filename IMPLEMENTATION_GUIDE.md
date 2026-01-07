# Icon Upload Feature - Implementation Guide

## Tổng quan
Chức năng upload icon/thumbnail cho links với 2 options:
1. **Upload ảnh**: Upload ảnh lên R2 storage
2. **Chọn icon**: Chọn từ Iconify API (200,000+ icons miễn phí)

## Các thay đổi đã thực hiện

### 1. Database Migration
**File**: `api/migrations/add_icon_fields.sql`

Thêm 2 cột mới vào bảng `links`:
- `icon_type`: 'none' | 'image' | 'iconify'
- `icon_data`: URL (cho image) hoặc icon ID (cho iconify)

**Chạy migration**:
```bash
# Windows
cd api
.\run-icon-migration.ps1

# Linux/Mac
cd api
chmod +x run-icon-migration.sh
./run-icon-migration.sh
```

### 2. Backend Changes

#### Types (`api/src/types.ts`)
- Updated `Link` interface với `icon_type` và `icon_data`

#### Database Functions (`api/src/db.ts`)
- `createLink()`: Thêm params `icon_type`, `icon_data`
- `updateLink()`: Thêm params `icon_type`, `icon_data`

#### API Routes (`api/src/routes/links.ts`)
- POST `/links/:groupId`: Nhận `icon_type`, `icon_data`
- PUT `/links/:linkId`: Nhận `icon_type`, `icon_data`, tự động xóa ảnh cũ khi thay đổi
- DELETE `/links/:linkId`: Xóa ảnh từ R2 nếu là image type
- Helper `deleteLinkIconFromR2()`: Chỉ xóa khi `icon_type === 'image'`

### 3. Frontend Changes

#### Icon Utils (`frontend/src/lib/utils/iconUtils.ts`)
Thêm functions mới:
- `getIconUrl(iconType, iconData)`: Convert icon data thành URL để hiển thị
- `searchIconifyIcons(query)`: Search icons từ Iconify API
- `getIconCollections()`: Lấy danh sách collections

#### IconPickerModal (`frontend/src/lib/components/modals/IconPickerModal.svelte`)
- Đổi từ local Tabler Icons sang Iconify API
- Search realtime với debounce
- Hiển thị 200,000+ icons từ nhiều collections
- Dispatch `{ iconType: 'iconify', iconData: 'tabler:brand-github' }`

#### LinkForm (`frontend/src/lib/components/editor/LinkForm.svelte`)
- Đổi props: `iconType`, `iconData` thay vì `iconPreviewUrl`, `iconSvg`
- Dùng `getIconUrl()` để render preview
- Dispatch `iconChange` event với `{ iconType, iconData }`

## Cách sử dụng

### 1. Tạo link mới với icon
```typescript
// Frontend
const linkData = {
  title: 'GitHub',
  url: 'https://github.com',
  iconType: 'iconify',
  iconData: 'tabler:brand-github'
};

// API call
POST /links/:groupId
{
  "title": "GitHub",
  "url": "https://github.com",
  "icon_type": "iconify",
  "icon_data": "tabler:brand-github"
}
```

### 2. Upload ảnh
```typescript
// Frontend
const linkData = {
  title: 'My Link',
  url: 'https://example.com',
  iconType: 'image',
  iconData: 'https://r2-url/link-icons/abc123.jpg'
};

// API call
POST /links/:groupId
{
  "title": "My Link",
  "url": "https://example.com",
  "icon_type": "image",
  "icon_data": "https://r2-url/link-icons/abc123.jpg"
}
```

### 3. Hiển thị icon
```typescript
import { getIconUrl } from '$lib/utils/iconUtils';

// Get URL để hiển thị
const iconUrl = getIconUrl(link.icon_type, link.icon_data);

// Render
<img src={iconUrl} alt="icon" />
```

## Iconify API

### Format icon ID
```
collection:icon-name

Ví dụ:
- tabler:brand-github
- mdi:home
- heroicons:user-circle
- lucide:star
- fa6-brands:facebook
```

### API Endpoints
```
# Get icon SVG
https://api.iconify.design/{collection}/{icon}.svg
https://api.iconify.design/tabler/brand-github.svg

# Search icons
https://api.iconify.design/search?query=github&limit=64&prefixes=tabler,mdi

# Get collections
https://api.iconify.design/collections
```

### Customize icon
```
# Thay đổi màu và size
https://api.iconify.design/tabler/home.svg?color=red&width=32&height=32
```

## Testing Checklist

- [ ] Chạy migration thành công
- [ ] Tạo link mới với Iconify icon
- [ ] Tạo link mới với upload ảnh
- [ ] Edit link: đổi từ icon sang ảnh
- [ ] Edit link: đổi từ ảnh sang icon
- [ ] Xóa link có ảnh (kiểm tra ảnh bị xóa khỏi R2)
- [ ] Search icons từ Iconify
- [ ] Hiển thị icon preview trong editor
- [ ] Hiển thị icon trên public page

## Troubleshooting

### Migration lỗi
```bash
# Kiểm tra database schema
npx wrangler d1 execute bio-link-db --local --command="PRAGMA table_info(links);"

# Rollback nếu cần
npx wrangler d1 execute bio-link-db --local --command="ALTER TABLE links DROP COLUMN icon_type; ALTER TABLE links DROP COLUMN icon_data;"
```

### Icons không load
- Kiểm tra network tab, xem API Iconify có bị block không
- Thử truy cập trực tiếp: https://api.iconify.design/tabler/home.svg
- Kiểm tra format icon ID đúng chưa (collection:name)

### Ảnh không xóa khỏi R2
- Kiểm tra `deleteLinkIconFromR2()` có được gọi không
- Kiểm tra `icon_type === 'image'` 
- Kiểm tra storage key format đúng chưa

## Next Steps (Optional)

1. **Cache icons**: Cache SVG vào localStorage để offline
2. **Lazy load**: Lazy load icons khi scroll
3. **Icon categories**: Thêm filter theo categories
4. **Recent icons**: Lưu icons đã dùng gần đây
5. **Custom colors**: Cho phép customize màu icon
