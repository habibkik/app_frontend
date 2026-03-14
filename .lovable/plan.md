

## Plan: Market Intelligence Product Dropdown + Content Studio Auto-Fill

### What Changes

Replace the plain "Product Title" text input with a **combo dropdown** that lists:
1. All products from **Market Intelligence** analysis history (`useAnalysisStore().history`)
2. A **"Custom Product (Manual Entry)"** blank option at the top

When the user selects a Market Intelligence product, the system:
- Sets the `title` to the product name
- Auto-searches `content_templates` (DB) and `savedItems` (in-memory) for a matching Content Studio entry by product name
- If a match is found → auto-fills description, tags, and images using the existing `handleContentStudioImport` logic
- If seller results exist for that product → fills `price` from `pricingRecommendation.suggested` and `compareAtPrice` from `marketPriceRange.max`
- Shows the "Imported from" banner

When "Custom Product" is selected → clears the title field so the user can type manually.

### File to Edit

**`src/features/marketplace/components/TabProductListing.tsx`**:

1. Import `useAnalysisStore` and read `history` and `sellerResults`
2. Replace the Product Title `<Input>` (lines 330-338) with a `<Select>` dropdown containing:
   - First option: `"custom"` → "Custom Product (Manual Entry)"
   - Then each unique `history` item showing `productName — category`
3. Add `handleProductSelect(value)` function:
   - If `"custom"` → clear title, let user type in a text input that appears below
   - Otherwise → set title, look up matching content template, call existing import logic, fill pricing from seller results
4. Show a manual title `<Input>` below the dropdown when "Custom" is selected (or always, pre-filled when a product is selected so user can still edit)
5. Keep the existing "Import from Content Studio" dropdown as a secondary override option

### No database changes needed

