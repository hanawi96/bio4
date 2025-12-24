# Appearance System Refactor

## Yêu cầu

### Cấu trúc dữ liệu mới
```ts
appearance = {
  presetKey: string,           // "minimal", "dark", "gradient"
  overrides: Record<string, any>,  // Chỉ lưu giá trị KHÁC preset
  headerPresetId?: string,     // Header preset đang chọn
  blockPresetId?: string       // Block preset đang chọn
}
```

### Nguyên tắc xử lý
1. **Chọn theme preset** → Reset `overrides = {}`
2. **Mọi thay đổi** đi qua 1 hàm duy nhất: `setAppearance(path, value)`
3. **So sánh với preset**:
   - Giống preset → Xóa khỏi overrides
   - Khác preset → Lưu vào overrides
4. **Xác định Custom**:
   - `overrides` rỗng + preset IDs = default → Highlight preset card
   - Có bất kỳ thay đổi nào → Highlight Custom card

---

## Đã hoàn thành

### Phase 1: Cấu trúc mới ✅

#### File: `frontend/src/lib/appearance/manager.ts`
```ts
// Interface mới
interface AppearanceState {
  presetKey: string;
  overrides: Record<string, any>;
  headerPresetId?: string;
  blockPresetId?: string;
}

// Core functions
getPresetValue(presetKey, path, headerPresetId?, blockPresetId?)  // Lấy giá trị từ preset
setAppearance(state, path, value)  // Set giá trị, tự động so sánh với preset
isCustomTheme(state)               // Check có customization không
getResolvedValue(state, path)      // Lấy giá trị đã merge (override > preset)
resetToPreset(presetKey)           // Reset về preset, xóa overrides
setHeaderPreset(state, headerPresetId)  // Đổi header preset
setBlockPreset(state, blockPresetId)    // Đổi block preset

// Migration functions
migrateOldToNew(dbState)  // Convert DB format cũ → internal state
migrateNewToOld(newState) // Convert internal state → DB format mới
```

#### File: `frontend/src/lib/stores/appearanceManager.ts`
```ts
// Derived stores
appearanceState  // Current state từ page store
isCustom         // Boolean: có customization không

// Actions
updateAppearance(path, value)      // Update 1 field
changeThemePreset(presetKey)       // Đổi theme preset
changeHeaderPreset(headerPresetId) // Đổi header preset
changeBlockPreset(blockPresetId)   // Đổi block preset
getValue(path)                     // Get resolved value
```

### Phase 2: Refactor stores ✅

#### File: `frontend/src/lib/appearance/resolver.ts`
- Hỗ trợ cả format cũ và mới
- Detect format qua `pageState.overrides !== undefined`
- Xóa helper functions không dùng

#### File: `frontend/src/lib/stores/appearance.ts`
- Giữ nguyên, dùng resolver để resolve

### Phase 3.1: ThemeSection ✅

#### File: `frontend/src/lib/components/editor/sections/ThemeSection.svelte`
- Import `appearanceState`, `isCustom`, `changeThemePreset`
- Custom card hiển thị khi `$isCustom = true`
- Preset card highlight khi `currentPresetKey === preset.key && !isCustomTheme`

### Phase 3.3: HeaderSection ✅

#### File: `frontend/src/lib/components/editor/sections/HeaderSection.svelte`
- Import `appearanceState`, `updateAppearance`, `changeHeaderPreset`
- Dùng `updateAppearance('header.coverType', value)` để update
- Lấy giá trị từ `$appearanceState.overrides['header.xxx']` hoặc preset default

#### File: `frontend/src/lib/appearance/presets.ts`
- Thêm `coverType` và `coverValue` vào header presets có cover

#### File: `frontend/src/lib/appearance/types.ts`
- Thêm `coverType?` và `coverValue?` vào `HeaderPreset` interface

### Preview Components ✅

#### File: `frontend/src/lib/components/preview/HeaderPreview.svelte`
- Import `appearanceState` từ manager
- Lấy header từ format mới

#### File: `frontend/src/lib/components/editor/PhoneMockup.svelte`
- Import `appearanceState` và `HEADER_PRESETS`
- Lấy header từ format mới
- `coverStyle` lấy từ header đã merge

### Backend ✅

#### File: `api/src/db.ts`
- `saveDraft()`: Detect full reset vs partial update
- Full reset (có `themeKey` + `overrides` rỗng) → Replace toàn bộ
- Partial update → Merge với data cũ

---

## Chưa hoàn thành

