# 🔧 Khắc phục sự cố: Icon Countdown không hiển thị

## ✅ Icon Countdown ĐÃ ĐƯỢC THÊM VÀO CODE

Icon countdown (đồng hồ ⏱️) đã được thêm vào file `LinkCard.svelte` ở vị trí giữa icon Thumbnail và icon Lock.

---

## 🚀 Các bước khắc phục

### Bước 1: Restart Dev Server

**Dừng server hiện tại:**
- Nhấn `Ctrl + C` trong terminal đang chạy dev server

**Khởi động lại:**
```bash
cd frontend
npm run dev
```

---

### Bước 2: Hard Refresh Browser

**Windows/Linux:**
- Nhấn `Ctrl + Shift + R`
- Hoặc `Ctrl + F5`

**Mac:**
- Nhấn `Cmd + Shift + R`

---

### Bước 3: Clear Browser Cache

**Chrome/Edge:**
1. Nhấn `F12` để mở DevTools
2. Click chuột phải vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

**Firefox:**
1. Nhấn `Ctrl + Shift + Delete`
2. Chọn "Cached Web Content"
3. Click "Clear Now"

---

### Bước 4: Kiểm tra Console

1. Mở DevTools (`F12`)
2. Chuyển sang tab "Console"
3. Xem có lỗi JavaScript nào không
4. Nếu có lỗi, copy và báo lại

---

### Bước 5: Verify File Changes

Kiểm tra file `frontend/src/lib/components/editor/LinkCard.svelte` có chứa đoạn code này không:

```svelte
<!-- Countdown Timer -->
<button
    on:click={toggleSchedulePanel}
    class="p-1.5 rounded-lg transition-colors relative"
    class:bg-blue-100={showSchedulePanel}
    class:text-blue-600={showSchedulePanel}
    class:text-gray-400={!showSchedulePanel}
    class:hover:text-gray-600={!showSchedulePanel}
    class:hover:bg-gray-100={!showSchedulePanel}
    title="Add countdown timer"
>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
    {#if link.scheduled_at}
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full"></span>
    {/if}
</button>
```

Đoạn code này phải nằm **GIỮA** icon Thumbnail và icon Lock.

---

## 📍 Vị trí Icon trong Toolbar

Thứ tự các icon từ trái sang phải:

1. 📊 **Analytics** (biểu đồ)
2. ✨ **Animation** (sparkles)
3. 🖼️ **Thumbnail** (hình ảnh)
4. ⏱️ **Countdown Timer** (đồng hồ) ← ICON NÀY
5. 🔒 **Lock** (khóa)
6. 📈 **Clicks Counter** (số lượt click)

---

## ❓ Vẫn không thấy icon?

Nếu sau khi làm tất cả các bước trên mà vẫn không thấy icon:

1. **Chụp screenshot** màn hình LinkCard
2. **Copy toàn bộ nội dung Console** (F12 → Console tab)
3. **Kiểm tra** xem có file nào bị lỗi compile không
4. Báo lại để được hỗ trợ thêm

---

## ✨ Icon sẽ trông như thế nào?

- **Màu xám** khi chưa active
- **Màu xanh dương** khi đang mở panel
- **Có chấm xanh** ở góc trên phải khi link đã được schedule
- **Tooltip** "Add countdown timer" khi hover

---

Chúc bạn thành công! 🎉
