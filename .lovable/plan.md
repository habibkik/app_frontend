

## Enhance Outreach Hub with Professional Best Practices

### Gap Analysis

**Already implemented:**
- Single-touch campaign generation across 9 channels
- Automation rules (product/channel/interval/max runs)
- History tab with response tracking
- Channel message editor with per-channel character limits
- Approve/approve-all workflow
- AI-generated messages via backend function

**Missing from the guide (to be added):**

---

### Planned Changes

#### 1. Campaign Objective Selector (`src/components/outreach/CampaignObjectiveSelector.tsx` -- new)

Add an objective picker at the top of the Campaigns tab. Options:
- **Supplier Sourcing** -- Find and qualify new suppliers
- **Contract Renewal Leverage** -- Create competitive pressure before renegotiation
- **Dual Sourcing** -- Find backup supplier
- **ESG Compliance** -- Request updated certifications
- **RFQ Follow-up** -- Follow up on sent RFQs
- **General Inquiry** -- Custom outreach

The selected objective is passed to the AI edge function to tailor message tone and content. Displayed as a row of selectable cards with icon, title, and one-line description.

#### 2. Multi-Step Sequence Builder (`src/components/outreach/SequenceBuilder.tsx` -- new)

Replace the current single-message-per-channel approach with a multi-step sequence timeline. Each supplier campaign becomes a **sequence** of 5-7 touches across multiple days:

- Visual timeline showing Day 1, 3, 5, 8, 12, 16 with channel icons
- Each step shows: day number, channel, message preview, status (pending/sent/replied)
- Users can add/remove/reorder steps
- Default sequence auto-generated based on selected objective

The `OutreachCampaign` store type gets a new `sequence_step` (number) and `scheduled_day` (number) field. Campaigns for the same supplier are grouped into a sequence and ordered by `scheduled_day`.

#### 3. Sequence Templates Library (`src/components/outreach/SequenceTemplatesPanel.tsx` -- new)

A modal/drawer with pre-built sequence templates from the guide:

- **Supplier Sourcing (15-18 days, 6 touches)**: Email → LinkedIn → Follow-up Email → Phone → Value Add Email → Breakup Email
- **Contract Renewal Leverage**: Soft market check email → competitor benchmarking → LinkedIn touch
- **ESG Compliance**: Certification request → reminder → escalation
- **Dual Sourcing**: Capability inquiry → qualification → RFQ

Each template shows: name, description, timeline visualization, touch count, duration. Users click "Apply Template" to populate the sequence for selected suppliers.

#### 4. Outreach KPI Dashboard (`src/components/outreach/OutreachMetricsDashboard.tsx` -- new)

New **Metrics** tab on the Outreach Hub with:

**Top Funnel Cards:**
- Campaigns Sent (total)
- Open Rate (target: 45-65%)
- Bounce Rate (target: <3%)

**Engagement Cards:**
- Reply Rate (target: 8-20%)
- Positive Reply Rate
- LinkedIn Acceptance Rate (target: >30%)

**Conversion Cards:**
- Meetings Booked
- Qualified Suppliers
- RFQs Sent

**Performance Table:**
A summary table: Metric | Target | Actual | Status (green/amber/red badges)

Data is computed from existing campaign statuses. Metrics like open rate use simulated values since actual email tracking is not integrated, but the structure is ready for real data.

#### 5. Channel Strategy Guide (`src/components/outreach/ChannelStrategyGuide.tsx` -- new)

A collapsible reference panel (accessible via an info button) showing best practices per channel from the guide:

| Channel | Best For | Avoid |
|---------|----------|-------|
| Email | Formal qualification, RFQ | Long messages |
| LinkedIn | First touch | Hard selling |
| WhatsApp | Follow-up | Cold outreach |
| SMS | Reminder | Prospecting |
| Phone | Fast decision | Unprepared calls |
| Facebook | Research | Negotiation |
| Instagram | Verification | Formal RFQ |
| TikTok | Intelligence | Business negotiation |

Plus key rules: 3-6 lines max, one CTA, personalization line, follow-up 3-5 days later.

#### 6. Personalization Score Badge (`src/components/outreach/PersonalizationScore.tsx` -- new)

