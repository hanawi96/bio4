# Quick Start - Icon Upload Feature

## Bước 1: Chạy Database Migration

### Windows (PowerShell)
```powershell
cd api
.\run-icon-migration.ps1
```

### Linux/Mac (Bash)
```bash
cd api
chmod +x run-icon-migration.sh
./run-icon-migration.sh
```

### Hoặc chạy thủ công
```bash
cd api
npx wrangler d1 execute bio-link-db --local --file=migrations/add_icon_fields.sql
```

## Bước 2: Restart Dev Server

```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Bước 3: Test

1. Mở editor: http://localhost:5173/editor/[username]
2. Thêm link mới
3. Click vào ô thumbnail
4. Chọn "Choose from Tabler Icons"
5. Search icon (vd: "github", "home", "user")
6. Chọn icon và save
7. Kiểm tra icon hiển thị đúng

## Kiểm tra Migration thành công

```bash
cd api
npx wrangler d1 execute bio-link-db --local --command="PRAGMA table_info(links);"
```

Phải thấy 2 cột mới:
- `icon_type` TEXT
- `icon_data` TEXT

## Các thay đổi chính

### Database
- Thêm `icon_type` và `icon_data` vào bảng `links`
- Migrate data cũ từ `icon_url` sang `icon_data`

### Backend API
- POST/PUT `/links/*` nhận `icon_type` và `icon_data`
- Tự động xóa ảnh cũ khi thay đổi icon

### Frontend
- IconPickerModal: Search từ Iconify API (200,000+ icons)
- LinkForm: Dùng `iconType` và `iconData` props
- Render icon qua `getIconUrl()` helper

## Iconify API Examples

```
# GitHub icon
tabler:brand-github

# Home icon
mdi:home

# User icon
heroicons:user-circle

# Star icon
lucide:star

# Facebook icon
fa6-brands:facebook
```

## Troubleshooting

### Migration lỗi "column already exists"
```bash
# Bỏ qua, cột đã tồn tại rồi
```

### Icons không hiển thị
- Kiểm tra network tab
- Thử truy cập: https://api.iconify.design/tabler/home.svg
- Kiểm tra format icon ID: `collection:name`

### Frontend lỗi TypeScript
```bash
cd frontend
npm run build
```

Nếu có lỗi, check file `LinkForm.svelte` props đã đúng chưa.

## Xong!

Giờ bạn có thể:
- ✅ Upload ảnh thumbnail cho link
- ✅ Chọn icon từ 200,000+ icons miễn phí
- ✅ Search icons realtime
- ✅ Tự động xóa ảnh cũ khi thay đổi
