
# Heat Map Page Implementation Plan

## Overview
Add a dedicated Market Heat Map page accessible from the sidebar navigation across all dashboard modes (Buyer, Producer, Seller). This page will display geographic market opportunity visualization showing regional demand, competition density, pricing averages, and growth trends.

## What You'll Get

### A New "Heat Map" Page
- **Dedicated route**: `/dashboard/heatmap`
- **Visible in sidebar**: For Buyer, Producer, and Seller modes
- **Full-page experience**: Regional market data in an interactive grid layout
- **Mode-aware content**: Different context/descriptions based on active mode

### Features on the Heat Map Page
- Regional market demand visualization (High/Medium/Low indicators)
- Competitor count per region
- Average pricing by region
- Growth trends with opportunity ratings (Excellent/Good/Moderate/Saturated)
- Filter and sort capabilities
- Summary statistics cards
- Integration with existing analysis store data

---

## Technical Implementation

### 1. Create Heat Map Page Component
**File**: `src/pages/dashboard/HeatMap.tsx`

A new dashboard page that:
- Uses `DashboardLayout` wrapper (consistent with other pages)
- Displays mode-specific header text based on current mode
- Shows summary stat cards for quick insights
- Renders regional heat map grid using the existing `MarketHeatMap` component
- Includes empty state when no data is available
- Pulls data from the analysis store (`sellerResults.marketHeatMap`)

### 2. Update Navigation Configuration
**File**: `src/features/dashboard/config/navigation.ts`

Add "Heat Map" navigation item to the "Insights" group for all three modes:
- Buyer mode: Add to "Insights" group
- Producer mode: Add to "Insights" group  
- Seller mode: Add to "Insights" group (near Analytics)

Icon: `Map` from lucide-react

### 3. Register Route in Router
**File**: `src/app/Router.tsx`

Add protected route:
```
/dashboard/heatmap -> HeatMap component
```

### 4. Update Quick Actions (Optional Enhancement)
**File**: `src/features/dashboard/pages/components/QuickActions.tsx`

Add heat map shortcut for Seller mode quick actions.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/dashboard/HeatMap.tsx` | Create | New Heat Map page component |
| `src/features/dashboard/config/navigation.ts` | Edit | Add Heat Map nav item to all mode navigations |
| `src/app/Router.tsx` | Edit | Add `/dashboard/heatmap` route |

---

## Page Layout Preview

```text
+------------------------------------------------------------------+
|  [Map Icon] Heat Map                                              |
|  View regional market opportunities and demand                    |
+------------------------------------------------------------------+
|                                                                   |
|  +------------+  +------------+  +------------+  +------------+   |
|  | Regions    |  | Avg Demand |  | Top Region |  | Growth Avg |   |
|  | 8          |  | High       |  | North Amer.|  | +12.5%     |   |
|  +------------+  +------------+  +------------+  +------------+   |
|                                                                   |
|  +--------------------+  +--------------------+  +-------------+  |
|  | North America      |  | Europe            |  | Asia Pacific|  |
|  | Demand: High       |  | Demand: Medium    |  | Demand: High|  |
|  | Competitors: 45    |  | Competitors: 32   |  | Competitors:|  |
|  | Avg Price: $245    |  | Avg Price: $198   |  | Avg Price:  |  |
|  | Growth: +15%       |  | Growth: +8%       |  | Growth: +22%|  |
|  | [Excellent]        |  | [Good]            |  | [Excellent] |  |
|  +--------------------+  +--------------------+  +-------------+  |
|                                                                   |
|           ...more region cards in responsive grid...              |
+------------------------------------------------------------------+
```

---

## Mode-Specific Behavior

| Mode | Page Title | Description |
|------|------------|-------------|
| Buyer | Regional Supplier Heat Map | View supplier density and pricing by region |
| Producer | Manufacturing Heat Map | View production capacity and competition by region |
| Seller | Market Heat Map | View demand and opportunities by region |

---

## Data Flow

1. User navigates to `/dashboard/heatmap` from sidebar
2. Page reads current mode from `useDashboardMode()`
3. Page checks analysis store for existing `marketHeatMap` data
4. If data exists: Displays regional cards
5. If no data: Shows empty state with prompt to run analysis first

---

## Dependencies
- Uses existing `MarketHeatMap` component from `src/components/seller/MarketHeatMap.tsx`
- Uses existing `useAnalysisStore` for data
- Uses existing `DashboardLayout` wrapper
- No new packages required
