

# Plan: Enhance RFx Platform to World-Class AI Procurement OS

## Current State Assessment

**What already exists:**
- RFQ management (list, create, filter, sort, paginate, detail modal)
- RFQ Campaign Builder with multi-channel distribution (12 channels)
- RFQ Templates Library
- Approval Workflow (multi-stage: Manager → Director → VP → CEO)
- AI Suggestion Library (reusable procurement snippets)
- Price Forecast Panel (chart + trend insights)
- Purchase Order Generator
- Supplier Comparison Tool (risk profiles, scoring matrix)
- Supplier Scorecard (radar chart, weighted dimensions)
- Negotiation Intelligence (AI-powered via edge function)
- Competitor Analysis & monitoring
- Demand Signals page
- 26+ edge functions for AI agents

**What's missing or needs major enhancement:**
1. **No RFI/RFP/SOW generation** — only RFQ exists
2. **No AI RFx Copilot** — no natural language to document generation
3. **No Document Intelligence** — no PDF/Excel/Word parsing for requirement extraction
4. **No AI Compliance & Risk Checker** for contracts/clauses
5. **No Supplier Portal** — suppliers can't self-serve
6. **No Procurement Knowledge Brain** — no learning from past data
7. **No dedicated RFx Analytics Dashboard** with procurement-specific KPIs
8. **No Contract Generator**
9. **Vendor Response Automation** missing (smart forms, AI auto-fill)
10. **Quote Comparison Engine** is basic — needs normalization, anomaly detection

---

## Implementation Plan (Phased)

### Phase 1: AI RFx Copilot & Multi-Document Generator

**New Edge Function: `rfx-copilot/index.ts`**
- Accepts natural language description (e.g., "I need tractors 100HP for Algeria agriculture")
- Uses Lovable AI (Gemini Flash) to generate structured output via tool calling:
  - RFI document, RFP document, RFQ document, SOW, evaluation matrix, supplier invitation email
- Returns structured JSON with all document sections

**New Component: `src/components/rfqs/RFxCopilot.tsx`**
- Text input area for natural language requirement description
- "Generate RFx Package" button
- Tabs showing generated: RFI | RFP | RFQ | SOW | Evaluation Matrix | Supplier Email
- Each tab has editable rich text content, copy/download buttons
- Option to save as template or create directly as active RFQ

**New Page: `src/pages/dashboard/RFxCopilot.tsx`**
- Wraps the copilot component in DashboardLayout
- Route: `/dashboard/rfx-copilot`

**Update `CreateRFQDialog.tsx`**
- Add "AI Draft from Description" mode at the top — a textarea where user describes what they need, AI fills all form fields automatically (enhance existing `aiDrafting` state which appears to be a placeholder)

### Phase 2: Document Intelligence

**New Edge Function: `document-intelligence/index.ts`**
- Accepts uploaded file (PDF/Excel/Word via base64 or storage URL)
- Uses Lovable AI to extract: requirements, specs, compliance clauses, pricing tables
- Returns structured extraction result

**New Component: `src/components/rfqs/DocumentIntelligence.tsx`**
- Drag-and-drop file upload area
- Displays extracted data in structured cards: Requirements, Specifications, Compliance Clauses, Pricing Tables
- "Import to RFQ" button that pre-fills CreateRFQDialog
- Support for multiple files

### Phase 3: Enhanced Quote Comparison Engine

**New Component: `src/components/rfqs/QuoteComparisonEngine.tsx`**
- Replaces/enhances the basic quote table in RFQDetailModal
- Features:
  - Currency normalization (using existing CurrencyContext)
  - Line-item comparison grid
  - Price anomaly detection (highlights outliers with warnings)
  - Cost breakdown visualization (unit price, tooling, logistics, taxes)
  - Total Cost of Ownership (TCO) calculation
  - Side-by-side comparison cards with "Recommended" badge on best value
  - Export comparison report

### Phase 4: AI Compliance & Risk Checker

**New Edge Function: `compliance-checker/index.ts`**
- Analyzes RFQ/contract text against common procurement policies
- Checks: missing certifications, risky legal clauses, regulatory gaps
- Returns risk score + itemized findings

**New Component: `src/components/rfqs/ComplianceRiskChecker.tsx`**
- Input: paste contract/RFQ text or upload document
- Output: risk score gauge, categorized findings (Legal, Certifications, Regulatory, Financial)
- Each finding has severity (High/Medium/Low) and AI-suggested fix
- Integrate as a tab in RFQDetailModal

