
## Root Cause Analysis: Why Hover Still Doesn't Work

After reading the full code, there are **3 distinct bugs** that together prevent any hover popup from appearing:

---

### Bug 1 — Children portalled into a detached DOM node (PRIMARY CAUSE)

In `MapMarker`, all children (including `MarkerContent`, `MarkerTooltip`, `MarkerPopup`) are rendered via:

```tsx
{createPortal(children, elementRef.current)}
```

`elementRef.current` is created as `document.createElement("div")` — a **detached** div that is never appended to the document body. It's only used as the marker element in MapLibre. This means:

- `MarkerTooltip`'s `useEffect` runs, gets `marker` from context (non-null now), and calls `marker.getElement().addEventListener("mouseenter", show)` — this attaches correctly.
- BUT the tooltip's `containerRef.current` (also a detached div) is set as `tooltip.setDOMContent(...)`. When `show()` calls `tooltip.addTo(map)`, MapLibre successfully creates a popup in the map container DOM.
- **However**, `createPortal(content, containerRef.current)` renders React content into the detached div — but MapLibre's `setDOMContent` copies the node reference. React portals into it correctly.

Actually re-reading more carefully — the hover **event listener** is attached to `marker.getElement()` which IS the element inserted into the map's canvas. So mouseenter/mouseleave should fire.

The actual problem is: **`marker` in context is `null` when `MarkerTooltip`'s `useEffect` runs the first time**. Here's the sequence:

1. `MapMarker` renders → portals children into `elementRef.current`
2. `MarkerTooltip` renders (inside portal) → its `useEffect([map, isLoaded, marker])` runs with `marker = null` → **returns early, does nothing**
3. `MapMarker`'s own `useEffect` runs → creates the MapLibre marker → calls `setMarkerState(marker)` → triggers re-render
4. `MarkerTooltip` re-renders with `marker` now non-null → `useEffect([map, isLoaded, marker])` runs again → **should work now**

Wait — but `createPortal(children, elementRef.current)` where `elementRef.current` is an element that IS used as the MapLibre marker element. Children do get re-renders. So the tooltip effect SHOULD re-run when `marker` becomes non-null.

### Bug 2 — The ACTUAL root cause: `MarkerTooltip` renders inside `elementRef` which is the marker DOM element — and mouseenter/mouseleave on the marker element fires, but the `show` and `hide` functions close over the tooltip created in `useEffect`. Let me check this more carefully.

The issue is subtle: `MarkerTooltip` attaches `mouseenter`/`mouseleave` to `marker.getElement()`. But `marker.getElement()` IS `elementRef.current` — the same div that `MarkerContent` renders into. When you hover the marker dot (inside `MarkerContent`), the event bubbles up to `marker.getElement()`, triggering `show`. This should work.

**But**: `MarkerPopup` ALSO attaches a `click` listener to `marker.getElement()`. Both components fight for events on the same element — this is fine.

### Bug 3 — The actual cause found in console: `TransportChip` ref error

The console error says:
```
Warning: Function components cannot be given refs. Check the render method of BuyerPopupCard.
  at TransportChip
```

This is a **React rendering error** that causes the `BuyerPopupCard` component tree to **partially fail to render**. When React encounters this error during rendering inside a portal (specifically inside `MapPopup`), it can cause the portal content to render incorrectly or not at all in some environments.

More critically: looking at line 80 of `MapcnHeatMap.tsx`:
```
at TransportChip (MapcnHeatMap.tsx:80:26)
```
Line 80 is where `TransportChip` is defined. The error says `BuyerPopupCard` is passing a `ref` to `TransportChip`. This happens because **Lucide icons (`Truck`, `Ship`, `Plane`) are functional components** that don't forward refs — and in some React versions the icon usage inside `TransportChip` can cause this if icons are used as JSX elements that receive implicit ref forwarding.

Actually the real cause: looking at the error trace more carefully, it says `at TransportChip` is a child of `BuyerPopupCard`. The issue is that `TransportChip` is being passed as a component with a `ref` prop somewhere — likely because it's being used directly as a JSX element in a context that passes refs (like `React.cloneElement` or a radix component).

### The Real Fix Strategy

After careful analysis, the **simplest and most reliable fix** is to **abandon the `MarkerTooltip`/`MarkerPopup` approach entirely** for the heat map and instead:

1. **Use hover state at the `MapcnHeatMap` level** — track which entity/region is hovered using React state
2. **Render a `MapPopup` component** (which is a standalone, working popup) at the hovered entity's coordinates when hovered
3. **Attach mouseenter/mouseleave to the marker element directly** via `MapMarker`'s `onMouseEnter`/`onMouseLeave` props

This avoids all the portal-into-marker-element complexity entirely.

