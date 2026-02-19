
## Fix: Map Markers Not Showing for Buyer, Producer, and Seller Modes

### Problem Summary

Three interconnected bugs in `src/components/ui/map.tsx` prevent markers from appearing:

**Bug 1 — `setStyle` fires on every load (primary cause)**
The `useEffect` that calls `map.setStyle(getStyle(theme))` lists `isLoaded` as a dependency. When `isLoaded` first becomes `true`, this effect fires and immediately re-applies the map style — wiping all freshly added sources and layers before they can render. This is why nothing shows on initial load.

**Bug 2 — Style reload destroys cluster layers (Buyer mode)**
`MapClusterLayer` adds its GeoJSON source and circle/symbol layers inside a `useEffect([map, isLoaded])` that only runs once. When `map.setStyle()` is called (either from Bug 1 or a real theme switch), MapLibre silently removes all custom sources and layers. Because the effect never re-runs, the Buyer cluster is permanently gone.

**Bug 3 — Style reload removes custom markers (Producer + Seller modes)**
Same mechanism as Bug 2 — `MapMarker` creates its marker element once in a `useEffect([map, isLoaded])`. When style reloads, MapLibre removes all layer state but the markers (being DOM-attached) also get detached silently.

**Bug 4 — Stale `map` value in context**
`MapContext.Provider` receives `{ map: mapRef.current, isLoaded }` at render time. On first render, `mapRef.current` is `null` because the map hasn't been constructed yet. The context value is stale. Children correctly only render when `isLoaded && children`, but the `map` reference in context is captured from the closure, not the live ref.

---

### Fix Plan

**File: `src/components/ui/map.tsx`**

#### Fix 1 — Remove `isLoaded` from the `setStyle` dependency array
The theme-sync effect should only re-run when `theme` or `getStyle` changes, not when `isLoaded` flips to true. Adding a "previous theme" ref so the style is only applied when the theme actually changes (not on initial mount) prevents the immediate re-style that wipes layers.

```tsx
// BEFORE — fires on first load because isLoaded is a dep:
useEffect(() => {
  const map = mapRef.current;
  if (!map || !isLoaded) return;
  map.setStyle(getStyle(theme));
}, [theme, getStyle, isLoaded]);

// AFTER — use a ref to skip the first call, only apply on real theme changes:
const prevThemeRef = useRef<string | null>(null);
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;
  if (prevThemeRef.current === null) {
    prevThemeRef.current = theme; // record initial theme, don't call setStyle
    return;
  }
  if (prevThemeRef.current === theme) return;
  prevThemeRef.current = theme;
  map.setStyle(getStyle(theme));
}, [theme, getStyle]);
```

#### Fix 2 — Re-add cluster layers after `styledata` event (Buyer cluster)
In `MapClusterLayer`, listen for the `styledata` event which fires after every `setStyle()` call. On `styledata`, re-add the source and layers if they're missing. This keeps clusters visible after theme switches.

```tsx
useEffect(() => {
  if (!map || !isLoaded) return;

  const sid = sourceId.current;

  const addLayersAndSource = () => {
    if (map.getSource(sid)) return; // already present
    // ... add source + 3 layers as before
  };

  addLayersAndSource();

  // Re-add after style reload
  map.on("styledata", addLayersAndSource);

  return () => {
    map.off("styledata", addLayersAndSource);
    try {
      if ((map as any)._removed) return;
      if (map.getLayer(`${sid}-clusters`)) map.removeLayer(`${sid}-clusters`);
      // ... remove other layers
      if (map.getSource(sid)) map.removeSource(sid);
    } catch { /* safe to ignore */ }
  };
}, [map, isLoaded]);
```

#### Fix 3 — Fix stale `map` context value
Change the Provider to use the ref's live value so children always see the real map instance:

```tsx
// BEFORE
<MapContext.Provider value={{ map: mapRef.current, isLoaded }}>

// AFTER — introduce a separate mapState piece of state that's set when map is created
const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
// ... in init effect:
mapRef.current = map;
setMapInstance(map);
// ... in cleanup:
setMapInstance(null);

// Provider:
<MapContext.Provider value={{ map: mapInstance, isLoaded }}>
```

#### Fix 4 — Data updates for `MapClusterLayer`
Currently the cluster source data never updates when `filteredEntities` changes (filters applied). Add a `useEffect` that calls `source.setData(data)` when data changes:

```tsx
useEffect(() => {
  const map = mapRef.current;  // use local ref inside the component
  if (!map || !isLoaded) return;
  const source = map.getSource(sourceId.current) as maplibregl.GeoJSONSource | undefined;
  source?.setData(data as GeoJSON.FeatureCollection);
}, [data, isLoaded]);
```

---

### Files to Edit

| File | Change |
|---|---|
| `src/components/ui/map.tsx` | Fix `setStyle` timing (Bug 1), fix stale map context (Bug 3), add `styledata` listener in `MapClusterLayer` (Bug 2), add data-update effect in `MapClusterLayer` (Bug 4) |

No new files, no database changes, no new dependencies required.
