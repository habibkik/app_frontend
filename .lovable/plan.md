

## Gap Analysis: Handbook vs Current Producer Mode

### Already Implemented
- AI-powered BOM detection from images
- Component cost estimation and supplier matching
- Supply chain risk scoring (lead time, single-supplier, geographic)
- Production feasibility analysis with Make vs Buy
- Should-Cost Model calculator
- Kraljic Matrix (Buyer mode)
- Contract Checklist (Buyer mode)
- Scenario simulator for cost modeling

### Missing Features to Add

The following 7 features close the biggest gaps between the handbook and the current Producer mode.

---

#### 1. Product Architecture Classifier (`src/components/bom/ProductArchitectureSelector.tsx` -- new)

Add a selector at the top of the BOM page (before analysis results) where the user classifies the product architecture:
- **Modular** -- Replaceable modules, easier supplier swaps
- **Integrated** -- Tight mechanical/electrical integration
- **Platform-based** -- Shared sub-assemblies across SKUs
- **Configurable** -- Variants driven by options

Each option shows impact on: complexity, supplier count, risk exposure, inventory model. Stored in component state and displayed as a badge on the BOM results header.

#### 2. BOM Type Selector & Views (`src/components/bom/BOMTypeSelector.tsx` -- new)

Add a tab bar or segmented control within the BOM results section for 4 BOM views:
- **EBOM** (Engineering) -- Shows: designed parts, material specs, tolerances, finish requirements
- **MBOM** (Manufacturing) -- Adds: process consumables, packaging, labels, fixtures, sub-assembly grouping
- **CBOM** (Costed) -- Shows: unit cost, tooling amortization, MOQ pricing tiers, currency
- **Service BOM** -- Shows: replaceable components, service kits, repair consumables

Each view filters/augments the existing BOM components with additional columns relevant to that BOM type. CBOM is essentially the current default view. MBOM and Service BOM add extra "supplementary items" rows (packaging, labels, fixtures, spare kits) with editable fields.

#### 3. BOM Completeness Checklist (`src/components/bom/BOMCompletenessChecklist.tsx` -- new)

A collapsible checklist panel on the BOM results page. 14 categories from the handbook:
- Mechanical parts, Electronic components, Fasteners, Adhesives & tapes, Surface treatments, Coatings, Labels & regulatory marks, Firmware programming, Packaging (primary/secondary/master carton), Manuals, Inserts, Testing consumables, Shipping protection materials

Each item is a checkbox. The panel auto-checks items that match detected BOM component categories. Shows a completion percentage bar. Unchecked items are flagged as "potentially missing."

#### 4. Component Risk Classification (Kraljic per BOM Item) (`src/components/bom/BOMRiskClassification.tsx` -- new)

For each BOM component, auto-classify into one of 4 Kraljic quadrants based on:
- **Supply Risk** = f(matchedSuppliers, alternatives) -- fewer suppliers = higher risk
- **Business Impact** = f(totalCost / totalBOMCost) -- higher cost share = higher impact

Display as:
- A color-coded badge on each component row (Strategic / Leverage / Bottleneck / Commodity)
- A mini Kraljic scatter plot showing all BOM components plotted
- Sourcing strategy recommendation per quadrant (from the handbook)

#### 5. DFM/DFA Review Checklist (`src/pages/dashboard/DFMReview.tsx` -- new page)

A new page under Producer mode navigation: "DFM/DFA Review"

**DFM Section** (Design for Manufacturing):
- Can parts be molded without side actions?
- Can tolerance stack be relaxed?
- Can secondary operations be eliminated?
- Are standard materials used?
- Are standard fastener sizes used?

**DFA Section** (Design for Assembly):
- Can screw count be reduced?
- Can orientation constraints be minimized?
- Can snap fits replace screws?
- Are fasteners standardized?

Each item is a yes/no/NA toggle with a notes field. Shows an overall DFM score and DFA score. Includes a "Standardization Opportunities" section listing components that could use standard alternatives.

#### 6. Supplier Ecosystem Map (`src/components/bom/SupplierEcosystemMap.tsx` -- new)

A visual dashboard showing the complete supplier network needed for a product, organized into 7 categories from the handbook:

- **A. Direct Materials** -- Injection molders, PCB manufacturers, PCBA assemblers, metal fabricators, etc.
- **B. Tooling & Industrialization** -- Mold makers, jig/fixture manufacturers, automation integrators
- **C. Finishing** -- Coating, anodizing, painting, laser marking
- **D. Certification & Compliance** -- EMC testing labs, safety certification, regulatory consultants
- **E. Packaging** -- Carton manufacturers, foam suppliers, label suppliers
- **F. Logistics** -- Freight forwarders, customs brokers, 3PL, fulfillment
- **G. Digital** -- ERP, PLM, supplier portal

Each category shows: count of identified suppliers, count needed, status (covered/gap). Components from the BOM are mapped to required supplier categories. Gaps are highlighted in red. Users can mark categories as "covered" or "needs sourcing."

#### 7. Dual-Source Strategy Panel (`src/components/bom/DualSourcePanel.tsx` -- new)

An expandable panel on the BOM results page for strategic/bottleneck components. For each component classified as Strategic or Bottleneck:
- Shows current supplier count
- Recommendation: "Dual-source recommended" or "Design drop-in alternative"
- Fields for: Primary supplier, Backup supplier, Design compatibility (drop-in / requires modification)
- Safety stock recommendation based on lead time
- Visual indicator: single-source (red), dual-source (green), under evaluation (amber)

---

### Navigation & Routing Updates

**Producer mode navigation** (`src/features/dashboard/config/navigation.ts`):
- Add "DFM/DFA Review" under Production group

**Router** (`src/app/Router.tsx`):
- Add route for `/dashboard/dfm-review`

**BOM Page** (`src/pages/dashboard/BOM.tsx`):
- Add Product Architecture selector above upload
- Add BOM Type selector tabs in results
- Add BOM Completeness Checklist as collapsible sidebar panel
- Add Kraljic risk badges to component table rows
- Add Supplier Ecosystem Map as new results tab
- Add Dual-Source Strategy as new results tab

---

### Files Created
- `src/components/bom/ProductArchitectureSelector.tsx`
- `src/components/bom/BOMTypeSelector.tsx`
- `src/components/bom/BOMCompletenessChecklist.tsx`
- `src/components/bom/BOMRiskClassification.tsx`
- `src/components/bom/SupplierEcosystemMap.tsx`
- `src/components/bom/DualSourcePanel.tsx`
- `src/pages/dashboard/DFMReview.tsx`

### Files Modified
- `src/pages/dashboard/BOM.tsx` -- integrate architecture selector, BOM types, completeness checklist, risk badges, ecosystem map tab, dual-source tab
- `src/features/dashboard/config/navigation.ts` -- add DFM/DFA Review to Producer navigation
- `src/app/Router.tsx` -- add DFM review route
- `src/data/bom.ts` -- extend BOMComponent with `kraljicQuadrant`, `bomLevel`, `riskClassification` fields

### Technical Notes
- All features are client-side with static reference data from the handbook -- no new API calls or database tables required
- Kraljic classification is computed automatically from existing `matchedSuppliers`, `alternatives`, and cost ratio data
- BOM types are view filters over the same component data, with MBOM/Service adding supplementary placeholder rows
- Ecosystem map categories are static; supplier counts come from existing `matchedSuppliers` aggregated by component category

