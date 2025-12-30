# Theme Refactor v2.2 - Separation of Concerns

## Mục tiêu
Tách biệt trách nhiệm giữa Theme và Presets để Theme không gánh toàn bộ config cho header/block styles.

## Thay đổi chính

### 1. **Tạo bảng `block_presets`** (004_create_block_presets.sql)
```sql
CREATE TABLE block_presets (
    id, key, name, description,
    category, tier, config,
    thumbnail_url, is_active, sort_order,
    usage_count, created_by,
    created_at, updated_at
)
```

**Presets mặc định:**
- `rounded-solid` - Rounded corners with solid fill
- `pill-outline` - Pill shape with outline border
- `square-gradient` - Square shape with gradient fill
- `ghost` - Minimal ghost style
- `bold` - Bold pill style with emphasis

### 2. **Refactor Theme Config v2.2** (005_refactor_theme_v2.2.sql)

#### ❌ Đã loại bỏ:
```json
"recipes": {
  "header": {
    "base": {...},
    "variants": {
      "preset": {
        "no-cover": {...},
        "with-cover": {...},
        "centered": {...}
      }
    }
  },
  "button": {
    "base": {...},
    "variants": {...}
  }
}
```

```json
"page": {
  "defaults": {
    "header": {
      "recipe": "header",
      "variant": {"preset": "no-cover"},
      "showAvatar": true,
      "showBio": true
    },
    "linkGroup": {...},
    "link": {...},
    "button": {...}
  }
}
```

#### ✅ Thay thế bằng:
```json
"page": {
  "defaults": {
    "headerPresetId": "no-cover",
    "blockPresetId": "rounded-solid",
    "linkStyle": "soft",
    "linkGroupLayout": "list"
  }
}
```

#### ✅ Giữ lại:
```json
"recipes": {
  "link": {
    "base": {...},
    "hover": {...},
    "variants": {
      "style": {"solid": {...}, "outline": {...}, "soft": {...}}
    }
  },
  "linkGroup": {
    "base": {...},
    "variants": {
      "layout": {"list": {...}, "cards": {...}, "grid": {...}}
    }
  }
}
```

**Lý do giữ lại:** `link` và `linkGroup` là styling rules (CSS properties), không phải presets độc lập.

## Kiến trúc mới

### Theme chịu trách nhiệm:
- ✅ Design tokens (colors, typography, spacing, radius, elevation)
- ✅ Semantic layer (primary, text, surface, border colors)
- ✅ Styling recipes cho link/linkGroup (CSS rules)
- ✅ Page layout config (maxWidth, padding, gap, alignment)
- ✅ Background config (wallpaper, effects)
- ✅ Mode switching (light/dark)

### Header Presets (bảng `header_presets`) chịu trách nhiệm:
- ✅ Header layout variants (with-cover, no-cover, centered-large, avatar-cover)
- ✅ Avatar config (size, shape, position, border)
- ✅ Cover config (height, type, value)
- ✅ Content alignment và spacing

### Block Presets (bảng `block_presets`) chịu trách nhiệm:
- ✅ Block shape variants (rounded, pill, square)
- ✅ Fill styles (solid, outline, gradient, ghost)
- ✅ Size và spacing
- ✅ Icon position và hover effects

## Database Schema

```
theme_presets
├── id, key, name, config
├── default_header_preset_id  → references header_presets(key)
└── default_block_preset_id   → references block_presets(key)

header_presets
├── id, key, name, config
└── (no-cover, with-cover, centered-large, avatar-cover)

block_presets
├── id, key, name, config
└── (rounded-solid, pill-outline, square-gradient, ghost, bold)
```

## Migration Steps

1. **Chạy migration 004:** Tạo bảng `block_presets`
   ```bash
   wrangler d1 execute bio-link-db --remote --file=./migrations/004_create_block_presets.sql
   ```

2. **Chạy migration 005:** Update theme config v2.2
   ```bash
   wrangler d1 execute bio-link-db --remote --file=./migrations/005_refactor_theme_v2.2.sql
   ```

3. **Verify:** Kiểm tra theme config mới
   ```bash
   wrangler d1 execute bio-link-db --remote --command="SELECT config FROM theme_presets WHERE key='minimal';"
   ```

## Breaking Changes

### Frontend cần update:

1. **ThemeConfig type** (`frontend/src/lib/types.ts`):
   ```typescript
   interface ThemePage {
     defaults?: {
       headerPresetId?: string;      // NEW: thay vì header object
       blockPresetId?: string;        // NEW: thay vì block object
       linkStyle?: string;            // NEW: 'solid' | 'outline' | 'soft'
       linkGroupLayout?: string;      // NEW: 'list' | 'cards' | 'grid'
     };
   }
   ```

2. **Appearance Manager** cần load presets từ database:
   ```typescript
   // Load header presets
   const headerPresets = await api.getHeaderPresets();
   
   // Load block presets
   const blockPresets = await api.getBlockPresets();
   
   // Apply theme với preset references
   const headerConfig = headerPresets[theme.config.page.defaults.headerPresetId];
   const blockConfig = blockPresets[theme.config.page.defaults.blockPresetId];
   ```

## Benefits

1. **Separation of Concerns:** Theme chỉ quản lý design tokens, presets quản lý layout variants
2. **Reusability:** Presets có thể dùng chung cho nhiều themes
3. **Extensibility:** Dễ thêm custom presets cho users
4. **Performance:** Presets được cache riêng, không cần parse lại khi switch theme
5. **Maintainability:** Dễ update/fix presets mà không ảnh hưởng theme config

## Version History

- **v2.0:** Initial theme spec với recipes.header
- **v2.1:** Fix padding/grid/mode issues
- **v2.2:** Refactor - loại bỏ recipes.header/button, chỉ giữ references
