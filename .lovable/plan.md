

# Competitor API Implementation Plan

## Overview
Create a new API module `src/features/seller/api/competitorApi.ts` that provides functions for competitor monitoring operations. This API will integrate with the existing `apiClient` service and use the comprehensive types already defined in `competitorIntelligence.ts`.

## Current State

### Existing Infrastructure
- **API Client**: `src/services/api/apiClient.ts` - Full-featured HTTP client with auth, timeout, and error handling
- **Endpoints**: `src/services/api/endpoints.ts` - Centralized endpoint constants (missing competitor endpoints)
- **Types**: `src/features/seller/types/competitorIntelligence.ts` - Comprehensive 900+ line type system
- **Existing Competitor API**: `src/lib/competitor-api.ts` - Only has `analyzeCompetitor()` using Supabase edge function

### What's Missing
1. No `api/` folder in `src/features/seller/`
2. No competitor monitoring API functions
3. No competitor-specific endpoints in `API_ENDPOINTS`

---

## Implementation Plan

### 1. Add Competitor Endpoints

**Edit**: `src/services/api/endpoints.ts`

Add new COMPETITORS section:
```typescript
// Competitors
COMPETITORS: {
  MONITOR: "/competitors/monitor",
  REFRESH: "/competitors/refresh",
  DATA: (productId: string) => `/competitors/${productId}`,
  DETAILS: (competitorId: string) => `/competitors/details/${competitorId}`,
  HISTORY: (competitorId: string) => `/competitors/${competitorId}/history`,
  AUTO_REFRESH: "/competitors/auto-refresh",
},

// Alerts
ALERTS: {
  DISMISS: (alertId: string) => `/alerts/${alertId}/dismiss`,
  LIST: "/alerts",
  ACKNOWLEDGE: (alertId: string) => `/alerts/${alertId}/acknowledge`,
},
```

### 2. Create Competitor API Module

**New File**: `src/features/seller/api/competitorApi.ts`

Complete API module with 7 functions:

```typescript
/**
 * Competitor Monitoring API
 * 
 * Provides functions for competitor tracking, price monitoring,
 * and market intelligence operations.
 */

import { apiClient, API_ENDPOINTS } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type {
  CompetitorMarketData,
  Competitor,
  CompetitorPrice,
  PriceAlert,
} from "../types/competitorIntelligence";

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface AutoRefreshSettings {
  enabled: boolean;
  interval: number | null;
  nextUpdate: string | null;
}

export interface PriceHistoryItem {
  id: string;
  competitorId: string;
  price: number;
  currency: string;
  availability: string;
  collectedAt: string;
}

export interface CompetitorDetails extends Competitor {
  priceHistory: PriceHistoryItem[];
  recentAlerts: PriceAlert[];
  trackingStatus: {
    isTracked: boolean;
    priority: string;
    lastCheck: string;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Start monitoring competitors for a product
 * Triggers the competitorMonitoringPipeline via miroflow
 */
export async function startMonitoring(
  productId: string,
  productName: string
): Promise<ApiResponse<CompetitorMarketData>> {
  return apiClient.post<CompetitorMarketData>(
    API_ENDPOINTS.COMPETITORS.MONITOR,
    { productId, productName }
  );
}

/**
 * Manually refresh competitor prices for a product
 * Forces immediate price update from all sources
 */
export async function refreshCompetitors(
  productId: string
): Promise<ApiResponse<CompetitorMarketData>> {
  return apiClient.post<CompetitorMarketData>(
    API_ENDPOINTS.COMPETITORS.REFRESH,
    { productId }
  );
}

/**
 * Get cached competitor market data for a product
 * Returns the most recent analysis without triggering refresh
 */
export async function getCompetitorData(
  productId: string
): Promise<ApiResponse<CompetitorMarketData>> {
  return apiClient.get<CompetitorMarketData>(
    API_ENDPOINTS.COMPETITORS.DATA(productId)
  );
}

/**
 * Get detailed competitor profile with full history
 * Includes contact info, reputation, engagement metrics
 */
export async function getCompetitorDetails(
  competitorId: string
): Promise<ApiResponse<CompetitorDetails>> {
  return apiClient.get<CompetitorDetails>(
    API_ENDPOINTS.COMPETITORS.DETAILS(competitorId)
  );
}

/**
 * Get price history for a specific competitor
 * Returns price observations over specified time period
 */
export async function getPriceHistory(
  competitorId: string,
  days: number = 30
): Promise<ApiResponse<PriceHistoryItem[]>> {
  return apiClient.get<PriceHistoryItem[]>(
    API_ENDPOINTS.COMPETITORS.HISTORY(competitorId),
    { days }
  );
}

/**
 * Configure automatic price refresh for a product
 * Set intervalHours to null to disable auto-refresh
 */
export async function setAutoRefresh(
  productId: string,
  intervalHours: number | null
): Promise<ApiResponse<AutoRefreshSettings>> {
  return apiClient.post<AutoRefreshSettings>(
    API_ENDPOINTS.COMPETITORS.AUTO_REFRESH,
    { productId, intervalHours }
  );
}

/**
 * Dismiss a price alert
 * Marks alert as dismissed and removes from active list
 */
export async function dismissAlert(
  alertId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>(
    API_ENDPOINTS.ALERTS.DISMISS(alertId)
  );
}

// ============================================================================
// BARREL EXPORT
// ============================================================================

export const competitorApi = {
  startMonitoring,
  refreshCompetitors,
  getCompetitorData,
  getCompetitorDetails,
  getPriceHistory,
  setAutoRefresh,
  dismissAlert,
};
```

