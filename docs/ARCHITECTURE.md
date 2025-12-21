# Architecture

## Overview

Bio Link là platform tạo link in bio với kiến trúc đơn giản, tối ưu cho performance và chi phí.

## Stack

- **Frontend**: SvelteKit + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deploy**: Cloudflare Pages

## Data Flow

```
User → SvelteKit (Pages) → Workers API → D1/R2
                ↓
         Live Preview (Stores)
```

## Appearance System

### 3-Layer Design

1. **Preset**: Chọn theme có sẵn (minimal, dark, gradient)
2. **Global**: Customize toàn bộ (colors, fonts, spacing)
3. **Section Override**: Chỉnh layout/spacing từng section

### CSS Variables

Global styles được convert thành CSS variables:
- `--bg-color`
- `--text-color`
- `--primary-color`
- `--font-family`
- `--border-radius`
- `--spacing`

Components sử dụng CSS variables → realtime preview

## Database Schema

```sql
profiles
  - username (unique)
  - profile_data (JSON)
  - appearance_data (JSON)
```

Lưu JSON để flexible, không cần migration khi thêm fields mới.

## Performance

- SSR cho public profiles → SEO tốt
- Edge caching cho profiles
- R2 CDN cho images
- Zero cold start với Workers
