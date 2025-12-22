# Autosave & Publish System

## Tổng quan

Hệ thống autosave/publish cho phép user chỉnh sửa trang appearance với 2 trạng thái riêng biệt:
- **DRAFT**: Tự động lưu khi chỉnh sửa (autosave)
- **PUBLISHED**: Trạng thái công khai (visitor thấy)

## Kiến trúc

### Database Schema

```sql
-- Thêm field draft_settings vào bio_pages
ALTER TABLE bio_pages ADD COLUMN draft_settings TEXT DEFAULT '{}';

-- settings: dữ liệu PUBLISHED (public)
-- draft_settings: dữ liệu DRAFT (autosave)
```

### Flow hoạt động

```
User chỉnh sửa 
  → Store cập nhật (reactive)
  → Preview realtime
  → Debounce 1000ms
  → API: PUT /editor/:username/draft
  → Lưu vào draft_settings
  → Hiển thị "Đã lưu"

User bấm "Xuất bản"
  → API: POST /editor/:username/publish
  → Copy draft_settings → settings
  → Set status = 'published'
  → Invalidate cache
  → Hiển thị "Đã xuất bản thành công"
```

## API Endpoints

### 1. Save Draft (Autosave)
```
PUT /editor/:username/draft
Body: { title, bio, avatar_url, theme_preset_key, theme_mode, settings }
```

### 2. Publish
```
POST /editor/:username/publish
```

## Frontend Implementation

### 1. Store với Autosave Trigger

```typescript
// frontend/src/lib/stores/page.ts
// Store tự động trigger autosave khi có thay đổi
export const page = createPageStore(); // với autosave trigger
export const theme = createThemeStore(); // với autosave trigger
```

### 2. Autosave Logic

```typescript
// frontend/src/lib/stores/autosave.ts
export function triggerAutosave(username: string) {
  // Debounce 1000ms
  // Skip nếu data không đổi
  // Call API saveDraft
  // Update status: saving → saved → idle
}
```

### 3. Save Indicator Component

```svelte
<!-- frontend/src/lib/components/SaveIndicator.svelte -->
<SaveIndicator username="demo" />
```

Hiển thị:
- "Đang lưu..." (với spinner)
- "Đã lưu" (với checkmark)
- Nút "Xuất bản"
- Toast "Đã xuất bản thành công"

## Tính năng

✅ **Autosave tự động**: Debounce 1000ms, chỉ lưu khi data thay đổi
✅ **Preview realtime**: Cập nhật ngay lập tức
✅ **Tránh race condition**: Skip nếu data không đổi
✅ **Status indicator**: Hiển thị trạng thái lưu
✅ **Publish riêng biệt**: Copy draft → published
✅ **Không mất dữ liệu**: Reload trang vẫn giữ draft

## Migration

Chạy migration để thêm field `draft_settings`:

```bash
# Cloudflare D1
wrangler d1 execute DB_NAME --file=Database/migrations/002_add_draft_settings.sql
```

## Testing

1. Mở trang `/dashboard/appearance`
2. Chỉnh sửa bất kỳ setting nào
3. Thấy "Đang lưu..." → "Đã lưu"
4. Reload trang → Dữ liệu vẫn còn
5. Bấm "Xuất bản" → Thấy toast success
6. Mở trang public `/:username` → Thấy dữ liệu mới

## Tối ưu

- **Debounce 1000ms**: Giảm số lần gọi API
- **Skip unchanged data**: Không lưu nếu data giống nhau
- **JSON serialization**: So sánh data bằng JSON.stringify
- **Cleanup on unmount**: Xóa autosave trigger khi rời trang