A small badge on each campaign message showing a personalization score (0-100%):
- Checks for: recipient name, company name, industry reference, specific detail, single CTA
- Color coded: Red (<40%), Amber (40-70%), Green (>70%)
- Tooltip shows which personalization elements are present/missing

#### 7. Supplier Tier Classification

Add a tier selector on the `OutreachSupplierDiscoveryCard`:
- **Tier A - Strategic**: Executive-level intro sequence
- **Tier B - Operational**: Procurement-led outreach
- **Tier C - Backup**: Automated sequence

The tier determines which default sequence template is applied and the level of personalization expected. Stored locally in component state.

#### 8. Psychology Triggers Reference (`src/components/outreach/PsychologyTriggersPanel.tsx` -- new)

A small expandable panel within the Campaigns tab header showing quick-reference psychological triggers with copyable example phrases:
- **Curiosity**: "Are you currently supplying [industry] companies in [region]?"
- **Scarcity**: "We are shortlisting 3 suppliers for long-term partnership."
- **Authority**: "Our procurement team is conducting a structured sourcing program."
- **Social Proof**: "We are currently working with suppliers in [region] and expanding."

Each trigger has a "Copy" button to paste into message editors.

#### 9. Edge Function Enhancement (`supabase/functions/prepare-outreach-campaigns/index.ts`)

Update the AI prompt to accept:
- `objective` (sourcing/renewal/esg/dual/rfq-followup/general)
- `sequenceTemplate` (template ID to follow)
- `supplierTier` (A/B/C)

Generate multi-step sequences instead of single messages. Return an array with `scheduled_day` and `sequence_step` for each message. Use the guide's exact template structures for each objective type.

#### 10. Outreach Hub Page Updates (`src/pages/dashboard/OutreachHub.tsx`)

- Add **Metrics** tab alongside Campaigns, Automation, History
- Add Campaign Objective selector above the supplier list
- Add "Templates" button opening the SequenceTemplatesPanel
- Add "Channel Guide" info button opening the strategy reference
- Add Psychology Triggers expandable section
- Group campaigns by supplier AND show them as a timeline sequence rather than flat list
- Add tier badges next to supplier names

---

### Files Modified
- `src/pages/dashboard/OutreachHub.tsx` -- add Metrics tab, objective selector, templates button, channel guide trigger, psychology triggers panel, sequence timeline grouping
- `src/stores/outreachCampaignStore.ts` -- add `sequence_step`, `scheduled_day`, `objective`, `supplier_tier` to OutreachCampaign type; update `prepareCampaigns` to accept objective/tier params
- `src/components/outreach/OutreachCampaignCard.tsx` -- render campaigns as sequence timeline instead of flat list; add personalization score badge
- `src/components/outreach/OutreachSupplierDiscoveryCard.tsx` -- add tier selector dropdown
- `supabase/functions/prepare-outreach-campaigns/index.ts` -- accept objective/tier/template params; generate multi-step sequences with scheduled_day

### Files Created
- `src/components/outreach/CampaignObjectiveSelector.tsx` -- objective picker cards
- `src/components/outreach/SequenceBuilder.tsx` -- multi-step sequence timeline component
- `src/components/outreach/SequenceTemplatesPanel.tsx` -- pre-built template library modal
- `src/components/outreach/OutreachMetricsDashboard.tsx` -- KPI dashboard with metrics cards and performance table
- `src/components/outreach/ChannelStrategyGuide.tsx` -- channel best practices reference panel
- `src/components/outreach/PersonalizationScore.tsx` -- personalization score badge component
- `src/components/outreach/PsychologyTriggersPanel.tsx` -- copyable psychology trigger phrases

### Database Changes
- Add columns to `outreach_campaigns` table: `sequence_step` (integer, default 1), `scheduled_day` (integer, default 1), `objective` (text, nullable), `supplier_tier` (text, nullable)

### Technical Notes
- All new reference panels (Channel Strategy Guide, Psychology Triggers, Templates) are static content from the user's guide -- no API calls needed
- KPI metrics are computed from existing campaign data (status counts) with placeholder targets
- The multi-step sequence is backwards-compatible: existing single-touch campaigns render as step 1 of a 1-step sequence
- Personalization scoring runs client-side by checking for name/company/industry tokens in the message text
- Supplier tier is stored on the campaign record so the edge function can tailor AI output accordingly

