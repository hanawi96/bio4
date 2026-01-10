# Add Block Modal - Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the redesigned Add Block Modal with 8 essential block types.

## File to Modify
- `frontend/src/lib/components/modals/AddBlockModal.svelte`

## Implementation Steps

### Step 1: Update Block Categories Array

Add 4 new block types to the existing `categories` array:

```typescript
const categories = [
	// Existing blocks
	{ id: 'link', name: 'Links', icon: '🔗', color: 'bg-green-500', section: 'Content', description: 'Add clickable links', available: true },
	{ id: 'text', name: 'Text', icon: '📝', color: 'bg-orange-500', section: 'Content', description: 'Add headings and paragraphs', available: true },
	{ id: 'image', name: 'Image', icon: '🖼️', color: 'bg-gray-700', section: 'Content', description: 'Upload and display images', available: true },
	{ id: 'divider', name: 'Divider', icon: '➖', color: 'bg-gray-500', section: 'Content', description: 'Add visual separators', available: true },
	
	// NEW: Add these 4 blocks
	{ id: 'video', name: 'Video', icon: '▶️', color: 'bg-red-500', section: 'Content', description: 'Embed YouTube, TikTok, Vimeo', available: true },
	{ id: 'social', name: 'Social Links', icon: '📱', color: 'bg-pink-500', section: 'Content', description: 'Link to social profiles', available: true },
	{ id: 'email', name: 'Email Signup', icon: '✉️', color: 'bg-blue-500', section: 'Content', description: 'Collect email subscribers', available: true },
	{ id: 'contact', name: 'Contact Button', icon: '📞', color: 'bg-purple-500', section: 'Content', description: 'Email, phone, WhatsApp', available: true }
];
```

### Step 2: Add Layouts for New Block Types

Add layouts to the existing `layouts` object:

```typescript
const layouts = {
	// Existing layouts...
	link: [...],
	text: [...],
	image: [...],
	divider: [...],
	
	// NEW: Add these layouts
	video: [
		{
			id: 'embed',
			name: 'Video Embed',
			description: 'YouTube, TikTok, Vimeo',
			badge: null
		}
	],
	social: [
		{
			id: 'icons',
			name: 'Icon Bar',
			description: 'Social media icons',
			badge: 'Popular',
			badgeColor: 'bg-pink-100 text-pink-700'
		}
	],
	email: [
		{
			id: 'form',
			name: 'Newsletter Form',
			description: 'Email input + subscribe button',
			badge: null
		}
	],
	contact: [
		{
			id: 'email',
			name: 'Email Button',
			description: 'Opens email client',
			badge: null
		},
		{
			id: 'phone',
			name: 'Phone Button',
			description: 'Opens phone dialer',
			badge: null
		},
		{
			id: 'whatsapp',
			name: 'WhatsApp Button',
			description: 'Opens WhatsApp chat',
			badge: 'Popular',
			badgeColor: 'bg-green-100 text-green-700'
		}
	]
};
```

### Step 3: Add Preview Mockups

In the "Layouts" section of the modal, add preview mockups for new block types:

```svelte
<!-- Inside the layout preview area -->
{#if selectedCategory === 'video'}
	<div class="w-full aspect-video bg-white rounded-xl shadow-sm flex items-center justify-center">
		<svg class="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
			<path d="M8 5v14l11-7z"/>
		</svg>
	</div>

{:else if selectedCategory === 'social'}
	<div class="flex gap-3 justify-center">
		<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
		<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
		<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
		<div class="w-10 h-10 bg-white rounded-full shadow-sm"></div>
	</div>

{:else if selectedCategory === 'email'}
	<div class="w-full space-y-3">
		<div class="h-10 bg-white rounded-lg shadow-sm flex items-center px-3">
			<span class="text-xs text-gray-400">Enter your email...</span>
		</div>
		<div class="h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm flex items-center justify-center">
			<span class="text-xs font-semibold text-white">Subscribe</span>
		</div>
	</div>

{:else if selectedCategory === 'contact'}
	{#if layout.id === 'email'}
		<div class="w-full">
			<div class="h-12 bg-white rounded-xl shadow-sm flex items-center justify-center gap-2">
				<span class="text-lg">✉️</span>
				<span class="text-sm font-semibold text-gray-900">Email me</span>
			</div>
		</div>
	{:else if layout.id === 'phone'}
		<div class="w-full">
			<div class="h-12 bg-white rounded-xl shadow-sm flex items-center justify-center gap-2">
				<span class="text-lg">📞</span>
				<span class="text-sm font-semibold text-gray-900">Call me</span>
			</div>
		</div>
	{:else if layout.id === 'whatsapp'}
		<div class="w-full">
			<div class="h-12 bg-white rounded-xl shadow-sm flex items-center justify-center gap-2">
				<span class="text-lg">💬</span>
				<span class="text-sm font-semibold text-gray-900">Chat on WhatsApp</span>
			</div>
		</div>
	{/if}
{/if}
```

