

# Competitor Intelligence Types Enhancement Plan

## Overview
This plan adapts and enhances the existing competitor monitoring system to incorporate the comprehensive type definitions you provided. The current implementation has basic types, while the new specification includes advanced features like detailed competitor profiles, extensive market statistics, alert configurations, historical tracking, and API response wrappers.

## Current State vs Required State

### Existing Types (87 lines)
- Basic `Platform`, `StockStatus`, `AlertType` enums
- Simple `CompetitorTableRow` with limited fields
- Basic `PriceMovementAlert` 
- Simple `MarketInsight`
- `PriceTrendDataPoint` for charts
- `CompetitorMonitorMetrics`

### Required Types (700+ lines)
- Comprehensive `Competitor` with reputation, engagement, contact info
- Detailed `CompetitorPrice` with source tracking, MOQ, lead times
- `CompetitorListing` combining profile + price history
- `CompetitorMarketData` with full market statistics
- `PriceAlert` with severity levels, notification channels
- `AlertConfiguration` for user preferences
- `PriceTrendPoint` for charts with competitor count
- `CompetitorActivityLog` for tracking changes
- `CompetitorComparison` for side-by-side views
- `CompetitorTracking` and `CompetitorGroup` for management
- `MarketReport` for exports
- API response wrappers and filters
- Type guards for runtime validation

---

## Implementation Plan

### 1. Create New Comprehensive Types File

**New File**: `src/features/seller/types/competitorIntelligence.ts`

Contains all comprehensive type definitions organized into sections:
- **Core Types**: `Competitor`, `CompetitorPrice`, `CompetitorListing`
- **Market Analysis**: `CompetitorMarketData`, `MarketStats`, `MarketTrends`
- **Alerts & Notifications**: `PriceAlert`, `AlertConfiguration`
- **Historical & Trending**: `PriceTrendPoint`, `CompetitorActivityLog`
- **Comparison & Management**: `CompetitorComparison`, `CompetitorTracking`, `CompetitorGroup`
- **Export Types**: `MarketReport`
- **API Types**: Response wrappers, pagination, filters
- **Type Guards**: Runtime validation functions

### 2. Update Existing Types for Backward Compatibility

**Edit**: `src/features/seller/types/competitorMonitor.ts`

Keep existing types but extend them to be compatible with new comprehensive types:
- Extend `Platform` to include all platforms: instagram, whatsapp, telegram, viber, tiktok, linkedin
- Add `pre_order` to `StockStatus`
- Add `availability_change`, `rating_change`, `market_shift` to `AlertType`
- Enhance `CompetitorTableRow` with new fields from `Competitor`:
  - `country`
  - `businessType`
  - `contactInfo` (full social/communication channels)
  - `reputation` (response time, return rate, verified status, account age)
  - `engagement` (followers, monthly orders, last activity)
  - `reliabilityScore`
  - `status` (active, inactive, verified, flagged_suspicious)
- Enhance `PriceMovementAlert` to match `PriceAlert`:
  - Add `severity` (low, medium, high, critical)
  - Add `status` (active, acknowledged, resolved, dismissed)
  - Add `notificationChannels`
  - Add `details` object with granular change tracking
- Enhance `MarketInsight` with full market statistics:
  - Add `marketStats` (median, stdDev, priceRange, competitiveness)
  - Add `availability` metrics
  - Add `insights` (opportunities, threats, recommendations)
  - Add `dataQuality` metrics

### 3. Create Type Converters/Mappers

**New File**: `src/features/seller/utils/competitorTypeConverters.ts`

Utility functions to convert between legacy types and new comprehensive types:
- `toCompetitorListing(row: CompetitorTableRow): CompetitorListing`
- `toCompetitorMarketData(metrics, competitors): CompetitorMarketData`
- `toPriceAlert(alert: PriceMovementAlert): PriceAlert`
- `fromCompetitorListing(listing: CompetitorListing): CompetitorTableRow`

### 4. Update Store with Enhanced Data Structure

**Edit**: `src/stores/competitorMonitorStore.ts`

Add new state and actions:
- Add `marketData: CompetitorMarketData | null`
- Add `alertConfiguration: AlertConfiguration | null`
- Add `activityLog: CompetitorActivityLog[]`
- Add `competitorGroups: CompetitorGroup[]`
- Add `trackingSettings: CompetitorTracking[]`
- Add actions: `setAlertConfiguration`, `addActivityLog`, `createGroup`, `updateTracking`
- Update mock data to include new fields

