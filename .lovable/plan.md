

## Auto-Create Conversations When Campaigns Are Approved

### Problem
When a campaign is approved in the Outreach Hub, no conversation is created in the Conversations page. Users have to manually navigate and create conversations.

### Solution
When a campaign (or batch of campaigns) is approved, automatically create or update conversations in the conversations store with the outreach messages, tagged by channel.

### Changes

#### 1. `src/stores/conversationsStore.ts` — Add `addOutreachMessage` method

Add a new action to the interface and implementation:

```typescript
addOutreachMessage: (supplierId, supplierName, message, channel, productName) => void;
```

Implementation logic:
- Check if a conversation already exists for that `supplierId`
- If yes: append the message to that conversation with the correct channel tag
- If no: create a new `Conversation` object with the supplier info, add the message as the first message, and prepend it to the conversations list
- The message is marked as `isOwn: true` (outgoing outreach) with the campaign channel

The supplier logo will be derived from the first two letters of the supplier name (e.g., "TP" for "TechParts").

#### 2. `src/stores/outreachCampaignStore.ts` — Wire approve actions to conversations

Import `useConversationsStore` and call `addOutreachMessage` after each successful approval:

**`approveCampaign`**: After setting status to "approved", find the campaign data and call:
```typescript
const conv = useConversationsStore.getState();
conv.addOutreachMessage(campaign.supplier_id, campaign.supplier_name, campaign.message, campaign.channel, campaign.product_name);
```

**`approveAll`**: After bulk-updating all drafts, loop through each approved campaign and call `addOutreachMessage` for each one. Campaigns for the same supplier will be grouped into the same conversation automatically (since `addOutreachMessage` checks for existing conversations).

### Files Modified
- `src/stores/conversationsStore.ts` — add `addOutreachMessage` to interface and implementation
- `src/stores/outreachCampaignStore.ts` — import conversations store and call `addOutreachMessage` in `approveCampaign` and `approveAll`

### Result
- Approving a single campaign creates/updates a conversation with that message tagged by channel
- Approving all campaigns creates conversations for every supplier, with all channel messages grouped per supplier
- Users see all outreach messages immediately in the Conversations page with channel badges