### Step 4: Update Quick Add Items (Optional)

If you want to add new blocks to Quick Add:

```typescript
const quickAddItems = [
	{ id: 'link', name: 'Link', icon: '🔗', shortcut: 'Ctrl+L' },
	{ id: 'text', name: 'Text', icon: '📝', shortcut: 'Ctrl+T' },
	{ id: 'image', name: 'Image', icon: '🖼️', shortcut: 'Ctrl+I' },
	// Optional: Add more quick add items
	// { id: 'video', name: 'Video', icon: '▶️', shortcut: 'Ctrl+V' },
];
```

### Step 5: Test the Implementation

1. Open the modal and verify all 8 block types appear in the sidebar
2. Click each block type and verify layouts display correctly
3. Check preview mockups are clear and recognizable
4. Test search functionality with new block names
5. Verify hover states work correctly
6. Test Recently Used tracking
7. Validate Quick Add shortcuts

## Code Quality Checklist

- [ ] No console.log statements left in code
- [ ] Consistent indentation and formatting
- [ ] All new blocks have proper icons and colors
- [ ] Preview mockups match design spec
- [ ] Hover states work smoothly
- [ ] Search filters new blocks correctly
- [ ] No TypeScript errors
- [ ] No duplicate code

## Testing Scenarios

### Scenario 1: Add Video Block
1. Open modal
2. Click "Video" in sidebar
3. Verify "Video Embed" layout appears
4. Click layout card
5. Verify modal closes and event dispatches

### Scenario 2: Add Social Links
1. Open modal
2. Click "Social Links" in sidebar
3. Verify "Icon Bar" layout appears with "Popular" badge
4. Click layout card
5. Verify modal closes and event dispatches

### Scenario 3: Add Email Signup
1. Open modal
2. Click "Email Signup" in sidebar
3. Verify "Newsletter Form" layout appears
4. Click layout card
5. Verify modal closes and event dispatches

### Scenario 4: Add Contact Button
1. Open modal
2. Click "Contact Button" in sidebar
3. Verify 3 layouts appear: Email, Phone, WhatsApp
4. Verify WhatsApp has "Popular" badge
5. Click any layout card
6. Verify modal closes and event dispatches

### Scenario 5: Search Functionality
1. Open modal
2. Type "video" in search
3. Verify only Video block appears
4. Type "social"
5. Verify only Social Links block appears
6. Clear search
7. Verify all blocks reappear

### Scenario 6: Recently Used
1. Add a Video block
2. Reopen modal
3. Verify Video appears in "Recently Used" section
4. Add a Social Links block
5. Reopen modal
6. Verify both Video and Social Links appear in "Recently Used"

## Performance Considerations

- Preview mockups use simple SVG/div elements (no images)
- Animations are CSS-based (no JavaScript)
- Search filtering is reactive (no debouncing needed for small dataset)
- Modal uses fixed height to prevent layout shifts

## Accessibility Notes

- All block types have descriptive names and descriptions
- Preview mockups are visual only (no interactive elements)
- Keyboard navigation works for all blocks
- Focus states are visible
- ARIA labels are present

## Future Enhancements (Out of Scope)

- Backend implementation for new block types
- Database schema for Video, Social, Email, Contact blocks
- Block rendering on public bio page
- Email service provider integrations
- WhatsApp API integration
- Video platform API integrations
- Advanced layout customization
- Block templates and presets

## Rollback Plan

If issues arise, revert changes to `AddBlockModal.svelte`:
1. Remove new block types from `categories` array
2. Remove new layouts from `layouts` object
3. Remove new preview mockups from template
4. Test that original 4 blocks still work

## Support & Documentation

- Design spec: `.kiro/specs/add-block-modal-redesign/design.md`
- Requirements: `.kiro/specs/add-block-modal-redesign/requirements.md`
- Component file: `frontend/src/lib/components/modals/AddBlockModal.svelte`
- Design system: `frontend/src/app.css`

## Notes

- This implementation is UI-only
- Backend support for new blocks will be added separately
- Focus on making the modal beautiful and professional
- Follow app.css design system strictly
- Keep code clean and maintainable
