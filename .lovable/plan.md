

# Plan: Add "Marketing Creatives" Section to Pro Photography

## What We're Building

A new 5th section in Pro Photography called **"Marketing Creatives"** that generates 10 promotional landing-page-style images (similar to the Arabic COD product pages shown in the reference images). These images include styles like: hero banners, before/after comparisons, testimonial cards, feature highlights, trust badges, ingredient/specs showcases, urgency/CTA banners, social proof collages, guarantee seals, and order-now footers.

## Changes Required

### 1. Update Types (`types.ts`)
- Add `"marketing"` to `ProImageSection` type
- Add a new section entry in `PRO_IMAGE_SECTIONS` with 10 image IDs (e.g., `marketing-hero-banner`, `marketing-before-after`, `marketing-testimonials`, `marketing-features`, `marketing-trust-badges`, `marketing-ingredients`, `marketing-urgency-cta`, `marketing-social-proof`, `marketing-guarantee`, `marketing-order-footer`)
- Add corresponding labels in `PRO_IMAGE_LABELS`

### 2. Update Store (`contentStudioStore.ts`)
- Add 10 new `proImages` entries with `section: "marketing"` in the initial state

### 3. Update Edge Function (`generate-product-images/index.ts`)
- Add 10 new prompt entries in `IMAGE_PROMPTS` tailored for Arabic-style marketing creatives:
  - Hero banner with product showcase and key benefits
  - Before/after comparison layout
  - Customer testimonials with photos
  - Product features/specs grid
  - Trust badges (free shipping, money-back, secure payment)
  - Ingredients/components breakdown
  - Urgency/limited-time CTA banner
  - Social proof collage (community/reviews)
  - Guarantee/certification seal
  - Order-now footer with discount messaging

### 4. Update ProImageGenerationTab (`ProImageGenerationTab.tsx`)
- Add `marketing: true` to `openSections` default state
- Update "Generate All" button text from "20" to "30"
- The grid for this section will use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (same as other sections)

### 5. Update ContentStudio generate-all flow
- The `ContentStudio.tsx` full-kit generation already iterates `PRO_IMAGE_SECTIONS`, so it will automatically pick up the new section

## Technical Notes
- The prompts will be designed to produce vertical/portrait marketing creatives with Arabic-market styling cues (RTL layout hints, warm colors, trust elements)
- Same model fallback chain (Gemini 3 Pro → Gemini 2.5 Flash) and reference image logic applies
- ZIP export will automatically include the new section since it already iterates all `proImages`

