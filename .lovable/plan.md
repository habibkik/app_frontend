

# Simplify Page Titles Across All Locale Files

## Problem
Many page titles and subtitles are overly long and verbose. For example:
- "Competitor Intelligence & Tracking" should be "Competitors"
- "Regional Supplier Heat Map" should be "Heat Map"  
- "Production Feasibility" with subtitle "Analyze production capabilities, costs, and viability" is too wordy

## Changes

All 4 locale files (en, fr, es, ar) will be updated. Here are the English changes as reference:

### Titles to Simplify

| Key Path | Current (EN) | New (EN) |
|----------|-------------|----------|
| `pages.competitors.title` | "Competitor Tracking" | "Competitors" |
| `pages.competitors.subtitle` | "Monitor competitor pricing, products, and market positioning" | "Track pricing, products & market position" |
| `pages.heatMap.regionalSupplierHeatMap` | "Regional Supplier Heat Map" | "Supplier Heat Map" |
| `pages.heatMap.viewSupplierLocations` | "View supplier locations and density by region" | "Supplier locations by region" |
| `pages.heatMap.manufacturingHeatMap` | "Manufacturing Heat Map" | "Manufacturing Map" |
| `pages.heatMap.viewCompetitorFactories` | "View competitor factories and production capacity by region" | "Factories & capacity by region" |
| `pages.heatMap.marketHeatMap` | "Market Heat Map" | "Market Map" |
| `pages.heatMap.viewDemandConcentration` | "View demand concentration and opportunities by region" | "Demand & opportunities by region" |
| `pages.feasibility.pageTitle` | "Production Feasibility" | "Feasibility" |
| `pages.feasibility.pageSubtitle` | "Analyze production capabilities, costs, and viability" | "Production costs & viability" |
| `pages.conversations.title` | "Conversations" | "Messages" |
| `pages.conversations.messagesHeader` | "Messages" | "Messages" |
| `pages.suppliers.title` | "Supplier Discovery" | "Suppliers" |
| `pages.suppliers.subtitle` | "Find suppliers by uploading a product image or browse our network" | "Upload a product image or browse suppliers" |
| `pages.componentSupply.title` | "Component Supply" | "Components" |
| `pages.componentSupply.subtitle` | "Compare suppliers and build optimal component packages" | "Compare & source components" |
| `pages.savedSuppliers.title` | "Saved Suppliers" | "Saved" |
| `pages.savedSuppliers.subtitle` | "Manage your bookmarked suppliers with notes and tags" | "Your bookmarked suppliers" |
| `pages.analytics.title` | "Analytics" | "Analytics" (no change) |
| `pages.analytics.subtitle` | "Insights and performance metrics for your sourcing activities" | "Sourcing performance & insights" |
| `pages.gtm.title` | "Go-To-Market" | "Go-To-Market" (no change) |
| `pages.gtm.subtitle` | "Plan and execute your product launch strategy" | "Product launch strategy" |
| `sellerAnalytics.title` | "Seller Analytics" | "Analytics" |
| `sellerAnalytics.subtitle` | "Performance metrics, AI insights, and MiroRL learnings" | "Performance & AI insights" |
| `socialPublisher.title` | "Social Publisher" | "Publisher" |
| `socialPublisher.subtitle` | "Compose, schedule, and publish across all your social channels." | "Schedule & publish to social channels" |
| `dailyReport.title` | "Daily Intelligence Report" | "Daily Report" |
| `products.title` | "Products" (no change) | "Products" |
| `products.subtitle` | "Manage your product catalog and pricing" | "Catalog & pricing" |

### Technical Details
- Update the same keys in all 4 locale files: `en.json`, `fr.json`, `es.json`, `ar.json`
- Only string values change; no structural or code changes needed
- The translation keys referenced in components remain the same
- Approximately 25 title/subtitle pairs across 4 files = ~100 line edits

