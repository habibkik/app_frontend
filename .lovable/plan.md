

## Enhance Buyer Mode with Professional Procurement Best Practices

Based on the comprehensive procurement framework you shared, here are the key enhancements to bring the buyer mode to OEM-level procurement standards.

### Current State

The buyer mode currently has:
- Basic RFQ creation (title, description, category, quantity, target price, delivery date/location)
- RFQ list with search/filter/sort
- 4-step RFQ Campaign Builder wizard
- Supplier search with AI image discovery
- Saved suppliers with tags/notes
- Basic dashboard stats and alerts

### What's Missing (mapped to best practices)

The RFQ form lacks critical procurement fields (Incoterms, payment terms, quality standards, certifications, evaluation criteria, pricing breakdown requirements). There's no structured way to compare quotes side-by-side. No supplier scorecard or risk scoring. No procurement-specific KPIs.

---

### Planned Changes

#### 1. Enhanced RFQ Data Model (`src/data/rfqs.ts`)

Extend `RFQItem` with professional procurement fields:

- `incoterm` — EXW, FOB, CIF, DDP, etc.
- `paymentTerms` — Net 30, Net 60, LC, etc.
- `qualityStandards` — ISO 9001, FDA, CE, etc. (array)
- `certificationsRequired` — specific certs needed (array)
- `evaluationCriteria` — weighted criteria: `{ criterion: string; weight: number }[]`
- `pricingBreakdownRequired` — boolean flag requesting cost transparency
- `clarificationDeadline` — date for Q&A window
- `sampleRequired` — boolean
- `warrantyTerms` — string
- `complianceNotes` — regulatory/import notes

Add new mock data reflecting these fields.

#### 2. Enhanced RFQ Creation Dialog (`src/components/rfqs/CreateRFQDialog.tsx`)

Restructure into a multi-step form (3 tabs):

**Tab 1 — Basics** (existing fields, improved):
- Title, description, category, quantity, unit, target price, currency

**Tab 2 — Requirements** (new):
- Incoterm selector (EXW / FOB / CIF / DDP / DAP)
- Payment terms selector
- Quality standards multi-select
- Certifications required multi-select
- Sample required toggle
- Warranty terms field
- Compliance notes textarea

**Tab 3 — Evaluation & Timeline** (new):
- Weighted evaluation criteria builder (add/remove rows with criterion name + weight %)
- Weight total validation (must sum to 100%)
- Clarification deadline date picker
- Submission deadline (delivery date, existing)
- Pricing breakdown required toggle
- Attachments zone (existing)

#### 3. RFQ Detail View Modal (`src/components/rfqs/RFQDetailModal.tsx` — new file)

A comprehensive modal triggered from the RFQ table "View Details" action:

- Full RFQ information display with all new fields
- **Quote Comparison Tab** — side-by-side mock quotes from suppliers with:
  - Unit price, tooling cost, MOQ, logistics, taxes
  - Lead time, payment terms offered
  - Weighted score calculation based on evaluation criteria
  - Visual bar chart comparing total scores
  - "Award" button on best quote
- **Timeline Tab** — visual timeline of RFQ lifecycle (created → clarification → submission → evaluation → award)
- **Activity Log** — mock log of events (quote received, clarification asked, etc.)

#### 4. Supplier Scorecard Component (`src/components/buyer/SupplierScorecard.tsx` — new file)

A reusable scorecard widget based on the OEM template:

- 7 dimensions: Quality (30%), Delivery (25%), Cost (20%), Innovation (10%), Responsiveness (5%), Risk (5%), Sustainability (5%)
- Radar chart visualization using Recharts
- Editable scores (1–5 scale per dimension)
- Weighted total score calculation
- Color-coded risk level (Low / Medium / High)
- Integrated into the Saved Suppliers detail view

#### 5. Enhanced Buyer Dashboard (`src/features/buyer/pages/BuyerDashboard.tsx`)

Add a new **Procurement KPIs** section with:

- RFQ Cycle Time (avg days from creation to award)
- Cost Savings vs Target Price (%)
- Supplier Response Rate (%)
- Quote Accuracy (variance vs final contract)
- Dual Sourcing Coverage (%)
- On-Time RFQ Submission Rate

These are displayed as a horizontal scrollable card row with trend indicators.

#### 6. Navigation Update (`src/features/dashboard/config/navigation.ts`)

No new pages needed — the enhancements are within existing pages (RFQs, Saved Suppliers, Buyer Dashboard).

---

### Files Modified
- `src/data/rfqs.ts` — extend RFQItem type + mock data + add Incoterms/payment terms constants
- `src/components/rfqs/CreateRFQDialog.tsx` — multi-tab form with new fields
- `src/pages/dashboard/RFQs.tsx` — wire up RFQ detail modal
- `src/features/buyer/pages/BuyerDashboard.tsx` — add procurement KPIs section

### Files Created
- `src/components/rfqs/RFQDetailModal.tsx` — full detail view with quote comparison
- `src/components/buyer/SupplierScorecard.tsx` — weighted evaluation scorecard with radar chart

### Technical Notes
- All new form fields use Zod validation with sensible defaults (optional where appropriate)
- Evaluation criteria weights validated to sum to 100%
- Quote comparison uses mock data simulating supplier responses
- Radar chart uses existing Recharts dependency
- No database changes needed — all data is local/mock for now