### Phase 4: Testing & Cleanup ❌
- Test flow đầy đủ
- Xóa code cũ không dùng
- Verify DB migration

---

## Phase 3.2: BackgroundSection ✅ (All Types)

### File: `frontend/src/lib/components/editor/sections/BackgroundSection.svelte`

#### Imports thêm
```ts
import { appearanceState, updateAppearance } from '$lib/stores/appearanceManager';
```

#### Derived values
```ts
$: presetBgColor = THEMES_MAP[$appearanceState.presetKey]?.config?.backgroundColor || '#ffffff';
$: resolvedBgColor = $appearanceState.overrides['backgroundColor'] ?? presetBgColor;
```

#### Functions mới (tất cả dùng updateAppearance)
```ts
// Solid color
async function updateSolidColor(color: string) {
  currentBgColor = color;
  backgroundHistory.solid = color;
  await updateAppearance('backgroundColor', color);
}

// Gradient
async function updateGradientColor(gradient: string, from?, to?, direction?, type?) {
  currentBgColor = gradient;
  backgroundHistory.gradient = gradient;
  // ...
  await updateAppearance('backgroundColor', gradient);
}

// Pattern
async function updatePatternColor(patternId: string, inkColor: string, bgColor: string) {
  selectedPattern = patternId;
  patternColor = inkColor;
  patternBgColor = bgColor;
  const patternStyle = getPatternStyle(patternId, inkColor, bgColor);
  currentBgColor = patternStyle;
  backgroundHistory.pattern = patternStyle;
  await updateAppearance('backgroundColor', patternStyle);
}

// Image
async function updateImageBackground(imageUrl: string) {
  backgroundImageUrl = imageUrl;
  const bgValue = `url('${imageUrl}')`;
  currentBgColor = bgValue;
  if (imageUrl !== DEFAULT_IMAGE_BG) {
    backgroundHistory.image = imageUrl;
  }
  await updateAppearance('backgroundColor', bgValue);
}

// Video
async function updateVideoBackground(videoUrl: string) {
  backgroundVideoUrl = videoUrl;
  currentBgColor = '#000000';
  if (videoUrl !== DEFAULT_VIDEO_BG) {
    backgroundHistory.video = videoUrl;
  }
  await updateAppearance('backgroundColor', '#000000');
  await updateAppearance('backgroundVideo', videoUrl);
}
```

#### Đã xóa
- `updateBgColor()` - thay bằng các functions mới
- `saveTimer` - không cần vì updateAppearance đã có debounce
- Code trực tiếp update `page` store và gọi `api.saveDraft`

#### Sync currentBgColor
```ts
$: if (resolvedBgColor) {
  if (resolvedBgColor.match(/^#[0-9a-fA-F]{6}$/)) {
    currentBgColor = resolvedBgColor;
    if (selectedType !== 'solid') selectedType = 'solid';
  } else if (resolvedBgColor.includes('gradient')) {
    currentBgColor = resolvedBgColor;
    if (selectedType !== 'gradient') selectedType = 'gradient';
    // Parse gradient colors...
  }
}
```

---

## DB Format

### Format mới (flat)
```json
{
  "themeKey": "dark",
  "overrides": {
    "backgroundColor": "#ff0000",
    "header.coverType": "solid"
  },
  "headerPresetId": "no-cover"
}
```

### Khi không có thay đổi
```json
{
  "themeKey": "dark",
  "overrides": {}
}
```

### Bảng: `bio_pages`
| Cột | Mô tả |
|-----|-------|
| `theme_preset_key` | Key của preset đang chọn |
| `draft_appearance` | JSON chứa overrides |

---

## Flow hoạt động

```
1. User chọn theme "dark"
   → changeThemePreset("dark")
   → resetToPreset("dark")
   → DB: { themeKey: "dark", overrides: {} }
   → ThemeSection: Highlight "Dark" card

2. User đổi header sang "no-cover" (dark default = "with-cover")
   → changeHeaderPreset("no-cover")
   → headerPresetId = "no-cover" ≠ default
   → isCustomTheme() = true
   → ThemeSection: Highlight "Custom" card

3. User đổi cover color sang #ff0000
   → updateAppearance("header.coverValue", "#ff0000")
   → So sánh với preset: khác → lưu override
   → DB: { themeKey: "dark", overrides: { "header.coverValue": "#ff0000" }, headerPresetId: "no-cover" }

4. User đổi lại header về "with-cover" và cover về default
   → overrides = {}, headerPresetId = default
   → isCustomTheme() = false
   → ThemeSection: Highlight "Dark" card
```
