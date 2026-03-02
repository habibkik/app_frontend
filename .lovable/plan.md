

## Two Issues to Fix

### Issue 1: Click-to-dismiss still not working

The `document.elementsFromPoint()` approach is correct in theory, but there's a subtle problem: **MapLibre markers have `pointer-events: auto` on their container, but the map canvas sits in a separate stacking context**. When MapLibre fires its `map.on("click")`, the `originalEvent` is the actual DOM `MouseEvent` from the canvas. `document.elementsFromPoint()` should find the marker divs since they are absolutely positioned on top of the canvas.

However, looking deeper at the code, I suspect the issue is that the **map click handler and the marker DOM click handler fire in rapid succession**, and the state update from `handleClickEntity` (which sets `pinnedEntity`) hasn't committed yet when `MapClickDismiss` fires `dismissAll`. Both run synchronously in the same microtask.

**The fix**: Use a simple `requestAnimationFrame` delay in `MapClickDismiss` to ensure the marker's DOM click handler runs first. Alternatively — and more robustly — add a `data-map-marker` attribute to marker elements and check with `elementsFromPoint` more broadly, AND add a small `setTimeout(0)` to defer the dismiss check.

Actually, the most reliable approach: **skip `map.on("click")` entirely**. Instead, attach a single `click` listener to the map's **canvas container element** (`map.getCanvasContainer()`). This is a normal DOM element, so `e.target` and `e.stopPropagation()` work correctly. When the user clicks a marker, `stopPropagation` prevents the canvas container listener from firing. When they click empty space, the canvas receives the click and dismiss fires.

### Issue 2: Show all 3 transport modes with distance

Currently `TransportChip` shows only the **recommended** transport mode (the one matching the distance threshold). The user wants to see all 3 modes (Road, Sea, Air) with the distance, so users can compare costs across shipping methods.

---

### Changes

#### File: `src/components/shared/MapcnHeatMap.tsx`

**1. Fix `MapClickDismiss`** — Replace `map.on("click")` with a DOM click listener on `map.getCanvasContainer()`:

```typescript
function MapClickDismiss({ onDismiss }: { onDismiss: () => void }) {
  const { map, isLoaded } = useMap();
  const cbRef = useRef(onDismiss);
  cbRef.current = onDismiss;

  useEffect(() => {
    if (!map || !isLoaded) return;
    const container = map.getCanvasContainer();
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      // If click landed on the canvas itself (not a marker/popup), dismiss
      if (target.tagName === "CANVAS") {
        cbRef.current();
      }
    };
    container.addEventListener("click", handler);
    return () => { container.removeEventListener("click", handler); };
  }, [map, isLoaded]);

  return null;
}
```

This works because:
- Marker clicks go through DOM marker elements → `e.target` is NOT the canvas
- Empty map clicks go through the canvas → `e.target.tagName === "CANVAS"`
- No timing issues, no `elementsFromPoint`, no ref guards

**2. Replace `TransportChip` with `AllTransportModes`** — Show all 3 transport options (Road, Sea, Air) with the distance, highlighting the recommended one:

```typescript
function AllTransportModes({ lat, lng, userCoords }: { lat: number; lng: number; userCoords: UserCoords | null }) {
  if (!userCoords) return null;
  const distKm = haversineKm(userCoords.lat, userCoords.lng, lat, lng);
  const recommended = getTransportInfo(distKm);
  const allModes = [
    { mode: "road", icon: Truck, label: "Road freight", cost: getRoadCost(distKm) },
    { mode: "sea",  icon: Ship,  label: "Sea freight",  cost: getSeaCost(distKm) },
    { mode: "air",  icon: Plane, label: "Air freight",  cost: getAirCost(distKm) },
  ];
  // Show distance + all 3 modes, with recommended one highlighted
}
```

**3. Update `src/utils/transportEstimate.ts`** — Export individual cost functions for each mode so all 3 can be displayed regardless of distance.

