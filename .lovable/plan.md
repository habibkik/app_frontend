

## Expand Demo Data and Add Seller Map Points

### 1. Expand Demo Data to 20 Entries Each

**File: `src/data/demoMapData.ts`**

Add 14 more buyer supplier entries and 15 more producer factory entries to reach 20 each, spread across diverse global locations (Africa, Middle East, Southeast Asia, Eastern Europe, Oceania, etc.) with varied match scores, price ranges, and market shares.

### 2. Add Seller Demo Map Entities (Potential Clients + Demand Points)

Currently, seller mode only renders region-level markers (broad areas like "North America"). The user wants individual point markers representing potential clients and demand hotspots.

**File: `src/stores/analysisStore.ts`**
- Add a `clientType` optional field to `MapEntity`: `"potential_client" | "demand_point"` so we can distinguish marker types visually.

**File: `src/data/demoMapData.ts`**
- Add a new `DEMO_SELLER_MAP_ENTITIES` array with ~20 entries of type `"competitor"` but with a `clientType` field. Examples:
  - Potential clients: retail chains, distributors, e-commerce platforms in major cities
  - Demand points: trending markets, trade hubs, emerging consumer hotspots

**File: `src/pages/dashboard/HeatMap.tsx`**
- Change the seller branch from `mapEntities = []` to use `DEMO_SELLER_MAP_ENTITIES` as fallback demo data, so the map shows both region markers AND individual client/demand point pins.

**File: `src/components/shared/MapcnHeatMap.tsx`**
- Add a new seller entity layer (alongside the existing region markers) that renders `MapMarker` components for each seller entity.
- Use distinct marker icons/colors:
  - Potential clients: green markers with a `Users` icon
  - Demand points: orange markers with a `TrendingUp` icon
- Add a `SellerEntityPopup` component showing client name, type badge, demand score, and transport estimate.
- Update `MapLegend` for seller mode to include the new marker types.
- Update `MapFilterBar` to allow filtering seller entities by type (client vs demand).

### Technical Details

**New MapEntity fields:**
```text
MapEntity {
  ...existing fields
  clientType?: "potential_client" | "demand_point"  // seller mode only
  demandScore?: number                               // 0-100, for demand points
}
```

**New demo data structure (20 seller entries):**
- 10 potential clients (retailers, distributors) across major commercial cities
- 10 demand points (trending markets) across emerging and established regions

**Map rendering for seller mode:**
- Region markers (Flame icon, existing) stay as-is for broad demand areas
- Entity markers (new) render alongside regions for granular client/demand visibility
- Both layers are independently filterable

**Files changed:**
- `src/stores/analysisStore.ts` — add `clientType` and `demandScore` to `MapEntity`
- `src/data/demoMapData.ts` — expand buyer (20), producer (20), add seller entities (20)
- `src/pages/dashboard/HeatMap.tsx` — wire seller entities to the map
- `src/components/shared/MapcnHeatMap.tsx` — render seller entity markers, popup, legend update

