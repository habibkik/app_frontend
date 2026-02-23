

## Add Pro Photography Image Picker to All Website Builder Block Sections

### Problem
Currently, only the Hero block has an image picker grid, and it still references the old legacy `store.images` instead of `store.proImages`. The About, Solution, and Product Catalog blocks have image URL text inputs but no way to browse and select from generated pro photography images.

### Changes

**File: `src/features/seller/components/website-builder/BlockConfigurator.tsx`**

1. **Create a reusable `ProImagePicker` component** inside the file that:
   - Reads `useContentStudioStore((s) => s.proImages)` to get all pro photography images
   - Filters to only those with a `imageUrl` set (generated images)
   - Displays a scrollable grid of thumbnail previews with labels
   - Highlights the currently selected image with a checkmark overlay
   - Calls a provided `onSelect(imageUrl)` callback when clicked
   - Shows "No pro images yet. Generate them in Content Studio > Pro Photography." when empty

2. **Update `HeroForm`** (line 136-173):
   - Replace `useContentStudioStore((s) => s.images)` with the new `ProImagePicker` component
   - Pass `currentValue={config.backgroundImageUrl}` and `onSelect={(url) => update({ backgroundImageUrl: url })}`

3. **Update `AboutForm`** (line 202-209):
   - Add `ProImagePicker` below the Image URL input
   - Pass `currentValue={config.imageUrl}` and `onSelect={(url) => update({ imageUrl: url })}`

4. **Update `SolutionForm`** (line 326-351):
   - Add `ProImagePicker` below the Image URL input
   - Pass `currentValue={config.imageUrl}` and `onSelect={(url) => update({ imageUrl: url })}`

5. **Update `ProductCatalogForm`** (line 176-199):
   - Add a new "Featured Image" field with a text input and `ProImagePicker`
   - This maps to `config.featuredImage` (a new optional field)
   - Update `ProductCatalogBlockConfig` in `types.ts` to include `featuredImage?: string`

### ProImagePicker Component Design

The component will render:
- A label: "Pick from Pro Photography" with a camera icon
- A 2-column grid of image thumbnails (aspect-video ratio)
- Each thumbnail shows the image, a bottom label bar, and a check overlay when selected
- A text note when no images are available

### Type Update

**File: `src/features/seller/components/website-builder/types.ts`**

- Add `featuredImage?: string` to `ProductCatalogBlockConfig`

### Files Changed

| File | Change |
|---|---|
| `src/features/seller/components/website-builder/types.ts` | Add `featuredImage?: string` to `ProductCatalogBlockConfig` |
| `src/features/seller/components/website-builder/BlockConfigurator.tsx` | Create reusable `ProImagePicker`, add it to Hero, About, Solution, and Product Catalog forms |

