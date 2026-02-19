

## Change Map Markers from Hover to Click-Only

Since hover popups aren't working reliably, we'll simplify to click-only interaction. Clicking a marker opens the popup with a close button; clicking another marker switches to that one.

### Changes to `src/components/shared/MapcnHeatMap.tsx`

1. **Remove all hover state and handlers**: Delete `hoveredEntity`, `hoveredRegion`, `hoverTimerRef`, and all `handleMouseEnter*` / `handleMouseLeave*` functions
2. **Remove hover-related props from markers**: Remove `onMouseEnter` and `onMouseLeave` from all `MapMarker` components (Producer and Seller)
3. **Remove hover popup blocks**: Delete the "PRODUCER hover popup" and "SELLER hover popup" `MapPopup` sections
4. **Update click handlers**: Simplify `handleClickEntity` and `handleClickRegion` to just toggle the pinned state (already does this, just removing the hover-clear line)
5. **Keep pinned popups as-is**: The existing pinned popup blocks (with close button) remain and become the only popup mechanism

### What stays the same
- Pinned popup behavior (click to open, close button to dismiss, click same pin to toggle)
- Pulsing ring animation on active/pinned markers
- FlyTo behavior from grid cards
- User location blue dot
- All buyer cluster layer behavior

### Technical detail
The net result is removing roughly 30 lines of hover code and keeping only the click-driven pinned popup system that's already working.

