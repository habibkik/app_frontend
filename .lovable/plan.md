

# Plan: Block Text Visibility, Button Positioning & Color Customization

## What We're Building

Two enhancements to the Website Builder block system:

1. **Text Visibility Controls** — Let users hide/show titles, subtitles, and other text elements per block. If text is empty or toggled off, it won't render in the HTML output.

2. **Button Customization** — Per-block controls for:
   - **Button position**: left, center, right
   - **Button color**: custom color picker (overrides theme color)
   - Option to hide/remove buttons entirely

## Changes

### 1. Update Types (`types.ts`)

Add shared optional fields to block configs that have text/buttons:

```typescript
// Add to relevant block config interfaces (Hero, Contact, OrderForm, OfferPricing, Countdown, Newsletter, etc.)
showTitle?: boolean;       // default true — toggle to hide section heading
showSubtitle?: boolean;    // default true — for blocks that have subtitles
showButton?: boolean;      // default true — toggle to hide CTA button
buttonPosition?: "left" | "center" | "right";  // default "center"
buttonColor?: string;      // custom hex color, overrides theme primaryColor
buttonTextColor?: string;  // custom text color for button
```

### 2. Update `BlockConfigurator.tsx`

Add a reusable **`ButtonCustomizer`** component rendered in block forms that have buttons (Hero, Contact, OrderForm, OfferPricing, Countdown, Newsletter, PricingTable, ShoppingCart, CheckoutForm, ProductDetail):

- **Show/Hide Title** toggle (Switch)
- **Show/Hide Subtitle** toggle (where applicable)
- **Show/Hide Button** toggle (Switch)
- **Button Position** select: Left / Center / Right
- **Button Color** picker (`<input type="color">`)
- **Button Text Color** picker (`<input type="color">`)

Also add a reusable **`TextVisibilityFields`** component for blocks that only have headings (Testimonials, FAQ, FeaturesGrid, ImageGallery, VideoEmbed, SocialProof, MarketStats).

### 3. Update `generateStorefrontHtml.ts`

- Modify `btnStyle()` to accept optional `customColor` and `customTextColor` overrides
- In each block renderer, conditionally render:
  - Headings: only if `showTitle !== false` and text is non-empty
  - Subtitles: only if `showSubtitle !== false` and text is non-empty  
  - Buttons/CTAs: only if `showButton !== false`
  - Button alignment: wrap button in a div with `text-align: ${buttonPosition || "center"}`
- Apply `buttonColor` to the button's background and `buttonTextColor` to its text color when set

### 4. Blocks Affected

**Blocks with buttons** (full controls — title, subtitle, button visibility, position, color):
- Hero, Contact, OrderForm, OfferPricing, Countdown, Newsletter, ProductDetail, ShoppingCart, CheckoutForm

**Blocks with headings only** (title visibility toggle):
- Testimonials, FAQ, FeaturesGrid, ImageGallery, VideoEmbed, SocialProof, MarketStats, About, ProblemAgitation, Solution, CustomerReviews

## Technical Notes

- All new fields are optional with sensible defaults (`true` for show, `"center"` for position) so existing configs are backward-compatible
- The `ButtonCustomizer` component will be grouped under a collapsible "Button & Text" section in the configurator to keep the UI clean
- Button color picker defaults to the theme's primary color as placeholder

