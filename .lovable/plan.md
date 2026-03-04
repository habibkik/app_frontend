

## Plan: Marketing Seller Mode — Single-Page Marketplace Publisher

### Overview

Create a single-page module at `/dashboard/marketplace` with a sticky horizontal tab bar (6 tabs) using shadcn Tabs + Framer Motion transitions. All content lives on one page with no route changes.

### Database Migration

Create 4 new tables + 1 storage bucket:

1. **`marketplace_listings`** — Enhanced product listings with marketplace-specific fields: `id`, `user_id`, `title`, `description`, `price`, `compare_at_price`, `currency`, `category`, `subcategory`, `condition` (new/used/refurbished), `images_json` (JSONB array), `video_url`, `variants_json` (JSONB), `sku`, `barcode`, `stock_quantity`, `low_stock_threshold`, `shipping_weight`, `shipping_dimensions`, `free_shipping`, `shipping_cost`, `tags` (text[]), `location`, `schedule_at`, `status` (draft/active/archived), `created_at`, `updated_at`. RLS: user-scoped CRUD.

2. **`marketplace_connections`** — Platform connections: `id`, `user_id`, `platform_name`, `platform_type` (global/local), `connection_status` (connected/disconnected/error), `credentials_json` (JSONB), `platform_config_json` (JSONB), `last_sync_at`, `listings_count`, `created_at`, `updated_at`. RLS: user-scoped CRUD.

3. **`marketplace_published`** — Published listings junction: `id`, `user_id`, `listing_id` (FK→marketplace_listings), `platform_name`, `external_id`, `external_url`, `status` (draft/published/pending/rejected/expired/paused), `views`, `inquiries`, `clicks`, `revenue`, `published_at`, `expires_at`, `platform_overrides_json` (JSONB), `created_at`. RLS: user-scoped CRUD.

4. **`marketplace_messages`** — Unified inbox: `id`, `user_id`, `listing_id` (FK→marketplace_listings), `platform_name`, `customer_name`, `customer_avatar`, `message_text`, `is_read`, `is_starred`, `is_archived`, `label`, `created_at`. RLS: user-scoped CRUD.

5. **`marketplace_automation_rules`** — Automation rules: `id`, `user_id`, `rule_type`, `config_json` (JSONB), `is_active`, `created_at`, `updated_at`. RLS: user-scoped CRUD.

6. **Storage bucket**: `marketplace-media` (public) for product images/videos.

### AI Edge Function

**`supabase/functions/marketplace-ai/index.ts`** — Multi-task AI endpoint using `google/gemini-3-flash-preview` via Lovable AI gateway:
- `optimize-title` — Platform-optimized title rewrite
- `rewrite-description` — Tone-adjusted description (Professional/Casual/Luxury/Bargain)
- `suggest-tags` — SEO tags and platform hashtags
- `suggest-price` — Market-based price recommendation
- `translate` — Listing translation with cultural adaptations
- `enhance-image-prompt` — Image enhancement suggestions (placeholder for future real processing)

### Files to Create

**Core page:**
- `src/features/marketplace/pages/MarketplaceSellerPage.tsx` — Main SPA page with sticky Tabs bar, Framer Motion `AnimatePresence` for tab transitions, Zustand store for shared state (active tab, selected product for publishing)

**Tab components (one per tab):**
- `src/features/marketplace/components/TabProductListing.tsx` — Product form (title, description, price, compare-at, category, condition, images upload to `marketplace-media` bucket with drag-reorder, video upload, variants manager, SKU, stock, shipping, tags chip input, location, schedule picker) + product list table/grid below with search/filter/view toggle
- `src/features/marketplace/components/TabConnections.tsx` — Platform cards grid (global: Facebook, Instagram, TikTok, WooCommerce, Shopify; local: country-auto-detected from CurrencyContext) + Publish Product sub-section (product selector, platform checkboxes with preview modals, per-platform overrides, schedule, publish button with progress)
- `src/features/marketplace/components/TabDashboard.tsx` — Stats cards row, bar/line charts (recharts), listings status table, unified inbox accordion
- `src/features/marketplace/components/TabBulkAutomation.tsx` — Multi-select product list with bulk actions dropdown + automation rule toggle cards (6 rules)
- `src/features/marketplace/components/TabAITools.tsx` — Grid of 5 AI tool cards (Description Generator, Price Suggester, Image Enhancer, Hashtag Generator, Translator) each expanding into a working form that calls the edge function
- `src/features/marketplace/components/TabSettings.tsx` — Seller profile form, platform preferences matrix, subscription/quota display with plan comparison table, data/privacy section

**Supporting:**
- `src/features/marketplace/components/LocalPlatformData.ts` — Country→platform mapping (17 countries) with URLs, logos, API availability flags
- `src/features/marketplace/components/PlatformCard.tsx` — Reusable connection card with status badge, health dot, connect/disconnect
- `src/features/marketplace/components/ListingPreviewModal.tsx` — Platform-specific listing preview mockup
- `src/features/marketplace/components/CopyPasteMode.tsx` — For local platforms without API: formatted text + copy buttons + open URL
- `src/features/marketplace/store/marketplaceStore.ts` — Zustand store for active tab, selected listing, connection state
- `src/features/marketplace/index.ts` — Barrel export

### Files to Edit

1. **`src/features/dashboard/config/navigation.ts`** — Add "Marketplace" item to seller Marketing nav group: `{ title: "Marketplace", url: "/dashboard/marketplace", icon: Store }`
2. **`src/app/Router.tsx`** — Add route: `/dashboard/marketplace` → `MarketplaceSellerPage`

### Implementation Notes

- The existing `products` table will be referenced but not modified; `marketplace_listings` is a separate enhanced listing layer
- Images uploaded to `marketplace-media` bucket with path `{user_id}/{listing_id}/{filename}`
- Local platform detection uses `CurrencyContext` currency code to infer country, with manual country override in Connections tab
- Tab badges: computed from state (unread messages count on Dashboard, error connections on Connections)
- Mobile: tabs use `overflow-x-auto` with icon-only display on small screens
- All destructive actions use `AlertDialog` confirmation
- Empty states with descriptive text and CTA buttons pointing to relevant actions

