

## Connect Publisher with Content Studio and Unify All Marketing Sections

Make the entire Marketing section (Campaigns, Content Studio, Social Publisher, Website Builder) work as a connected ecosystem where content flows seamlessly between modules.

### Current State

The marketing modules are partially connected:
- Content Studio can send individual posts and batch posts to Social Publisher via `contentStudioStore` (`pendingPublisherPost` / `pendingBatchPosts`)
- Website Builder pulls from `products`, `analysisStore`, and `contentStudioStore`
- The Campaigns page is a standalone, older implementation that does NOT use the database and is disconnected from everything else

The gaps:
1. **Campaigns page** is completely isolated -- local state only, no database, no connection to Content Studio
2. **Email campaigns** from Content Studio have no send/schedule action
3. **Landing Page** from Content Studio is not linked to Website Builder
4. **Website Builder** cannot pull Content Studio social posts or email campaigns
5. **Social Publisher** only reads legacy `savedItems` from the store, not the newer generated social posts
6. **No cross-navigation hub** -- users have to manually jump between pages

### What Gets Built

#### 1. Content Studio "Send to Publisher" for ALL generated content (not just social posts)

Currently only the Social Image Posts tab has "Send to Publisher" buttons. We will add:

- **Email Campaign tab**: "Send to Publisher" button per campaign that copies the email subject + body to the Publisher as a draft post for email-related platforms
- **Landing Page tab**: "Send to Website Builder" button that pushes the generated landing page HTML and theme directly into the `websiteBuilderStore`, then navigates to Website Builder

#### 2. Upgrade Social Publisher to consume Content Studio's generated social posts directly

The Publisher currently only reads `studioItems` (legacy saved items). We will add a new content source option: **"From Content Studio (Generated)"** that reads `socialPosts` from `contentStudioStore` directly, showing each platform-specific post with its hook, caption, CTA, and hashtags. Users can select one or send all as a batch.

#### 3. Connect Campaigns page to the database and Content Studio

Replace the Campaigns page's local state with the `scheduled_posts` database table (same as Publisher uses). Add a Content Studio content source dropdown. This makes Campaigns and Publisher show the same scheduled posts.

#### 4. Add a Marketing Hub card at the top of each marketing page

A compact "Marketing Flow" banner at the top of Content Studio, Publisher, and Website Builder showing the pipeline stages with navigation links:

```text
[Products] --> [Market Intel] --> [Content Studio] --> [Publisher] --> [Website Builder]
```

Each step shows a status indicator (active/completed/pending) and is clickable to navigate.

#### 5. Website Builder pulls Content Studio email campaigns

The Website Builder's block system will gain a new block type: **"Email Signup"** that references the email campaign content from the Content Studio store.

### Files to Modify

| File | Changes |
|------|---------|
| `src/features/seller/components/ContentStudio.tsx` | No changes needed (orchestrates tabs) |
| `src/features/seller/components/content-studio/EmailCampaignTab.tsx` | Add "Send to Publisher" button per campaign |
| `src/features/seller/components/content-studio/LandingPageTab.tsx` | Add "Send to Website Builder" button |
| `src/features/seller/components/SocialPublisher.tsx` | Add "Generated Posts" content source that reads `contentStudioStore.socialPosts` |
| `src/pages/dashboard/Campaigns.tsx` | Connect to `scheduled_posts` DB table, add Content Studio source |
| `src/stores/contentStudioStore.ts` | Add `pendingWebsiteData` for landing page transfer to Website Builder |
| `src/stores/websiteBuilderStore.ts` | Add `importLandingPage` action |

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/seller/components/MarketingFlowBanner.tsx` | Reusable pipeline navigation banner |

### Technical Details

**Content Flow Architecture:**

```text
Market Intelligence (analysisStore)
        |
        v
Content Studio (contentStudioStore)
   |         |          |
   v         v          v
Social    Email      Landing
Posts   Campaigns     Page
   |         |          |
   v         v          v
Publisher  Publisher  Website
(batch)   (drafts)   Builder
   |
   v
scheduled_posts (DB)
   |
   v
Batch Analytics
```

**Generated Posts in Publisher:**

When "From Content Studio (Generated)" is selected:
- Read `contentStudioStore.socialPosts` array (5 platform-optimized posts)
- Display each as a selectable card with platform icon, hook preview, and caption
- User can pick individual posts to load into the composer, or "Send All as Batch" to open the batch dialog
- This replaces the current empty "No content generated yet" state when the kit has been generated

**Email Campaign to Publisher:**

- Each email campaign card gets a "Schedule Email" button
- Clicking it sets `pendingPublisherPost` with the email subject + body as content and platform="email"
- Publisher consumes it via the existing `pendingPublisherPost` effect

**Landing Page to Website Builder:**

- Landing Page tab gets a "Import to Website Builder" button
- Clicking stores the HTML, theme, and section data in `contentStudioStore.pendingWebsiteData`
- Website Builder checks for `pendingWebsiteData` on mount and imports it into its block configuration
- Shows toast confirmation and clears the pending data

**Campaigns Page Database Connection:**

- Replace local `scheduledPosts` state with a `useEffect` that loads from `scheduled_posts` table (same query as Publisher)
- Reuse the same `handleSchedule` / `handleSaveDraft` pattern from Publisher
- Add Content Studio content source dropdown (same as Publisher)
- This ensures both pages show consistent data

**Marketing Flow Banner:**

- Horizontal stepper showing: Products -> Intelligence -> Content Studio -> Publisher -> Website Builder
- Each step is a link to its dashboard route
- Current page is highlighted
- Steps that have data show a green check (e.g., if `analysisStore.sellerResults` exists, Intelligence shows complete)
- Compact: single row with icons and labels

### Implementation Order

1. Create `MarketingFlowBanner` component
2. Add `pendingWebsiteData` to `contentStudioStore` and `importLandingPage` to `websiteBuilderStore`
3. Update `EmailCampaignTab` with "Send to Publisher" button
4. Update `LandingPageTab` with "Send to Website Builder" button
5. Update `SocialPublisher` with generated posts content source
6. Update `Campaigns` page to use database and Content Studio
7. Add `MarketingFlowBanner` to Content Studio, Publisher, Website Builder, and Campaigns pages
