
## Full App-Wide i18n Translation Plan: Complete Implementation

### Problem
Only the sidebar, header, landing nav, and Content Studio are translated. All other pages show hardcoded English text:
- **Dashboards**: Seller, Buyer, Producer, Main Dashboard
- **Landing Page**: Hero, Features, HowItWorks, RoleCards, Testimonials, CTA, Footer
- **Auth Pages**: Login, Signup
- **Other Components**: ModeSelector, DashboardStats, QuickActions, RecentAnalyses

### Solution Overview
This plan adds ~400 new translation keys to all 4 locale files (en, ar, fr, es) and wires up `useTranslation()` in 20+ component files. Every hardcoded string will be replaced with `t("section.key")` so the entire app responds instantly to language changes.

### Phase 1: Locale Data (4 files)
Add new translation sections to `src/i18n/locales/{en,ar,fr,es}.json`:

**New sections:**
- `sellerDashboard` -- Welcome, stats labels, key actions, chart titles, section headers
- `buyerDashboard` -- Welcome, stats labels, key actions, chart titles, RFQ table headers
- `producerDashboard` -- Welcome, stats labels, key actions, charts, alerts
- `mainDashboard` -- Dashboard title, upload text, AI analysis section, stats
- `dashboardStats` -- All stat card titles and "from last month" text
- `quickActions` -- Mode-specific action labels and descriptions (for buyer, seller, producer)
- `recentAnalyses` -- Card titles, empty state text
- `hero` -- Headline, subtitle, mode labels, descriptions, demo button text, feature pills, stats
- `features` -- Section header, 8 feature cards with titles and descriptions
- `howItWorks` -- Section header, 4 step titles and descriptions
- `roleCards` -- Section header, 3 role cards (title, subtitle, features, CTA)
- `testimonials` -- Section header, testimonial content
- `cta` -- Badge, headline, description, buttons
- `footer` -- Section categories, links, copyright
- `login` -- Form labels, placeholders, left-side hero text, feature bullets, buttons, links
- `signup` -- Form labels, placeholders, hero text, features, role options, buttons
- `modeSelector` -- Mode labels and descriptions

### Phase 2: Component Wiring (20+ files)

**Dashboards (4 files):**
1. `src/features/seller/pages/SellerDashboard.tsx`
   - Welcome greeting, stat labels (Active Products, Sales This Month, Average Rating)
   - Key action titles & descriptions (Monitor Competitors, Optimize Pricing, Create Content, Publish Post)
   - Section headers (Sales Trend, Top Products, Competitor Alerts, Recent Posts)
   - Table headers (Product, Units Sold, Revenue, Rating)
   - Button labels (View all alerts, Analytics)

2. `src/features/buyer/pages/BuyerDashboard.tsx`
   - Welcome greeting, stat labels (Active RFQs, Quotes Received, Saved Suppliers)
   - Key action titles & descriptions (Supplier Search, My RFQs, Conversations, Saved Suppliers)
   - Section headers (RFQ Status Breakdown, Quotes by Category, Latest Supplier Discovery, Active RFQs, Sourcing Alerts)
   - Table headers (Title, Category, Quotes, Status, Expires)
   - Badge "total" label, empty state messages

3. `src/features/producer/pages/ProducerDashboard.tsx`
   - Welcome greeting, stat labels, key actions, section headers

4. `src/features/dashboard/pages/DashboardPage.tsx`
   - Page title (Dashboard)
   - "Upload a product image to get started" text
   - AI analysis section headers

**Dashboard Sub-Components (3 files):**
5. `src/features/dashboard/pages/components/DashboardStats.tsx`
   - Stat card titles, "from last month" text

6. `src/features/dashboard/pages/components/QuickActions.tsx`
   - Card title, description text
   - Move mode-specific actions inside component to use `t()`

7. `src/features/dashboard/pages/components/RecentAnalyses.tsx`
   - Card titles, empty state messages

**Landing Page Components (7 files):**
8. `src/components/landing/Hero.tsx`
   - Main headline (One Image. Infinite Insights.)
   - Subtitle, mode labels, descriptions
   - Upload button text, Try Demo button
   - Feature pills (No signup required, Instant results, 100% free demo)
   - Stats labels (Trade Volume, Suppliers, Accuracy, Analysis Time)

9. `src/components/landing/Features.tsx`
   - Section badge, title, subtitle
   - All 8 feature card titles and descriptions

