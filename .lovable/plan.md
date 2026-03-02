

## Plan: Close popup card on map click or second dot click

**Problem**: The info card (popup) that appears when clicking a supplier/factory marker stays open permanently. Clicking elsewhere on the map or on another dot doesn't dismiss it — only the small close button works.

**Fix**: Add a single `click` event listener on the map itself that clears all pinned states (`pinnedEntity`, `pinnedRegion`, `buyerSelectedPoint`) whenever the user clicks on empty map space (not on a marker). This gives natural "click anywhere to dismiss" behavior.

### Changes in `src/components/shared/MapcnHeatMap.tsx`

1. **Add a map click listener** inside the main component that fires on every map click. Use a small `useEffect` that:
   - Listens for the map's `click` event
   - Checks if the click hit any marker element (using `e.originalEvent.target` to detect if a marker `div` was clicked)
   - If the click is on empty map space → clear `setPinnedEntity(null)`, `setPinnedRegion(null)`, `setBuyerSelectedPoint(null)`
   - This naturally closes the popup card and removes the connection line

2. **Toggle behavior already works** for same-marker clicks — the existing `handleClickEntity` already toggles via `prev?.id === entity.id ? null : entity`. No change needed there.

This is a lightweight addition (~15 lines) that gives intuitive close-on-click-away behavior across all three modes.

