

## Plan: Connect BOM Analysis Data Across All Producer Pages

When a BOM analysis completes (via image upload or AI analysis), the result is stored in `useAnalysisStore().producerResults`. Currently, only `BOM.tsx` and `GTM.tsx` read from this store. The other pages (Feasibility, Components, ShouldCost) use hardcoded mock data, ignoring real analysis results.

### Changes Required

#### 1. Feasibility Page (`src/pages/dashboard/Feasibility.tsx`)
- Import `useAnalysisStore` and read `producerResults`
- When `producerResults` exists, convert its `components` array to `BOMComponent[]` format and pass to `FeasibilityAnalysisComponent` instead of `mockBOMComponents`
- Replace the hardcoded `mockProjects` selector with real BOM analyses loaded from the `bom_analyses` database table
- Auto-select the latest BOM analysis as the active project
- Keep mock projects as fallback when no real data exists

#### 2. Components Page (`src/pages/dashboard/Components.tsx`)
- Import `useAnalysisStore` and read `producerResults`
- When `producerResults` exists, dynamically generate `ComponentPart[]` from the BOM components instead of using `mockComponentParts`
- Merge AI-generated parts with mock data as fallback
- Update all references to `mockComponentParts` (filters, categories, risk calculation, cost chart) to use the dynamic list

#### 3. Should-Cost Page (`src/pages/dashboard/ShouldCost.tsx`)
- Import `useAnalysisStore` and read `producerResults`
- When `producerResults` exists, auto-populate the product name, material cost per unit (from total BOM cost / volume), and volume fields
- Add an "Auto-fill from BOM" button that loads BOM data into the calculator inputs
- Show a banner when BOM data is available but not yet applied

#### 4. BOM Cost Summary (`src/components/bom/BOMCostSummary.tsx`)
- Pass `productName` from the BOM analysis to the `generate-cost-estimate` edge function instead of hardcoded "BOM Product"
- Accept an optional `productName` prop

#### 5. GTM Page (`src/pages/dashboard/GTM.tsx`)
- Already reads `producerResults` -- enhance to also pass the total BOM cost and component count to the GTM strategy generator for more accurate revenue projections

#### 6. Producer Dashboard (`src/features/producer/pages/ProducerDashboard.tsx`)
- Already loads real BOMs from DB -- enhance stats cards to show real counts from the `bom_analyses` table instead of hardcoded "18" and "342"

### Technical Approach
- All pages read from the same `useAnalysisStore` (Zustand, persisted) -- no new stores needed
- BOM components are converted to each page's expected format at the page level
- Mock data remains as fallback when no analysis has been performed
- No database or edge function changes required

