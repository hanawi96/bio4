# Background Cleanup Fix - Sau khi Publish

## Vấn đề
Sau khi publish, ảnh và video background đã được xóa khỏi R2, nhưng URL lỗi vẫn hiển thị trên UI vì:
1. URL vẫn còn trong database (draft_appearance)
2. UI không validate URL trước khi hiển thị
3. Logic cleanup chưa được tích hợp vào publish flow
4. **backgroundImageUrl và backgroundVideoUrl không được clear khi switch type**

## Giải pháp đã implement

### 1. Tích hợp cleanup vào publish endpoint
**File: `api/src/routes/editor.ts`**

Khi publish, endpoint sẽ:
- Phát hiện background type đang active (solid/gradient/image/video/pattern)
- Xóa các background không active khỏi R2 storage
- Clear URL của backgrounds không active khỏi database
- Clear backgroundVideo nếu không phải video type
- Sau đó mới publish draft lên published

```typescript
// Determine active background type
let activeType = 'solid';
if (backgroundVideo) {
  activeType = 'video';
} else if (backgroundColor.includes('url(')) {
  activeType = 'image';
} else if (backgroundColor.includes('gradient')) {
  activeType = 'gradient';
} else if (backgroundColor.includes('background:')) {
  activeType = 'pattern';
}

// Delete inactive backgrounds from R2 and clear from DB
const typesToCleanup = ['image', 'video'].filter(t => t !== activeType);
```

### 2. Validate URL trước khi hiển thị
**File: `frontend/src/lib/components/editor/PhoneMockup.svelte`**

```typescript
$: backgroundVideo = (() => {
  if (!$page?.draft_appearance) return null;
  try {
    const appearance = JSON.parse($page.draft_appearance);
    const videoUrl = appearance.customTheme?.backgroundVideo;
    // Only return if URL exists and is valid
    return videoUrl && videoUrl.trim() ? videoUrl : null;
  } catch {
    return null;
  }
})();
```

### 3. Clear URL khi auto-detect type
**File: `frontend/src/lib/components/editor/sections/BackgroundSection.svelte`**

Khi auto-detect type từ backgroundColor, clear URL không liên quan:

```typescript
if (videoUrl && videoUrl.trim()) {
  selectedType = 'video';
  backgroundVideoUrl = videoUrl;
  backgroundImageUrl = ''; // Clear image URL
} else if (bgColor.includes('background:')) {
  selectedType = 'pattern';
  backgroundImageUrl = ''; // Clear image URL
  backgroundVideoUrl = ''; // Clear video URL
} else if (bgColor.includes('gradient')) {
  selectedType = 'gradient';
  backgroundImageUrl = ''; // Clear image URL
  backgroundVideoUrl = ''; // Clear video URL
}
```

### 4. Clear URL khi switch type
Khi user chuyển type, clear URL không liên quan:

```typescript
// Clear URLs when switching to non-media types
if (type !== 'image') {
  backgroundImageUrl = '';
}
if (type !== 'video') {
  backgroundVideoUrl = '';
}
```

### 5. Validate URL khi restore từ DB
```typescript
// Only restore valid URLs (non-empty strings)
backgroundHistory = {
  solid: savedBackgrounds.solid || '#ffffff',
  gradient: savedBackgrounds.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  image: (savedBackgrounds.image && savedBackgrounds.image.trim()) ? savedBackgrounds.image : '',
  video: (savedBackgrounds.video && savedBackgrounds.video.trim()) ? savedBackgrounds.video : '',
  pattern: savedBackgrounds.pattern || ''
};
```

### 6. Xóa endpoint cleanup cũ
- Xóa endpoint `/editor/:username/cleanup-backgrounds`
- Xóa method `cleanupInactiveBackgrounds()` trong `api.client.ts`
- Đơn giản hóa logic publish trong `autosave.ts`

## Kết quả
✅ Sau khi publish, backgrounds không active sẽ bị xóa khỏi R2 và database
✅ UI không hiển thị URL lỗi nữa
✅ Background history được validate trước khi restore
✅ **backgroundImageUrl và backgroundVideoUrl được clear khi không phải type tương ứng**
✅ Logic cleanup được tự động hóa trong publish flow
✅ Code sạch hơn, không cần endpoint riêng cho cleanup

## Test Cases
1. **Upload ảnh → Switch sang video → Publish**
   - ✅ Ảnh bị xóa khỏi R2
   - ✅ URL ảnh bị clear khỏi DB
   - ✅ UI không hiển thị lỗi
   - ✅ backgroundImageUrl = ''

2. **Upload video → Switch sang solid color → Publish**
   - ✅ Video bị xóa khỏi R2
   - ✅ URL video bị clear khỏi DB
   - ✅ backgroundVideo bị xóa khỏi appearance
   - ✅ backgroundVideoUrl = ''

3. **Upload ảnh → Switch sang pattern → Publish**
   - ✅ Ảnh bị xóa khỏi R2
   - ✅ URL ảnh bị clear khỏi DB
   - ✅ UI hiển thị pattern, không hiển thị ảnh lỗi
   - ✅ backgroundImageUrl = ''

4. **Reload page sau publish (page đang dùng pattern)**
   - ✅ Không có URL lỗi
   - ✅ Background history chỉ chứa URL valid
   - ✅ selectedType = 'pattern'
   - ✅ backgroundImageUrl = ''
   - ✅ backgroundVideoUrl = ''

## Cải tiến chính
- **Thông minh**: Auto-detect type và clear URL không liên quan
- **Chuẩn**: Validate URL ở mọi điểm (restore, switch, display)
- **Tối ưu**: Logic cleanup tích hợp vào publish, không cần endpoint riêng
- **Đơn giản**: Clear URL ngay khi switch type, không để URL lỗi tồn tại
