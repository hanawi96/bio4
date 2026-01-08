# 📅 Countdown Feature Setup Guide

## ✅ Feature Completed!

The countdown/schedule link feature has been fully implemented. This allows you to schedule links to become active at a specific future time with a real-time countdown timer.

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

You need to add the `scheduled_at` column to your `links` table.

#### For Local SQLite:
```bash
sqlite3 api/dev.db < api/migrations/add_scheduled_at_field.sql
```

#### For Cloudflare D1:
```bash
cd api
wrangler d1 execute DB --file=migrations/add_scheduled_at_field.sql
```

---

## 📖 How to Use

### Dashboard (Admin):

1. **Open Link Editor** - Click on any link card
2. **Click Countdown Icon** (⏱️ clock icon in the toolbar)
3. **Set Date & Time**:
   - Pick a date from the date picker
   - Pick a time from the time picker
   - Preview countdown shows time remaining
4. **Click "Lưu" (Save)**
5. **Badge indicator** (blue dot) appears on countdown icon when active
6. **To Remove**: Click countdown icon again and click "Xóa" (Remove) button

**Note**: By default, all links are active immediately. You only need to use countdown when you want to schedule a link for future activation.

### Public Page (User):

**Scheduled Links Display**:
- Link appears with reduced opacity (60%)
- Clock icon (⏰) displayed
- Shows "Available in: [countdown]" text
- Real-time countdown updates every second
- Link is not clickable until countdown reaches zero

**Countdown Formats**:
- More than 24 hours: "2 days 5 hrs"
- Less than 24 hours: "23:45:32" (HH:MM:SS)
- Less than 1 hour: "45:32" (MM:SS)
- Less than 1 minute: "32s"

**When Countdown Reaches Zero**:
- Link automatically becomes active
- Countdown disappears
- Link becomes clickable
- Normal link styling restored

---

## 🔧 Technical Details

### Database Schema:
```sql
ALTER TABLE links ADD COLUMN scheduled_at TEXT DEFAULT NULL;
-- Format: ISO 8601 datetime string in UTC (e.g., "2026-01-09T15:00:00Z")
```

### Timezone Handling:
- **Backend**: Stores all datetimes in UTC
- **Dashboard**: Displays in admin's local timezone
- **Public Page**: Converts to user's local timezone for countdown
- **Validation**: Backend ensures scheduled time is in the future

### Files Modified:
1. **Backend**:
   - `api/migrations/add_scheduled_at_field.sql` - Database migration
   - `api/src/db.ts` - Added `scheduled_at` to updateLink
   - `api/src/routes/links.ts` - Added validation for scheduled_at

2. **Frontend**:
   - `frontend/src/lib/types.ts` - Added `scheduled_at` to Link interface
   - `frontend/src/lib/utils/dateUtils.ts` - NEW: Date/time utilities
   - `frontend/src/lib/components/editor/LinkCard.svelte` - Schedule panel UI (simplified)
   - `frontend/src/lib/components/editor/LinksEditor.svelte` - Event handling
   - `frontend/src/routes/dashboard/bio/+page.svelte` - API integration
   - `frontend/src/lib/components/public/PublicBioPage.svelte` - Countdown display

---

## ✨ Features

- ✅ Schedule links for future activation
- ✅ Real-time countdown timer (updates every second)
- ✅ Timezone-aware (UTC backend, local frontend)
- ✅ Validation (must be future time)
- ✅ Optimistic UI updates
- ✅ Visual indicators (badge, opacity, disabled state)
- ✅ Clean, simple UI - no unnecessary options
- ✅ Easy to remove schedule with one click
- ✅ Automatic cleanup when countdown reaches zero

---

## 🎯 Use Cases

1. **Product Launch**: Schedule link to product page for launch time
2. **Event Registration**: Open registration at specific time
3. **Flash Sale**: Activate discount link at sale start time
4. **Content Release**: Schedule video/article links
5. **Exclusive Access**: Create hype with countdown timer

---

## 🐛 Troubleshooting

**Issue**: Migration fails
- **Solution**: Check if column already exists, or manually add it

**Issue**: Countdown not updating
- **Solution**: Check browser console for errors, ensure JavaScript is enabled

**Issue**: Time is wrong
- **Solution**: Verify system timezone is correct, backend uses UTC

**Issue**: Link not activating after countdown
- **Solution**: Refresh the page, or check if scheduled_at is valid

**Issue**: Icon not visible
- **Solution**: See `TROUBLESHOOTING_COUNTDOWN_ICON.md` for detailed steps

---

## 📝 Notes

- Countdown runs client-side for real-time updates
- No server polling required (efficient)
- Works offline (countdown continues)
- Cleanup interval on component unmount (no memory leaks)
- Compatible with existing features (animation, lock, etc.)
- Simplified UI: No "Active Now" option needed (default state)

---

Enjoy your new countdown feature! 🎉
