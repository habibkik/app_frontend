

# Complete Remaining i18n: All Hardcoded Strings

## Summary
There are still ~40 files with hardcoded English strings that don't update when switching languages. This plan covers every remaining file, organized by category.

## Files to Update

### Category 1: Major Dashboard Pages (15 files)
These are the page-level components with the most hardcoded strings:

| File | Hardcoded strings count (approx) |
|------|--------------------------------|
| `Competitors.tsx` (1755 lines) | ~200+ strings |
| `Suppliers.tsx` (644 lines) | ~50 strings |
| `Components.tsx` (333 lines) | ~30 strings |
| `SavedSuppliers.tsx` (761 lines) | ~60 strings |
| `HeatMap.tsx` (213 lines) | ~25 strings |
| `MarketIntelligence.tsx` (345 lines) | ~40 strings |
| `Feasibility.tsx` (258 lines) | ~30 strings |
| `Conversations.tsx` (593 lines) | ~40 strings |
| `Analytics.tsx` (898 lines) | ~50 strings |
| `GTM.tsx` (530 lines) | ~80 strings |
| `Pricing.tsx` (18 lines) | 2 strings |
| `Products.tsx` | 0 (uses sub-component) |
| `WebsiteBuilder.tsx` | ~8 strings (via PlaceholderPage) |
| `DailyReport.tsx` | 0 (uses sub-component) |
| `SellerAnalytics.tsx` | 0 (uses sub-component) |

### Category 2: Market Analysis Components (5 files)
None of these use `useTranslation`:
- `MarketSearch.tsx` -- "AI Market Analysis", "Product", "Competitors", "Trends", "Pricing", "Analyze", "Analyzing...", placeholders, quick search labels
- `AnalysisSummaryCard.tsx` -- "Analysis Summary", "Key Insights", "Sources"
- `CompetitorAnalysisCard.tsx` -- "Competitor Analysis", "Strengths", "Weaknesses", "Recent Activity", "share"
- `PricingAnalysisCard.tsx` -- "Pricing Analysis", "Recommended Price", "Market Average", "Market Price Range", "Competitor Pricing"
- `TrendAnalysisCard.tsx` -- "Market Trends", "Timeframe", "confidence"
- `AnalysisHistory.tsx` -- "Recent Analyses", "No analysis history yet", "Clear All", "Clear All History?", "Cancel"

### Category 3: Component Supply Chain (7 files)
None use `useTranslation`:
- `ComponentCard.tsx` -- "Qty:", "Selected:"
- `SupplierQuoteList.tsx` -- "Lowest", "MOQ:", "Lead time:", "In Stock", "Low Stock", "Select"
- `ComparisonSummary.tsx` -- "Build Summary", "Components Selected", "Total Estimated Cost", "Create Purchase Order", "Avg. Lead Time"
- `CostComparisonChart.tsx` -- "Cost Comparison", "No selections", "Selected"
- `SupplyChainFlow.tsx` -- "Supply Chain Overview", "Components", "Parts Required", "Suppliers", "Available", "Avg. Lead Time", "Days"
- `SupplyChainRiskPanel.tsx` -- "Supply Chain Risk", "Overall Risk Score", risk factor labels
- `ComponentSupplierDetailModal.tsx` -- modal labels
- `SaveComparisonDialog.tsx` / `LoadComparisonDialog.tsx` -- dialog labels

### Category 4: Seller Feature Components (5 files)
These don't use `useTranslation`:
- `CompetitorMonitorDetailModal.tsx` -- "Overview", "Price History", "Contact", tab labels, stock badges
- `PricingOptimizerComponent.tsx` (726 lines) -- extensive pricing UI labels
- `SellerAnalyticsDashboard.tsx` (562 lines) -- analytics labels, chart titles
- `DailyReportViewer.tsx` (289 lines) -- report section labels
- `SocialPublisher.tsx` (964 lines) -- publishing UI labels

### Category 5: Shared Components (2 files)
- `UniversalImageUpload.tsx` -- mode-specific strings like "Find Suppliers for Any Product", processing steps
- `MapboxMap.tsx` -- "No location data available", marker tooltips
- `PlaceholderPage.tsx` -- "Coming Soon", "Planned Features", "Enable Feature"

### Category 6: Supplier Modals (2 files)
- `SupplierNotesTagsModal.tsx` -- "Notes & Tags", "Save", suggested tag labels
- `BulkTagAssignModal.tsx` -- "Assign Tags", suggested tags, buttons

## Implementation Approach

### Step 1: Add ~400 new translation keys to `en.json`
Organized into sections:
- `pages.competitors.*`, `pages.suppliers.*`, `pages.components.*`, `pages.savedSuppliers.*`
- `pages.heatMap.*`, `pages.marketIntel.*`, `pages.feasibility.*`, `pages.conversations.*`
- `pages.analytics.*`, `pages.gtm.*`, `pages.pricing.*`, `pages.websiteBuilder.*`
- `market.*` (MarketSearch, AnalysisSummary, CompetitorAnalysis, PricingAnalysis, TrendAnalysis, AnalysisHistory)
- `componentSupply.*` (ComponentCard, SupplierQuoteList, ComparisonSummary, CostComparison, SupplyChainFlow, SupplyChainRisk)
- `competitorDetail.*` (CompetitorMonitorDetailModal)
- `pricingOptimizer.*` (PricingOptimizerComponent)
- `sellerAnalytics.*` (SellerAnalyticsDashboard)
- `dailyReport.*` (DailyReportViewer)
- `socialPublisher.*` (SocialPublisher)
- `imageUpload.*` (UniversalImageUpload)
- `supplierModals.*` (SupplierNotesTagsModal, BulkTagAssignModal)
- `placeholder.*` (PlaceholderPage)

### Step 2: Mirror all keys to `fr.json`, `es.json`, `ar.json`
Translate all new keys into French, Spanish, and Arabic.

### Step 3: Update all ~40 files
For each file:
1. Add `import { useTranslation } from "react-i18next";`
2. Add `const { t } = useTranslation();`
3. Replace every hardcoded string with `t("section.key")`

Due to the large scope, this will be implemented in batches:
- **Batch 1**: Market components + Component Supply chain (12 files)
- **Batch 2**: Major pages (Suppliers, Components, HeatMap, Feasibility, Pricing, Conversations)
- **Batch 3**: Large pages (Competitors, SavedSuppliers, Analytics, GTM)
- **Batch 4**: Seller components (PricingOptimizer, SellerAnalytics, DailyReport, SocialPublisher, CompetitorDetailModal)
- **Batch 5**: Shared components + modals (UniversalImageUpload, MapboxMap, PlaceholderPage, SupplierNotesTagsModal, BulkTagAssignModal)

## Notes
- `Competitors.tsx` at 1755 lines is the single largest file and will require the most work
- Static mock data strings (company names, addresses) will remain in English as they represent real-world data
- Toast messages throughout all pages will also be translated
- Processing step strings in `UniversalImageUpload` will be translated per mode

