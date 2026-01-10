# Add Block Modal Redesign - Spec Overview

## Quick Summary

Redesign the "Add a block" modal to support 8 essential block types with a beautiful, professional iOS-inspired interface.

## Block Types (4 New + 4 Existing)

### Existing Blocks ✅
1. **Link** 🔗 - Classic, Carousel, Grid, Card layouts
2. **Text** 📝 - Heading, Paragraph layouts
3. **Image** 🖼️ - Single, Gallery layouts
4. **Divider** ➖ - Line, Spacer layouts

### New Blocks 🆕
5. **Video** ▶️ - Embed layout (YouTube, TikTok, Vimeo)
6. **Social Links** 📱 - Icon Bar layout (Instagram, Twitter, etc.)
7. **Email Signup** ✉️ - Newsletter Form layout
8. **Contact Button** 📞 - Email, Phone, WhatsApp layouts

## Scope

### In Scope ✅
- Update modal UI with 8 block types
- Add preview mockups for all layouts
- Follow app.css design system (iOS-inspired)
- Search, Recently Used, Quick Add functionality
- Smooth animations and hover states

### Out of Scope ❌
- Backend implementation
- Database schema changes
- Block rendering on public bio page
- Email/WhatsApp/Video API integrations

## Documents

1. **requirements.md** - User stories, acceptance criteria, technical requirements
2. **design.md** - Visual design system, mockups, interaction states, accessibility
3. **implementation.md** - Step-by-step code changes, testing scenarios, rollback plan
4. **README.md** - This overview document

## Key Design Principles

- **iOS-Inspired**: Use `.card-ios`, `.btn-ios-primary`, `.icon-ios` from app.css
- **Professional**: Clean, modern, polished interface
- **Intuitive**: Clear preview mockups, descriptive labels
- **Smooth**: 200ms animations, hover effects, transitions
- **Accessible**: Keyboard navigation, ARIA labels, focus management

## Implementation Phases

1. **Phase 1**: Update block categories array (5 min)
2. **Phase 2**: Define layouts for new blocks (10 min)
3. **Phase 3**: Create preview mockups (20 min)
4. **Phase 4**: Update event handling (5 min)
5. **Phase 5**: Polish & testing (10 min)

**Total Estimated Time**: ~50 minutes

## Success Criteria

- ✅ All 8 block types are selectable
- ✅ Modal opens/closes smoothly
- ✅ Search filters correctly
- ✅ Recently Used updates dynamically
- ✅ Preview mockups are clear and recognizable
- ✅ Design follows app.css system consistently
- ✅ No console errors or TypeScript issues

## Testing Checklist

- [ ] Video block selectable with embed layout
- [ ] Social Links block selectable with icon bar layout
- [ ] Email Signup block selectable with form layout
- [ ] Contact Button block selectable with 3 layouts (Email, Phone, WhatsApp)
- [ ] Search filters new blocks correctly
- [ ] Recently Used tracks new blocks
- [ ] Hover states work on all layout cards
- [ ] Modal animations are smooth
- [ ] No console errors

## Files to Modify

- `frontend/src/lib/components/modals/AddBlockModal.svelte` (main implementation)

## Files to Reference

- `frontend/src/app.css` (design system)
- `frontend/src/lib/types.ts` (Block interface)

## Next Steps

1. Review requirements.md for detailed user stories
2. Review design.md for visual specifications
3. Follow implementation.md for step-by-step code changes
4. Test all scenarios from implementation.md
5. Verify success criteria are met

## Notes

- This is a UI-only implementation
- Backend support will be added in a separate task
- Focus on making the modal beautiful and professional
- Keep code clean, maintainable, and consistent with existing patterns

## Questions?

Refer to the detailed documents:
- User stories → requirements.md
- Visual design → design.md
- Code changes → implementation.md
