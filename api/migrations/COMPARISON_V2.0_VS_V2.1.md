# So Sánh Theme v2.0 vs v2.1

## 1. Token References

### v2.0 (Ambiguous)
```json
{
  "semantic": {
    "color": {
      "primary": "tokens.color.blue.500",
      "overlay": "rgba(0, 0, 0, 0.5)"
    }
  }
}
```
❌ Không rõ đâu là reference, đâu là giá trị

### v2.1 (Clear)
```json
{
  "semantic": {
    "color": {
      "primary": "ref:tokens.color.blue.500",
      "overlay": "ref:tokens.color.overlay.50"
    }
  }
}
```
✅ Rõ ràng với prefix `ref:`

---

## 2. Font Size Units

### v2.0 (Mixed)
```json
{
  "tokens": {
    "space": { "1": 4 },
    "fontSize": { "base": "16px" }
  }
}
```
❌ Lẫn lộn số và string

### v2.1 (Consistent)
```json
{
  "tokens": {
    "meta": { "spaceUnit": "px", "fontSizeUnit": "px" },
    "space": { "1": 4 },
    "fontSize": { "base": 16 }
  }
}
```
✅ Tất cả là số, unit khai báo riêng

---

## 3. RGBA Values

### v2.0 (Scattered)
```json
{
  "semantic": {
    "color": {
      "surface": {
        "overlay": "rgba(0, 0, 0, 0.5)"
      }
    }
  },
  "background": {
    "effects": {
      "overlayColor": "rgba(0, 0, 0, 0)"
    }
  }
}
```
❌ RGBA rải rác, khó sync

### v2.1 (Tokenized)
```json
{
  "tokens": {
    "color": {
      "overlay": {
        "10": "rgba(0, 0, 0, 0.1)",
        "50": "rgba(0, 0, 0, 0.5)",
        "80": "rgba(0, 0, 0, 0.8)"
      }
    }
  },
  "semantic": {
    "color": {
      "surface": {
        "overlay": "ref:tokens.color.overlay.50"
      }
    }
  },
  "background": {
    "effects": {
      "overlayColor": "ref:tokens.color.overlay.10"
    }
  }
}
```
✅ Token scale, dễ quản lý

---

## 4. Page Defaults

### v2.0 (Style Duplication)
```json
{
  "page": {
    "defaults": {
      "linkGroup": {
        "textAlign": "center",
        "fontSize": "M",
        "radius": "tokens.radius.lg",
        "padding": "tokens.space.3",
        "shadow": "tokens.elevation.xs",
        "style": "soft"
      }
    }
  }
}
```
❌ Style trực tiếp, trùng với recipes

### v2.1 (Recipe Reference)
```json
{
  "page": {
    "defaults": {
      "linkGroup": {
        "recipe": "linkGroup",
        "variant": { "layout": "list" }
      },
      "link": {
        "recipe": "link",
        "variant": { "style": "soft" }
      }
    }
  }
}
```
✅ Chỉ reference recipe, không duplicate

---

## 5. Control Mapping

### v2.0 (No Mapping)
```json
{
  "contract": {
    "controls": [
      {
        "keyPath": "page.layout.baseFontSize",
        "type": "select",
        "options": ["S", "M", "L", "XL"],
        "default": "M"
      }
    ]
  }
}
```
❌ Không biết "M" map vào token nào

### v2.1 (With Mapping)
```json
{
  "contract": {
    "controls": [
      {
        "keyPath": "page.layout.baseFontSize",
        "type": "select",
        "options": ["S", "M", "L", "XL"],
        "default": "M",
        "map": {
          "S": "ref:tokens.typography.fontSize.sm",
          "M": "ref:tokens.typography.fontSize.base",
          "L": "ref:tokens.typography.fontSize.lg",
          "XL": "ref:tokens.typography.fontSize.xl"
        }
      }
    ]
  }
}
```
✅ Map rõ ràng, declarative

---

## 6. Dark Mode

### v2.0 (Partial Override)
```json
{
  "modes": {
    "dark": {
      "tokens": {
        "color": {
          "gray": {
            "50": "#18181b",
            "900": "#fafafa"
          }
        }
      }
    }
  }
}
```
❌ Chỉ override 2 giá trị, mất scale

### v2.1 (Full Scale)
```json
{
  "modes": {
    "dark": {
      "tokens": {
        "color": {
          "gray": {
            "50": "#18181b",
            "100": "#27272a",
            "200": "#3f3f46",
            "300": "#52525b",
            "400": "#71717a",
            "500": "#a1a1aa",
            "600": "#d4d4d8",
            "700": "#e4e4e7",
            "800": "#f4f4f5",
            "900": "#fafafa"
          },
          "overlay": {
            "10": "rgba(255, 255, 255, 0.1)",
            "50": "rgba(255, 255, 255, 0.5)"
          }
        }
      }
    }
  }
}
```
✅ Full scale, không mất token

---

## 7. Recipe Naming

### v2.0 (Inconsistent)
```json
{
  "recipes": {
    "linkItem": { ... },
    "linkGroup": { ... },
    "header": { ... },
    "button": { ... }
  }
}
```
❌ "linkItem" vs "linkGroup" không consistent

### v2.1 (Semantic)
```json
{
  "recipes": {
    "link": { ... },
    "linkGroup": { ... },
    "header": { ... },
    "button": { ... }
  }
}
```
✅ Tên ngắn gọn, semantic

---

## 8. Semantic Layer

### v2.0 (Mixed References)
```json
{
  "semantic": {
    "color": {
      "primary": "tokens.color.blue.500",
      "surface": {
        "card": "tokens.color.white",
        "overlay": "rgba(0, 0, 0, 0.5)"
      }
    }
  }
}
```
❌ Lẫn lộn token ref và raw value

### v2.1 (Pure References)
```json
{
  "semantic": {
    "color": {
      "primary": "ref:tokens.color.blue.500",
      "surface": {
        "card": "ref:tokens.color.white",
        "overlay": "ref:tokens.color.overlay.50"
      }
    }
  }
}
```
✅ Tất cả đều là references

---

## SUMMARY TABLE

| Feature | v2.0 | v2.1 | Improvement |
|---------|------|------|-------------|
| Reference syntax | Ambiguous | `ref:` prefix | ✅ Clear |
| Font size type | String | Number + unit | ✅ Consistent |
| RGBA handling | Scattered | Tokenized | ✅ Organized |
| Page defaults | Style duplication | Recipe reference | ✅ DRY |
| Control mapping | None | Declarative | ✅ Flexible |
| Dark mode | Partial | Complete | ✅ Robust |
| Recipe naming | Inconsistent | Semantic | ✅ Clear |
| Semantic purity | Mixed | Pure refs | ✅ Clean |

---

## MIGRATION EFFORT

| Task | Complexity | Time |
|------|------------|------|
| Add `ref:` prefix | Low | 10 min |
| Convert fontSize | Low | 5 min |
| Tokenize RGBA | Medium | 15 min |
| Update defaults | Medium | 20 min |
| Add control maps | Low | 10 min |
| Complete dark mode | Medium | 15 min |
| Rename recipes | Low | 5 min |
| **TOTAL** | | **~80 min** |

---

## BACKWARD COMPATIBILITY

✅ **v2.1 resolver supports both formats:**

```typescript
// Handles v2.0 format
"primary": "tokens.color.blue.500"

// Handles v2.1 format
"primary": "ref:tokens.color.blue.500"

// Handles raw values
"primary": "#3b82f6"
```

**No breaking changes for existing themes!**
