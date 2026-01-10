# Add Block Modal - Design Specification

## Visual Design System

### Color Palette
```css
/* Primary Actions */
--green-primary: #00aa4f;
--green-hover: #008f42;

/* Block Type Colors */
--link-color: #10b981;      /* green-500 */
--text-color: #f97316;      /* orange-500 */
--image-color: #374151;     /* gray-700 */
--video-color: #ef4444;     /* red-500 */
--divider-color: #6b7280;   /* gray-500 */
--social-color: #ec4899;    /* pink-500 */
--email-color: #3b82f6;     /* blue-500 */
--contact-color: #8b5cf6;   /* purple-500 */

/* Backgrounds */
--sidebar-bg: #f9fafb;      /* gray-50 */
--content-bg: #ffffff;
--preview-bg: linear-gradient(to bottom right, #f9fafb, #e5e7eb);

/* Borders & Shadows */
--border-default: #e5e7eb;  /* gray-200 */
--border-hover: #00aa4f;    /* green-500 */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### Typography
```css
/* Modal Title */
font-size: 1.5rem;          /* text-2xl */
font-weight: 700;           /* font-bold */
color: #111827;             /* gray-900 */

/* Section Headers */
font-size: 0.75rem;         /* text-xs */
font-weight: 700;           /* font-bold */
text-transform: uppercase;
letter-spacing: 0.05em;     /* tracking-wider */
color: #6b7280;             /* gray-500 */

/* Block Names */
font-size: 0.875rem;        /* text-sm */
font-weight: 600;           /* font-semibold */
color: #111827;             /* gray-900 */

/* Descriptions */
font-size: 0.75rem;         /* text-xs */
color: #6b7280;             /* gray-500 */
```

### Spacing & Layout
```css
/* Modal */
max-width: 1200px;
height: 900px;
border-radius: 1.5rem;      /* rounded-3xl */
padding: 0;

/* Sidebar */
width: 320px;
padding: 1rem;              /* p-4 */

/* Content Area */
padding: 2rem;              /* p-8 */

/* Grid */
grid-template-columns: repeat(2, 1fr);
gap: 1.5rem;                /* gap-6 */

/* Cards */
border-radius: 1rem;        /* rounded-2xl */
border-width: 2px;
```

## Block Type Specifications

### 1. Link Block 🔗
**Color**: `bg-green-500`  
**Layouts**: 4

#### Classic Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │ ← Stacked button
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │               │  │ ← Stacked button
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │               │  │ ← Stacked button
│  └───────────────┘  │
└─────────────────────┘

Badge: "Most popular"
Badge Color: bg-green-100 text-green-700
```

#### Carousel Layout
```
Preview:
┌─────────────────────┐
│  ┌────┐  ┌────┐     │
│  │    │  │    │ →   │ ← Swipeable cards
│  │    │  │    │     │
│  └────┘  └────┘     │
└─────────────────────┘

Badge: None
```

#### Grid Layout
```
Preview:
┌─────────────────────┐
│  ┌──┐ ┌──┐ ┌──┐    │
│  │  │ │  │ │  │    │ ← 3x2 image grid
│  └──┘ └──┘ └──┘    │
│  ┌──┐ ┌──┐ ┌──┐    │
│  │  │ │  │ │  │    │
│  └──┘ └──┘ └──┘    │
└─────────────────────┘

Badge: None
```

#### Card Layout
```
Preview:
┌─────────────────────┐
│  ┌──┐ ─────────     │
│  │  │ Title         │ ← Thumbnail + text
│  └──┘ Subtitle      │
│  ┌──┐ ─────────     │
│  │  │ Title         │
│  └──┘ Subtitle      │
└─────────────────────┘

Badge: None
```

### 2. Text Block 📝
**Color**: `bg-orange-500`  
**Layouts**: 2

#### Heading Layout
```
Preview:
┌─────────────────────┐
│  ═══════════════    │ ← Large title
│  ─────────────      │ ← Subtitle
└─────────────────────┘

Badge: None
```

#### Paragraph Layout
```
Preview:
┌─────────────────────┐
│  ─────────────────  │
│  ─────────────────  │
│  ──────────────     │ ← Body text lines
│  ─────────────────  │
│  ────────────       │
└─────────────────────┘

Badge: None
```

### 3. Image Block 🖼️
**Color**: `bg-gray-700`  
**Layouts**: 2

#### Single Image Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │
│  │               │  │ ← Full-width image
│  │               │  │
│  └───────────────┘  │
└─────────────────────┘

Badge: "Recommended"
Badge Color: bg-green-100 text-green-700
```

#### Gallery Layout
```
Preview:
┌─────────────────────┐
│  ┌────┐  ┌────┐     │
│  │    │  │    │     │ ← 2x2 grid
│  └────┘  └────┘     │
│  ┌────┐  ┌────┐     │
│  │    │  │    │     │
│  └────┘  └────┘     │
└─────────────────────┘

