

## Premium High-Conversion Product Landing Template

### Overview
Add a new "Nike-inspired" premium conversion template to the existing template picker. This template uses **only existing block types** and theme controls, arranged in a conversion-optimized order with a coral/orange accent, white background, and bold geometric typography.

### Block-to-Request Mapping

The 8 requested sections map to existing blocks as follows:

| Requested Section | Existing Block Used | How It Maps |
|---|---|---|
| 1. Hero Banner (split layout + CTA) | `hero` | `heroStyle: "split"`, title/subtitle/CTA |
| 2. Trust / Social Proof Strip | `social-proof` | Heading "Trusted By Industry Leaders" |
| 3. Feature Product Section (2-col + features) | `solution` | `differentiationPoints` for feature grid, `imageUrl` for product image |
| 4. Product Variants Grid | `product-catalog` | 3-column grid with price + description |
| 5. Benefits Icon Row | `problem-agitation` | Repurposed: 4 benefit icons with positive framing |
| 6. Testimonials (card grid) | `testimonials` | 3 testimonial cards |
| 7. Newsletter CTA | `contact` | Centered contact form |
| 8. Footer | Built-in | Automatically rendered by `generateStorefrontHtml` |

Additionally, an `offer-pricing` block is inserted between testimonials and contact for CTA repetition (conversion optimization).

### Theme Configuration

```text
Primary:       #FF6B5C (coral/orange)
Background:    #FFFFFF (white)
Text:          #111111 (dark charcoal)
Secondary:     #111111 (dark)
Accent:        #FF6B5C (coral)
Heading Font:  'Space Grotesk', system-ui, sans-serif
Body Font:     'Inter', system-ui, sans-serif
Layout:        bold
Border Radius: large (16px)
Hero Style:    split
```

### What Changes

**File: `src/features/seller/components/website-builder/templates.ts`**

Add a new template entry `"premium-conversion"` to the `WEBSITE_TEMPLATES` array with:
- A `PREMIUM_BLOCKS` array containing 8 blocks in the strict order above
- A `PREMIUM_THEME` object with the coral/orange Nike-inspired design system
- A `siteConfig` with name "Premium Store" and tagline matching the hero subtitle
- Block configs pre-populated with conversion-optimized placeholder copy:
  - Hero: bold headline, benefit-driven subtitle, "Add to Cart" CTA
  - Social Proof: heading "Trusted By Industry Leaders"
  - Solution block: 3 feature differentiation points (Comfort / Stability / Hands-free), product image slot, credibility text
  - Product Catalog: 3 columns, price + description visible
  - Problem-Agitation: repurposed as 4 benefit icons with positive framing (Free Shipping, 30-Day Returns, Premium Quality, 24/7 Support)
  - Testimonials: 3 minimal quote cards
  - Offer Pricing: value stack with anchor/actual price, scarcity text, strong CTA
  - Contact: "Stay in the Loop" newsletter-style heading

**File: `src/features/seller/components/website-builder/AILandingGenerator.tsx`**

Add a new demo preset `DEMO_PREMIUM` to the data source dropdown so users can load the premium conversion template data directly into the AI generator. This adds a "Load Demo (Premium)" option alongside the existing E-Bike demo.

### No Other Files Change

The template uses only existing block types, theme properties, and the existing `generateStorefrontHtml` renderer. The template picker, block configurator, and block palette all work automatically with the new template.

