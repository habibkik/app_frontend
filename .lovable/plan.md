
# Pricing Optimizer Component

## Overview
Create a comprehensive `PricingOptimizerComponent` in `src/features/seller/components/` with 8 sections: product header with editable price, three strategy recommendation cards (Premium/Recommended/Aggressive), a collapsible What-If calculator, automated pricing rules with toggles, price change history timeline, AI recommendation explanation, and action buttons with confirmation dialog.

## Sections

### 1. Header
- Product selector dropdown using existing `Select` UI component
- Current price displayed large and editable inline (click-to-edit with `Input`)
- Product cost (COGS) display
- Current margin with color coding: green (>30%), yellow (20-30%), red (<20%)

### 2. Three Strategy Cards (Side-by-Side)
- **Premium**: Green highlight, higher price, lower volume, higher profit per unit
- **Recommended**: Blue highlight with "Recommended" badge, balanced margin/volume
- **Aggressive**: Orange highlight, lower price, more volume, market share play
- Each card shows: recommended price, expected margin, volume impact, revenue impact, description, reasoning, risk level
- "Select" button per card (filled for recommended, outline for others)

### 3. Scenario Simulator (Collapsible)
- Uses existing `Collapsible` component pattern (like ScenarioSimulator.tsx)
- Price slider within market range
- Live preview showing: price, margin %, estimated sales impact, daily revenue, daily profit

### 4. Pricing Rules (Automation)
- Card with 4 predefined rules
- Each rule has a `Switch` toggle to enable/disable
- Rules: competitor price drop response, inventory surplus discount, peak hours markup, low inventory markup
- "Add Rule" button (disabled/placeholder)

### 5. Price Change History
- Timeline with vertical line and dot markers
- Each entry: date, old price -> new price, reason badge (Manual, Rule Applied, AI Suggested)
- 5 mock entries

### 6. Recommendation Explanation
- Card with AI-generated reasoning in a styled box
- Bullet points: market analysis, cost basis, target customer, final recommendation

### 7. Actions (Bottom)
- "Apply Selected Strategy" large button
- Uses `AlertDialog` for confirmation: "Change price from $XX to $XX?"
- Success toast after confirmation

## Technical Details

### File to create
- `src/features/seller/components/PricingOptimizerComponent.tsx`

### Files to modify
- `src/features/seller/index.ts` -- add export
- `src/pages/dashboard/Pricing.tsx` -- integrate the component (add as a tab or replace existing content)

### Dependencies (all installed)
- `framer-motion` for animations
- `lucide-react` for icons (DollarSign, TrendingUp, TrendingDown, Shield, Zap, Clock, Package, Sparkles, etc.)
- Existing UI: Card, Badge, Button, Select, Slider, Switch, Collapsible, AlertDialog, Input
- `sonner` toast for success feedback

### Mock data
- 4 products with id, name, currentPrice, cost, competitorAvg
- 3 strategy cards with pre-calculated values derived from selected product
- 4 pricing rules with toggle state
- 5 price change history entries
- AI recommendation text

### Layout
- Responsive grid: strategy cards 3-column on desktop, stacked on mobile
- Simulator and rules side-by-side on large screens
- History and explanation side-by-side on large screens
- Full-width action bar at bottom
