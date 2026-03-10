

## Plan: Scroll Preview Modal to Clicked Template Position

**Problem**: When clicking a template card, the preview modal always scrolls to the top. The user wants the modal to appear contextually aligned with the clicked template's position.

**Approach**: Since the preview is a centered popup modal (not inline), the best UX is to remove the `useScrollToTop` behavior so the modal simply opens centered on screen showing the hero image at top — which is already the natural state. 

However, re-reading the request: the user wants the preview to appear **at the same position as the clicked template card**, not as a top-anchored dialog.

**Solution**: Replace the fixed centered modal with an **inline expansion** that expands the clicked card in-place, or alternatively, scroll the page so the modal visually aligns near where the user clicked.

The cleanest approach: **Keep the popup modal but remove the forced scroll-to-top**, and instead pass the click event's Y position to position the modal content naturally. Since it's a fixed overlay with `max-h-[85vh]` and centered, the content already starts at the hero image which is the most useful view.

**Actually**, the simplest fix: just remove the `useScrollToTop` hook call. The modal's scrollable container will naturally start at top (showing the preview image), which is correct. The issue described is likely that the *page behind* scrolls to top. Let me check the code more carefully.

Looking at the current code — `useScrollToTop` scrolls the modal's inner `scrollRef` to top, which is fine. The real request seems to be: don't scroll the background page, and have the modal appear near where they clicked.

**Implementation**:
1. Remove `useScrollToTop` (modal content naturally starts at top anyway)
2. Track which template card was clicked and its DOM position
3. Use `framer-motion` `layoutId` to animate the card expanding into the modal from its original position — giving the illusion the preview opens "in place"

**Simpler alternative**: Use `framer-motion`'s `layoutId` on the template card image and the modal image so it animates from the card's position to the modal, creating a smooth spatial connection.

### Changes

**File: `src/features/seller/components/website-builder/TemplatePicker.tsx`**

1. Add `layoutId={template.id}` to the card's image container and the modal's hero image — `framer-motion` will automatically animate between the two positions
2. Remove the `useScrollToTop` hook (no longer needed)
3. The modal animation `initial` changes from `scale: 0.9, y: 40` to just opacity fade, letting `layoutId` handle the spatial transition

This gives the effect of the preview "growing out" from the clicked card's position rather than appearing from the top.

