

## Plan: Show Demo Data in Hero Right Card per Mode

### What changes
**Single file**: `src/components/landing/Hero.tsx`

Replace the current right-side card content (icon + title + description + feature chips + 3 demo buttons) with a **two-part layout**:

**Top half** — Mode-specific demo data preview (changes per selected mode via AnimatePresence crossfade):
- **Buyer mode**: Show 4 mock supplier match rows (company name, country flag, match %, price) in a mini table/list
- **Producer mode**: Show a mini BOM summary (4 components with name, qty, unit cost, total)  
- **Seller mode**: Show 4 market insight rows (metric name + value + trend arrow)

Each row: subtle border, small padding, icon/flag left, label center, value right — compact and clean.

**Bottom half** — Single CTA button: "Try {mode} Demo →" that navigates to `/dashboard`. Keep the "One Image. Infinite Insights." footer with stats below.

### Demo Data (hardcoded)

**Buyer:**
| Supplier | Country | Match | Price |
|----------|---------|-------|-------|
| SteelMax GmbH | 🇩🇪 | 97.2% | $12.40/kg |
| ZhongTai Parts | 🇨🇳 | 94.8% | $8.20/kg |
| Atlas Industrial | 🇺🇸 | 91.5% | $15.60/kg |
| Konya Metals | 🇹🇷 | 89.1% | $9.80/kg |

**Producer:**
| Component | Qty | Unit Cost | Total |
|-----------|-----|-----------|-------|
| Steel Frame | 2 | $24.50 | $49.00 |
| PCB Board | 1 | $18.30 | $18.30 |
| LED Module | 4 | $3.20 | $12.80 |
| Housing | 1 | $31.00 | $31.00 |

**Seller:**
| Metric | Value | Trend |
|--------|-------|-------|
| Market Price | $45.20 | ↑ +8.2% |
| Competitors | 23 found | — |
| Demand Score | 87/100 | ↑ High |
| Best Channel | Amazon EU | ★ |

### Layout Structure
```text
┌─────────────────────────────┐
│  [Mode Icon]                │
│  Mode Title                 │
│  Subtitle                   │
│                             │
│  ┌─ Demo Data Rows ──────┐ │
│  │ Row 1                  │ │
│  │ Row 2                  │ │
│  │ Row 3                  │ │
│  │ Row 4                  │ │
│  └────────────────────────┘ │
│                             │
│  [  Try Buyer Demo →      ] │
│                             │
│  ─────────────────────────  │
│  One Image. Infinite Insights│
│                             │
│  $2.5B+ | 50K+ | 99.2% |<2s│
└─────────────────────────────┘
```

### Files Changed
| File | Change |
|------|--------|
| `src/components/landing/Hero.tsx` | Replace feature chips + 3 demo buttons with mode-specific demo data rows + single CTA |

