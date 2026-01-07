# TODO Checklist - Icon Upload Feature

## ✅ Đã hoàn thành

### Backend
- [x] Tạo migration file `add_icon_fields.sql`
- [x] Update `Link` interface trong `types.ts`
- [x] Update `createLink()` trong `db.ts`
- [x] Update `updateLink()` trong `db.ts`
- [x] Update POST `/links/:groupId` route
- [x] Update PUT `/links/:linkId` route
- [x] Update DELETE `/links/:linkId` route
- [x] Update `deleteLinkIconFromR2()` helper
- [x] Tạo migration scripts (bash + powershell)

### Frontend
- [x] Add `getIconUrl()` helper
- [x] Add `searchIconifyIcons()` helper
- [x] Add `getIconCollections()` helper
- [x] Update `IconPickerModal` với Iconify API
- [x] Update `LinkForm` props và logic
- [x] Unified thumbnail display

### Documentation
- [x] `IMPLEMENTATION_GUIDE.md` - Chi tiết kỹ thuật
- [x] `QUICK_START.md` - Hướng dẫn nhanh
- [x] `CHANGES_SUMMARY.md` - Tổng hợp thay đổi
- [x] `TODO_CHECKLIST.md` - File này

### Quality Checks
- [x] No TypeScript errors
- [x] No linting errors
- [x] All diagnostics passed

---

## 🔲 Cần làm tiếp (Bạn)

### 1. Chạy Migration
```powershell
cd api
.\run-icon-migration.ps1
```

### 2. Test cơ bản
- [ ] Restart dev servers
- [ ] Mở editor
- [ ] Thêm link mới
- [ ] Click thumbnail → chọn icon
- [ ] Search "github" → chọn icon
- [ ] Save và kiểm tra hiển thị

### 3. Test upload ảnh
- [ ] Thêm link mới
- [ ] Click thumbnail → upload ảnh
- [ ] Crop và save
- [ ] Kiểm tra ảnh hiển thị đúng

### 4. Test edit
- [ ] Edit link có icon → đổi sang ảnh
- [ ] Edit link có ảnh → đổi sang icon
- [ ] Kiểm tra ảnh cũ bị xóa khỏi R2

### 5. Test delete
- [ ] Delete link có ảnh
- [ ] Kiểm tra ảnh bị xóa khỏi R2
- [ ] Delete link có icon (không cần xóa gì)

### 6. Test edge cases
- [ ] Link không có icon (empty state)
- [ ] Search icon không có kết quả
- [ ] Network error khi search
- [ ] Upload ảnh quá lớn (>5MB)
- [ ] Upload file không phải ảnh

---

## 🐛 Nếu gặp lỗi

### Migration lỗi
```bash
# Kiểm tra schema
npx wrangler d1 execute bio-link-db --local --command="PRAGMA table_info(links);"

# Nếu cột đã tồn tại, bỏ qua lỗi
```

### Icons không load
1. Check network tab
2. Thử truy cập: https://api.iconify.design/tabler/home.svg
3. Kiểm tra format icon ID: `collection:name`

### TypeScript errors
```bash
cd frontend
npm run build
```

### Component không nhận props
- Check `LinkForm.svelte` props: `iconType`, `iconData`
- Check parent component có truyền đúng props không

---

## 📋 Integration với code hiện tại

### Nơi cần update (nếu có)

#### 1. Nơi tạo link mới
```typescript
// CŨ
const linkData = {
  title: 'GitHub',
  url: 'https://github.com',
  icon_url: 'https://...'  // ❌
};

// MỚI
const linkData = {
  title: 'GitHub',
  url: 'https://github.com',
  icon_type: 'iconify',     // ✅
  icon_data: 'tabler:brand-github'  // ✅
};
```

#### 2. Nơi hiển thị link
```svelte
<!-- CŨ -->
{#if link.icon_url}
  <img src={link.icon_url} alt="icon" />
{/if}

<!-- MỚI -->
<script>
  import { getIconUrl } from '$lib/utils/iconUtils';
  $: iconUrl = getIconUrl(link.icon_type, link.icon_data);
</script>

{#if iconUrl}
  <img src={iconUrl} alt="icon" />
{/if}
```

#### 3. Nơi gọi LinkForm
```svelte
<!-- CŨ -->
<LinkForm
  bind:headline
  bind:url
  bind:iconPreviewUrl  {/* ❌ */}
  bind:iconSvg         {/* ❌ */}
/>

<!-- MỚI -->
<LinkForm
  bind:headline
  bind:url
  bind:iconType        {/* ✅ */}
  bind:iconData        {/* ✅ */}
  on:iconChange={handleIconChange}
/>
```

---

## 🎯 Success Criteria

Chức năng hoàn thành khi:
- ✅ Migration chạy thành công
- ✅ Có thể search và chọn icon từ Iconify
- ✅ Có thể upload ảnh thumbnail
- ✅ Icon/ảnh hiển thị đúng trong editor
- ✅ Icon/ảnh hiển thị đúng trên public page
- ✅ Ảnh cũ tự động xóa khi thay đổi
- ✅ Không có TypeScript/linting errors

---

## 📞 Support

Nếu cần giúp:
1. Check `IMPLEMENTATION_GUIDE.md` - Chi tiết kỹ thuật
2. Check `QUICK_START.md` - Hướng dẫn nhanh
3. Check `CHANGES_SUMMARY.md` - Tổng hợp thay đổi
4. Hỏi tôi nếu còn vấn đề!

---

**Current Status**: ✅ Code complete, ready for testing
**Next Action**: Chạy migration và test
