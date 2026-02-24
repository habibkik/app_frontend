

## Unified Outreach Hub with Response Tracking, Conversations Integration, and All Suppliers

### What This Does

Three major enhancements:

1. **Response Tracking**: Add `response_received`, `response_channel`, `responded_at` columns to `outreach_campaigns` table. The History tab becomes a full response tracker showing which suppliers replied and through which channel, with response status badges.

2. **Unified Conversations Page with Channel Switching**: Replace the current single-channel Conversations page with a unified inbox where all outreach responses (Email, LinkedIn, WhatsApp, SMS, etc.) are collected into one conversation per supplier. A dropdown menu at the top of each conversation lets the user switch channels while staying on the same page. Messages are tagged with their channel origin.

3. **All Suppliers in Outreach Hub**: The Outreach Hub currently only shows suppliers that have campaigns in the database. Update it to also list ALL suppliers from the Supplier Search (both `mockSuppliers` and `discoveredSuppliers`) with a "Generate Campaigns" button for suppliers that don't have campaigns yet.

### Technical Design

#### 1. Database Migration

Add response tracking columns to `outreach_campaigns`:

```sql
ALTER TABLE outreach_campaigns
  ADD COLUMN response_received text,
  ADD COLUMN response_channel text,
  ADD COLUMN responded_at timestamptz;
```

No new tables needed — responses are stored directly on the campaign row.

#### 2. Store Updates: `outreachCampaignStore.ts`

- Add `OutreachCampaign` fields: `response_received`, `response_channel`, `responded_at`
- Add `updateCampaignResponse(id, response, channel)` action to record a supplier response
- Add `prepareCampaignsForSupplier(supplier)` action for generating campaigns for a single supplier on demand

#### 3. Store Updates: `conversationsStore.ts`

- Add `channel` field to `Message` interface (default: `"email"`)
- Add `activeChannel` state to track which channel dropdown is selected per conversation
- Update `addMessage` to include channel information
- Add `setActiveChannel(conversationId, channel)` action
- When an outreach campaign gets a response, auto-create/update a conversation for that supplier with the response message tagged by channel

#### 4. Updated Conversations Page: `Conversations.tsx`

- Add a channel dropdown (Select) in the message thread header, next to the supplier name
- Options: All Channels, Email, LinkedIn, WhatsApp, SMS, Phone, Facebook, Instagram, TikTok, Twitter/X
- When a specific channel is selected, filter messages to that channel only
- Each message bubble shows a small channel badge (e.g., "via LinkedIn") below the timestamp
- Switching channels also sets the outgoing message channel

#### 5. Updated OutreachHub Page

**Prepared Campaigns tab changes:**
- Import `mockSuppliers` from `@/data/suppliers` and `discoveredSuppliers` from the store
- Merge all suppliers (mock + discovered + those already in campaigns)
- Group display: suppliers WITH campaigns show the existing `OutreachCampaignCard`; suppliers WITHOUT campaigns show a simpler card with supplier info + "Generate Campaigns" button
- "Generate Campaigns" button calls `prepareCampaigns` for that single supplier

**History tab changes:**
- Upgrade from simple list to a richer view showing:
  - Response status: "Awaiting Response" / "Responded" with colored badges
  - Response preview text when available
  - Channel through which response was received
  - Click to expand and see full response + reply directly (opens conversation)

#### 6. New Component: `OutreachSupplierDiscoveryCard.tsx`

A card for suppliers that don't have campaigns yet:
- Shows supplier name, industry, location, rating
- "Generate Outreach Campaigns" button
- Loading state while campaigns are being prepared
- Once generated, transitions to the standard `OutreachCampaignCard`

#### 7. Data Flow: `Message` type update in `data/conversations.ts`

Add optional `channel` field:
```typescript
export interface Message {
  // ...existing fields
  channel?: string; // email, linkedin, whatsapp, etc.
}
```

### Files to Create
- `src/components/outreach/OutreachSupplierDiscoveryCard.tsx` — card for suppliers without campaigns

### Files to Modify
- Database migration — add response columns to `outreach_campaigns`
- `src/stores/outreachCampaignStore.ts` — add response tracking actions and types
- `src/data/conversations.ts` — add `channel` field to Message type
- `src/stores/conversationsStore.ts` — add channel switching logic
- `src/pages/dashboard/OutreachHub.tsx` — merge all suppliers, upgrade history tab
- `src/pages/dashboard/Conversations.tsx` — add channel dropdown, channel badges on messages
- `src/components/outreach/OutreachCampaignCard.tsx` — add response status display

### Summary

One migration (3 columns), one new component, and updates to 6 existing files. After this:
- Every supplier (existing + AI-discovered) appears in the Outreach Hub
- Suppliers without campaigns get a one-click "Generate Campaigns" button
- Responses are tracked with channel info on each campaign
- The Conversations page becomes a unified multi-channel inbox with a channel-switching dropdown
- All responses from all channels appear in one place per supplier

