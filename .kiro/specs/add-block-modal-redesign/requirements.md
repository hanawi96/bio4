# Add Block Modal Redesign - Requirements

## Overview
Redesign the "Add a block" modal to support 8 essential block types with a beautiful, professional interface following the app's iOS-inspired design system.

## User Stories

### US-1: Core Content Blocks
**As a** bio page creator  
**I want** to add basic content blocks (Link, Text, Image, Divider)  
**So that** I can build a simple, functional bio page

**Acceptance Criteria:**
- Link block with 4 layouts: Classic (stacked), Carousel (swipeable), Grid (image grid), Card (with thumbnails)
- Text block with 2 layouts: Heading (large title), Paragraph (body text)
- Image block with 2 layouts: Single Image, Gallery (grid)
- Divider block with 2 layouts: Line (horizontal separator), Spacer (empty space)

### US-2: Video Embedding
**As a** content creator  
**I want** to embed videos from YouTube, TikTok, and Vimeo  
**So that** I can showcase my video content directly on my bio page

**Acceptance Criteria:**
- Video block type with embed layout
- Support for YouTube, TikTok, Vimeo URLs
- Responsive video player preview
- Auto-detect video platform from URL

### US-3: Social Media Links
**As a** social media influencer  
**I want** to display my social media profiles as clickable icons  
**So that** visitors can easily find and follow me on different platforms

**Acceptance Criteria:**
- Social Links block with icon bar layout
- Support for major platforms: Instagram, Twitter/X, Facebook, LinkedIn, YouTube, TikTok, GitHub, Discord
- Icon grid display (responsive: 4-6 icons per row)
- Platform auto-detection with branded colors

### US-4: Email Newsletter Signup
**As a** content creator  
**I want** to collect email subscribers  
**So that** I can build my mailing list and send newsletters

**Acceptance Criteria:**
- Email Signup block with form layout
- Input field for email address
- Submit button with customizable text
- Integration with email service providers (future: Mailchimp, ConvertKit, etc.)
- Success/error message display

### US-5: Contact Buttons
**As a** business owner  
**I want** to add contact buttons (email, phone, WhatsApp)  
**So that** customers can easily reach me

**Acceptance Criteria:**
- Contact Button block with 3 types: Email, Phone, WhatsApp
- Email: Opens default email client with pre-filled address
- Phone: Opens phone dialer on mobile, displays number on desktop
- WhatsApp: Opens WhatsApp chat with pre-filled message
- Icon + text display with platform branding

## Block Types Summary

| Block Type | Icon | Layouts | Priority |
|------------|------|---------|----------|
| Link | 🔗 | Classic, Carousel, Grid, Card | High |
| Text | 📝 | Heading, Paragraph | High |
| Image | 🖼️ | Single, Gallery | High |
| Divider | ➖ | Line, Spacer | High |
| Video | ▶️ | Embed | Medium |
| Social Links | 📱 | Icon Bar | Medium |
| Email Signup | ✉️ | Form | Medium |
| Contact Button | 📞 | Email, Phone, WhatsApp | Medium |

## Design Requirements

### Visual Design
- Follow iOS-inspired design system from `app.css`
- Use `.card-ios` for cards with subtle shadows
- Use `.btn-ios-primary` for primary actions (green #00aa4f)
- Use `.btn-ios-secondary` for secondary actions
- Use `.icon-ios` for block type icons with gradient backgrounds
- Maintain consistent spacing, border radius (rounded-2xl), and typography

### Layout Structure
- **Modal Size**: 1200px max-width, 900px height
- **Sidebar**: 320px width, gray-50 background
  - Search bar at top
  - Quick Add section (3 most used blocks)
  - Recently Used section (dynamic)
  - All Blocks section (categorized)
- **Content Area**: Flexible width
  - Section title with description
  - Layout grid (2 columns)
  - Preview cards with hover effects

### Interaction Design
- Smooth animations (fade-in, scale-in)
- Hover states with border color change (gray-200 → green-500)
- Shadow elevation on hover
- Click to select layout and close modal
- Search functionality with real-time filtering
- Keyboard shortcuts for Quick Add items

### Preview Mockups
Each layout must have a visual preview showing:
- Link Classic: 3 stacked rectangular buttons
- Link Carousel: 2 side-by-side cards (swipeable)
- Link Grid: 3x2 image grid
- Link Card: 2 cards with thumbnail + text
- Text Heading: Large title + subtitle
- Text Paragraph: 5 lines of text
- Image Single: Full-width image placeholder
- Image Gallery: 2x2 image grid
- Video Embed: Video player with play icon
- Divider Line: Horizontal line
- Divider Spacer: Dashed border box
- Social Icons: 4 circular icons in a row
- Email Form: Input field + submit button
- Contact Email: Envelope icon + "Email me" text
- Contact Phone: Phone icon + "Call me" text
- Contact WhatsApp: WhatsApp icon + "Chat on WhatsApp" text

## Technical Requirements

### Data Structure
```typescript
interface BlockCategory {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind bg-* class
  section: string;
  description: string;
  available: boolean;
}

interface BlockLayout {
  id: string;
  name: string;
  description: string;
  badge?: string | null;
  badgeColor?: string;
}
```

### Component API
```typescript
// Props
export function open(): void;
export function close(): void;

// Events
dispatch('select', { type: string, layout: string });
```

### State Management
- `isOpen`: boolean - Modal visibility
- `selectedCategory`: string - Currently selected block type
- `searchQuery`: string - Search input value
- `recentlyUsed`: string[] - Recently added block types (max 3)

## Implementation Notes

### Phase 1: Update Block Categories
- Add 4 new block types to `categories` array
- Assign appropriate icons, colors, descriptions
- Set `available: true` for all 8 blocks

### Phase 2: Define Layouts
- Add layouts for Video, Social Links, Email Signup, Contact Button
- Define layout IDs, names, descriptions
- Add badges where appropriate (e.g., "Popular", "Recommended")

### Phase 3: Create Preview Mockups
- Design visual previews for each layout
- Use Tailwind classes for consistent styling
- Ensure previews are recognizable and intuitive

### Phase 4: Update Event Handling
- Ensure `selectLayout()` dispatches correct data
- Update `recentlyUsed` tracking
- Test Quick Add functionality

### Phase 5: Polish & Testing
- Test all 8 block types
- Verify search functionality
- Check responsive behavior
- Validate keyboard shortcuts
- Test hover states and animations

## Out of Scope
- Backend implementation for new block types
- Database schema changes
- Block rendering on public bio page
- Email service provider integrations
- WhatsApp API integration
- Video platform API integrations

## Success Metrics
- All 8 block types are selectable
- Modal opens/closes smoothly
- Search filters correctly
- Recently Used updates dynamically
- Preview mockups are clear and recognizable
- Design follows app.css system consistently

## Dependencies
- `frontend/src/lib/components/modals/AddBlockModal.svelte` (existing)
- `frontend/src/app.css` (design system)
- `frontend/src/lib/types.ts` (Block interface)

## Notes
- This spec focuses on UI/UX only
- Backend implementation will be handled separately
- Block rendering logic is out of scope
- Focus on making the modal beautiful and professional
