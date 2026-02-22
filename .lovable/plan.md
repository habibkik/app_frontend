

## Clean Up Image Upload Titles

Based on your request, I'll simplify the image upload zone by removing the large title and subtitle text, keeping only the essential drop zone with a clean, minimal design.

### What Changes

**Before (current):**
- Large mode-specific title (e.g., "Reverse Engineer", "Find Suppliers", "Market Analysis")
- Subtitle text below the title
- Upload / Camera buttons
- Format support text

**After (simplified):**
- Mode icon only (smaller)
- Simple "Drop image or click to browse" text
- Upload / Camera buttons
- Format support text

### Technical Details

**File: `src/components/shared/UniversalImageUpload.tsx`**
- Remove the `<h2>` title element (lines 326-331) that displays `config.title`
- Remove the `<p>` subtitle element (lines 332-337) that displays `config.subtitle`
- Keep the mode icon, upload buttons, and format support text
- Adjust spacing (reduce `mb-6` on icon since there's no title below it)

**Locale files** (`en.json`, `ar.json`, `fr.json`, `es.json`):
- No changes needed -- the unused keys (`buyerTitle`, `buyerSubtitle`, `producerTitle`, `producerSubtitle`, `sellerTitle`, `sellerSubtitle`) can optionally be cleaned up, but won't cause issues if left in place

