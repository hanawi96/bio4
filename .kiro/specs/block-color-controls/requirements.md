# Requirements Document

## Introduction

Thêm 2 control mới vào phần Block Style trong trang Appearance để cho phép user tùy chỉnh màu nền (background color) và màu text của block. Các control này phải đồng bộ với theme config, nghĩa là khi apply theme có màu cụ thể thì control phải highlight màu đó, và khi user thay đổi màu thì theme config cũng được cập nhật tương ứng.

## Glossary

- **Block**: Các button/link items hiển thị trên bio page
- **BlockStyleSection**: Component trong trang Appearance quản lý style của block
- **Theme Config**: Cấu trúc dữ liệu chứa theme settings, bao gồm `semantic.color.*`
- **ColorPicker**: Component UI cho phép user chọn màu
- **Appearance Store**: Svelte store quản lý trạng thái appearance và theme overrides
- **Highlight**: Hiển thị màu đang được chọn/active trong UI

## Requirements

### Requirement 1: Thêm Block Background Color Control

**User Story:** Là một user, tôi muốn tùy chỉnh màu nền của block, để bio page của tôi có style phù hợp với brand của tôi.

#### Acceptance Criteria

1. WHEN user mở trang Appearance, THE System SHALL hiển thị control "Block Background Color" trong phần Block Style
2. WHEN theme được apply có giá trị background color cụ thể, THE ColorPicker SHALL highlight màu đó
3. WHEN user chọn màu mới từ ColorPicker, THE System SHALL cập nhật giá trị vào theme config
4. WHEN màu được thay đổi, THE System SHALL hiển thị preview real-time trên PhoneMockup
5. WHEN màu được thay đổi, THE System SHALL tự động lưu vào database qua autosave

### Requirement 2: Thêm Block Text Color Control

**User Story:** Là một user, tôi muốn tùy chỉnh màu text của block, để text dễ đọc và phù hợp với màu nền.

#### Acceptance Criteria

1. WHEN user mở trang Appearance, THE System SHALL hiển thị control "Block Text Color" trong phần Block Style
2. WHEN theme được apply có giá trị `semantic.color.primary`, THE ColorPicker SHALL highlight màu đó
3. WHEN user chọn màu mới từ ColorPicker, THE System SHALL cập nhật giá trị vào `semantic.color.primary`
4. WHEN màu được thay đổi, THE System SHALL hiển thị preview real-time trên PhoneMockup
5. WHEN màu được thay đổi, THE System SHALL tự động lưu vào database qua autosave

### Requirement 3: Đồng bộ với Theme Config

**User Story:** Là một user, tôi muốn các color control tự động đồng bộ với theme đang apply, để tôi biết theme đang dùng màu gì và có thể customize từ đó.

#### Acceptance Criteria

1. WHEN user apply theme mới, THE System SHALL tự động cập nhật giá trị hiển thị trong ColorPicker
2. WHEN user switch giữa các theme, THE ColorPicker SHALL luôn hiển thị đúng màu của theme đang active
3. WHEN user override màu trong Appearance, THE System SHALL lưu override vào `appearanceState.overrides`
4. WHEN user reset về theme default, THE System SHALL xóa override và hiển thị lại màu gốc của theme

### Requirement 4: UI/UX Consistency

**User Story:** Là một user, tôi muốn các color control có UI/UX giống với các control khác trong Appearance, để dễ sử dụng và nhất quán.

#### Acceptance Criteria

1. THE ColorPicker components SHALL sử dụng cùng style và layout với các control khác
2. THE ColorPicker components SHALL có label rõ ràng ("Block Background Color", "Block Text Color")
3. THE ColorPicker components SHALL có description text giải thích chức năng
4. THE ColorPicker components SHALL được đặt trong phần Block Style section, sau các control hiện tại
5. THE ColorPicker components SHALL responsive và hoạt động tốt trên mobile
