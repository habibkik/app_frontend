
# Integrate mapcn Map Library into Heat Map Page

## What is mapcn?
mapcn is a shadcn-style copy-paste map component library built on **MapLibre GL** (free, no API key). It uses free CARTO basemap tiles and auto-switches between light/dark themes. It is installed via one `shadcn` CLI command which copies a `map.tsx` file into `src/components/ui/`.

Key components available:
- `Map` — root container (no API key needed)
- `MapControls` — zoom, compass, fullscreen buttons
- `MapMarker` + `MarkerContent` + `MarkerPopup` + `MarkerTooltip` — interactive markers
- `MapClusterLayer` — GeoJSON-based auto-clustering for large datasets
- `useMap` hook — access raw MapLibre instance

## Current State
The Heat Map page (`src/pages/dashboard/HeatMap.tsx`) currently uses:
- `MapboxMap` component (requires `VITE_MAPBOX_ACCESS_TOKEN` — falls back to a blank error card if missing)
- `react-map-gl` + `mapbox-gl` packages

The page has 3 modes: **Seller**, **Buyer**, **Producer** — but the map only shows data when real AI analysis has been run. No demo data is shown by default.

Demo data exists in `src/data/demoMarketData.ts` (seller-focused) but there is no demo data for Buyer or Producer modes.

## Plan

### Step 1 — Install mapcn
Run the shadcn CLI command to copy the map component:
```
npx shadcn@latest add @mapcn/map
```
This installs `maplibre-gl` and adds `src/components/ui/map.tsx`. No API key needed.

### Step 2 — Add Demo Data for All 3 Modes
Extend `src/data/demoMarketData.ts` to add:

**Buyer demo** — 6 suppliers with geo coordinates across different countries:
- Shenzhen Electronics Co. (China)
- Mumbai Textiles Ltd (India)
- Frankfurt Parts GmbH (Germany)
- Toronto Supply Corp (Canada)
- Osaka Industrial (Japan)
- São Paulo Manufacturing (Brazil)

**Producer demo** — 5 competitor factories:
- Shanghai Auto Parts (China)
- Detroit Precision Mfg (USA)
- Stuttgart Engineering (Germany)
- Monterrey Components (Mexico)
- Pune Auto Systems (India)

**Seller demo** — already exists (`DEMO_HEAT_MAP_REGIONS` with 5 global regions)

Each entry will have `latitude`, `longitude`, `city`, `country`, and relevant business data (matchScore for buyer, marketShare for producer, demand for seller).

### Step 3 — Create a New `MapcnHeatMap` Component
Create `src/components/shared/MapcnHeatMap.tsx` that:
- Accepts `entities` (MapEntity[]), `regions` (MarketHeatMapRegion[]), and `mode`
- Uses mapcn's `Map`, `MapControls`, `MapMarker`, `MarkerContent`, `MarkerPopup`, `MarkerTooltip`
- Renders **color-coded markers** based on mode:
  - Buyer → blue markers (Package icon) showing supplier name, match score, price range
  - Producer → purple markers (Factory icon) showing factory name, market share, capacity
  - Seller → red/amber/green markers based on demand level (Flame icon) showing region, growth %, opportunity
- Marker popups show rich info card with all available data
- MarkerTooltip shows quick name on hover
- `MapControls` adds zoom + fullscreen buttons
- Falls back to an informative empty state card if no data

### Step 4 — Update `HeatMap.tsx` Page
Replace the `MapboxMap` usage with `MapcnHeatMap` in the map view:
- Always show demo data when no real AI analysis has been run (use `hasRealData || hasDemoData`)
- For seller mode: use `sellerResults?.marketHeatMap || DEMO_HEAT_MAP_REGIONS`
- For buyer mode: use buyer `MapEntity[]` from store OR `DEMO_BUYER_MAP_ENTITIES`
- For producer mode: use producer `MapEntity[]` from store OR `DEMO_PRODUCER_MAP_ENTITIES`
- Add a small "Demo data" badge when demo data is shown so users know it's sample data
- Update stat cards to always show demo data stats when no real data exists
- Keep the grid view (`MarketHeatMap` component) working as before

### Step 5 — Clean Up
- Keep the old `MapboxMap` component intact (used by other pages potentially), but stop using it on the Heat Map page
- No API key configuration needed at all for the new map

## Technical Details

### mapcn Map Component API (key props)
```tsx
<Map center={[lng, lat]} zoom={2} className="h-[500px]">
  <MapControls showZoom showFullscreen />
  <MapMarker longitude={lng} latitude={lat}>
    <MarkerContent>
      <div className="...custom icon..."/>
    </MarkerContent>
    <MarkerTooltip>Supplier Name</MarkerTooltip>
    <MarkerPopup>
      <div className="p-3">...rich card...</div>
    </MarkerPopup>
  </MapMarker>
</Map>
```

### Color coding per mode
```text
Seller demand:
  high   → bg-red-500 marker
  medium → bg-amber-500 marker
  low    → bg-blue-500 marker

Buyer (suppliers):
  matchScore >= 80 → bg-emerald-500
  matchScore >= 60 → bg-blue-500
  below            → bg-slate-400

Producer (factories):
  all → bg-violet-600 marker
```

### Files to Create/Modify
```text
CREATE  src/components/ui/map.tsx           (auto-added by CLI)
CREATE  src/components/shared/MapcnHeatMap.tsx
MODIFY  src/data/demoMarketData.ts          (add buyer + producer demo data)
MODIFY  src/pages/dashboard/HeatMap.tsx     (use new map, show demo fallback)
```

### Why mapcn over MapboxMap?
- No API key required — works immediately in all environments
- Free CARTO tiles — no cost
- shadcn-style — integrates with existing dark mode + Tailwind
- MapLibre GL is open-source — no vendor lock-in
- Popups use React JSX — easy to style with shadcn/ui cards
