# Implementation Plan: Block Color Controls

## Overview

Thêm 2 ColorPicker controls vào BlockStyleSection để cho phép user tùy chỉnh block background color và text color. Implementation sẽ tận dụng ColorPicker component có sẵn và appearance manager system hiện tại.

## Tasks

- [ ] 1. Thêm reactive variables cho block colors vào BlockStyleSection
  - Thêm `blockBackgroundColor` reactive variable bind với `semantic.color.background`
  - Thêm `blockTextColor` reactive variable bind với `semantic.color.primary`
  - Implement fallback logic về default colors khi theme thiếu config
  - _Requirements: 1.2, 2.2, 3.1, 3.2_

- [ ]* 1.1 Write property test for theme color binding
  - **Property 1: Theme Color Binding**
  - **Validates: Requirements 1.2, 2.2, 3.1, 3.2**

- [ ] 2. Thêm ColorPicker components vào BlockStyleSection UI
  - Import ColorPicker component
  - Thêm "Block Background Color" section với ColorPicker
  - Thêm "Block Text Color" section với ColorPicker
  - Thêm labels và description text cho mỗi control
  - Đặt các controls sau Shadow Style section
  - _Requirements: 1.1, 2.1, 4.2, 4.3, 4.4_

- [ ]* 2.1 Write unit tests for ColorPicker rendering
  - Test ColorPicker renders với correct initial values
  - Test labels và descriptions hiển thị đúng
  - Test DOM structure và ordering
  - _Requirements: 1.1, 2.1, 4.2, 4.3, 4.4_

- [ ] 3. Implement color update handlers
  - Tạo `updateBlockBackgroundColor` function gọi `updateAppearance('semantic.color.background', color)`
  - Tạo `updateBlockTextColor` function gọi `updateAppearance('semantic.color.primary', color)`
  - Wire handlers vào ColorPicker `on:change` events
  - _Requirements: 1.3, 2.3_

- [ ]* 3.1 Write property test for color update propagation
  - **Property 2: Color Update Propagation**
  - **Validates: Requirements 1.3, 2.3**

- [ ]* 3.2 Write property test for override storage
  - **Property 3: Override Storage**
  - **Validates: Requirements 3.3**

- [ ] 4. Verify autosave và preview functionality
  - Test manually: thay đổi color → verify autosave triggered
  - Test manually: thay đổi color → verify PhoneMockup preview updates
  - Verify debounce 300ms hoạt động đúng (existing behavior)
  - _Requirements: 1.4, 1.5, 2.4, 2.5_

- [ ]* 4.1 Write unit test for autosave trigger
  - Mock timer và API
  - Test autosave called sau 300ms
  - **Validates: Requirements 1.5, 2.5**

- [ ] 5. Test theme switching và reset functionality
  - Test manually: switch theme → verify colors update
  - Test manually: override color → reset → verify override cleared
  - Verify fallback logic khi theme thiếu color config
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 5.1 Write property test for reset functionality
  - **Property 4: Reset to Default**
  - **Validates: Requirements 3.4**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- ColorPicker component đã tồn tại, không cần implement lại
- Appearance manager system đã có sẵn `updateAppearance()` function
- Autosave logic đã được implement trong appearanceManager, không cần thêm code
- Property tests sử dụng `@fast-check/vitest` với minimum 100 iterations
- Each property test references design document property number
