

# Plan: Marketing Creatives Customization + Website Builder Background Image Sizing

## Part 1: Marketing Creatives — Language, Currency, Country & Style Options

### What We're Building
A settings panel in the Marketing Creatives section of Pro Photography that lets users choose:
- **Language**: Arabic, English, French, Spanish (text on the generated image itself)
- **Currency**: USD, EUR, SAR, AED, MAD, DZD, TND, etc.
- **Country/Region**: Saudi Arabia, UAE, Morocco, Algeria, Tunisia, Egypt, etc.
- **Style**: COD Landing Page, Modern Minimal, Luxury Premium, Bold/Aggressive

These preferences get passed to the edge function and injected into the marketing prompts so the AI generates images with the correct language, currency symbols, and regional aesthetic.

### Changes

**1. ProImageGenerationTab.tsx**
- Add a "Marketing Settings" card above the Marketing Creatives section (or inside it as a collapsible header)
- Four select dropdowns: Language, Currency, Country, Style
- Store selections in local state, pass them in the `generateProImage` call body for marketing-* image types

**2. Edge Function (`generate-product-images/index.ts`)**
- Accept new optional fields: `marketingLanguage`, `marketingCurrency`, `marketingCountry`, `marketingStyle`
- For `marketing-*` image types, append language/currency/country/style instructions to the prompt:
  - Language: "All text in the image must be written in Arabic/French/etc."
  - Currency: "Use SAR/AED/MAD currency symbol for all prices shown"
  - Country: "Design for Saudi/UAE/Moroccan market with local cultural aesthetic cues"
  - Style: Swap base prompt tone (e.g., "luxury premium" vs "bold flash-sale")

---

## Part 2: Website Builder — Background Image Respects Chosen Image Dimensions

### The Problem
Currently, blocks with background images use `background-size:cover` and fixed padding (e.g., `80px 20px` for hero). The section height is determined by content, not by the image's aspect ratio. If a user picks a tall/wide image, the block doesn't adapt.

### Solution
When a `backgroundImageUrl` is set, detect the image's natural dimensions and store them in the block config (`bgImageWidth`, `bgImageHeight`). Then use `aspect-ratio` in the rendered section so the block adapts to the image proportions while still showing content overlaid.

### Changes

**1. BlockConfigurator.tsx — `BackgroundImageFields` component**
- When a background image URL is set (via input or ProImagePicker), load the image in a hidden `<img>` element to get `naturalWidth` and `naturalHeight`
- Store these as `bgImageWidth` and `bgImageHeight` in the block config
- Add a toggle: "Fit to image dimensions" (default on when image is set)
- Add a `minHeight` slider (fallback/override) so user can still manually control height

**2. Block type interfaces (`types.ts`)**
- Add optional fields to all block configs that have `backgroundImageUrl`:
  - `bgImageWidth?: number`
  - `bgImageHeight?: number`  
  - `fitToImage?: boolean`

**3. `generateStorefrontHtml.ts` — `bgStyle` and `heroBg` functions**
- When `fitToImage` is true and dimensions are available, add `aspect-ratio: {w}/{h}` and `min-height: auto` to the section style instead of fixed padding
- Keep `background-size: cover; background-position: center;`
- Ensure overlay still works correctly with aspect-ratio-based sizing

