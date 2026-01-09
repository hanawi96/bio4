# Design Document: Block Color Controls

## Overview

Feature này thêm 2 ColorPicker controls vào BlockStyleSection component để cho phép user tùy chỉnh màu nền và màu text của block. Các control này sẽ tự động đồng bộ với theme config thông qua reactive binding với appearance store, tương tự như các control khác đang có (font, spacing, border radius, shadow).

## Architecture

### Component Structure

```
BlockStyleSection.svelte
├── Button Style (existing)
├── Block Border Radius (existing)
├── Shadow Style (existing)
├── Block Background Color (NEW)
└── Block Text Color (NEW)
```

### Data Flow

```
Theme Config (DB)
    ↓
appearanceState store (reactive)
    ↓
BlockStyleSection.svelte
    ↓
ColorPicker components (bind to semantic.color.*)
    ↓
updateAppearance() function
    ↓
Save to DB (autosave)
    ↓
Preview on PhoneMockup (real-time)
```

## Components and Interfaces

### 1. ColorPicker Component

**Existing component:** `frontend/src/lib/components/ui/ColorPicker.svelte`

**Props:**
- `value: string` - Hex color value (e.g., "#ff0000")
- `label: string` - Label text hiển thị

**Events:**
- `change` - Emit khi user thay đổi màu

**Usage:**
```svelte
<ColorPicker 
  value={blockBackgroundColor} 
  label="Block Background Color"
  on:change={(e) => updateAppearance('semantic.color.background', e.detail)}
/>
```

### 2. BlockStyleSection Component

**File:** `frontend/src/lib/components/editor/sections/BlockStyleSection.svelte`

**New reactive variables:**
```typescript
// Block background color - bind to semantic.color.background
$: blockBackgroundColor = 
  $appearanceState.overrides?.['semantic.color.background'] 
  ?? $appearance?.theme?.config?.semantic?.color?.surface?.card
  ?? '#ffffff';

// Block text color - bind to semantic.color.primary
$: blockTextColor = 
  $appearanceState.overrides?.['semantic.color.primary']
  ?? $appearance?.theme?.config?.semantic?.color?.primary
  ?? '#000000';
```

**New functions:**
```typescript
function updateBlockBackgroundColor(color: string) {
  updateAppearance('semantic.color.background', color);
}

function updateBlockTextColor(color: string) {
  updateAppearance('semantic.color.primary', color);
}
```

### 3. Appearance Manager

**File:** `frontend/src/lib/stores/appearanceManager.ts`

**Existing function:** `updateAppearance(path: string, value: any)`

**Behavior:**
- Nhận path dạng dot notation (e.g., "semantic.color.primary")
- Cập nhật giá trị vào `appearanceState.overrides`
- Trigger autosave sau 300ms debounce
- Optimistic update: UI update ngay lập tức

## Data Models

### Theme Config Structure

```typescript
interface ThemeConfig {
  semantic?: {
    color?: {
      primary?: string;           // Block text color
      background?: string;         // Block background color (NEW)
      surface?: {
        card?: string;            // Fallback for background
        page?: string;
      };
      text?: {
        default?: string;
        muted?: string;
      };
    };
  };
}
```

### Appearance State Structure

```typescript
interface AppearanceState {
  presetKey: string;              // Theme key (e.g., "minimal")
  headerPresetId?: string;
  overrides?: {
    'semantic.color.primary'?: string;      // Override block text color
    'semantic.color.background'?: string;   // Override block background color
    [key: string]: any;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Sau khi phân tích prework, tôi nhận thấy một số properties có thể được gom nhóm hoặc loại bỏ redundancy:

**Redundancy Analysis:**
- Properties 1.2 và 2.2 (theme highlight) có thể gom thành 1 property chung cho cả 2 colors
- Properties 1.3 và 2.3 (update config) có thể gom thành 1 property chung
- Properties 1.4 và 2.4 (preview real-time) có thể gom thành 1 property chung
- Properties 1.5 và 2.5 (autosave) có thể gom thành 1 property chung
- Properties 3.1 và 3.2 về cơ bản test cùng một behavior (reactive update khi theme change)

**Consolidated Properties:**
1. Color binding from theme → ColorPicker (covers 1.2, 2.2, 3.1, 3.2)
2. Color update from ColorPicker → config (covers 1.3, 2.3)
3. Override storage (covers 3.3)
4. Reset functionality (covers 3.4)
5. Autosave trigger (covers 1.5, 2.5)

### Properties

**Property 1: Theme Color Binding**

*For any* theme config with defined color values (background color and primary color), when the theme is applied or switched, the ColorPicker components SHALL display the correct color values from the theme.

**Validates: Requirements 1.2, 2.2, 3.1, 3.2**

---

**Property 2: Color Update Propagation**

*For any* color value selected by the user in either ColorPicker, the system SHALL update the corresponding path in the theme config (`semantic.color.background` for background, `semantic.color.primary` for text).

**Validates: Requirements 1.3, 2.3**

---

**Property 3: Override Storage**

*For any* color override made by the user, the system SHALL store the override in `appearanceState.overrides` with the correct path key.

**Validates: Requirements 3.3**

---

**Property 4: Reset to Default**

*For any* theme with color overrides, when the user resets to theme default, the system SHALL remove all color overrides from `appearanceState.overrides` and the ColorPickers SHALL display the original theme colors.

**Validates: Requirements 3.4**

---

**Property 5: Autosave Trigger**

*For any* color change made through the ColorPickers, the system SHALL trigger an autosave API call within 300ms to persist the changes to the database.

**Validates: Requirements 1.5, 2.5**



## Error Handling

### 1. Missing Theme Config

**Scenario:** Theme không có semantic.color config

**Handling:**
- Fallback về default colors:
  - Background: `#ffffff` (white)
  - Text: `#000000` (black)
