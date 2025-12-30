# Quick Fix Reference - Theme v2.1

## 4 Fixes Áp Dụng

### 1️⃣ Padding: Tách X và Y

```json
// ❌ BEFORE
"padding": "ref:tokens.space.2 ref:tokens.space.4"

// ✅ AFTER
"paddingX": "ref:tokens.space.4",
"paddingY": "ref:tokens.space.2"
```

**Lý do:** Multi-ref string khó parse, không rõ ràng

---

### 2️⃣ Grid: Dùng gridTemplateColumns

```json
// ❌ BEFORE
"grid": {
  "display": "grid",
  "columns": 2
}

// ✅ AFTER
"grid": {
  "display": "grid",
  "gridTemplateColumns": "repeat(2, 1fr)"
}
```

**Lý do:** `columns` không phải CSS property chuẩn

---

### 3️⃣ Mode: Chuyển sang meta

```json
// ❌ BEFORE
"page": {
  "mode": "light",
  "layout": { ... }
}

// ✅ AFTER
"meta": {
  "defaultMode": "light"
},
"page": {
  "layout": { ... }
}
```

**Lý do:** Tách config vs runtime state

---

### 4️⃣ LineHeight: Đảm bảo unitless

```json
// ✅ CORRECT (không cần fix)
"lineHeight": {
  "tight": 1.25,    // unitless
  "normal": 1.5,    // unitless
  "relaxed": 1.75   // unitless
}

// ✅ CORRECT
"fontSize": {
  "base": 16  // số, engine append "px"
}
```

**Lý do:** LineHeight phải unitless theo CSS spec

---

## Files

- **Fixed config:** `minimal-theme-v2.1-fixed.json`
- **Detailed doc:** `FIXES_V2.1.md`
- **Comparison:** `COMPARISON_V2.0_VS_V2.1.md`

---

## Quick Check

```bash
# Validate JSON
jq . minimal-theme-v2.1-fixed.json

# Check for issues
grep -E '"padding":|"columns":' minimal-theme-v2.1-fixed.json
# Should return nothing

grep -E '"paddingX":|"paddingY":|"gridTemplateColumns":' minimal-theme-v2.1-fixed.json
# Should find matches
```
