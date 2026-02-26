

## Wire Campaign Objective to Content Generation

### Problem
The `objective` state is selected in the UI but never passed through the generation chain:
1. `handleGenerateCampaigns` in OutreachHub doesn't pass `objective` to the store
2. `prepareCampaignsForSupplier` doesn't accept `objective` or `supplierTier` params
3. The local fallback (unauthenticated) generates identical generic messages regardless of objective
4. The tier from the discovery card is accepted by `handleGenerateCampaigns` but discarded

### Changes

#### 1. `src/pages/dashboard/OutreachHub.tsx`
- Update `handleGenerateCampaigns` to pass both `objective` and `tier` to `prepareCampaignsForSupplier`
- Change the function signature to: `prepareCampaignsForSupplier(supplier, undefined, objective, tier)`

#### 2. `src/stores/outreachCampaignStore.ts`
- Update `prepareCampaignsForSupplier` signature to accept `objective` and `supplierTier` params and forward them to `prepareCampaigns`
- Update the local fallback in `prepareCampaigns` to generate **objective-specific messages** instead of generic ones. Each objective gets different message content, subject lines, and sequence structure matching the best-practice templates (e.g., sourcing = qualification focus, renewal = market check positioning, ESG = certification request)

#### 3. `src/components/outreach/OutreachSupplierDiscoveryCard.tsx`
- No changes needed — already passes `tier` to `onGenerateCampaigns`

### Files Modified
- `src/pages/dashboard/OutreachHub.tsx` — pass `objective` and `tier` through `handleGenerateCampaigns`
- `src/stores/outreachCampaignStore.ts` — update `prepareCampaignsForSupplier` to forward `objective`/`tier`; add objective-specific local fallback messages with proper sequence structures

