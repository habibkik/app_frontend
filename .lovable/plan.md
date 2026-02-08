

# Competitor Monitor -- Missing Features

## What Already Exists (No Changes Needed)

The Competitor Monitor is already very comprehensive with all major sections implemented:

- Header with product selector, date range picker, refresh controls, auto-refresh toggle
- 4 metric cards (Market Average, Your Price, Price Position, Competitors Found)
- Price Trend Chart with your price line, market average, price range area, hover tooltips, and annotation
- Competitor Table with rank, name, platform (12 platforms), price, 7d change, stock status, reviews, sorting, platform filtering, pagination (20/page), expandable rows with mini charts
- Price Movement Alerts with color-coded severity, timestamps, view/dismiss buttons, scrollable list
- Market Insights Panel with pricing recommendation, market statistics, availability, data quality, and actionable insights

## What Needs to Be Added

### 1. Competitor Detail Modal (from Monitor context)

The existing `CompetitorDetailModal` in `src/components/seller/CompetitorDetailModal.tsx` uses a different data type (`CompetitorData`) than the monitor's `CompetitorTableRow`. A new modal is needed that works directly with monitor data.

**New file:** `src/features/seller/components/CompetitorMonitorDetailModal.tsx`

Contents:
- Competitor name + logo avatar
- Location display
- Contact info (from `contactInfo` field on `CompetitorTableRow`)
- Current price with currency conversion via `useFormatCurrency`
- Price history chart with 7-day / 30-day toggle (using existing `priceHistory` data from the row)
- Product description (from `description` field)
- Reviews: average rating with stars + review count
- Stock level badge
- Last price update timestamp
- "Request Info" button that opens a WhatsApp link (`https://wa.me/{phone}`) or `mailto:` link based on available contact info

**Wire into CompetitorMonitor.tsx:**
- Add state for `selectedCompetitor` and `detailModalOpen`
- Pass `onViewCompetitor` callback that sets the selected competitor and opens the modal
- Render the modal at the bottom of the component

### 2. Real-Time Price Updates via Backend

Currently all data is mock. To enable real-time updates:

**Update `src/stores/competitorMonitorStore.ts`:**
- Add a `subscribeToRealtime` action that sets up a Supabase channel subscription on a future `competitor_prices` table
- For now, since the table doesn't exist yet, keep the mock data but add the subscription infrastructure as a no-op placeholder with a comment
- The existing auto-refresh via `setInterval` already works well as the primary refresh mechanism

**Update `src/features/seller/components/CompetitorMonitor.tsx`:**
- Add a toast notification when `refreshData` completes: "Competitor X price changed!" (already partially done -- just needs to check if any prices actually changed and show specific competitor names)

### 3. Minor Enhancements

**CompetitorMonitor.tsx:**
- Show toast with specific competitor name when price changes are detected during refresh (compare old vs new prices)

## Files to Create

| File | Purpose |
|---|---|
| `src/features/seller/components/CompetitorMonitorDetailModal.tsx` | Full competitor detail modal with price history chart, contact info, and request-info action |

## Files to Modify

| File | Change |
|---|---|
| `src/features/seller/components/CompetitorMonitor.tsx` | Add detail modal state management, render the new modal, enhance refresh toast to show specific competitor changes |
| `src/stores/competitorMonitorStore.ts` | Add realtime subscription placeholder, return changed competitors from `refreshData` for toast notifications |

## Technical Details

- The detail modal will use `recharts` `LineChart` for the price history (same pattern as the inline mini chart in `CompetitorTable`)
- Contact "Request Info" button will construct WhatsApp (`https://wa.me/`) or email (`mailto:`) links from the `contactInfo` field on `CompetitorTableRow`
- The 7/30 day toggle in the modal will slice the `priceHistory` array accordingly
- All prices will use `useFormatCurrency` for automatic currency conversion
- Modal will follow the same design patterns as the existing `CompetitorDetailModal` (tabs, cards, badges)