10. `src/components/landing/HowItWorks.tsx`
    - Section badge, title, subtitle
    - All 4 step titles and descriptions

11. `src/components/landing/RoleCards.tsx`
    - Section badge, title, subtitle
    - All 3 role card titles, subtitles, feature lists, button text

12. `src/components/landing/Testimonials.tsx`
    - Section badge, title, subtitle
    - Testimonial content

13. `src/components/landing/CTA.tsx`
    - Badge, headline, description
    - Button labels, trust text

14. `src/components/landing/Footer.tsx`
    - Link categories, all link labels
    - Tagline, copyright text

**Auth Pages (2 files):**
15. `src/features/auth/pages/LoginPage.tsx`
    - Logo brand text (TradePlatform)
    - Hero section headline, description, feature bullets
    - Form labels (Email address, Password), placeholders (you@company.com, Enter your password)
    - Checkbox label (Remember me), Forgot password link text
    - Button text (Sign in, Signing in...)
    - Signup link text (Don't have an account?, Sign up for free)

16. `src/features/auth/pages/SignupPage.tsx`
    - Same pattern as LoginPage

**Mode Selector (1 file):**
17. `src/features/dashboard/components/ModeSelector.tsx`
    - Mode labels (Buyer, Seller, Producer) and descriptions

### Phase 3: Technical Implementation Details

**Static Arrays Translation Pattern:**
For components with static arrays like `keyActions`, `modeConfig`, `features`, etc., move them INSIDE the component function so they can use `t()`:

```tsx
export default function SellerDashboard() {
  const { t } = useTranslation();
  
  const keyActions = [
    { title: t("sellerDashboard.actions.competitors"), desc: t("sellerDashboard.actions.competitorsDesc"), ... },
    { title: t("sellerDashboard.actions.pricing"), desc: t("sellerDashboard.actions.pricingDesc"), ... },
    // ...
  ];
  
  // ... rest of component
}
```

**Dynamic Translation Maps:**
For components that need to map between untranslated config keys and translated labels (like sidebar, mode selector), use a key lookup:

```tsx
const titleKeyMap: Record<string, string> = {
  "Home": "sidebar.home",
  "Suppliers": "sidebar.suppliers",
  // ...
};

const translatedTitle = t(titleKeyMap[item.title] || "sidebar.default");
```

### Phase 4: Locale File Structure

Example structure (en.json):
```json
{
  "sellerDashboard": {
    "welcome": "Welcome back, {{firstName}}!",
    "subtitle": "Here's what's happening with your store today.",
    "stats": {
      "activeProducts": "Active Products",
      "salesThisMonth": "Sales This Month",
      "averageRating": "Average Rating"
    },
    "actions": {
      "competitors": "Monitor Competitors",
      "competitorsDesc": "Track pricing & stock changes",
      "pricing": "Optimize Pricing",
      // ...
    },
    "sections": {
      "salesTrend": "Sales Trend (30 days)",
      "topProducts": "Top 5 Products by Revenue",
      "competitorAlerts": "Competitor Alerts",
      "recentPosts": "Recent Posts"
    },
    "tables": {
      "product": "Product",
      "unitsSold": "Units Sold",
      "revenue": "Revenue",
      "rating": "Rating"
    },
    "buttons": {
      "viewAllAlerts": "View all alerts",
      "analytics": "Analytics"
    }
  },
  "buyerDashboard": {
    // Similar structure
  },
  // ... other sections
}
```

Arabic (ar.json) will have RTL translations. French and Spanish will follow the same key structure.

### Phase 5: RTL & Mobile Verification

- RTL is already handled by LanguageContext (applies `dir="rtl"` and `rtl` class)
- All flex/grid layouts will automatically flip for Arabic
- No additional RTL CSS needed

### Files to Modify (Total: 24 files)
1. `src/i18n/locales/en.json`
2. `src/i18n/locales/ar.json`
3. `src/i18n/locales/fr.json`
4. `src/i18n/locales/es.json`
5-24. The 20+ component files listed above

### Expected Outcome
After implementation:
- ✅ Change language selector to Arabic/French/Spanish
- ✅ ALL text on dashboard updates instantly
- ✅ ALL text on landing pages updates instantly
- ✅ ALL text on auth pages updates instantly
- ✅ Arabic layout flips to RTL automatically
- ✅ All translation keys follow the same pattern for consistency