---

## Fix Plan

### Strategy: Replace `MarkerTooltip` + `MarkerPopup` with hover-state-driven `MapPopup`

Instead of portalling tooltip/popup content through the marker DOM chain, we:
1. Track `hoveredEntity` / `hoveredRegion` in state inside `MapcnHeatMap`
2. On `mouseenter` of a `MapMarker`, set the hovered state
3. On `mouseleave`, clear it
4. Render a `<MapPopup>` at the hovered coordinate when state is set

This uses `MapPopup` which is already proven to work (it's the same thing used for cluster click popups in Buyer mode and it works).

### File: `src/components/shared/MapcnHeatMap.tsx`

**Remove** `MarkerTooltip` and `MarkerPopup` from all `MapMarker` usages in Producer and Seller modes.

**Add** `hoveredEntity` and `hoveredRegion` state in `MapcnHeatMap`.

**Update** Producer mode markers:
```tsx
<MapMarker
  key={entity.id}
  longitude={entity.geoLocation.longitude}
  latitude={entity.geoLocation.latitude}
  onMouseEnter={() => setHoveredEntity(entity)}
  onMouseLeave={() => setHoveredEntity(null)}
>
  <MarkerContent>
    <MarkerDot color="#7c3aed" icon={Factory} />
  </MarkerContent>
</MapMarker>
```

**Add** a single `MapPopup` that shows when `hoveredEntity` is set:
```tsx
{hoveredEntity && (
  <MapPopup
    longitude={hoveredEntity.geoLocation.longitude}
    latitude={hoveredEntity.geoLocation.latitude}
    closeButton={false}
  >
    <ProducerPopup entity={hoveredEntity} userCoords={userCoords} />
  </MapPopup>
)}
```

Same pattern for Seller regions using `hoveredRegion`.

**Also fix** the `TransportChip` ref warning by wrapping it with `React.forwardRef` or simply removing the problematic prop — since `TransportChip` is a plain function component not expecting refs, the warning is likely caused by an outer component passing a ref (Lucide icons inside `TransportChip` should be fine). The fix is to check if `TransportChip` itself is being cloned with a ref and ensure it doesn't receive one. The simplest fix: wrap `TransportChip` in `React.memo` (not `forwardRef`) and ensure it isn't used in a ref-passing context.

After reading the error again: `at TransportChip` inside `BuyerPopupCard` inside `MapPopup`. The `MapPopup` component uses `createPortal` into `containerRef.current`. This should be fine. The ref warning likely comes from how `ModeIcon` is constructed dynamically: `const ModeIcon = info.mode === "road" ? Truck : ...` — and then `<ModeIcon className="..." />`. Lucide icons ARE `forwardRef` components so they accept refs. The issue must be elsewhere.

Re-reading line 96-109 of `MapcnHeatMap.tsx`:
```tsx
const ModeIcon = info.mode === "road" ? Truck : info.mode === "sea" ? Ship : Plane;
return (
  <div ...>
    <ModeIcon className="h-3.5 w-3.5 shrink-0" />
```

This is fine — Lucide icons support refs. The ref warning error trace says `at TransportChip ... at BuyerPopupCard ... at div ... at MapPopup`. In `MapPopup`, the wrapping div is:
```tsx
return createPortal(
  <div className="rounded-lg border bg-card...">
    {children}  // ← BuyerPopupCard is children
  </div>,
  containerRef.current
);
```

The `containerRef.current` is `document.createElement("div")` which is immediately set as `popup.setDOMContent(containerRef.current)`. When `popup.addTo(map)` is called, MapLibre appends this div to the map container DOM. React portals content into it. This should work.

**The ref warning** is a red herring for the hover issue — it's a warning, not an error. The REAL problem is that `MapPopup` is a standalone component that only works on `click` in the buyer cluster, but for Producer/Seller the hover approach using `MarkerTooltip` is broken because:

Looking at `MapMarker` again at lines 394-406:
```tsx
return (
  <MarkerContext.Provider value={{ marker: markerState, ... }}>
    {createPortal(children, elementRef.current)}
  </MarkerContext.Provider>
);
```

`MarkerTooltip` is a child of `MapMarker`. It's rendered inside the portal into `elementRef.current`. The `MarkerContext.Provider` wraps the portal call but **the portal escapes the React tree** — portalled components DO still receive context from their logical React parent. So `MarkerTooltip` DOES receive `marker` from `MarkerContext`.

**The actual issue**: `onMouseEnter` and `onMouseLeave` props on `MapMarker` are added to the element via:
```tsx
if (onMouseEnter) el.addEventListener("mouseenter", onMouseEnter);
if (onMouseLeave) el.addEventListener("mouseleave", onMouseLeave);
```

But these are **not currently passed in `MapcnHeatMap.tsx`** for Producer/Seller markers! The markers only have `longitude`, `latitude`, and children. There are NO `onMouseEnter`/`onMouseLeave` props passed.

**Meanwhile `MarkerTooltip`** attaches its own `mouseenter`/`mouseleave` to `marker.getElement()`. This SHOULD work. Let me trace the full effect chain one more time:

1. Producer `MapMarker` renders with `markerState = null`
2. `MarkerTooltip` child runs `useEffect([map, isLoaded, marker])` with `marker = null` → returns early
3. `MapMarker`'s useEffect runs → creates marker → `setMarkerState(marker)` → re-render
4. `MarkerTooltip`'s useEffect runs again with `marker = markerState` (non-null) → attaches mouseenter/mouseleave to `marker.getElement()`
5. User hovers → `show()` fires → `tooltip.setLngLat(...).addTo(map)` → popup appears
6. `createPortal(children, containerRef.current)` → renders children into the popup's DOM content

**Step 5-6 should work**. Unless... the tooltip created in step 4 doesn't have `setDOMContent` called yet at that point? Let me recheck:

```tsx
const tooltip = new maplibregl.Popup({...}).setDOMContent(containerRef.current);
const show = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
```

`setDOMContent` IS called before `show`. And `containerRef.current` already has the React content portalled into it. So this should show.

**CONCLUSION**: The likely actual issue is that `MarkerTooltip` inside a portal into the marker element has a **z-index / CSS problem** or the popup is being immediately closed by some event. OR the `mouseleave` event fires immediately after `mouseenter` because the popup DOM appears under the cursor.

The safest, most reliable fix is the **hover-state approach**: lift hover to parent state, use proven `MapPopup` for display. This eliminates all the complex portal chains.

---

## Implementation Plan

### File: `src/components/shared/MapcnHeatMap.tsx`

**Changes:**
1. Add `hoveredEntity: MapEntity | null` state and `hoveredRegion: MarketHeatMapRegion | null` state
2. Remove `<MarkerTooltip>` and `<MarkerPopup>` from all Producer and Seller `MapMarker` usages
3. Add `onMouseEnter`/`onMouseLeave` props to each `MapMarker` to set/clear the hover state
4. Add a single `<MapPopup>` for hovered entity (Producer) and hovered region (Seller) inside the `<Map>` component
5. Fix the `TransportChip` ref warning: wrap it in `React.forwardRef` so React doesn't complain when it's used inside portal contexts

### File: `src/components/ui/map.tsx`

**Changes:**
1. In `MapPopup`: add `closeOnMove={false}` and ensure the popup is removed only on explicit close, not on map clicks — currently `closeOnClick: false` is already set, which is correct
2. Ensure `MapPopup` stays open while the mouse is over it — add a small delay on `mouseLeave` (250ms debounce) so the popup doesn't vanish when the cursor moves from marker to popup content

### Technical Details

**Hover state approach in `MapcnHeatMap`:**
```tsx
const [hoveredEntity, setHoveredEntity] = useState<MapEntity | null>(null);
const [hoveredRegion, setHoveredRegion] = useState<MarketHeatMapRegion | null>(null);

// Producer markers:
<MapMarker
  key={entity.id}
  longitude={entity.geoLocation.longitude}
  latitude={entity.geoLocation.latitude}
  onMouseEnter={() => setHoveredEntity(entity)}
  onMouseLeave={() => setHoveredEntity(null)}
>
  <MarkerContent>
    <MarkerDot color="#7c3aed" icon={Factory} />
  </MarkerContent>
</MapMarker>

// Single hover popup for producer:
{mode === "producer" && hoveredEntity && (
  <MapPopup
    longitude={hoveredEntity.geoLocation.longitude}
    latitude={hoveredEntity.geoLocation.latitude}
  >
    <ProducerPopup entity={hoveredEntity} userCoords={userCoords} />
  </MapPopup>
)}
```

**Debounce on mouseleave** (prevents popup flickering):
```tsx
const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleMouseEnterEntity = (entity: MapEntity) => {
  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  setHoveredEntity(entity);
};
const handleMouseLeaveEntity = () => {
  hoverTimerRef.current = setTimeout(() => setHoveredEntity(null), 200);
};
```

**No changes to database, no new dependencies.**

### Files to Edit

| File | What Changes |
|---|---|
| `src/components/shared/MapcnHeatMap.tsx` | Replace `MarkerTooltip`+`MarkerPopup` inside markers with hover-state-driven `MapPopup`; add debounced hover handlers; fix `TransportChip` if needed |
| `src/components/ui/map.tsx` | Minor: ensure `MapPopup` has `anchor="bottom"` default so popup appears above marker not below it |
