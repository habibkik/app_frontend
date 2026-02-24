

## Add Background Image + Pro Photography Picker to All Remaining Blocks

### Current State
Six blocks already have image fields with `ProImagePicker`: Hero, Product Catalog, About, Solution, Problem Agitation, and Offer Pricing.

Six blocks have **no** image support: **Testimonials, FAQ, Contact, Order Form, Social Proof, Market Stats**.

### Changes

**File: `src/features/seller/components/website-builder/types.ts`**

Add `backgroundImageUrl?: string` to these interfaces:
- `TestimonialsBlockConfig` (line 38)
- `FaqBlockConfig` (line 42)
- `ContactBlockConfig` (line 46)
- `OrderFormBlockConfig` (line 52)
- `SocialProofBlockConfig` (line 57)
- `MarketStatsBlockConfig` (line 61)

**File: `src/features/seller/components/website-builder/BlockConfigurator.tsx`**

Add a Background Image URL input + `ProImagePicker` to each of the six forms:

1. **TestimonialsForm** (after the "Add Testimonial" button, ~line 250): Add `Field` for Background Image URL + `ProImagePicker`
2. **FaqForm** (after the "Add FAQ" button, ~line 276): Same
3. **ContactForm** (after Show Address switch, ~line 293): Same
4. **OrderFormConfig** (after Product Name, ~line 301): Same
5. **HeadingOnly** (line 305-307): Convert to include Background Image URL + `ProImagePicker` below the heading input. Since this is shared by Social Proof and Market Stats, both get the picker automatically.

### Summary

| Block | Field Added |
|---|---|
| Testimonials | `backgroundImageUrl?: string` + picker |
| FAQ | `backgroundImageUrl?: string` + picker |
| Contact | `backgroundImageUrl?: string` + picker |
| Order Form | `backgroundImageUrl?: string` + picker |
| Social Proof | `backgroundImageUrl?: string` + picker |
| Market Stats | `backgroundImageUrl?: string` + picker |

All blocks will now let users set a background image via URL or pick from generated Pro Photography assets.

