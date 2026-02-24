

## Auto-Outreach & RFQ Campaign Hub

### What This Does
When suppliers are detected (via AI image analysis or browsing), the system automatically prepares outreach campaigns across **every available channel** for each supplier. A new dedicated page (`/dashboard/outreach-hub`) displays all prepared campaigns in a review-ready format. Users can modify messages, validate, and launch campaigns with one click. Automation settings let users control how often campaigns repeat per product and per platform.

### Technical Design

#### 1. New Database Table: `outreach_campaigns`

Stores each prepared campaign message per supplier per channel:

```text
outreach_campaigns
├── id (uuid, PK)
├── user_id (uuid, NOT NULL)
├── supplier_id (text, NOT NULL)       -- links to supplier ID
├── supplier_name (text, NOT NULL)
├── product_name (text)
├── channel (text)                     -- email, linkedin, whatsapp, sms, phone_call, facebook, instagram, tiktok, twitter
├── message (text)                     -- AI-generated draft message
├── subject (text)                     -- for email channel
├── status (text, default 'draft')     -- draft | approved | sent | paused
├── auto_repeat (boolean, default false)
├── repeat_interval_hours (integer, default 24)
├── max_auto_runs (integer, default 1)
├── runs_completed (integer, default 0)
├── last_sent_at (timestamptz)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

RLS: standard user-scoped policies (SELECT/INSERT/UPDATE/DELETE where `auth.uid() = user_id`).

#### 2. New Database Table: `outreach_automation_rules`

Stores per-product, per-platform automation settings:

```text
outreach_automation_rules
├── id (uuid, PK)
├── user_id (uuid, NOT NULL)
├── product_name (text, NOT NULL)
├── channel (text, NOT NULL)
├── enabled (boolean, default true)
├── max_runs (integer, default 3)
├── interval_hours (integer, default 24)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

RLS: same user-scoped policies.

#### 3. New Zustand Store: `src/stores/outreachCampaignStore.ts`

- Holds campaign drafts in-memory before DB persistence
- `generateCampaignsForSuppliers(suppliers[])` -- creates draft messages for each supplier across all channels
- `approveCampaign(id)` / `approveAll()` / `editMessage(id, newMessage)`
- `setAutomation(productName, channel, config)` -- set repeat rules

#### 4. New Page: `src/pages/dashboard/OutreachHub.tsx`

Layout with 3 tabs:

**Tab 1 - Prepared Campaigns** (default)
- Grouped by supplier, showing a card per supplier
- Each card lists all channels (email, LinkedIn, WhatsApp, SMS, phone call, Facebook, Instagram, etc.) with the AI-drafted message
- Inline edit button to modify each message
- Per-message "Approve" button + bulk "Approve All & Send" button
- Status badges (Draft / Approved / Sent)
- Channel icons for visual clarity

**Tab 2 - Automation Rules**
- Table/grid of rules per product + platform
- Toggle enabled/disabled
- Set max number of automatic runs
- Set interval (every X hours)
- "Add Rule" dialog

**Tab 3 - Campaign History**
- List of all sent campaigns with timestamps, statuses, and response tracking

#### 5. New Component: `src/components/outreach/OutreachCampaignCard.tsx`

Renders a single supplier's outreach campaigns:
- Supplier name, location, match score badge
- Channel rows with: icon | channel name | editable message textarea | status badge | approve button
- Expandable/collapsible design

#### 6. New Component: `src/components/outreach/AutomationRulesPanel.tsx`

- Displays and manages per-product per-platform automation settings
- Slider for interval hours, number input for max runs
- Toggle switches for each channel

#### 7. New Component: `src/components/outreach/ChannelMessageEditor.tsx`

- Inline message editor with template variable support
- Character count
- Channel-specific formatting hints (e.g., SMS max 160 chars)

#### 8. Integration with Supplier Detection Flow

In `src/pages/dashboard/Suppliers.tsx`, after `addFromAnalysis()` completes (line 68-75), trigger automatic campaign preparation:
- Call a function that generates draft messages for each detected supplier across all channels
- Show a toast notification with a link: "Outreach campaigns prepared → Review now"
- The link navigates to `/dashboard/outreach-hub`

#### 9. AI Message Generation (Edge Function Enhancement)

Enhance the existing `auto-outreach` edge function OR create a new `prepare-outreach-campaigns` edge function that:
- Takes supplier list + product info
- Uses Lovable AI (Gemini Flash) to generate channel-appropriate messages:
  - Email: formal, with subject line
  - LinkedIn: professional networking tone
  - WhatsApp: conversational, concise
  - SMS: ultra-short, 160 char max
  - Phone call: script/talking points
  - Social media: platform-appropriate tone
- Returns structured JSON with messages per channel per supplier
- Saves drafts to `outreach_campaigns` table

#### 10. Navigation Update

Add "Outreach Hub" to buyer navigation in `src/features/dashboard/config/navigation.ts`:
```text
Sourcing group:
  ...existing items...
  + Outreach Hub → /dashboard/outreach-hub (icon: Send)
```

Add route in `src/app/Router.tsx`.

#### 11. Channel Coverage

All channels prepared for each supplier:

| Channel | Message Style | Max Length |
|---|---|---|
| Email | Formal with subject | 2000 chars |
| LinkedIn | Professional networking | 500 chars |
| WhatsApp | Conversational | 500 chars |
| SMS | Ultra-brief | 160 chars |
| Phone Call | Script/talking points | 1000 chars |
| Facebook | Social inquiry | 500 chars |
| Instagram | DM style | 500 chars |
| TikTok | Casual business | 300 chars |
| Twitter/X | Short pitch | 280 chars |

### Files to Create
- `supabase/functions/prepare-outreach-campaigns/index.ts` -- AI message generation
- `src/stores/outreachCampaignStore.ts` -- state management
- `src/pages/dashboard/OutreachHub.tsx` -- main page
- `src/components/outreach/OutreachCampaignCard.tsx` -- supplier campaign card
- `src/components/outreach/AutomationRulesPanel.tsx` -- automation settings
- `src/components/outreach/ChannelMessageEditor.tsx` -- inline editor

### Files to Modify
- `src/features/dashboard/config/navigation.ts` -- add nav item
- `src/app/Router.tsx` -- add route
- `src/pages/dashboard/Suppliers.tsx` -- trigger campaign prep after detection
- Database migration for 2 new tables

