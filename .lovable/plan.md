

## Plan: Restyle Hero to Match Column.com Reference Image

The reference image shows Column.com's hero with a **light white/off-white background** instead of the current dark gradient, with a dense dot-matrix world map pattern, dark navy text, and a floating white card overlaid on the map.

### Changes

| File | Change |
|------|--------|
| `src/components/landing/Hero.tsx` | Switch from dark bg to light bg, restyle all text colors, dramatically increase world map dot density to match Column.com's dense dot-matrix style |
| `src/index.css` | Update `--gradient-hero` or add a light hero variant |

### Hero Restyling Details

**Background**: Change from `bg-gradient-hero` (dark navy gradient) to light off-white/warm gray (`#F7F7F6` or similar) — matching the Column.com screenshot.

**World Map Dots**: Replace the current sparse dots with a much denser dot-matrix grid pattern like Column.com uses — hundreds of small circles arranged in a grid where land masses appear as filled dots and ocean is empty. Use a muted teal/gray color at ~15-20% opacity (currently 7%). The dots should be smaller (r=1.2-1.5) but far more numerous, creating that distinctive pixelated map look.

**Text Colors**:
- H1: Change from `text-white` to `text-column-navy` (dark navy, like the reference)
- Teal highlight span stays `text-column-teal`
- Subtitle: Change from `text-white/60` to `text-column-body` (gray)
- Badge pill: Dark-themed outlined pill instead of light
- Mode tabs: Navy text instead of white
- Trust pills: Navy/gray borders and text instead of white

**Upload Card**: Already white — keep as-is, it will naturally stand out against the light bg.

**Overall feel**: Clean, bright, professional — the map serves as a subtle textured background behind the content, exactly like Column.com.

### Dot-Matrix Map Approach
Generate a grid-based dot pattern (every ~12px) covering the viewBox, with dots only placed where land masses exist. This creates the characteristic Column.com pixelated globe look. Use roughly 500-800 dots total across all continents for proper density.

