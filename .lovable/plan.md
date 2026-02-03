
# Competitor Monitor Component Implementation

## Overview
Create a new `CompetitorMonitorComponent` in `src/features/seller/components/` that provides comprehensive competitor monitoring with real-time updates, sortable tables, advanced filtering, and actionable insights. This component will be integrated into the existing Competitors page as a dedicated monitoring dashboard.

## Current State Analysis

The existing Competitors page (1697 lines) has:
- Basic stats cards
- 12-month price history chart
- Competitor list with search
- Price alerts (basic)
- Competitor detail modal

**Missing Features:**
1. Product multi-selector with date range picker
2. Auto-refresh functionality with toggle
3. Key metrics cards with live values
4. Enhanced price trend chart with area fills and annotations
5. Sortable/filterable competitor table with pagination
6. Price movement alerts with dismiss functionality
7. Market insights sidebar with recommendations
8. Real-time update notifications

---

## Implementation Plan

### 1. Create Competitor Monitor Types

**New File**: `src/features/seller/types/competitorMonitor.ts`

Define types for:
- `MonitoredProduct` - products being tracked
- `CompetitorTableRow` - table data structure with all columns
- `PriceMovementAlert` - alert types (drop, increase, new entry, out of stock)
- `MarketInsight` - pricing recommendations and conditions
- `AutoRefreshSettings` - refresh interval configuration

```typescript
export interface MonitoredProduct {
  id: string;
  name: string;
  category: string;
  yourPrice: number;
  marketAverage: number;
}

export interface CompetitorTableRow {
  rank: number;
  id: string;
  name: string;
  logo: string;
  platform: "Facebook" | "Amazon" | "OLX" | "Ouedkniss" | "Website" | "Other";
  currentPrice: number;
  priceChange7d: number;
  lastUpdated: Date;
  stockStatus: "in_stock" | "limited" | "out_of_stock";
  reviewCount: number;
  avgRating: number;
  isAboveYourPrice: boolean;
  priceHistory: { date: string; price: number }[];
}

export interface PriceMovementAlert {
  id: string;
  type: "drop" | "increase" | "new_entry" | "out_of_stock";
  competitorName: string;
  productName: string;
  oldPrice?: number;
  newPrice: number;
  timestamp: Date;
  dismissed: boolean;
}

export interface MarketInsight {
  optimalPrice: number;
  currentMargin: number;
  recommendedMargin: number;
  priceAdjustment: number;
  trend: { direction: "up" | "down" | "stable"; percentage: number; period: string };
  demandLevel: "low" | "medium" | "high";
  newCompetitorsThisWeek: number;
  supplyStatus: "low" | "stable" | "high";
}
```

### 2. Create Competitor Monitor Store

**New File**: `src/stores/competitorMonitorStore.ts`

Zustand store managing:
- Selected products for monitoring
- Date range selection
- Auto-refresh settings (on/off, interval)
- Last updated timestamp
- Alerts list with dismiss state
- Competitors data

```typescript
interface CompetitorMonitorStore {
  // Selection state
  selectedProducts: string[];
  dateRange: { from: Date; to: Date };
  
  // Refresh settings
  autoRefresh: boolean;
  refreshInterval: 1 | 2 | 4; // hours
  lastUpdated: Date;
  isRefreshing: boolean;
  
  // Data
  competitors: CompetitorTableRow[];
  alerts: PriceMovementAlert[];
  marketInsight: MarketInsight | null;
  
  // Actions
  setSelectedProducts: (products: string[]) => void;
  setDateRange: (range: { from: Date; to: Date }) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (hours: 1 | 2 | 4) => void;
  refreshData: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
}
```

### 3. Create Component Architecture

#### Main Component
**New File**: `src/features/seller/components/CompetitorMonitor.tsx`

Main orchestrating component with layout:
- Header with controls
- Key metrics cards row
- Price trend chart (large)
- Two-column layout: Table (left), Insights sidebar (right)
- Alerts section (bottom)

#### Sub-Components

**`CompetitorMonitorHeader.tsx`**
- Product multi-select dropdown
- Date range picker (using existing DateRangePicker)
- Refresh button with "Last updated: X hours ago"
- Auto-refresh toggle with interval selector

**`CompetitorMetricsCards.tsx`**
Four cards:
1. Market Average Price ($45.99)
2. Your Current Price ($42.99)
3. Price Position ("10% Below Market" green badge)
4. Competitors Found ("12 active sellers")

