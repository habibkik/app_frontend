
## Fix Map Hover Popups + Add Distance & Transport Cost

### Problem Diagnosis

There are two bugs preventing hover information from showing, plus a feature request for distance and transport cost.

**Bug 1 — `MarkerTooltip` always renders `null` (primary cause)**

In `src/components/ui/map.tsx`, `MarkerTooltip` has this guard at line 564:
```tsx
if (!tooltipRef.current) return null;
```
Because `tooltipRef` is assigned inside a `useEffect`, it is always `null` on the first render. React evaluates the return value at render time, so the `createPortal(...)` below is unreachable — the tooltip content never mounts into the DOM, meaning nothing appears on hover, ever.

**Bug 2 — Stale `marker` in `MarkerContext` (affects both tooltip and popup)**

`MapMarker` provides context with `marker: markerRef.current`. Since the actual MapLibre marker is created inside a `useEffect`, `markerRef.current` is `null` during the first render. When `MarkerTooltip` reads `marker` from context and checks `if (!marker) return`, it exits early. The tooltip and popup `useEffect` hooks never run because `marker` is `null`.

Fix: Add a `markerState` piece of React state inside `MapMarker`, set it when the marker is created, and pass that to context instead of `markerRef.current`.

---

### Fix Plan

**File: `src/components/ui/map.tsx`**

#### Fix 1 — Live `marker` state in `MapMarker`
Replace `marker: markerRef.current` in the context with a `useState` value that gets set inside the `useEffect`:
```tsx
const [markerState, setMarkerState] = useState<maplibregl.Marker | null>(null);

// inside useEffect, after marker is created:
markerRef.current = marker;
setMarkerState(marker);

// cleanup:
setMarkerState(null);

// context:
<MarkerContext.Provider value={{ marker: markerState, ... }}>
```

#### Fix 2 — Remove `if (!tooltipRef.current) return null` guard
The `MarkerTooltip` component should unconditionally call `createPortal` using a stable `containerRef`. The tooltip DOM element is created in the effect and content is portalled into it. Replace the broken pattern with a stable `containerRef` approach (same as `MarkerPopup` already uses):
```tsx
// Instead of:
if (!tooltipRef.current) return null;
return createPortal(<div>...</div>, tooltipRef.current.getElement() ?? div);

// Use a stable container div, just like MarkerPopup does:
const containerRef = useRef<HTMLDivElement>(document.createElement("div"));
// In useEffect: tooltip.setDOMContent(containerRef.current)
// Return: createPortal(<div>...</div>, containerRef.current)  ← always works
```

---

### Feature: Distance + Smart Transport Cost in Hover Popups

#### Distance Calculation
Use the browser's `navigator.geolocation` API to get the user's coordinates, then compute the great-circle distance (Haversine formula) between the user and each entity in a custom hook `useUserLocation`.

#### Smart Transport Mode Detection
Determine the likely mode of transport based on distance:
- **Road** (truck icon): ≤ 1,500 km — same continent, driveable
- **Sea** (ship icon): 1,500 – 8,000 km — intercontinental, sea freight typical
- **Air** (plane icon): > 8,000 km OR islands with no land route — fast air freight

Cost estimates (per-unit approximation, shown as a range):
- Road: ~$0.08–0.15 / km / CBM
- Sea: flat rate estimate based on distance tier (short haul $200–500, long haul $800–2,000)
- Air: ~$4–8 / kg, shown as "high cost" warning

These are displayed as estimates, clearly labeled "Est. transport cost" to avoid confusion with exact quotes.

#### New Enriched Popup Component: `EnrichedEntityPopup`
A single reusable popup that all three modes use on hover/click, combining:
- Entity name + type badge
- Country, city
- Match score (buyer) / Market share + tier badge (producer) / Growth + demand (seller)
- Price range
- Distance from user (e.g. "2,340 km away")
- Transport mode icon + label + cost estimate

---

### Implementation Details

**New hook — `useUserLocation` in `src/hooks/useUserLocation.ts`**
```tsx
export function useUserLocation() {
  const [coords, setCoords] = useState<{lat: number; lng: number} | null>(null);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently fail — fallback to "unknown"
    );
  }, []);
  return coords;
}
```

**New utility — `getTransportInfo(distanceKm)` in `src/utils/transportEstimate.ts`**
```tsx
export function haversineKm(lat1, lng1, lat2, lng2): number { ... }
export function getTransportInfo(distanceKm: number) {
  if (distanceKm <= 1500) return { mode: "road", icon: "Truck", label: "Road freight", costRange: "..." };
  if (distanceKm <= 8000) return { mode: "sea",  icon: "Ship",  label: "Sea freight",  costRange: "..." };
  return { mode: "air", icon: "Plane", label: "Air freight", costRange: "..." };
}
```

**Updated popup components in `MapcnHeatMap.tsx`**
- `BuyerPopupCard` — add distance row + transport chip
- `ProducerPopup` — add distance row + transport chip
- `SellerPopup` — add distance row (distance to that market region)
- Pass `userLocation` down from `MapcnHeatMap` → each popup

**Pass `userLocation` from `MapcnHeatMap`**
- Call `useUserLocation()` at the top of `MapcnHeatMap`
- Pass `userCoords` as a prop to `BuyerClusterLayer` (for the click popup) and to each `MapMarker` popup via the popup content component

---

### Files to Edit

| File | Change |
|---|---|
| `src/components/ui/map.tsx` | Fix Bug 1 (live `markerState`), Fix Bug 2 (stable `containerRef` in `MarkerTooltip`) |
| `src/components/shared/MapcnHeatMap.tsx` | Call `useUserLocation`, pass coords to all popup components, enrich `BuyerPopupCard`, `ProducerPopup`, `SellerPopup` with distance + transport mode |

### New Files

| File | Purpose |
|---|---|
| `src/hooks/useUserLocation.ts` | Browser geolocation hook with graceful fallback |
| `src/utils/transportEstimate.ts` | Haversine distance + smart transport mode/cost estimator |

No database changes, no new dependencies required.
