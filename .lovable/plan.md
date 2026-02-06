
# Auto-Convert All Prices to Selected Currency with Real Exchange Rates

## Overview
The exchange-rates backend function and `useFormatCurrency` hook are already working -- they fetch live rates and multiply amounts by the correct rate. However, many components still use hardcoded `$` with `.toLocaleString()` instead of calling the hook. This update will fix every remaining instance so that switching currency converts all amounts automatically.

## Files to Update

### 1. Seller Dashboard (`src/features/seller/pages/SellerDashboard.tsx`)
- Line 110: Static `${symbol}45,800` -- convert the raw number 45800 through `fc()`
- Line 207: `${p.revenue.toLocaleString()}` -- replace with `fc(p.revenue)`
- Add `useFormatCurrency` import and hook call

### 2. Producer Dashboard (`src/features/producer/pages/ProducerDashboard.tsx`)
- Line 186: Badge `${symbol}40K total` -- convert 40000 through `fc()` or use `symbol` with converted value
- Line 227: `${bomSummary.cost.toLocaleString()}` -- replace with `fc(bomSummary.cost)`
- Line 260: `${b.cost.toLocaleString()}` -- replace with `fc(b.cost)`
- Add `useFormatCurrency` import and hook call

### 3. Analytics Page (`src/pages/dashboard/Analytics.tsx`)
- Lines 631, 666: `${...totalSavings.toLocaleString()}` -- replace with `fc()`
- Lines 642, 677, 721: Y-axis `tickFormatter` using `$` -- use `symbol` + converted value
- Lines 646, 681, 725: Tooltip `formatter` using `$` -- use `fc()`
- Add `useFormatCurrency` and `useCurrency` imports

### 4. Supplier Card (`src/components/suppliers/SupplierCard.tsx`)
- Line 116: `${supplier.minOrderValue.toLocaleString()}` -- replace with `fc()`
- Add `useFormatCurrency` import

### 5. Supplier Detail Modal (`src/components/suppliers/SupplierDetailModal.tsx`)
- Lines 135, 377: `${supplier.minOrderValue.toLocaleString()}` -- replace with `fc()`
- Add `useFormatCurrency` import

### 6. Supplier Filters (`src/components/suppliers/SupplierFilters.tsx`)
- Lines 187-191: Hardcoded `$0`, `$50,000`, and `${filters.maxMinOrder.toLocaleString()}` -- use `symbol` prefix with converted values
- Add `useCurrency` import

### 7. Load Comparison Dialog (`src/components/components/LoadComparisonDialog.tsx`)
- Line 158: `${comparison.totalCost.toLocaleString()}` -- replace with `fc()`
- Add `useFormatCurrency` import

### 8. Save Comparison Dialog (`src/components/components/SaveComparisonDialog.tsx`)
- Line 108: `${totalCost.toLocaleString()}` -- replace with `fc()`
- Add `useFormatCurrency` import

### 9. Competitor Price Trend Chart (`src/features/seller/components/CompetitorPriceTrendChart.tsx`)
- Line 43: Custom tooltip uses raw `formatCurrency(entry.value)` without conversion -- pass `fc` to the tooltip instead

## Technical Approach
- For all React components: import `useFormatCurrency`, call `const fc = useFormatCurrency()`, replace all `$${value.toLocaleString()}` and `$${value.toFixed(2)}` with `fc(value)`
- For chart axis labels with abbreviated values (like `$12k`): use `useCurrency()` to get `symbol`, then `${symbol}${(convert(value) / 1000).toFixed(0)}k`
- The `fc()` function already handles: USD-to-target conversion via real exchange rates, proper locale formatting, and correct currency symbol
- No backend changes needed -- the exchange-rates edge function is already deployed and returning live rates

## What Will Happen After This
When you select a currency (e.g., EUR) from the dropdown:
- All prices will be multiplied by the real EUR/USD rate (currently ~0.848)
- Formatted with the correct symbol and locale rules
- Updates happen instantly across every page
