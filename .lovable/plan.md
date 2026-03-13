

# Plan: Add Color Chooser & Brand Kit Toggle to Marketing Creatives Settings

## What We're Building
Add a **custom color picker** and a **"Use Brand Kit Colors" toggle** inside the existing Marketing Creatives Settings panel. When the toggle is on, colors come from the user's saved Brand Kit. When off, the user can manually pick up to 4 custom marketing colors. These colors get passed to the edge function as `marketingColors` and injected into marketing prompts.

## Changes

### 1. `ProImageGenerationTab.tsx`
- Add state: `marketingColors: string[]` (default empty), `useBrandKitColors: boolean` (default `true`)
- Add a new row in the Marketing Settings card (below the existing 4-column grid):
  - A Switch: "Use Brand Kit Colors" — when on, grays out the manual picker
  - When off, show up to 4 color swatches with a color input picker (same pattern as BrandKitPanel)
- When building the request body for `marketing-*` images, include `marketingColors`:
  - If `useBrandKitColors` is true, send `brandKit.colors`
  - If false, send the manually chosen `marketingColors`

### 2. Edge Function (`generate-product-images/index.ts`)
- Add `marketingColors?: string[]` to `ImageRequest`
- In the marketing prompt injection block (around line 185), if `marketingColors` is present and non-empty, append: `"Use these specific colors for the design palette: ${colors.join(', ')}. These should be the primary and accent colors in all visual elements."`
- This takes priority over the general `brandColors` injection for marketing images

### 3. UI Details
- The color picker row uses the same compact swatch + `<input type="color">` + Plus/X pattern from BrandKitPanel
- Maximum 4 colors (primary, secondary, accent, background)
- Labels: "Primary", "Secondary", "Accent", "Background" shown as tiny text under each swatch