- Log warning to console
- UI vẫn hoạt động bình thường với default values

### 2. Invalid Color Format

**Scenario:** User nhập color không hợp lệ (không phải hex format)

**Handling:**
- ColorPicker component tự validate (HTML5 color input)
- Nếu text input không hợp lệ, không update state
- Giữ nguyên giá trị cũ

### 3. API Save Failure

**Scenario:** Autosave API call thất bại

**Handling:**
- Log error to console
- Optimistic update vẫn giữ trong UI (user thấy thay đổi ngay)
- Retry logic có thể được thêm sau (out of scope cho feature này)
- User có thể trigger save lại bằng cách thay đổi giá trị khác

### 4. Appearance State Parse Error

**Scenario:** `draft_appearance` JSON parse thất bại

**Handling:**
- Fallback về theme default (handled by appearanceManager)
- Reset về minimal theme
- Log error to console

## Testing Strategy

### Unit Tests

**Focus areas:**
- Component rendering với các props khác nhau
- Event handlers (color change events)
- Reactive variable calculations
- Fallback logic khi thiếu data

**Example tests:**
```typescript
// Test 1: ColorPicker renders with correct initial value
test('ColorPicker displays theme background color', () => {
  const theme = { semantic: { color: { background: '#ff0000' } } };
  // Mount component with theme
  // Assert ColorPicker value === '#ff0000'
});

// Test 2: Color change triggers update
test('Changing color calls updateAppearance', () => {
  const mockUpdate = vi.fn();
  // Mount component with mocked updateAppearance
  // Trigger color change
  // Assert mockUpdate called with correct path and value
});

// Test 3: Fallback to default when theme missing color
test('Uses default color when theme has no background color', () => {
  const theme = { semantic: {} };
  // Mount component with incomplete theme
  // Assert ColorPicker value === '#ffffff'
});
```

### Property-Based Tests

**Library:** `@fast-check/vitest` (for TypeScript/Svelte)

**Configuration:** Minimum 100 iterations per test

**Property tests:**

```typescript
// Property 1: Theme Color Binding
test.prop([fc.hexaColor(), fc.hexaColor()])
  ('ColorPickers display theme colors correctly', (bgColor, textColor) => {
    // Feature: block-color-controls, Property 1: Theme Color Binding
    const theme = {
      semantic: {
        color: {
          background: bgColor,
          primary: textColor
        }
      }
    };
    // Mount component with theme
    // Assert background ColorPicker value === bgColor
    // Assert text ColorPicker value === textColor
  });

// Property 2: Color Update Propagation
test.prop([fc.hexaColor()])
  ('Color changes update config correctly', (newColor) => {
    // Feature: block-color-controls, Property 2: Color Update Propagation
    // Mount component
    // Trigger color change to newColor
    // Assert updateAppearance called with correct path
    // Assert config updated with newColor
  });

// Property 3: Override Storage
test.prop([fc.hexaColor()])
  ('Overrides are stored correctly', (overrideColor) => {
    // Feature: block-color-controls, Property 3: Override Storage
    // Set initial theme color
    // Override with overrideColor
    // Assert appearanceState.overrides contains correct path and value
  });

// Property 4: Reset to Default
test.prop([fc.hexaColor(), fc.hexaColor()])
  ('Reset removes overrides and restores theme colors', (themeColor, overrideColor) => {
    // Feature: block-color-controls, Property 4: Reset to Default
    // Set theme color to themeColor
    // Override with overrideColor
    // Trigger reset
    // Assert overrides cleared
    // Assert ColorPicker displays themeColor
  });
```

**Note:** Property 5 (Autosave Trigger) sẽ được test bằng unit test với mock timer và API, không phù hợp cho property-based testing vì liên quan đến timing và side effects.

### Integration Tests

**Focus areas:**
- End-to-end flow: theme load → display → user change → save
- Interaction với PhoneMockup preview
- Theme switching behavior

**Example scenarios:**
1. Load page → verify colors from theme displayed
2. Change color → verify preview updates immediately
3. Switch theme → verify colors update to new theme
4. Override color → switch theme → verify override cleared

### Testing Balance

- **Unit tests:** Specific examples, edge cases (missing data, invalid input)
- **Property tests:** Universal properties across all color values
- **Integration tests:** Full user workflows and component interactions

Both unit and property tests are necessary:
- Unit tests catch concrete bugs in specific scenarios
- Property tests verify correctness across all possible inputs
- Together they provide comprehensive coverage
