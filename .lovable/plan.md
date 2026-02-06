
# Auto-Navigate on Mode Switch

## What changes
When a user selects a mode from the dropdown (Buyer, Producer, or Seller), the app will automatically navigate to that mode's dedicated dashboard page.

## How
Update `ModeSelector.tsx` to use `useNavigate` from react-router-dom. When a mode is selected, after calling `setMode(modeKey)`, also call `navigate()` to the corresponding dashboard route:

- **Buyer** -> `/dashboard/buyer`
- **Producer** -> `/dashboard/producer`
- **Seller** -> `/dashboard/seller`

## Technical details

### File: `src/features/dashboard/components/ModeSelector.tsx`
- Import `useNavigate` from `react-router-dom`
- Define a route map: `{ buyer: "/dashboard/buyer", producer: "/dashboard/producer", seller: "/dashboard/seller" }`
- In the `onClick` handler for each dropdown item, add `navigate(dashboardRoutes[modeKey])` after `setMode(modeKey)`
