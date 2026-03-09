

## Plan: Auto-rotating tabs with hover pause for case study slider

### What changes
**Single file**: `src/components/landing/RoleCards.tsx`

Add a `useEffect` interval that cycles through the 3 tabs every 5 seconds. Track hover state on the tabbed card container — when hovered, pause the rotation. When hover ends, resume.

### Implementation details

1. Add `useEffect` with `setInterval(5000)` that advances `active` to the next role key in the `roleKeys` array (wrapping around).
2. Add `isHovered` state via `useState<boolean>(false)`. 
3. Attach `onMouseEnter` / `onMouseLeave` on the main card `div` (line 85) to toggle `isHovered`.
4. Inside the interval effect, skip advancing when `isHovered` is true. Include `isHovered` and `active` in the dependency array, clearing and re-creating the interval on each change.
5. When user manually clicks a tab, reset the timer naturally (since `active` changes trigger effect cleanup/restart).

No new files, no CSS changes, no other components affected.

