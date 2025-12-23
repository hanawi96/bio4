# 📤 LUỒNG XỬ LÝ KHI PUBLISH VỚI VIDEO BACKGROUND

## 🔄 TỔNG QUAN LUỒNG

### 1. Frontend: Gọi Publish
```typescript
// frontend/src/lib/stores/autosave.ts
publishChanges(username) {
  await api.publishPage(username);  // → POST /editor/:username/publish
  
  // Reload data sau khi publish
  const freshData = await api.getEditorData(username);
  page.set(freshData.page);
}
```

### 2. Backend: Xử lý Publish
```typescript
// api/src/routes/editor.ts
POST /editor/:username/publish
```

## 📋 CÁC BƯỚC XỬ LÝ

### Bước 1: Parse Draft Appearance
```javascript
appearance = JSON.parse(page.draft_appearance);
// Lấy:
// - backgrounds: { solid, gradient, image, video, pattern }
// - backgroundVideo: "https://..." (nếu đang dùng video)
// - backgroundColor: "#fff" hoặc "url(...)" hoặc "gradient(...)"
```

### Bước 2: Xác định Active Background Type
```javascript
let activeType = 'solid'; // default

if (backgroundVideo) {
  activeType = 'video';  // ← Video đang active
} else if (backgroundColor.includes('url(')) {
  activeType = 'image';
} else if (backgroundColor.includes('gradient')) {
  activeType = 'gradient';
} else if (backgroundColor.includes('background:')) {
  activeType = 'pattern';
}
```

### Bước 3: Cleanup Inactive Backgrounds
```javascript
// Xóa các background KHÔNG active (chỉ image và video)
const typesToCleanup = ['image', 'video'].filter(t => t !== activeType);

for (const type of typesToCleanup) {
  const url = backgrounds[type];
  if (!url) continue;
  
  // Extract storage key từ URL
  const storageKey = urlParts[urlParts.length - 1];
  
  // Xóa từ R2
  if (type === 'image') {
    await STORAGE.delete(`backgrounds/${storageKey}`);
  } else if (type === 'video') {
    await STORAGE.delete(`background-videos/${storageKey}`);
  }
  
  // Clear từ history
  backgrounds[type] = '';
}
```

### Bước 4: Update Appearance
```javascript
// Update backgrounds với data đã clean
appearance.customTheme.backgrounds = backgrounds;

// Xóa backgroundVideo nếu không active
if (activeType !== 'video' && appearance.customTheme.backgroundVideo) {
  delete appearance.customTheme.backgroundVideo;
}
```

### Bước 5: Save & Publish
```javascript
// Save cleaned appearance vào draft
UPDATE bio_pages 
SET draft_appearance = ?, updated_at = CURRENT_TIMESTAMP 
WHERE id = ?

// Publish: Copy draft → published
await publishDraft(DB, page.id);
```

## 🎬 TRƯỜNG HỢP: PUBLISH VỚI VIDEO BACKGROUND

### Scenario: User đang dùng Video Background

**Draft Appearance:**
```json
{
  "customTheme": {
    "backgroundColor": "#ffffff",
    "backgroundVideo": "https://r2.../video.mp4",  // ← Active
    "backgrounds": {
      "solid": "#ffffff",
      "gradient": "linear-gradient(...)",
      "image": "https://r2.../old-image.jpg",  // ← Inactive, sẽ bị xóa
      "video": "https://r2.../video.mp4",
      "pattern": ""
    }
  }
}
```

**Xử lý:**
1. ✅ Detect `activeType = 'video'`
2. ✅ Cleanup: Xóa `backgrounds.image` từ R2 và DB
3. ✅ Keep: `backgroundVideo` và `backgrounds.video`
4. ✅ Publish

**Published Appearance:**
```json
{
  "customTheme": {
    "backgroundColor": "#ffffff",
    "backgroundVideo": "https://r2.../video.mp4",  // ← Kept
    "backgrounds": {
      "solid": "#ffffff",
      "gradient": "linear-gradient(...)",
      "image": "",  // ← Cleared
      "video": "https://r2.../video.mp4",  // ← Kept
      "pattern": ""
    }
  }
}
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Chỉ cleanup Image và Video
- ✅ Image và Video được xóa khỏi R2 khi không active
- ❌ Solid, Gradient, Pattern KHÔNG bị xóa (chỉ là CSS)

### 2. Video được giữ khi active
- ✅ `backgroundVideo` field được giữ
- ✅ `backgrounds.video` được giữ
- ✅ File video trên R2 KHÔNG bị xóa

### 3. Cleanup chỉ xảy ra khi Publish
- Draft: Giữ tất cả backgrounds (cho phép switch qua lại)
- Publish: Xóa inactive backgrounds (tiết kiệm storage)

### 4. Reload sau Publish
- Frontend reload data sau khi publish
- Đảm bảo UI sync với DB đã clean

## 🔍 KIỂM TRA

### Để verify video được publish đúng:

1. **Check Draft Appearance:**
```sql
SELECT draft_appearance FROM bio_pages WHERE username = 'demo';
```

2. **Check Published Appearance:**
```sql
SELECT published_appearance FROM bio_pages WHERE username = 'demo';
```

3. **Verify R2 Storage:**
- Video file vẫn tồn tại: `background-videos/{key}`
- Old image đã bị xóa: `backgrounds/{key}` (404)

4. **Check Frontend:**
- Video hiển thị trên public page
- Video URL trong `customTheme.backgroundVideo`

## ✅ KẾT LUẬN

**Khi publish với video background:**
1. ✅ Video được detect là active type
2. ✅ Inactive backgrounds (image) bị xóa khỏi R2 và DB
3. ✅ Video được giữ nguyên trong cả `backgroundVideo` và `backgrounds.video`
4. ✅ Published appearance chứa video URL
5. ✅ Video hiển thị trên public page