**`CompetitorPriceTrendChart.tsx`**
Enhanced Recharts AreaChart:
- X-axis: dates (30 days)
- Y-axis: price ($)
- Thick blue line: Your price
- Gray dashed line: Market average
- Light gray area fill: Min-Max price range
- Reference lines for annotations
- Custom tooltip showing all values

**`CompetitorTable.tsx`**
Full-featured table with:
- Sortable columns (click header)
- Platform filter checkboxes
- Pagination (20 per page)
- Expandable rows (click to show price history chart)
- Color coding: Green if competitor price > yours, Red if < yours
- Columns: Rank, Name, Platform, Current Price, 7d Change, Last Updated, Stock, Reviews

**`PriceMovementAlerts.tsx`**
Scrollable list with:
- Color-coded icons (red/yellow/blue/green)
- Alert description with old/new prices
- Timestamp ("2 hours ago")
- "View competitor" button
- Dismiss (X) button

**`MarketInsightsPanel.tsx`**
Right sidebar showing:
- Pricing recommendation box
- Market conditions indicators
- Trend visualization

---

## Component Layout Diagram

```text
+------------------------------------------------------------------+
| HEADER                                                            |
| [Product ▼] [Date Range ▼] | [Refresh] Last updated: 2h | Auto ⚙ |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| KEY METRICS CARDS                                                 |
| +---------------+ +---------------+ +---------------+ +---------+ |
| | Mkt Avg       | | Your Price    | | Position      | | Found   | |
| | $45.99        | | $42.99        | | -10% ▼        | | 12      | |
| +---------------+ +---------------+ +---------------+ +---------+ |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| PRICE TREND CHART (Large)                                         |
| ┌────────────────────────────────────────────────────────────────┐|
| │  $50 ─┬─────────────────────────────────────────────────────── │|
| │       │   ▲ You dropped price here                            │|
| │  $45 ─┤  ═══════╗                        ───── Your Price     │|
| │       │        ╚════════════════════    - - - Market Avg      │|
| │  $40 ─┤                 ░░░░░░░░░░░░░░░  ░░░░░ Min-Max Range   │|
| │       ├──────┬──────┬──────┬──────┬──────┬──────              │|
| │       Jan 5  Jan 12 Jan 19 Jan 26 Feb 2                       │|
| └────────────────────────────────────────────────────────────────┘|
+------------------------------------------------------------------+

+----------------------------------------------+ +------------------+
| COMPETITOR TABLE                              | | MARKET INSIGHTS  |
| +----+--------+------+-------+------+------+ | | +──────────────+ |
| |Rank| Name   | Plat | Price | Chng | Stock| | | │Optimal: $45 │ |
| +----+--------+------+-------+------+------+ | | │Margin: 35%  │ |
| | 1  | TechCo | 🛒   | $39.99| -8%  | ✓    | | | │Raise by $3  │ |
| | 2  | Parts+ | FB   | $41.50| +2%  | ⚠    | | | +──────────────+ |
| | 3  | Global | Web  | $44.00| 0%   | ✓    | | |                |
| +----+--------+------+-------+------+------+ | | | Trending ↓2%/wk|
| [◀ 1 2 3 ... 5 ▶]  Filter: [Platform ▼]     | | | Demand: High  |
+----------------------------------------------+ | | Supply: Stable|
                                                 +------------------+

+------------------------------------------------------------------+
| PRICE MOVEMENT ALERTS                                             |
| +────────────────────────────────────────────────────────────────+|
| | 🔴 Competitor A dropped to $39.99 (was $45.00) - Margin risk! ||
| |    2 hours ago                      [View] [×]                 ||
| +────────────────────────────────────────────────────────────────+|
| | 🟡 Market average rose 8% - Opportunity to raise price         ||
| |    4 hours ago                      [View] [×]                 ||
| +────────────────────────────────────────────────────────────────+|
+------------------------------------------------------------------+
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/seller/types/competitorMonitor.ts` | Create | Type definitions |
| `src/stores/competitorMonitorStore.ts` | Create | Zustand state management |
| `src/features/seller/components/CompetitorMonitor.tsx` | Create | Main orchestrating component |
| `src/features/seller/components/CompetitorMonitorHeader.tsx` | Create | Header with controls |
| `src/features/seller/components/CompetitorMetricsCards.tsx` | Create | 4 key metric cards |
| `src/features/seller/components/CompetitorPriceTrendChart.tsx` | Create | Enhanced area chart |
| `src/features/seller/components/CompetitorTable.tsx` | Create | Sortable/filterable table |
| `src/features/seller/components/PriceMovementAlerts.tsx` | Create | Alert list with actions |
| `src/features/seller/components/MarketInsightsPanel.tsx` | Create | Insights sidebar |
| `src/features/seller/index.ts` | Edit | Export new components |
| `src/stores/index.ts` | Edit | Export new store |
| `src/pages/dashboard/Competitors.tsx` | Edit | Add Monitor tab |

