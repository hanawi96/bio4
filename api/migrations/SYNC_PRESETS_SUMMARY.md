# Đồng bộ Block & Header Presets - Summary

## Vấn đề ban đầu

Có **3 nguồn khác nhau** cho block/header configs:
1. `frontend/src/lib/appearance/presets.ts` - Hardcoded (đang được dùng)
2. `frontend/src/lib/appearance/blockStyles.ts` - Block style recipes (đang được dùng)
3. Database `block_presets` & `header_presets` - Vừa tạo (chưa được dùng)

## Giải pháp

### 1. Làm rõ 2 concepts khác nhau:

**Block Presets** (shape + layout):
- `rounded-solid`, `pill-outline`, `square-gradient`, `ghost`, `bold`
- Định nghĩa: shape, borderRadius, size, iconPosition, spacing, hoverEffect
- Lưu trong database `block_presets`

**Block Style Recipes** (color formulas):
- `solid`, `soft`, `outline`, `glass`, `neon`, `brutal`
- Định nghĩa: fill, text, border, glow, blur, shadow (token references)
- Giữ trong code `blockStyles.ts` (không cần database)

### 2. Kiến trúc mới:

```
User chọn:
├─ Theme (minimal, dark, gradient) → Design tokens
├─ Header Preset (with-cover, no-cover) → Layout
├─ Block Preset (rounded-solid, pill-outline) → Shape
└─ Block Style Recipe (solid, soft, outline) → Colors/Effects
```

### 3. Thay đổi code:

#### Frontend stores mới:
- `frontend/src/lib/stores/headerPresets.ts` - Load từ API
- `frontend/src/lib/stores/blockPresets.ts` - Load từ API

#### Resolver updated:
- `frontend/src/lib/appearance/resolver.ts`
- Dùng stores với fallback về hardcoded presets

#### Layout updated:
- `frontend/src/routes/dashboard/+layout.svelte`
- Load presets khi app khởi động

### 4. Database migrations:

**004_create_block_presets.sql** - Tạo bảng (sai data)
**007_sync_block_presets_with_frontend.sql** - Sync đúng data từ presets.ts

### 5. API endpoints:

- `GET /header-presets` - List all header presets
- `GET /header-presets/:key` - Get single preset
- `GET /block-presets` - List all block presets
- `GET /block-presets/:key` - Get single preset

## Kết quả

✅ **1 nguồn duy nhất**: Database
✅ **Fallback**: Hardcoded presets nếu API fail
✅ **Tách biệt**: Presets (layout) vs Recipes (styling)
✅ **Không breaking**: Vẫn tương thích với code cũ

## Testing

```bash
# Test API endpoints
curl http://localhost:8787/block-presets
curl http://localhost:8787/header-presets

# Verify database
wrangler d1 execute bio-link-db --remote --command="SELECT key, name FROM block_presets;"
wrangler d1 execute bio-link-db --remote --command="SELECT key, name FROM header_presets;"
```

## Migration steps

1. ✅ Tạo bảng `block_presets`
2. ✅ Sync data với presets.ts
3. ✅ Tạo API routes
4. ✅ Tạo frontend stores
5. ✅ Update resolver
6. ✅ Load presets trong layout
7. ⏳ Test appearance page

## Next steps

- Test appearance page hoạt động đúng
- Verify không có lỗi console
- Kiểm tra preview render đúng
- Test switch giữa các presets