### Phase 5: Procurement Knowledge Brain

**New DB Table: `procurement_knowledge`**
- Columns: id, user_id, type (rfq/contract/policy/bid), title, content_summary, embedding_text, tags, metadata (JSONB), created_at
- RLS: users can only access their own knowledge

**New Edge Function: `procurement-knowledge/index.ts`**
- Stores summarized versions of past RFQs, contracts, bids
- When creating new RFx, queries similar past documents to suggest terms, pricing, suppliers
- Uses Lovable AI for summarization and similarity matching

**Auto-learning**: When an RFQ is awarded/closed, automatically extract key learnings (winning price, terms, supplier) and store in knowledge base

### Phase 6: RFx Analytics Dashboard

**New Page: `src/pages/dashboard/RFxAnalytics.tsx`**
- Route: `/dashboard/rfx-analytics`
- KPI Cards: Average Procurement Cycle Time, Total Savings, Supplier Win Rate, Avg Response Time, Active RFx Count
- Charts:
  - RFx by status (donut)
  - Procurement timeline trends (line)
  - Savings over time (bar)
  - Top categories by spend (horizontal bar)
  - Supplier response rate distribution
- Uses existing analytics patterns from the codebase

### Phase 7: Supplier Portal (Lightweight)

**New Page: `src/pages/SupplierPortal.tsx`**
- Public-facing page (no auth required initially, accessed via invite link with token)
- Route: `/supplier-portal/:token`
- Features:
  - View RFQ details (read-only)
  - Submit quote via structured form (smart form with field validation)
  - Upload supporting documents (certs, company profile)
  - Chat/ask clarification questions
  - Sign/accept terms

**New DB Tables:**
- `supplier_portal_invitations`: id, rfq_id, supplier_email, token, status, created_at, expires_at
- `supplier_portal_responses`: id, invitation_id, quote_data (JSONB), documents (JSONB), status, submitted_at

### Phase 8: Contract & SOW Generator

**New Edge Function: `generate-contract/index.ts`**
- Takes awarded RFQ data + winning supplier quote
- Generates contract draft with: parties, scope, pricing, payment terms, delivery, warranties, compliance, termination clauses
- Uses Lovable AI with structured tool calling

**New Component: `src/components/rfqs/ContractGenerator.tsx`**
- Triggered from RFQDetailModal when status is "awarded"
- Shows generated contract in editable sections
- Download as formatted document
- Digital signature placeholder

### Phase 9: Multi-Agent Architecture Enhancement

**Enhance `src/features/agents/index.ts`**
- Add new agent definitions:
  - **RFxWriter Agent** — wraps rfx-copilot edge function
  - **ComplianceAgent** — wraps compliance-checker
  - **PricingAgent** — wraps enhanced quote comparison logic
  - **RiskAgent** — extends existing supplier risk scoring
  - **KnowledgeAgent** — wraps procurement-knowledge

**New Component: `src/components/rfqs/AgentOrchestrator.tsx`**
- Shows active AI agents as cards with status indicators
- User can trigger individual agents or "Run All" for full autonomous pipeline
- Progress indicators for each agent step

### Navigation Updates

**Buyer mode navigation** — add under "Sourcing":
- "RFx Copilot" → `/dashboard/rfx-copilot` (Brain icon)
- "RFx Analytics" → `/dashboard/rfx-analytics` (BarChart3 icon)

**Add to RFQDetailModal tabs:**
- "Compliance" tab → ComplianceRiskChecker
- "Compare" tab → QuoteComparisonEngine (enhanced)
- "Contract" tab → ContractGenerator (when awarded)

---

## Priority Order

1. **Phase 1** (AI RFx Copilot) — highest impact, core differentiator
2. **Phase 3** (Quote Comparison Engine) — enhances existing functionality
3. **Phase 6** (RFx Analytics Dashboard) — immediate value, mostly UI
4. **Phase 4** (Compliance Checker) — premium feature
5. **Phase 2** (Document Intelligence) — enterprise value
6. **Phase 5** (Knowledge Brain) — long-term intelligence
7. **Phase 8** (Contract Generator) — workflow completion
8. **Phase 7** (Supplier Portal) — marketplace expansion
9. **Phase 9** (Multi-Agent) — architecture polish

## Technical Notes
- All AI features use Lovable AI Gateway (Gemini Flash) via edge functions
- LOVABLE_API_KEY is already available in secrets
- New DB tables need RLS policies tied to user_id
- Authentication is already in place for protected routes
- Existing currency conversion system will be reused for quote normalization

