

## Plan: Logo Marquee + Tabbed Case Study Slider

### 1. New Component: `LogoMarquee.tsx`
Create `src/components/landing/LogoMarquee.tsx` — infinite horizontal scrolling logo strip.

- 7 company names as text (not images): TechCorp Industries, Rodriguez Manufacturing, Global Retail Co, Brex, Mercury, Ramp, Best Egg
- Two duplicate rows in a flex container with `animation: marquee 30s linear infinite`
- CSS mask gradient for edge fading
- Hover pauses animation
- `prefers-reduced-motion` disables animation
- Background: `bg-column`, no borders

### 2. Replace `RoleCards.tsx` with Tabbed Slider
Rewrite `src/components/landing/RoleCards.tsx` to a tabbed case study card.

**Structure:**
- Keep same section badge, title, subtitle from i18n (`roleCards.*`)
- Large white card (16px radius, deep shadow)
- Top tab bar: 3 tabs using React state, active = navy pill, inactive = gray text
- Tab switching triggers crossfade (opacity + translateY via framer-motion `AnimatePresence`)

**Left column per tab:**
- Small gray uppercase label (`roleCards.{key}.subtitle`)
- Bold title (`roleCards.{key}.title`)
- Feature list with emoji icons (mapped per role)
- Large decorative `"` quote + description text
- Outlined navy CTA button with arrow (`roleCards.{key}.button`)

**Right column per tab:**
- 6 transaction-style rows per role (hardcoded French text as specified)
- Rows duplicated for seamless infinite upward scroll via CSS `scrollUp` keyframe (8s)
- Container: ~320px height, overflow hidden, vertical fade mask
- Row styling: white bg, 8px radius, border, icon + label + value layout
- Tab switch resets scroll animation via React key prop
- `prefers-reduced-motion` support

### 3. Update CSS (`src/index.css`)
Add keyframes:
```css
@keyframes marquee { 0% { translateX(0) } 100% { translateX(-50%) } }
@keyframes scrollUp { 0% { translateY(0) } 100% { translateY(-50%) } }
```

### 4. Update Page Layouts
Insert `<LogoMarquee />` between `<StatsBar />` and `<InteractiveDemo />` in both `src/pages/Index.tsx` and `src/features/landing/pages/IndexPage.tsx`.

### Files Changed
| File | Change |
|------|--------|
| `src/components/landing/LogoMarquee.tsx` | New — infinite logo marquee |
| `src/components/landing/RoleCards.tsx` | Rewrite — tabbed case study slider |
| `src/index.css` | Add marquee + scrollUp keyframes |
| `src/pages/Index.tsx` | Add LogoMarquee import |
| `src/features/landing/pages/IndexPage.tsx` | Add LogoMarquee import |