---

## Key Technical Details

### Auto-Refresh Implementation
```typescript
// In CompetitorMonitor.tsx
useEffect(() => {
  if (!autoRefresh) return;
  
  const intervalMs = refreshInterval * 60 * 60 * 1000; // hours to ms
  const timer = setInterval(() => {
    refreshData();
    toast({ title: "Data refreshed", description: "Competitor prices updated" });
  }, intervalMs);
  
  return () => clearInterval(timer);
}, [autoRefresh, refreshInterval]);
```

### Table Sorting
```typescript
const [sortConfig, setSortConfig] = useState<{
  key: keyof CompetitorTableRow;
  direction: "asc" | "desc";
}>({ key: "rank", direction: "asc" });

const sortedData = useMemo(() => {
  return [...competitors].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const modifier = sortConfig.direction === "asc" ? 1 : -1;
    return aVal > bVal ? modifier : -modifier;
  });
}, [competitors, sortConfig]);
```

### Chart with Annotations (Recharts)
```typescript
<AreaChart data={priceData}>
  <defs>
    <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="range" fill="url(#rangeGradient)" />
  <Line type="monotone" dataKey="yourPrice" stroke="#2563eb" strokeWidth={3} />
  <Line type="monotone" dataKey="marketAvg" stroke="#6b7280" strokeDasharray="5 5" />
  <ReferenceLine x="Jan 28" stroke="#ef4444" label="Price drop" />
</AreaChart>
```

### Platform Filter
```typescript
const platforms = ["Facebook", "Amazon", "OLX", "Ouedkniss", "Website"];
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms);

const filteredCompetitors = competitors.filter(c => 
  selectedPlatforms.includes(c.platform)
);
```

---

## Mock Data Structure

```typescript
const mockCompetitorRows: CompetitorTableRow[] = [
  {
    rank: 1,
    id: "1",
    name: "TechSupply Co",
    logo: "TS",
    platform: "Amazon",
    currentPrice: 39.99,
    priceChange7d: -8.2,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    stockStatus: "in_stock",
    reviewCount: 234,
    avgRating: 4.5,
    isAboveYourPrice: false, // competitor price < your price
    priceHistory: [/* 30 days of data */]
  },
  // ... more rows
];

const mockAlerts: PriceMovementAlert[] = [
  {
    id: "alert_1",
    type: "drop",
    competitorName: "TechSupply Co",
    productName: "Servo Motor XR-500",
    oldPrice: 45.00,
    newPrice: 39.99,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dismissed: false,
  },
  {
    id: "alert_2",
    type: "increase",
    competitorName: "Market Average",
    productName: "General",
    newPrice: 0, // Not applicable
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    dismissed: false,
  },
  // ...
];
```

---

## Integration with Existing Page

The new CompetitorMonitor component will be added as a third tab in the existing Competitors page:

```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full max-w-lg grid-cols-3">
    <TabsTrigger value="competitors">Competitors</TabsTrigger>
    <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
    <TabsTrigger value="product-analysis">Product Analysis</TabsTrigger>
  </TabsList>
  
  <TabsContent value="monitor">
    <CompetitorMonitor />
  </TabsContent>
</Tabs>
```

---

## Styling Guidelines

- **Color Coding**:
  - Green (#10b981): Competitor price above yours (favorable)
  - Red (#ef4444): Competitor price below yours (at risk)
  - Yellow (#f59e0b): Warnings, neutral alerts
  - Blue (#3b82f6): New entries, informational

- **Chart Colors**:
  - Your price: Blue (#2563eb), thick solid line
  - Market average: Gray (#6b7280), dashed line
  - Price range fill: Light purple/gray gradient

- **Table Row States**:
  - Hover: Light background change
  - Expanded: Shows mini price history chart
  - Selected: Primary border highlight

- **Responsive Design**:
  - Mobile: Stack cards, hide some table columns, full-width chart
  - Tablet: 2-column layout for insights
  - Desktop: Full 3-column layout

---

## Future Enhancements (Post-Implementation)

1. **Supabase Realtime**: Subscribe to competitor price changes in database
2. **Push Notifications**: Browser notifications for critical alerts
3. **Export Functionality**: CSV/PDF report generation
4. **Custom Alert Rules**: User-defined thresholds for notifications
5. **Historical Comparison**: Compare different time periods
