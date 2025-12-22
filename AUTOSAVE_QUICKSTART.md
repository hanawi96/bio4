# 🚀 Autosave & Publish - Quick Start

## Chạy Migration

```bash
cd api
wrangler d1 execute YOUR_DB_NAME --file=../Database/migrations/002_add_draft_settings.sql
```

## Cách hoạt động

### 1️⃣ DRAFT (Tự động lưu)
- User chỉnh sửa → Tự động lưu sau 1s
- Hiển thị: "Đang lưu..." → "Đã lưu"
- Reload trang không mất dữ liệu

### 2️⃣ PUBLISH (Xuất bản)
- User bấm nút "Xuất bản"
- Copy DRAFT → PUBLISHED
- Visitor thấy dữ liệu mới

## Files quan trọng

```
frontend/src/lib/
├── stores/
│   ├── autosave.ts          # Logic autosave
│   └── page.ts              # Store với trigger
├── components/
│   └── SaveIndicator.svelte # UI component
└── api.client.ts            # API methods

api/src/
├── db.ts                    # saveDraft, publishDraft
└── routes/editor.ts         # PUT /draft, POST /publish

Database/migrations/
└── 002_add_draft_settings.sql
```

## Test nhanh

1. Mở `/dashboard/appearance`
2. Đổi màu → Thấy "Đã lưu"
3. Reload → Màu vẫn còn
4. Bấm "Xuất bản" → Toast success
5. Mở `/:username` → Thấy màu mới

## Tùy chỉnh

### Đổi thời gian debounce
```typescript
// frontend/src/lib/stores/autosave.ts
setTimeout(async () => {
  // ...
}, 1000); // Đổi thành 500, 1500, etc.
```

### Đổi text tiếng Việt
```svelte
<!-- frontend/src/lib/components/SaveIndicator.svelte -->
$: statusText = {
  saving: 'Đang lưu...',
  saved: 'Đã lưu',
  error: 'Lỗi lưu'
}[$saveStatus];
```

Xong! 🎉
