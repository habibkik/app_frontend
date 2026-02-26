

## Add Missing Procurement Best Practices

After thorough review of the existing codebase against your comprehensive guide, here is what already exists and what needs to be added.

### Already Implemented
- RFQ creation with Incoterms, payment terms, quality standards, certifications, evaluation criteria, sample required, warranty, compliance notes
- RFQ detail modal with quote comparison, weighted scoring, timeline, activity log
- Should-cost calculator with cost breakdown (Material, Labor, Machine, Tooling, Overhead, Margin)
- Negotiation intelligence AI (generates tactics, scripts, cost drivers, supplier risks)
- Supplier scorecard with radar chart (7 dimensions)
- Supplier risk scoring (Financial, Operational, Compliance, Geopolitical)
- Supplier comparison tool (3-6 suppliers side-by-side)
- Procurement KPIs on buyer dashboard
- RFQ Campaign Builder (select suppliers, customize message, send)

### What is Missing

The following features from your guide are not yet in the platform:

---

### Planned Changes

#### 1. Enhanced RFQ Form — Missing Fields (`src/components/rfqs/CreateRFQDialog.tsx`)

Add to Tab 1 (Basics):
- **Quotation Validity** — number input (default 90 days)
- **Country of Origin** — text input
- **Packaging Requirements** — textarea
- **Labelling Requirements** — textarea

Add to Tab 2 (Requirements):
- **Required Documents** — multi-select checklist: Company Profile, Financial Statement, Certifications, References, Compliance Declaration
- **Submission Instructions** — textarea (email, format, deadline note)

Update `src/data/rfqs.ts` RFQItem type with these new fields and update mock data.

#### 2. Industry Procurement Playbook (`src/pages/dashboard/IndustryPlaybook.tsx` — new)

A comprehensive reference page with 12 industry tabs, each containing:
- **RFQ Best Practices** — industry-specific checklist of what to include
- **Negotiation Tactics** — key levers and strategies
- **Key Strategy** — the one-liner strategic focus

Industries: Manufacturing, IT/Software, Construction, Healthcare, Retail/FMCG, Energy/Utilities, Logistics, Hospitality, Financial Services, Agriculture, Chemical, Textile/Apparel.

Each tab renders as a structured card with collapsible sections. No AI needed — this is static reference content from your guide.

#### 3. Kraljic Matrix Classifier (`src/pages/dashboard/KraljicMatrix.tsx` — new)

Interactive 2x2 matrix tool:
- User inputs a purchase item name
- Two sliders: **Supply Risk** (Low to High) and **Business Impact** (Low to High)
- Item plots on a visual 2x2 grid
- Quadrant labels: Non-Critical, Leverage, Bottleneck, Strategic
- Each quadrant shows recommended strategy from your guide
- Users can add multiple items and see them all plotted
- Includes industry examples per quadrant (from your guide)

#### 4. Negotiation Playbook & Scripts Library (`src/pages/dashboard/NegotiationPlaybook.tsx` — new)

A static reference page with two sections:

**Section A — Psychological Tactics (12 tactics from your guide):**
Each as a card with title, description, example phrase, and when-to-use note:
1. The Flinch
2. Strategic Silence
3. Good Cop / Bad Cop (Internal)
4. The Nibble
5. Anchoring Power
6. Limited Budget Frame
7. Future Business Leverage
8. Controlled Concessions
9. Walk-Away Power
10. Scarcity Reversal
11. Data Dominance
12. Emotional Neutrality

**Section B — Ready-to-Use Scripts:**
Copyable script cards for each scenario: Opening, Price Too High, Anchoring Lower, Impossible Response, Trade-Off, Better Payment Terms, Competitive Pressure, Closing Summary.

**Section C — Golden Rules:**
Visual banner with the 4 golden rules and universal principles.

#### 5. Contract Clause Checklist (`src/pages/dashboard/ContractChecklist.tsx` — new)

Interactive checklist page with 15 contract clauses from your guide:
- Each clause as a collapsible card with: Name, Description, Key Points, Risk Level
- Checkbox to mark as reviewed/included
- Progress bar showing how many clauses are covered
- Clauses: Price Protection, Delivery Penalty, Quality/Inspection, Warranty, Termination, Force Majeure, Confidentiality/IP, Indemnification, Insurance, Payment Protection, Performance Bond, Dispute Resolution, Change Management, Audit Rights, ESG/Compliance
- Export summary button (copy to clipboard)

#### 6. Enhanced Negotiation Intelligence — BATNA & Cost Analysis (`src/pages/dashboard/NegotiationIntelligence.tsx`)

Add to the existing negotiation page:
- **BATNA Section** — inputs for Target Price, Walk-Away Price, and Best Alternative description
- **Should-Cost vs Quoted Gap** — when user provides should-cost estimate, show visual gap analysis bar
- **Industry Margin Benchmarks** — static reference showing average margins by industry (Manufacturing 8-15%, IT 20-40%, Distribution 5-10%)
- Pass BATNA data to the AI edge function for more targeted recommendations

#### 7. Navigation Updates (`src/features/dashboard/config/navigation.ts`)

Add to Buyer "Analysis" section:
- **Industry Playbook** (BookOpen icon)
- **Kraljic Matrix** (Grid3X3 icon)
- **Negotiation Playbook** (ScrollText icon)
- **Contract Checklist** (ClipboardCheck icon)

#### 8. Router Updates (`src/app/Router.tsx`)

Register 4 new routes:
- `/dashboard/industry-playbook`
- `/dashboard/kraljic`
- `/dashboard/negotiation-playbook`
- `/dashboard/contract-checklist`

---

### Files Modified
- `src/data/rfqs.ts` — extend RFQItem with quotationValidity, countryOfOrigin, packagingRequirements, labellingRequirements, requiredDocuments, submissionInstructions
- `src/components/rfqs/CreateRFQDialog.tsx` — add missing form fields to tabs 1 and 2
- `src/pages/dashboard/NegotiationIntelligence.tsx` — add BATNA inputs, should-cost gap, industry margins
- `src/features/dashboard/config/navigation.ts` — add 4 new nav items
- `src/app/Router.tsx` — add 4 new routes

### Files Created
- `src/pages/dashboard/IndustryPlaybook.tsx` — 12 industry-specific RFQ and negotiation reference
- `src/pages/dashboard/KraljicMatrix.tsx` — interactive purchase classification tool
- `src/pages/dashboard/NegotiationPlaybook.tsx` — psychological tactics and scripts library
- `src/pages/dashboard/ContractChecklist.tsx` — 15-clause contract review checklist

### Technical Notes
- All new pages are static reference content (no API calls needed) except the BATNA enhancement which extends the existing edge function
- Industry playbook and negotiation playbook use collapsible cards for clean organization
- Contract checklist state is managed locally with useState (persists during session)
- Kraljic matrix uses a simple SVG or positioned div grid for the 2x2 plot
- All content is sourced directly from the user's procurement guide

