

## Fix: Template Preview Modal Buttons Not Working

### Root Cause Analysis

The modal renders via `createPortal` to `document.body` with `z-[100]`. The `DashboardLayout` sidebar and other UI layers may have z-index values that overlap or intercept pointer events on the modal's footer buttons. Additionally, the `backdrop-blur-md` and layered motion divs can cause pointer-event issues in some browsers.

### Plan

**File: `src/features/seller/components/website-builder/TemplatePicker.tsx`**

1. **Raise z-index** of the backdrop from `z-[100]` to `z-[9999]` to guarantee it sits above all dashboard layers (sidebar, tooltips, dropdowns).

2. **Add `pointer-events-auto`** to the footer bar and both buttons to force clickability regardless of inherited pointer-events state.

3. **Add `type="button"`** to both footer `<Button>` components to prevent any implicit form submission behavior.

4. **Restructure the modal layout**: Make the footer a sibling outside the scrollable area with explicit `shrink-0` to prevent it from being clipped or overlapped by the scroll container.

These are small, targeted CSS and attribute changes — no structural refactor needed.