### 5. Enhance Mock Data

**Edit**: `src/stores/competitorMonitorStore.ts`

Update mock competitors with comprehensive data:
```typescript
{
  // Existing fields...
  country: "USA",
  businessType: "retailer",
  contactInfo: {
    website: "https://example.com",
    email: "contact@example.com",
    phone: "+1-555-0123",
    instagram: "@techsupply",
    facebook: "techsupplyco",
    whatsapp: "+1-555-0123",
    linkedin: "techsupply-co"
  },
  reputation: {
    reviewCount: 234,
    averageRating: 4.5,
    responseTime: 2.5, // hours
    returnRate: 3.2,   // percent
    isVerified: true,
    accountAge: 730    // days
  },
  engagement: {
    followers: 12500,
    monthlyOrders: 450,
    lastActivityAt: new Date().toISOString()
  },
  reliabilityScore: 87,
  status: "verified"
}
```

### 6. Update Components for Enhanced Data Display

**Edit**: Multiple component files

**CompetitorTable.tsx**:
- Add columns for reliability score, verified badge
- Add platform-specific icons for Instagram, WhatsApp, Telegram, TikTok
- Show engagement metrics in expanded row
- Display reputation badges

**MarketInsightsPanel.tsx**:
- Add market statistics section (median, std dev, range)
- Add competitiveness indicator
- Add data quality metrics
- Add market insights (opportunities, threats)

**PriceMovementAlerts.tsx**:
- Add severity badges (critical, high, medium, low)
- Add notification channel indicators
- Add acknowledge/resolve actions
- Color-code by severity

### 7. Update Exports

**Edit**: `src/features/seller/index.ts`

Export all new types:
```typescript
// Comprehensive Types
export type {
  Competitor,
  CompetitorPrice,
  CompetitorListing,
  CompetitorMarketData,
  MarketStats,
  MarketTrends,
  PriceAlert,
  AlertConfiguration,
  PriceTrendPoint,
  CompetitorActivityLog,
  CompetitorComparison,
  CompetitorTracking,
  CompetitorGroup,
  MarketReport,
  CompetitorFilters,
  MarketDataFilters,
  CompetitorDataResponse,
  PaginatedCompetitorResponse,
} from "./types/competitorIntelligence";

// Type guards
export {
  isCompetitor,
  isCompetitorPrice,
  isCompetitorMarketData,
  isPriceAlert,
} from "./types/competitorIntelligence";
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/seller/types/competitorIntelligence.ts` | Create | Full comprehensive type definitions (700+ lines) |
| `src/features/seller/types/competitorMonitor.ts` | Edit | Extend existing types for compatibility |
| `src/features/seller/utils/competitorTypeConverters.ts` | Create | Type conversion utilities |
| `src/stores/competitorMonitorStore.ts` | Edit | Add new state, enhanced mock data |
| `src/features/seller/components/CompetitorTable.tsx` | Edit | Display new fields, platforms |
| `src/features/seller/components/MarketInsightsPanel.tsx` | Edit | Add statistics, insights |
| `src/features/seller/components/PriceMovementAlerts.tsx` | Edit | Add severity, actions |
| `src/features/seller/index.ts` | Edit | Export all new types |

---

## New Platform Icons

```typescript
const platformIcons: Record<Platform, string> = {
  facebook: "📘",
  instagram: "📸",
  amazon: "🛒",
  olx: "🟡",
  ouedkniss: "🟢",
  website: "🌐",
  whatsapp: "💬",
  telegram: "✈️",
  viber: "💜",
  tiktok: "🎵",
  linkedin: "💼",
};
```

---

## Enhanced Alert Severity Colors

```typescript
const severityColors = {
  critical: "bg-red-600 text-white",
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-blue-500 text-white",
};
```

---

## New MarketStats Display

The Market Insights panel will show:
- Average, Median, Min, Max prices
- Price Range and Standard Deviation
- Your Competitiveness Status (underpriced → significantly_overpriced)
- Suggested Optimal Price
- Data Quality Score (0-100)
- Market Maturity Level
- Competitive Intensity

---

## Backward Compatibility

The plan maintains full backward compatibility by:
1. Keeping existing types intact
2. Adding new optional fields with defaults
3. Providing type converters for gradual migration
4. Using union types where old and new values overlap