### 3. Create API Barrel Export

**New File**: `src/features/seller/api/index.ts`

```typescript
// Seller API barrel export
export {
  startMonitoring,
  refreshCompetitors,
  getCompetitorData,
  getCompetitorDetails,
  getPriceHistory,
  setAutoRefresh,
  dismissAlert,
  competitorApi,
  type AutoRefreshSettings,
  type PriceHistoryItem,
  type CompetitorDetails,
} from "./competitorApi";
```

### 4. Update Seller Feature Index

**Edit**: `src/features/seller/index.ts`

Add API exports:
```typescript
// API
export {
  startMonitoring,
  refreshCompetitors,
  getCompetitorData,
  getCompetitorDetails,
  getPriceHistory,
  setAutoRefresh,
  dismissAlert,
  competitorApi,
  type AutoRefreshSettings,
  type PriceHistoryItem,
  type CompetitorDetails,
} from "./api";
```

### 5. Update Services Index (Optional)

**Edit**: `src/services/index.ts`

Ensure `API_ENDPOINTS` is exported:
```typescript
// Services barrel export
export { apiClient } from "./api/apiClient";
export { API_ENDPOINTS } from "./api/endpoints";
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/services/api/endpoints.ts` | Edit | Add COMPETITORS and ALERTS endpoints |
| `src/features/seller/api/competitorApi.ts` | Create | Main API module with 7 functions |
| `src/features/seller/api/index.ts` | Create | Barrel export for API module |
| `src/features/seller/index.ts` | Edit | Add API exports to feature |

---

## API Function Specifications

| Function | Method | Endpoint | Request Body | Response |
|----------|--------|----------|--------------|----------|
| `startMonitoring` | POST | `/competitors/monitor` | `{ productId, productName }` | `CompetitorMarketData` |
| `refreshCompetitors` | POST | `/competitors/refresh` | `{ productId }` | `CompetitorMarketData` |
| `getCompetitorData` | GET | `/competitors/{productId}` | - | `CompetitorMarketData` |
| `getCompetitorDetails` | GET | `/competitors/details/{id}` | - | `CompetitorDetails` |
| `getPriceHistory` | GET | `/competitors/{id}/history?days=30` | - | `PriceHistoryItem[]` |
| `setAutoRefresh` | POST | `/competitors/auto-refresh` | `{ productId, intervalHours }` | `AutoRefreshSettings` |
| `dismissAlert` | POST | `/alerts/{id}/dismiss` | - | `{ success: boolean }` |

---

## Usage Examples

```typescript
import { competitorApi } from "@/features/seller";

// Start monitoring a product
const result = await competitorApi.startMonitoring(
  "product-123",
  "Industrial Motor XR-500"
);

// Get cached market data
const marketData = await competitorApi.getCompetitorData("product-123");

// Refresh competitors manually
const updated = await competitorApi.refreshCompetitors("product-123");

// Get competitor details
const details = await competitorApi.getCompetitorDetails("competitor-456");

// Get 60 days of price history
const history = await competitorApi.getPriceHistory("competitor-456", 60);

// Enable auto-refresh every 2 hours
const settings = await competitorApi.setAutoRefresh("product-123", 2);

// Disable auto-refresh
const disabled = await competitorApi.setAutoRefresh("product-123", null);

// Dismiss an alert
const dismissed = await competitorApi.dismissAlert("alert-789");
```

---

## Integration with Existing Components

The new API will integrate with:

1. **CompetitorMonitorStore** (`src/stores/competitorMonitorStore.ts`)
   - Replace mock `refreshData()` with `competitorApi.refreshCompetitors()`
   - Use `competitorApi.setAutoRefresh()` for auto-refresh settings

2. **CompetitorMonitor** (`src/features/seller/components/CompetitorMonitor.tsx`)
   - Call `startMonitoring()` when user initiates tracking
   - Call `getCompetitorData()` to load cached data

3. **PriceMovementAlerts** (`src/features/seller/components/PriceMovementAlerts.tsx`)
   - Use `dismissAlert()` for dismiss button handler

4. **CompetitorTable** (`src/features/seller/components/CompetitorTable.tsx`)
   - Use `getCompetitorDetails()` for expanded row data
   - Use `getPriceHistory()` for historical charts

---

## Type Reuse

The API leverages existing comprehensive types:
- `CompetitorMarketData` - Full market intelligence response
- `Competitor` - Base competitor profile
- `PriceAlert` - Alert notifications
- `CompetitorPrice` - Price observations

New response types defined locally:
- `AutoRefreshSettings` - Auto-refresh configuration
- `PriceHistoryItem` - Simplified price history entry
- `CompetitorDetails` - Extended competitor with history

