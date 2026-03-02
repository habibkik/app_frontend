

## Plan: Draw a connection line from user location to clicked entity

When a user clicks on a supplier/factory/entity marker on the heat map, and the user's geolocation is available, draw an animated arc line from the user's blue dot to the clicked entity's position.

### Approach

Create a new inner component `ConnectionLine` that renders inside the `<Map>` context. It will:

1. **Use MapLibre's native GeoJSON source + line layer** — add a `geojson` source with a `LineString` feature connecting `userCoords` to the pinned entity's coordinates
2. **Create a curved arc** — compute intermediate points along a great-circle arc (5-10 interpolated points with a slight vertical bulge) so the line looks like a flight path rather than a straight segment
3. **Style the line** — dashed, animated, with a color matching the mode (emerald for buyer, violet for producer, orange for seller)
4. **Show/hide reactively** — the line appears when `pinnedEntity` is set and `userCoords` is available; it disappears when the popup is closed (pinnedEntity becomes null)
5. **For buyer cluster mode** — also connect to the selected cluster point (the `BuyerClusterLayer` already tracks a `selected` state; we'll lift that state up or pass userCoords down and draw the line from within)

### Changes

**`src/components/shared/MapcnHeatMap.tsx`**:
- Add a `ConnectionLine` component (~50 lines) that:
  - Accepts `userCoords`, `targetLat`, `targetLng`, `color`
  - Uses `useMap()` to access the MapLibre instance
  - On mount/update: adds a GeoJSON source with a curved `LineString` and a `line` layer with dash-array animation
  - On unmount: removes source and layer
  - Computes arc points using simple lat/lng interpolation with altitude bulge
- Render `<ConnectionLine>` inside `<Map>` whenever `pinnedEntity && userCoords` (for producer/seller modes)
- For buyer mode: pass `userCoords` into `BuyerClusterLayer`, and render `ConnectionLine` when a cluster point is selected
- The line will also show distance label via the existing `TransportChip` in popups (already implemented)

### Technical Details

```text
User Blue Dot ──── curved dashed line ────> Pinned Entity Marker
   (lat,lng)         (arc interpolation)        (lat,lng)
```

Arc interpolation: 8 intermediate points, with a latitude offset proportional to distance to create a subtle curve. The line layer uses `line-dasharray: [2, 2]` for a dashed effect and mode-specific coloring.

Source/layer IDs will be unique (`connection-line-src`, `connection-line-layer`) and cleaned up on unmount to prevent stale layers when theme changes trigger `styledata` events.

