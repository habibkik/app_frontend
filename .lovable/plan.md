
## RTL Sidebar: Move sidebar to the right in Arabic

### What changes
When Arabic is selected, the sidebar will automatically appear on the right side of the screen instead of the left, matching the natural RTL reading direction.

### Technical approach

**1. Update `DashboardLayout.tsx`**
- Import `useLanguage` from `LanguageContext`
- Pass `side={isRTL ? "right" : "left"}` to `DashboardSidebar`
- Reverse the flex direction when RTL using `flex-row-reverse`

**2. Update `DashboardSidebar.tsx`**
- Accept a `side` prop and pass it to the `<Sidebar>` component (which already supports `side="left" | "right"`)

**3. Update `DashboardHeader.tsx`**
- Ensure the sidebar trigger icon/position adjusts for RTL (if needed)

These are small changes -- the shadcn Sidebar component already handles right-side positioning natively via its `side` prop. We just need to wire the RTL language state to it.
