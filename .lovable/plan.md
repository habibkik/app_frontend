

## Fix: Background Images Not Rendering in Website Preview

### Root Cause
Two issues are preventing background images from appearing:

1. **`generateStorefrontHtml.ts` ignores `backgroundImageUrl`**: Every render function (Testimonials, FAQ, Contact, Order Form, Social Proof, Market Stats, Problem Agitation, Offer Pricing) uses hardcoded background colors and never checks the `backgroundImageUrl` field from block config. So even though the picker correctly saves the URL to the store, the generated HTML never uses it.

2. **"Use Pro Images" button bug**: In `WebsiteBuilder.tsx` line 269, the Hero block sets `backgroundImage` instead of `backgroundImageUrl`, which is the field the Hero renderer actually reads.

### Changes

**File: `src/features/seller/components/website-builder/generateStorefrontHtml.ts`**

Create a helper function to generate background style from `backgroundImageUrl`:

```typescript
function bgStyle(fallback: string, imageUrl?: string): string {
  if (imageUrl) return `background-image:url('${imageUrl}');background-size:cover;background-position:center;`;
  return `background:${fallback};`;
}
```

Update each render function to use `cfg.backgroundImageUrl` when present:

| Function | Current background | Change |
|---|---|---|
| `renderTestimonials` (line 99) | `background:#f9fafb;` | Use `bgStyle("#f9fafb", cfg.backgroundImageUrl)` |
| `renderFaq` (line 113) | `background:${theme.bgColor};` | Use `bgStyle(theme.bgColor, cfg.backgroundImageUrl)` |
| `renderContact` (line 122) | `background:#f9fafb;` | Use `bgStyle("#f9fafb", cfg.backgroundImageUrl)` |
| `renderOrderForm` (line 137) | `background:${theme.bgColor};` | Use `bgStyle(theme.bgColor, cfg.backgroundImageUrl)` |
| `renderSocialProof` (line 155) | `background:#f9fafb;` | Use `bgStyle("#f9fafb", cfg.backgroundImageUrl)` |
| `renderMarketStats` (line 167) | `background:${theme.bgColor};` | Use `bgStyle(theme.bgColor, cfg.backgroundImageUrl)` |
| `renderProblemAgitation` (line 186) | `background:#fef2f2;` | Use `bgStyle("#fef2f2", cfg.backgroundImageUrl)` |
| `renderOfferPricing` (line 213) | `background:linear-gradient(...)` | Use `bgStyle(\`linear-gradient(135deg,${theme.primaryColor}11,${theme.accentColor}22)\`, cfg.backgroundImageUrl)` |

**File: `src/features/seller/components/website-builder/WebsiteBuilder.tsx`**

- Line 269: Change `backgroundImage` to `backgroundImageUrl` so the Hero block's "Use Pro Images" button sets the correct field.

### Summary

Two files, one helper function, and fixing one typo. After this, selecting a Pro Photography image in any block's configurator will immediately render it as the section background in the live preview.

