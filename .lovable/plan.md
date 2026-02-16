
# Internationalize All Remaining Hardcoded English Strings

## Problem
Many components across the app still use hardcoded English strings instead of translation keys (`t("...")`). When switching languages, only parts of the UI update (mainly landing pages, dashboard headers, sidebar, and settings). Large sections -- especially the Seller, Buyer, and Producer dashboards and their sub-components -- remain in English.

## Scope of Changes

### Components with hardcoded strings (no `useTranslation` at all):

**Seller features (14 files):**
- `CompetitorMetricsCards.tsx` -- "Market Average", "Your Price", "Price Position", "Competitors Found", etc.
- `CompetitorMonitorHeader.tsx` -- "Refresh", "Auto-refresh", "Refresh interval", "Select product"
- `CompetitorTable.tsx` -- "Competitor List", "Rank", "Competitor", "Platform", "Price", "7d Change", "Stock", "Reviews", "View Details", "In Stock", "Limited", "Out of Stock", etc.
- `MarketInsightsPanel.tsx` -- "Market Insights", "Pricing Recommendation", "Optimal Price", "Market Conditions", "Demand", "Supply", "Availability", "Data Quality", "Opportunities", "Threats", etc.
- `PriceMovementAlerts.tsx` -- "Price Movement Alerts", alert descriptions
- `CompetitorPriceTrendChart.tsx` -- chart labels
- `CompetitorMonitorDetailModal.tsx` -- modal labels
- `PricingOptimizerComponent.tsx` -- pricing UI labels
- `ProductsManager.tsx` -- product management labels
- `SellerAnalyticsDashboard.tsx` -- analytics labels
- `DailyReportViewer.tsx` -- report labels
- `SocialPublisher.tsx` -- publishing labels
- `PriceCollectionConfig.tsx` -- "Automation", "Active/Inactive", "Frequency", "Save Settings", "Run Now", etc.
- `CompetitorOutreach.tsx` -- "Total Outreach", "Log Outreach", "Log Response", status badges, dialog labels, etc.

**Buyer components (6 files):**
- `SupplierMatchResults.tsx`, `ImageSupplierDiscovery.tsx`, `SubstituteProducts.tsx`, `SubstituteSuppliers.tsx`, `DeliveryEstimates.tsx`, `BuyerSupplierDetailModal.tsx`

**Seller display components (6 files):**
- `CompetitorDisplay.tsx` -- "Competitive Landscape", "No Competitors Found", etc.
- `PricingRecommendation.tsx` -- "Pricing Strategy", "AI Recommended", "Margin Scenarios", etc.
- `DemandIndicators.tsx`, `ImageMarketAnalysis.tsx`, `MarketHeatMap.tsx`, `SubstituteCompetitors.tsx`

**Producer components (8 files):**
- `FeasibilityAnalysisComponent.tsx`, `CostBreakdownCards.tsx`, `ScenarioSimulator.tsx`, `MakeVsBuyCard.tsx`, `FeasibilityScoreCircle.tsx`, `FeasibilityFactorsPanel.tsx`, `RiskFactorsPanel.tsx`, `RecommendationBanner.tsx`

**Shared components (7 files):**
- `BusinessProfileCard.tsx`, `MapboxMap.tsx`, `UniversalImageUpload.tsx`, `RecommendationFeedback.tsx`, `ResultsBadge.tsx`, `AnalysisErrorDisplay.tsx`, `GlobalAnalysisIndicator.tsx`

**BOM components (6 files):**
- `BOMUploadZone.tsx`, `BOMComponentsTable.tsx`, `BOMCostSummary.tsx`, `BOMExportActions.tsx`, `BOMSupplierMatchModal.tsx`, `AIAnalysisPanel.tsx`

**Supplier components (7 files):**
- `SupplierCard.tsx`, `SupplierDetailModal.tsx`, `SupplierFilters.tsx`, `ContactSupplierModal.tsx`, `ProductSupplierContactModal.tsx`, `BulkActionsToolbar.tsx`, etc.

**Market components (5 files):**
- `MarketSearch.tsx`, `AnalysisSummaryCard.tsx`, `CompetitorAnalysisCard.tsx`, `PricingAnalysisCard.tsx`, `TrendAnalysisCard.tsx`

**Component supply (7 files):**
- `ComponentCard.tsx`, `SupplierQuoteList.tsx`, `CostComparisonChart.tsx`, `SupplyChainFlow.tsx`, `SupplyChainRiskPanel.tsx`, etc.

**Pages with hardcoded strings (15+ files):**
- `Competitors.tsx` (1755 lines, heavily hardcoded)
- `Suppliers.tsx`, `Components.tsx`, `HeatMap.tsx`, `MarketIntelligence.tsx`, `Pricing.tsx`, `Products.tsx`, `SavedSuppliers.tsx`, `Conversations.tsx`, `Analytics.tsx`, `Feasibility.tsx`, `GTM.tsx`, `WebsiteBuilder.tsx`, `DailyReport.tsx`, `SellerAnalytics.tsx`

## Implementation Plan

### Step 1: Add translation keys to `en.json`
Add new sections for all missing components (~300-400 new keys), organized by feature area:
- `competitorMonitor.*` -- all competitor tracking UI
- `competitorTable.*` -- table headers, badges, pagination
- `marketInsights.*` -- insights panel labels
- `priceAlerts.*` -- alert descriptions
- `supplierSearch.*` -- supplier discovery UI
- `bomManager.*` -- BOM analysis UI
- `componentSupply.*` -- component supply chain UI
- `feasibility.*` -- production feasibility UI
- `marketIntel.*` -- market intelligence page
- `pricing.*` -- pricing strategy page
- `products.*` -- products manager
- `heatMap.*` -- heat map page
- `shared.*` -- shared component strings

### Step 2: Mirror keys to `fr.json`, `es.json`, `ar.json`
Translate all new keys into French, Spanish, and Arabic.

### Step 3: Update all components
For each component:
1. Import `useTranslation` from `react-i18next`
2. Add `const { t } = useTranslation();`
3. Replace every hardcoded English string with `t("section.key")`

### Step 4: Update `PriceCollectionConfig.tsx` and `CompetitorOutreach.tsx`
These already have translation keys defined in `en.json` (`outreach.*` and `automation.*`) but the components don't use them. Wire up `useTranslation` and replace hardcoded strings with the existing keys.

## Technical Notes
- This is a large but mechanical change -- no logic changes, just string replacement
- All new keys follow existing naming conventions in `en.json`
- The `Competitors.tsx` page (1755 lines) is the largest file and will require the most work
- Components that receive strings as props (e.g., from API responses or store data) will keep dynamic content as-is -- only static UI labels get translated
- Due to the massive scope (~70+ files), this will be implemented in batches by feature area
