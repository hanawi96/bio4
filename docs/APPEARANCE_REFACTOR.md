# Appearance System Refactor - COMPLETED ✅

## Tổng quan

Refactor hệ thống appearance từ nested structure phức tạp sang flat structure đơn giản, chỉ lưu những gì khác với preset.

## Cấu trúc dữ liệu

### Internal State
```ts
interface AppearanceState {
  presetKey: string;                    // "minimal", "dark", "gradient"
  overrides: Record<string, any>;       // Chỉ lưu giá trị KHÁC preset
  headerPresetId?: string;              // Header preset (nếu khác default)
  blockPresetId?: string;               // Block preset (nếu khác default)
}
```

### Database Format
```json
{
  "themeKey": "gradient",
  "overrides": {
    "backgroundColor": "background: radial-gradient(...)",
    "header.coverType": "solid"
  },
  "headerPresetId": "no-cover"
}
```

## Nguyên tắc hoạt động

1. **Chọn theme preset** → `overrides = {}`
2. **Mọi thay đổi** qua `updateAppearance(path, value)`
3. **Auto compare**:
   - `value === preset` → Xóa khỏi overrides
   - `value !== preset` → Lưu vào overrides
   - `value === null/undefined` → Xóa khỏi overrides
4. **Custom detection**: `overrides` không rỗng HOẶC preset IDs khác default

---

## Core Files

### `frontend/src/lib/appearance/manager.ts`

**Functions:**
- `setAppearance(state, path, value)` - Set value, auto compare với preset
- `getPresetValue(presetKey, path)` - Lấy value từ preset
- `getResolvedValue(state, path)` - Merge override + preset
- `isCustomTheme(state)` - Check có customization không
- `resetToPreset(presetKey)` - Reset về preset
- `migrateOldToNew()` / `migrateNewToOld()` - Convert formats

**Key logic:**
```ts
if (value === null || value === undefined) {
  delete overrides[path];
} else if (deepEqual(value, presetValue)) {
  delete overrides[path];
} else {
  overrides[path] = value;
}
```

### `frontend/src/lib/stores/appearanceManager.ts`

**Exports:**
- `appearanceState` - Derived store từ page
- `isCustom` - Boolean: có customization không
- `updateAppearance(path, value)` - Sync function, debounced save
- `changeThemePreset(presetKey)` - Đổi theme
- `changeHeaderPreset(id)` / `changeBlockPreset(id)` - Đổi presets

**Removed:**
- ❌ `isUpdating` flag (gây race condition)
- ❌ Async/await không cần thiết

---

## Components Refactored

### ✅ ThemeSection
- Dùng `$isCustom` để highlight Custom card
- Gọi `changeThemePreset()` khi chọn theme

### ✅ HeaderSection
- Dùng `updateAppearance('header.coverType', value)`
- Lấy values từ `$appearanceState.overrides['header.xxx']`

### ✅ BackgroundSection (ALL types)

**Update functions (tất cả dùng `updateAppearance`):**
```ts
updateSolidColor(color)
updateGradientColor(gradient, from, to, direction, type)
updatePatternColor(patternId, inkColor, bgColor)
updateImageBackground(imageUrl)
updateVideoBackground(videoUrl)
```

**Removed:**
- ❌ `updateBgColor()` - old function
- ❌ `saveTimer` - manager đã có debounce
- ❌ `isUserUpdate` flag - không cần
- ❌ Direct `page.update()` và `api.saveDraft()` calls
- ❌ Reactive statements tự động switch type
- ❌ Code trùng lặp (~450 dòng)

**Simplified:**
- Initial load: detect type 1 lần với `hasInitialized` flag
- Theme change: reset về theme default
- Type switching: sync function, không có race condition

### ✅ Preview Components
- `HeaderPreview.svelte` - Dùng `$appearanceState`
- `PhoneMockup.svelte` - Dùng `$appearanceState`

---

## Backend

### `api/src/db.ts`
- Detect full reset vs partial update
- Full reset: replace toàn bộ
- Partial update: merge với data cũ

---

## Examples

### 1. User chọn theme "gradient"
```
→ changeThemePreset("gradient")
→ DB: { themeKey: "gradient", overrides: {} }
→ UI: Highlight "Gradient" card
```

### 2. User đổi background sang pattern
```
→ updateAppearance("backgroundColor", "background: radial-gradient(...)")
→ DB: { themeKey: "gradient", overrides: { backgroundColor: "..." } }
→ UI: Highlight "Custom" card
```

### 3. User đổi header preset
```
→ changeHeaderPreset("no-cover")
→ DB: { themeKey: "gradient", overrides: {}, headerPresetId: "no-cover" }
→ UI: Highlight "Custom" card (vì headerPresetId ≠ default)
```

### 4. User reset về theme default
```
→ changeThemePreset("gradient")
→ DB: { themeKey: "gradient", overrides: {} }
→ UI: Highlight "Gradient" card
```

---

## Benefits

✅ **Đơn giản**: Flat structure, dễ hiểu  
✅ **Compact**: Chỉ lưu những gì thay đổi  
✅ **Maintainable**: 1 hàm duy nhất cho mọi updates  
✅ **No race conditions**: Sync updates, không có blocking flags  
✅ **Clean code**: Giảm ~450 dòng code thừa  
✅ **Type safe**: Full TypeScript support  

---

## Migration Notes

- Old format vẫn được support qua `migrateOldToNew()`
- New format tự động save qua `migrateNewToOld()`
- Không cần migration script, tự động convert khi load

---

**Status**: ✅ COMPLETED - All phases done, tested, production ready
