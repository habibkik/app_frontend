
# Connect All Remaining Price Displays to Currency Context

## Overview
Many components still use hardcoded `$` symbols with `.toFixed(2)` instead of the `useFormatCurrency` hook. This plan updates every remaining file so that switching currency in the profile dropdown updates prices everywhere automatically.

## Files to Update

### 1. `src/features/seller/components/CompetitorTable.tsx`
- Lines 266, 331: Replace `$${competitor.currentPrice.toFixed(2)}` and `$${metrics.yourPrice.toFixed(2)}` with `fc(...)` calls
- Add `useFormatCurrency` import and hook call

### 2. `src/features/seller/components/CompetitorPriceTrendChart.tsx`
- Line 41: Replace `$${entry.value.toFixed(2)}` in tooltip with `fc(entry.value)`
- Add `useFormatCurrency` import and hook call

### 3. `src/features/seller/components/CompetitorMetricsCards.tsx`
- Lines 22, 37: Replace `$${metrics.marketAverage.toFixed(2)}` and `$${metrics.yourPrice.toFixed(2)}` with `fc(...)` calls
- Add `useFormatCurrency` import and hook call

### 4. `src/features/seller/components/PriceMovementAlerts.tsx`
- Lines 66-70: Replace hardcoded `$` in alert message strings with `fc(...)` calls
- Add `useFormatCurrency` import and hook call

### 5. `src/features/seller/components/MarketInsightsPanel.tsx`
- Lines 103, 126, 151, 156, 161, 166: Replace all `$${...toFixed(2)}` with `fc(...)` calls (optimal price, adjustment, median, range, std deviation, suggested range)
- Add `useFormatCurrency` import and hook call

### 6. `src/features/producer/components/RecommendationBanner.tsx`
- Line 37: Replace `$${totalCostPerUnit.toFixed(2)}` in subtitle string with formatted value
- Add `useFormatCurrency` import and hook call

### 7. `src/pages/dashboard/BOM.tsx`
- Lines 401, 474: Replace `$${...toFixed(2)}` in AI analysis attributes and ComponentCard price display with `fc(...)` calls
- Add `useFormatCurrency` import and hook call

### 8. `src/pages/Dashboard.tsx`
- Lines 25, 31, 37: Hardcoded stat values like `"$12.4K"`, `"$84.2K"`, `"$45.8K"` -- these are static display strings. Replace `$` prefix with the currency symbol from context.
- Add `useCurrency` import to get the symbol

### 9. `src/features/seller/pages/SellerDashboard.tsx`
- Line 108: Replace `"$45,800"` with currency-symbol-prefixed value
- Add `useCurrency` import

### 10. `src/features/producer/pages/ProducerDashboard.tsx`
- Line 186: Replace `$40K total` badge with currency-symbol-prefixed value
- Add `useCurrency` import

### 11. `src/components/landing/ProducerInteractiveDemo.tsx`
- Line 427: Replace `$${component.unitCost.toFixed(2)}` with `fc(...)` call
- Add `useFormatCurrency` import and hook call

### 12. `src/features/seller/utils/competitorTypeConverters.ts`
- Lines 268-272: This is a pure utility function (not a React component), so it cannot use hooks. Refactor `getDefaultAlertMessage` to accept a formatter function parameter, or use `formatCurrency` directly with a currency parameter passed in.

## Approach
- For React components: import `useFormatCurrency`, call `const fc = useFormatCurrency()`, replace all `$${value.toFixed(2)}` with `fc(value)`
- For static display values (like `"$12.4K"`): use `useCurrency()` to get the symbol and prefix it
- For non-React utility functions: accept a formatter callback or currency code parameter

## Files not changed
- Landing pages (`BuyersPage.tsx`, `SellersPage.tsx`, `Hero.tsx`) -- these are marketing pages with static illustrative values, not real data
- `GTM.tsx` -- static mock revenue data for a demo page
