

## Plan: Column.com-Inspired Visual Redesign (Design-Only, No Content Changes)

Restyle the entire landing page to a warm light gray (#EBEBEA) aesthetic with dark navy headings, teal accents, white cards, and minimal design — keeping dark backgrounds only on hero, bottom CTA, and footer. Zero text/content/functionality changes.

### Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Add `.column-landing` scoped CSS variables + utility classes |
| `src/features/landing/pages/IndexPage.tsx` | Wrap in `column-landing` class |
| `src/components/landing/Navigation.tsx` | Light gray bg, dark navy text, restyled buttons |
| `src/components/landing/Hero.tsx` | Left-aligned layout, world map SVG dots bg, split hero+upload card, teal highlight on title2, stats moved out, restyled pills/buttons |
| `src/components/landing/InteractiveDemo.tsx` | Light gray bg, outlined badge, white cards with subtle shadow/border, minimal icons |
| `src/components/landing/Features.tsx` | Light gray bg, outlined teal badge, white cards, minimal single-color icons (no gradient bg), teal title highlight |
| `src/components/landing/RoleCards.tsx` | Light gray bg, remove colored top bars, outlined buttons with arrows, simple icons, teal title highlight, dash bullet points |
| `src/components/landing/HowItWorks.tsx` | Light gray bg, outlined step number badges (square, navy), dashed connector lines, minimal icon cards, teal title highlight |
| `src/components/landing/Testimonials.tsx` | Light gray bg, large decorative `"` quote mark, gray avatar bg, outlined teal badge, teal title highlight |
| `src/components/landing/CTA.tsx` | Keep dark navy bg, teal headline highlight, teal primary button, outlined secondary, outlined badge pill |
| `src/components/landing/Footer.tsx` | Keep dark bg, add faded watermark text, 1px top separator, clean link styling |
| `src/components/ui/hero-button.tsx` | Add `columnPrimary` (teal filled), `columnOutline` (white border), `columnDark` (navy filled) variants |

### Section-by-Section Design

**Navigation**: Bg `#EBEBEA`, links `#0D1B3E`, "Commencer" → navy filled button with `›`, "Essayer la démo" → subtle outlined pill, "Se connecter" → plain text, remove bottom border, h-16.

**Hero**: Keep dark bg. Left-align text (grid: left = text+CTAs, right = white upload card with shadow). Add dotted world map SVG overlay (teal, ~5% opacity). Badge → outlined pill. H1 `title2` → teal `#10B981`. Upload button → teal filled. Demo button → white outline. Trust pills → outlined white. Remove stats from hero (move to separate stats bar section).

**Stats Bar** (extracted from Hero into its own `<section>`): Light gray bg, teal numbers 48px bold, gray labels, thin vertical dividers.

**Interactive Demo**: Light gray bg `#EBEBEA`. Badge → outlined teal pill. Cards → white bg, `shadow-sm`, 1px `rgba(0,0,0,0.06)` border, 12px radius. Replace blue icon bgs with simple outlined navy icons.

**Features**: Light gray bg. Badge → outlined teal. Cards → white, shadow-sm, 1px border, 12px radius. Icons → single-color outlined squares (no gradient bg). Titles → navy 16px bold.

**Role Cards**: Light gray bg. Remove `h-2` gradient bar. Icons → smaller outlined single-color. Bullets → `—` dash or teal dot. CTA buttons → outlined navy border, `→` arrow, white bg.

**How It Works**: Light gray bg. Step numbers → small navy outlined square. Icons → light gray outlined card. Connector → gray dashed line. Teal title highlight.

**Testimonials**: Light gray bg. Remove blue Quote circle → large decorative gray `"`. Avatar → light gray bg, navy initials. Cards → white, shadow-sm, border.

**CTA**: Keep dark navy. Badge → outlined pill light border. "Débloquez des insights." → teal. Primary btn → teal filled. Secondary → white outline.

**Footer**: Keep dark. Add large faded "tradeplatform" watermark text (opacity 3-5%). Top separator 1px `rgba(255,255,255,0.08)`.

### Global Animations
- All sections: `framer-motion` fade-up on scroll (keep existing, ensure `duration: 0.5`)
- Cards: hover `translateY(-2px)` + shadow increase, `transition: 200ms ease`
- Buttons: hover brightness increase, no color shift
- No bouncy/flashy effects

### Spacing
- All sections: `py-24` → `py-28` (112px) for generous spacing
- Mobile: single-column stacking preserved

