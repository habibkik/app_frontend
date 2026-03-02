

## Plan: Fix connection line and click-to-dismiss

### Root cause

Both bugs stem from the same problem: **clicking a marker fires both the marker's DOM click handler AND MapLibre's map-level `click` event**. The 50ms `markerClickedRef` timing guard is unreliable — sometimes the map click fires before the marker click, causing `dismissAll()` to immediately undo the selection.

This explains both bugs:
1. **Connection line not appearing**: `pinnedEntity` gets set by marker click, then immediately cleared by `MapClickDismiss` in the same event loop
2. **Card not closing on empty space**: The dismiss logic works in isolation, but the timing guard causes inconsistent behavior

### Fix

**Stop event propagation on marker clicks** so the map-level click event never fires when clicking a marker. This is the standard MapLibre pattern and eliminates the race condition entirely.

### Changes in `src/components/shared/MapcnHeatMap.tsx`

1. **Update `handleClickEntity`** to accept the `MouseEvent` and call `e.stopPropagation()`:
   ```ts
   const handleClickEntity = (entity: MapEntity, e?: MouseEvent) => {
     e?.stopPropagation();
     setDismissing(false);
     setPinnedEntity((prev) => prev?.id === entity.id ? null : entity);
   };
   ```

2. **Update `handleClickRegion`** similarly with `e.stopPropagation()`.

3. **Update all marker `onClick` props** to forward the event:
   ```tsx
   onClick={(e) => handleClickEntity(entity, e)}
   ```
   Applied to producer markers (~line 1105), seller region markers (~line 1137), and seller entity markers (~line 1161).

4. **Remove the `markerClickedRef`** and the 50ms timeout hack — no longer needed since propagation is stopped at the source.

5. **Simplify `MapClickDismiss`** — remove the `markerClickedRef` check since marker clicks no longer reach the map handler.

This is ~15 lines changed, no new dependencies. The connection line, distance label, and click-to-dismiss all work correctly because `pinnedEntity` is never cleared by a competing event.

