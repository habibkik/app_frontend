

## Add Automated Price Collection and AI Price Extraction

### What Already Exists (No Changes Needed)

The vast majority of this spec is already implemented:
- Multi-platform social posting (Facebook, Instagram, TikTok, LinkedIn, Twitter, WhatsApp) via `social-post` edge function
- Social Publisher with scheduling, UTM tracking, A/B testing, content variants
- Content Studio with AI generation for all platforms (headlines, copy, descriptions, social posts, email, landing page)
- MiroFlow competitor monitoring with automated price collection and alerts (2-hour cron)
- Competitor Outreach tracking with interaction logging and response recording
- Daily Intelligence Reports with AI-generated insights and recommendations
- Pricing Optimizer with 3 strategy cards, scenario simulator, automated pricing rules, and AI validation
- Engagement aggregation (hourly cron)
- MiroRL Recommendation Feedback widget
- Platform setup guides in Settings (9 platforms)
- One-click multi-platform publishing dashboard

### What's Missing (3 features)

---

### 1. AI-Powered Price Extraction from Responses

**Problem:** When a user logs a competitor response in the Outreach Tracker, they must manually type the price. The spec requires NLP/AI to auto-extract price, MOQ, lead time, and currency from raw message text.

**Solution:** Add an "Extract Price" button to the Log Response dialog that sends the response text to an edge function using Lovable AI to parse structured pricing data.

**New file:** `supabase/functions/extract-price/index.ts`
- Accepts raw message text
- Uses Lovable AI (Gemini) with tool calling to extract structured data: price, currency, unit_type, moq, lead_time
- Returns extracted data with confidence score
- Handles ambiguous messages (e.g., "around $45") with lower confidence

**Modified file:** `src/features/seller/components/CompetitorOutreach.tsx`
- Add "Extract with AI" button next to the response text field in the Log Response dialog
- On click: sends response text to `extract-price` function
- Auto-fills price, confidence score fields from AI result
- Shows extracted MOQ and lead time as additional info
- User can review and edit before saving

---

### 2. Automated Outreach Scheduling

**Problem:** The spec describes a system that automatically sends pricing inquiries 4x daily. Currently outreach is manual-only (user clicks "Log Outreach").

**New file:** `supabase/functions/auto-outreach/index.ts`
- Queries `products` table for active products
- For each product, generates 3 inquiry message variants using Lovable AI
- Creates `competitor_interactions` records with status "sent"
- Logs all activity
- Designed to be triggered by cron (every 6 hours)

**New database table:** `outreach_configs`
- id, user_id, product_id, enabled (boolean), frequency_hours (default 6), message_template (text), max_contacts_per_run (default 10), created_at, updated_at
- RLS policies for user-owned data

---

### 3. Price Collection Scheduling UI

**Problem:** No UI to configure automated price collection frequency or outreach scheduling.

**New file:** `src/features/seller/components/PriceCollectionConfig.tsx`
- Card component showing automation status
- Toggle to enable/disable automated outreach
- Frequency selector (Every 6 hours, Every 12 hours, Daily)
- Max contacts per run slider (5-20)
- Message template textarea with variable support (product_name, price_range)
- "Run Now" button to trigger immediate collection
- Status indicator showing last run time and results

**Modified file:** `src/pages/dashboard/Competitors.tsx`
- Add "Automation" tab alongside existing "Intelligence" and "Outreach Tracking" tabs

---

### Technical Details

**Files to create (3):**
1. `supabase/functions/extract-price/index.ts` -- AI price extraction
2. `supabase/functions/auto-outreach/index.ts` -- Automated outreach scheduler
3. `src/features/seller/components/PriceCollectionConfig.tsx` -- Automation config UI

**Files to modify (3):**
1. `src/features/seller/components/CompetitorOutreach.tsx` -- Add AI extract button to dialog
2. `src/pages/dashboard/Competitors.tsx` -- Add Automation tab
3. `supabase/config.toml` -- Register 2 new edge functions

**Database migration (1 table):**
- `outreach_configs` -- Stores per-user automation settings with RLS

**Localization:** Add translation keys for new UI elements to all 4 locale files.

**Total: 6 files (3 new + 3 modified) + 1 database migration**