Badge: None
```

### 4. Video Block ▶️
**Color**: `bg-red-500`  
**Layouts**: 1

#### Embed Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │
│  │       ▶       │  │ ← Video player with play icon
│  │               │  │
│  └───────────────┘  │
└─────────────────────┘

Badge: None
Description: "YouTube, TikTok, Vimeo"
```

### 5. Divider Block ➖
**Color**: `bg-gray-500`  
**Layouts**: 2

#### Line Layout
```
Preview:
┌─────────────────────┐
│                     │
│  ─────────────────  │ ← Horizontal line
│                     │
└─────────────────────┘

Badge: None
```

#### Spacer Layout
```
Preview:
┌─────────────────────┐
│  ┌ ─ ─ ─ ─ ─ ─ ┐   │
│  │             │   │ ← Dashed border box
│  └ ─ ─ ─ ─ ─ ─ ┘   │
└─────────────────────┘

Badge: None
```

### 6. Social Links Block 📱
**Color**: `bg-pink-500`  
**Layouts**: 1

#### Icon Bar Layout
```
Preview:
┌─────────────────────┐
│                     │
│   ⭕ ⭕ ⭕ ⭕        │ ← Social media icons
│                     │
└─────────────────────┘

Badge: "Popular"
Badge Color: bg-pink-100 text-pink-700
Description: "Instagram, Twitter, Facebook, etc."
```

### 7. Email Signup Block ✉️
**Color**: `bg-blue-500`  
**Layouts**: 1

#### Form Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │ Email address │  │ ← Input field
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Subscribe   │  │ ← Submit button
│  └───────────────┘  │
└─────────────────────┘

Badge: None
Description: "Collect email subscribers"
```

### 8. Contact Button Block 📞
**Color**: `bg-purple-500`  
**Layouts**: 3

#### Email Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │ ✉️  Email me  │  │ ← Email button
│  └───────────────┘  │
└─────────────────────┘

Badge: None
```

#### Phone Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │ 📞  Call me   │  │ ← Phone button
│  └───────────────┘  │
└─────────────────────┘

Badge: None
```

#### WhatsApp Layout
```
Preview:
┌─────────────────────┐
│  ┌───────────────┐  │
│  │ 💬  WhatsApp  │  │ ← WhatsApp button
│  └───────────────┘  │
└─────────────────────┘

Badge: "Popular"
Badge Color: bg-green-100 text-green-700
```

## Interaction States

### Default State
```css
border: 2px solid #e5e7eb;
background: white;
box-shadow: none;
transition: all 0.2s ease;
```

### Hover State
```css
border: 2px solid #00aa4f;
background: white;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
transform: translateY(-2px);
cursor: pointer;
```

### Selected State (Sidebar)
```css
background: white;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
```

## Animation Specifications

### Modal Open
```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

duration: 200ms;
easing: ease-out;
```

### Backdrop Fade
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

duration: 200ms;
easing: ease-out;
```

### Card Hover
```css
transition: all 0.2s ease;
properties: border-color, box-shadow, transform;
```

## Responsive Behavior

### Desktop (1200px+)
- Modal: 1200px max-width
- Sidebar: 320px fixed
- Content: Flexible
- Grid: 2 columns

### Tablet (768px - 1199px)
- Modal: 90vw width
- Sidebar: 280px fixed
- Content: Flexible
- Grid: 2 columns

### Mobile (<768px)
- Modal: Full screen
- Sidebar: Collapsible drawer
- Content: Full width
- Grid: 1 column

## Accessibility

### Keyboard Navigation
- `Tab`: Navigate between elements
- `Enter`: Select layout
- `Escape`: Close modal
- `Ctrl+L`: Quick add Link
- `Ctrl+T`: Quick add Text
- `Ctrl+I`: Quick add Image

### ARIA Labels
```html
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Add a block</h2>
  <button aria-label="Close modal">×</button>
  <input aria-label="Search blocks" />
  <button aria-label="Add Link block">Link</button>
</div>
```

### Focus Management
- Focus trap within modal
- Return focus to trigger button on close
- Visible focus indicators (ring-2 ring-green-500)

## Implementation Checklist

- [ ] Update `categories` array with 8 block types
- [ ] Define `layouts` object for all block types
- [ ] Create preview mockups for each layout
- [ ] Add color classes for new block types
- [ ] Implement hover states with border color change
- [ ] Add badges to appropriate layouts
- [ ] Test search functionality
- [ ] Verify Recently Used tracking
- [ ] Test Quick Add shortcuts
- [ ] Validate responsive behavior
- [ ] Check accessibility (keyboard, ARIA)
- [ ] Polish animations and transitions

## Notes
- Keep preview mockups simple and recognizable
- Use consistent spacing and sizing
- Follow app.css design system strictly
- Ensure smooth animations (200ms duration)
- Test on multiple screen sizes
- Validate color contrast for accessibility
