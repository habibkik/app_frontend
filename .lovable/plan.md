

# Complete Seller Mode Workflow -- Missing Features Plan

## Current State Assessment

After a thorough audit of the codebase, here is a feature-by-feature status:

| Workflow Step | Status | Details |
|---|---|---|
| Setup: Social accounts | DONE | Settings page has full social media connection UI |
| Setup: Add products + COGS | MISSING | No product management page; all products are hardcoded mock arrays |
| Price Monitoring (MiroFlow) | PARTIAL | Competitor Monitor exists with mock data; no real automated pipeline |
| Pricing Optimization | PARTIAL | 3 strategies + simulator exist; no AI validation or performance tracking |
| Content Generation | PARTIAL | Content Studio UI complete; uses mock data instead of real AI |
| Social Publishing | DONE | Multi-platform, scheduling, A/B testing, UTM all working |
| Real-Time Engagement | MISSING | No post-level metrics (impressions, clicks, conversions) |
| Analytics and Learning | MISSING | No seller-specific analytics dashboard with AI recommendations |

## Implementation Plan (Prioritized)

### Phase 1: Product Management (Foundation)

Everything depends on having real products in the database.

**1a. Create `products` database table**
- Columns: `id`, `user_id`, `name`, `category`, `image_url`, `cost` (COGS), `current_price`, `sku`, `description`, `status` (active/inactive), `created_at`, `updated_at`
- RLS policies scoped to authenticated user

**1b. Create Products Management page** (`src/pages/dashboard/Products.tsx`)
- Add/edit/delete products with name, category, image, COGS, selling price
- Table view with inline editing for quick price/cost changes
- Import from CSV option
- Route: `/dashboard/products`
- Add to seller navigation in `navigation.ts`

**1c. Wire existing components to real products**
- Update `PricingOptimizerComponent` to load products from DB instead of mock array
- Update `ContentStudio` product selector to query from DB
- Update `CompetitorMonitorStore` products list from DB

### Phase 2: AI-Powered Content Generation (Replace Mocks)

**2a. Connect Content Studio to Lovable AI**
- Update the existing `generate-marketing-content` edge function to use the Lovable AI Gateway with `google/gemini-3-flash-preview`
- Send product details + audience + tone to AI, return structured headlines, ad copy, descriptions, email, and social captions
- Replace `generateMockContent()` with real AI call

**2b. Template Save/Reuse**
- Create `content_templates` table (id, user_id, name, product_id, content_json, created_at)
- Add "Save as Template" button in Content Studio
- Add "Load Template" option in generation form
- Templates appear in a searchable list

### Phase 3: Pricing Intelligence (MiroThinker Validation + MiroRL Tracking)

**3a. AI Pricing Validation**
- Create `validate-pricing` edge function using Lovable AI
- When user selects a strategy, call AI to validate profitability (checks margin, market position, competitor data)
- Show validation result: green checkmark if profitable, warning if risky
- Display AI reasoning for the validation

**3b. Price Change Tracking (MiroRL)**
- Create `price_changes` table (id, user_id, product_id, old_price, new_price, strategy_used, reason, created_at)
- Create `sales_performance` table (id, user_id, product_id, date, units_sold, revenue, created_at)
- When user applies a price change, log it with strategy info
- Dashboard card: "Did this price change improve sales?" with before/after comparison

### Phase 4: Post Engagement Tracking

**4a. Engagement metrics table**
- Create `post_engagement` table (id, post_id, platform, impressions, clicks, conversions, engagement_rate, measured_at)
- For now, populate with simulated data on post creation (real API integration would come later)

**4b. Post Analytics view**
- Add engagement columns to the scheduled posts list in Social Publisher
- Per-post detail modal showing impressions, clicks, conversions over time
- A/B test result comparison with auto-winner selection

### Phase 5: Seller Analytics Dashboard

**5a. Seller-specific analytics page**
- New component or tab within Analytics showing seller KPIs:
  - Sales trends (daily/weekly/monthly)
  - Top products by revenue
  - Content performance (which posts convert best)
  - Competitor price movement summary
  - Best posting times (derived from engagement data)

**5b. AI Learning Insights panel**
- Create `ai-insights` edge function using Lovable AI
- Analyze user's price changes, content performance, and engagement data
- Generate personalized recommendations:
  - "Instagram posts convert 2x better than Facebook for you"
  - "Best time to post: Tues-Thurs, 6-9 PM"
  - "This pricing strategy works well for your category"
- Display in a card on the Seller Dashboard

### Phase 6: Automated Monitoring Pipeline (MiroFlow)

**6a. Competitor price inquiry edge function**
- Create `competitor-price-check` edge function
- Uses Lovable AI to analyze competitor websites/listings and extract prices
- Stores results in `competitor_prices` table

**6b. Scheduled monitoring**
- Create a cron-triggered edge function that runs every 2 hours
- Checks tracked competitors for each user's products
- Updates the competitor monitor store with fresh data
- Triggers alerts when prices drop significantly

## Navigation Changes

Add to seller navigation in `src/features/dashboard/config/navigation.ts`:
- "Products" under a new "Setup" group (icon: Package, url: `/dashboard/products`)

## New Files Summary

| File | Purpose |
|---|---|
| `src/pages/dashboard/Products.tsx` | Product management page |
| `src/features/seller/components/ProductsManager.tsx` | Products CRUD component |
| `src/features/seller/components/EngagementMetrics.tsx` | Post engagement display |
| `src/features/seller/components/AIInsightsPanel.tsx` | AI learning recommendations |
| `supabase/functions/validate-pricing/index.ts` | AI pricing validation |
| `supabase/functions/ai-insights/index.ts` | AI learning recommendations |
| `supabase/functions/competitor-price-check/index.ts` | Automated price monitoring |

## New Database Tables

- `products` -- User's product catalog with COGS
- `content_templates` -- Saved content generation templates
- `price_changes` -- Price change history for MiroRL tracking
- `sales_performance` -- Sales data for performance analysis
- `post_engagement` -- Social post metrics

## Recommended Build Order

Start with **Phase 1** (Products) since it's the foundation everything else depends on, then **Phase 2** (real AI content) and **Phase 3** (pricing intelligence) in parallel, followed by Phases 4-6.

