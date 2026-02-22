

## Dynamic AI Landing Page Generator

### Overview
Add an "AI Generate" button to the Website Builder that opens a product data input form. When submitted, it calls a new edge function that uses AI to generate high-conversion landing page content following persuasion frameworks (AIDA, PAS, Social Proof, Scarcity). The AI output is converted into the existing block-based system so every generated section is fully editable, reorderable, and customizable. Per-block AI controls (Regenerate, Improve Conversion, etc.) are also added.

### What the User Sees

1. **"AI Generate" button** in the Website Builder toolbar (with a sparkle icon)
2. Clicking it opens a **Product Data Form dialog** with fields for: Product Name, Category, Target Audience, Key Features, Specs, Competitive Advantages, Market Positioning (dropdown), Pricing Strategy, Pain Points, Desires, Testimonials, FAQ, Brand Tone (dropdown), and Images
3. If the user has existing products in the database, they can **auto-fill from an existing product**
4. If Market Intelligence data exists (from the analysis store), it is automatically injected into the generation request
5. After submitting, a loading state shows progress while the AI generates content
6. The AI output populates the builder with conversion-optimized blocks: Hero, Problem Agitation (About block), Solution (About block), Feature-Benefit Cards (About block), Market Positioning (Market Stats), Social Proof/Testimonials, Offer/Pricing (About block), FAQ, and Final CTA (Contact/Order Form)
7. Each block in the configurator panel gets **AI action buttons**: "Regenerate", "Improve Conversion", "Make More Premium", "Make More Aggressive", "Shorter Copy", "Add Scarcity", "Add Data-Driven Tone"
8. The theme is automatically adapted based on brand tone selection

### New Block Types

To support the conversion-focused sections, 3 new block types are added:

- **`problem-agitation`** -- Exposes customer frustrations with 3 pain bullets and emotional reinforcement
- **`solution`** -- Presents the product as the hero solution with differentiation and technical credibility  
- **`offer-pricing`** -- Value stacking, anchor pricing psychology, and optional scarcity messaging

These integrate into the existing block palette, configurator, and HTML generator.

### Technical Details

**New Edge Function: `supabase/functions/generate-landing-page/index.ts`**
- Receives structured product data JSON
- Uses Lovable AI (google/gemini-3-flash-preview) with tool calling to return structured output
- The tool schema returns: hero config, problem agitation content, solution content, feature-benefit cards, testimonials, FAQ items, offer/pricing content, final CTA text, SEO title + meta description, recommended theme adjustments
- Handles 429/402 errors properly
- Added to `supabase/config.toml` with `verify_jwt = false`

**New File: `src/features/seller/components/website-builder/AILandingGenerator.tsx`**
- Product data input form dialog component
- Auto-fill from existing products dropdown
- Auto-inject market intelligence data when available
- Loading/progress state during generation
- Calls the edge function via `supabase.functions.invoke`
- Converts AI response into SiteBlock[] array and theme
- Updates the websiteBuilderStore with generated blocks

**Modified File: `src/features/seller/components/website-builder/types.ts`**
- Add 3 new block types to `BlockType` union: `"problem-agitation" | "solution" | "offer-pricing"`
- Add corresponding config interfaces:
  - `ProblemAgitationBlockConfig` -- heading, intro text, pain points array (3 items with icon/title/description), emotional reinforcement text
  - `SolutionBlockConfig` -- heading, intro, differentiation points, technical credibility text, image URL
  - `OfferPricingBlockConfig` -- heading, value items array, anchor price, actual price, scarcity text (optional), CTA text

**Modified File: `src/features/seller/components/website-builder/blocks.ts`**
- Add metadata for the 3 new block types (icons: AlertTriangle, Lightbulb, DollarSign)
- Add default configs in `createDefaultBlock`

**Modified File: `src/features/seller/components/website-builder/generateStorefrontHtml.ts`**
- Add `renderProblemAgitation`, `renderSolution`, `renderOfferPricing` functions
- Each renders conversion-optimized HTML with the theme colors

**Modified File: `src/features/seller/components/website-builder/BlockConfigurator.tsx`**
- Add config forms for the 3 new block types
- Add AI action buttons section at the bottom of every block's configurator:
  - "Regenerate Section" -- calls edge function with just that block's context
  - "Improve Conversion" -- sends current copy + instruction to make it more conversion-focused
  - "Make More Premium" -- adjusts tone to luxury
  - "Make More Aggressive" -- adjusts tone to urgency
  - "Shorter Copy" -- condenses the text
  - "Add Scarcity" -- adds urgency/scarcity elements
  - "Add Data-Driven Tone" -- adds statistics and data points
- Each AI action calls a lightweight rewrite via the same edge function with a `rewriteBlock` mode

**Modified File: `src/features/seller/components/website-builder/WebsiteBuilder.tsx`**
- Add "AI Generate" button (Sparkles icon) in the toolbar
- State for showing the AI generator dialog
- Import and render `AILandingGenerator`

**Modified File: `src/features/seller/components/website-builder/BlockPalette.tsx`**
- No changes needed -- it dynamically reads from `BLOCK_META` which will include the new types

**Modified File: `supabase/config.toml`**
- Add `[functions.generate-landing-page]` with `verify_jwt = false`

### AI Generation Flow

```text
User fills product data form
        |
        v
Form data + Market Intelligence (if available) sent to edge function
        |
        v
Edge function builds system prompt with persuasion frameworks
        |
        v
AI returns structured blocks via tool calling
        |
        v
Frontend converts to SiteBlock[] + theme
        |
        v
Store updated -> preview refreshes instantly
        |
        v
User can edit any block, reorder, toggle, or use per-block AI actions
```

### Brand Tone to Theme Mapping

- **Luxury**: Dark bg, gold accent, serif fonts, large border radius
- **Bold**: High contrast, vibrant primary, geometric sans-serif
- **Minimal**: White bg, subtle gray accents, clean sans-serif, small radius
- **Aggressive**: Red/orange accent, dark secondary, bold typography
- **Innovative**: Blue/purple gradient feel, modern sans-serif, medium radius

### Market Intelligence Integration

When `sellerResults` exists in the analysis store, the generator automatically:
- Detects pricing gaps from `marketPriceRange`
- Highlights strategic advantages from `competitors`
- Adapts CTA messaging based on `demandIndicators.trend`
- Populates the Market Stats block with real data
- Adjusts the Offer/Pricing block with competitive positioning

### SEO Output

The AI also generates an SEO title and meta description which are stored in `siteConfig` and rendered in the HTML `<head>` tags.

