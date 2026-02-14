

## Add Missing Automation & Intelligence Features

### Audit Summary: What Already Exists

The app already has strong coverage of the spec:
- Social credential management for 8 platforms (Twitter, Facebook, Instagram, LinkedIn, WhatsApp, TikTok, YouTube, Pinterest)
- Multi-platform posting via `social-post` edge function
- Scheduled posts processor with cron support
- Engagement aggregation (hourly via `aggregate-engagement`)
- MiroFlow competitor monitoring with price collection and alerts
- Pricing Optimizer with strategy cards and scenario simulator
- Content Studio with AI generation
- Seller Analytics with AI insights (MiroRL)
- Products Manager (CRUD)
- Settings with 10 tabs including Social Media connections

### What's Missing (4 features)

---

### 1. Daily Intelligence Report System

**Problem:** The spec requires an automated daily report (8 PM) summarizing competitor prices, market changes, and recommendations -- sent via email and viewable in-dashboard.

**New files:**
- `supabase/functions/daily-report/index.ts` -- Edge function that:
  - Queries competitor_prices, competitor_alerts, scheduled_posts, post_engagement for the last 24 hours
  - Generates a summary using Lovable AI (Gemini) with metrics: products monitored, competitors found, new prices collected, market changes, top recommendations
  - Stores the report in a new `daily_reports` table
  - Returns the report (email sending can be added later when email integration is configured)

- `src/features/seller/components/DailyReportViewer.tsx` -- Dashboard component showing:
  - Latest daily report card with key metrics
  - Historical reports list (last 7 days)
  - Expandable sections: Market Summary, Price Changes, Competitor Activity, Recommendations

- `src/pages/dashboard/DailyReport.tsx` -- Page wrapper

**Database:** New `daily_reports` table with columns: id, user_id, report_date, metrics_json, recommendations_json, created_at. RLS policies for user-owned data.

**Route:** `/dashboard/daily-report`

---

### 2. Competitor Interaction Tracking

**Problem:** The spec describes tracking messages sent to competitors and responses received (Steps 7-10 in Workflow 1). Currently no table or UI for this.

**Database:** New `competitor_interactions` table:
- id, user_id, product_id, competitor_name, platform, message_sent, response_received, response_price (extracted), confidence_score, status (sent/responded/no_response/expired), sent_at, responded_at, created_at
- RLS policies for user-owned data

**New file:** `src/features/seller/components/CompetitorOutreach.tsx` -- UI component showing:
- Outreach history table (competitor, platform, message sent, response status, extracted price)
- Response rate stats card
- Filter by status (sent, responded, no response)
- Manual "Log Response" button for recording prices from manual conversations

This component will be added as a tab or section within the Competitors page.

**Update:** `src/pages/dashboard/Competitors.tsx` to include the new outreach tracking section.

---

### 3. Platform Setup Guides in Settings

**Problem:** The Social Media Section shows a generic credential form. The spec wants detailed step-by-step instructions per platform (where to find Page ID, how to create a developer app, etc.).

**Update:** `src/components/settings/SocialMediaSection.tsx` to add:
- Per-platform collapsible setup guide that appears when clicking "Connect"
- Step-by-step instructions matching the spec (e.g., Facebook: go to developers.facebook.com, create app, get Page ID from About section, generate token)
- Visual indicators for each step (numbered steps with completion checkmarks)
- Links to each platform's developer portal (already partially present)
- "Test Connection" button before saving (already exists via `testCredentials`)

**Update:** Add Telegram platform to `src/hooks/useSocialCredentials.ts` with fields: Bot Token (from BotFather)

---

### 4. MiroRL Feedback UI

**Problem:** Step 13 describes a feedback loop where users rate AI recommendations and the system learns. No UI for this exists.

**Database:** New `ai_feedback` table:
- id, user_id, feature (pricing/content/competitor/report), recommendation_id, action_taken (applied/dismissed/modified), rating (1-5), notes, created_at
- RLS policies for user-owned data

**New file:** `src/components/shared/RecommendationFeedback.tsx` -- Reusable inline feedback widget:
- Thumbs up / thumbs down buttons
- Optional 1-5 star rating
- "Did you apply this?" toggle
- Brief notes field
- Submits to `ai_feedback` table

**Integration points:**
- Add to Pricing Optimizer (after applying a strategy)
- Add to Seller Analytics (after viewing AI insights)
- Add to Daily Report Viewer (after reading recommendations)

---

### Technical Details

**Files to create (5):**
1. `supabase/functions/daily-report/index.ts`
2. `src/features/seller/components/DailyReportViewer.tsx`
3. `src/pages/dashboard/DailyReport.tsx`
4. `src/features/seller/components/CompetitorOutreach.tsx`
5. `src/components/shared/RecommendationFeedback.tsx`

**Files to modify (5):**
1. `src/hooks/useSocialCredentials.ts` -- Add Telegram platform config
2. `src/components/settings/SocialMediaSection.tsx` -- Add per-platform setup guides
3. `src/pages/dashboard/Competitors.tsx` -- Add outreach tracking section
4. `src/app/Router.tsx` -- Add daily-report route
5. `supabase/config.toml` -- Add daily-report function config

**Database migrations (3 tables):**
1. `daily_reports` -- Stores generated daily intelligence reports
2. `competitor_interactions` -- Tracks outreach messages and responses
3. `ai_feedback` -- Stores user feedback on AI recommendations

**Localization:** Add translation keys for all new UI components to the 4 locale files.

**Total: 10 files (5 new + 5 modified) + 1 database migration**

