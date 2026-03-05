

## Plan: Content Studio Data Import Dropdown for Product Listing

### What

Add a "Import from Content Studio" dropdown at the top of the New Product Listing form. When the user selects a Content Studio item (from `savedItems` in `useContentStudioStore` or from `content_templates` in the database), it auto-fills the form fields: title (from `productName`), description (from `adCopy.long` or `descriptions.long`), tags (from social hashtags), and images (from `proImages` with URLs).

### Implementation

**Edit `src/features/marketplace/components/TabProductListing.tsx`:**

1. Import `useContentStudioStore` and add a query to fetch `content_templates` from the database
2. Add a new section at the top of the form (before the title field) with:
   - A labeled dropdown/select: "Import from Content Studio"
   - Options sourced from two places:
     - **In-memory**: `useContentStudioStore().savedItems` (items generated in the current session)
     - **Database**: `content_templates` table rows (persisted templates with `content_json` containing the full `GeneratedContent` structure)
   - Each option shows the product name and generation date
   - An "Import" or auto-fill on selection behavior
3. When a Content Studio item is selected, populate:
   - `title` ← `productName`
   - `description` ← `content_json.descriptions.long` or `adCopy.long`
   - `tags` ← extract unique hashtags from `socialMedia.instagram.hashtags` + `socialMedia.tiktok.hashtags`
   - `productImages` ← pull any `proImages` that have non-null `imageUrl` from the store (mapped to the image format the uploader expects)
4. Show a toast confirming "Product data imported from Content Studio"
5. Add a visual indicator (a highlighted card/banner) showing which Content Studio product was imported, with a "Clear" button

### Files to Edit
- `src/features/marketplace/components/TabProductListing.tsx` — add the import dropdown, content studio query, and auto-fill logic

### No database or migration changes needed
The `content_templates` table already exists with `content_json` JSONB field containing the generated content data.

