

## Plan: Restyle Hero Section + Merge Stats Bar Inline

### Changes Summary

**1. Merge StatsBar into Hero** — Remove the standalone `<StatsBar />` component from the page. Move the 4 stats (Trade Volume, Suppliers, Accuracy, Analysis Time) directly into the Hero section, placed at the bottom of the left column after the trust pills. Stats render inline with animated count-up, separated by subtle dividers.

**2. Replace Upload Card with Demo Triggers** — Remove the drag-and-drop upload card on the right side. Replace with a cleaner card that shows 3 demo mode buttons (one per role: Buyer, Producer, Seller). Each button triggers a simulated demo experience with mode-specific mock results appearing in the card. No file upload UI in the hero.

**3. Visual Polish** — Match the reference screenshot aesthetic more closely:
- Tighter spacing, bolder heading sizes
- Stats row: teal numbers, small gray labels, vertical `|` dividers
- Demo card: white bg, larger border-radius, subtle shadow, centered icon + title + subtitle + 3 demo buttons
- Mode tabs stay as-is but the right card changes contextually

### Files Changed

| File | Change |
|------|--------|
| `src/components/landing/Hero.tsx` | Remove upload/drag logic. Add demo-trigger card on right. Add inline stats row at bottom of left column with animated count-up. |
| `src/components/landing/StatsBar.tsx` | Keep file but export the `useCountUp` and `AnimatedStat` for reuse. Component itself no longer rendered. |
| `src/pages/Index.tsx` | Remove `<StatsBar />` from layout |
| `src/features/landing/pages/IndexPage.tsx` | Remove `<StatsBar />` from layout |

### Hero Layout (Desktop)

```text
┌──────────────────────────────────────────────────────────┐
│ [pill] AI-POWERED TRADE INTELLIGENCE                     │
│                                                          │
│  Left Column                    Right Column             │
│  ┌─────────────────────┐       ┌────────────────────┐    │
│  │ One Image.           │       │   [mode icon]      │    │
│  │ Infinite Insights.   │       │                    │    │
│  │                      │       │  Demo title text   │    │
│  │ Subtitle text...     │       │  Subtitle text     │    │
│  │                      │       │                    │    │
│  │ [Buyer][BOM][Seller] │       │ [▶ Buyer Demo]     │    │
│  │                      │       │ [▶ Producer Demo]  │    │
│  │ ✓ No signup ✓ Instant│       │ [▶ Seller Demo]    │    │
│  │                      │       │                    │    │
│  │ $2.5B+ | 50K+ |     │       └────────────────────┘    │
│  │ 99.2%  | <2s  |     │                                 │
│  └─────────────────────┘                                 │
└──────────────────────────────────────────────────────────┘
```

### Demo Card Behavior
- Shows 3 buttons: "Try Buyer Demo →", "Try Producer Demo →", "Try Seller Demo →"
- Clicking any navigates to `/dashboard` (or scrolls to the interactive demo section)
- Active mode tab highlights the corresponding demo button
- No file upload, no drag-and-drop — clean and professional

