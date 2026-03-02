

## Problem

MapLibre's `map.on("click", handler)` fires independently from DOM click events on markers. The `event.originalEvent.target` in that handler points to the **map canvas element**, not the marker `<div>`. This means:

1. `e.stopPropagation()` in marker click handlers has no effect on MapLibre's map click
2. The `target.closest(".maplibregl-marker")` check on line 1248 never matches because `target` is always the canvas
3. The 100ms `markerClickedRef` timeout is a race condition — unreliable across browsers/devices

## Solution (per MapLibre docs pattern)

Replace the timing-based ref guard with a **robust DOM hit-test**. Instead of checking `event.originalEvent.target` (which is always the canvas), use `document.elementsFromPoint()` to check if a marker element exists at the click coordinates. This is the reliable way to detect marker clicks from within a map-level click handler.

### Changes in `src/components/shared/MapcnHeatMap.tsx`

**1. Simplify `MapClickDismiss`** — remove `markerClickedRef` dependency, use `elementsFromPoint`:

```typescript
function MapClickDismiss({ onDismiss }: { onDismiss: () => void }) {
  const { map, isLoaded } = useMap();
  const cbRef = useRef(onDismiss);
  cbRef.current = onDismiss;

  useEffect(() => {
    if (!map || !isLoaded) return;
    const handler = (e: maplibregl.MapMouseEvent) => {
      const { clientX, clientY } = e.originalEvent;
      const els = document.elementsFromPoint(clientX, clientY);
      const hitMarker = els.some(el =>
        el.closest(".maplibregl-marker") || el.closest(".maplibregl-popup")
      );
      if (hitMarker) return;
      cbRef.current();
    };
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, isLoaded]);

  return null;
}
```

**2. Remove `markerClickedRef`** — delete the ref declaration and all references to it (~lines 955, 964-965, 971-972, 1053).

**3. Simplify marker click handlers** — remove ref manipulation, keep only state logic:

```typescript
const handleClickEntity = (entity: MapEntity, e?: MouseEvent) => {
  e?.stopPropagation();
  setDismissing(false);
  setPinnedEntity((prev) => prev?.id === entity.id ? null : entity);
};
```

Same for `handleClickRegion`.

**4. Update `<MapClickDismiss>` usage** — remove the `markerClickedRef` prop:

```tsx
<MapClickDismiss onDismiss={dismissAll} />
```

This is ~10 lines changed. `document.elementsFromPoint()` is the standard browser API that reliably detects if a marker sits under the click point, regardless of how MapLibre dispatches its events.

