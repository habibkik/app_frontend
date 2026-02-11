

## Full App-Wide i18n Translation Plan

### Problem
Currently, only the sidebar, header, landing navigation, and Content Studio respond to language changes. All other pages and components still show hardcoded English text -- including all 3 role dashboards (Buyer, Seller, Producer), the main Dashboard page, Login/Signup pages, all landing page sections (Hero, Features, How It Works, Role Cards, Testimonials, CTA, Footer), and the Mode Selector.

### Scope of Changes

This is a large change touching **20+ files**. Here is the full breakdown:

---

#### Phase 1: Translation Files (4 files)

Add ~300 new translation keys to all 4 locale files covering every page:

**New sections to add:**

- `buyerDashboard` -- Welcome message, stats (Active RFQs, Quotes Received, Saved Suppliers), key actions, table headers (Title, Category, Quotes, Status, Expires), section titles (RFQ Status Breakdown, Quotes by Category, Latest Supplier Discovery, Active RFQs, Sourcing Alerts), button labels
- `sellerDashboard` -- Welcome message, stats (Active Products, Sales This Month, Average Rating), key actions (Monitor Competitors, Optimize Pricing, Create Content, Publish Post), chart titles, table headers, section titles (Competitor Alerts, Recent Posts)
- `producerDashboard` -- Welcome message, stats (Active BOMs, Components Tracked, Avg Feasibility Score), key actions, chart titles, table headers (Product, Components, Est. Cost, Feasibility, Updated), alert section
- `mainDashboard` -- "Dashboard" title, "Upload a product image to get started", "AI Product Analysis", stats titles, quick actions labels, recent analyses labels
- `hero` -- "One Image. Infinite Insights.", subtitle, mode labels, upload zone text, feature pills, stats labels
- `features` -- Section badge, title, subtitle, all 8 feature cards (title + description)
- `howItWorks` -- Section badge, title, subtitle, all 4 steps (title + description)
- `roleCards` -- Section badge, title, subtitle, all 3 role cards (title, subtitle, description, features, button text)
- `testimonials` -- Section badge, title, subtitle, testimonial quotes/roles
- `cta` -- Badge, headline, description, button labels, trust text
- `footer` -- Category labels, link labels, tagline, copyright
- `login` -- All form labels, placeholders, hero text, features list, buttons
- `signup` -- All form labels, placeholders, hero text, features list, role options, buttons
- `modeSelector` -- Mode labels and descriptions

**Files:**
1. `src/i18n/locales/en.json`
2. `src/i18n/locales/ar.json`
3. `src/i18n/locales/fr.json`
4. `src/i18n/locales/es.json`

---

#### Phase 2: Dashboard Pages (5 files)

Wire up `useTranslation()` and replace all hardcoded strings:

5. **`src/features/buyer/pages/BuyerDashboard.tsx`** -- Welcome card, stat labels, key actions (title + desc), table headers, section titles, alert messages, button labels
6. **`src/features/seller/pages/SellerDashboard.tsx`** -- Welcome card, stat labels, key actions, chart titles, table headers, section titles, button labels
7. **`src/features/producer/pages/ProducerDashboard.tsx`** -- Welcome card, stat labels, key actions, chart titles, table headers, alert messages
8. **`src/features/dashboard/pages/DashboardPage.tsx`** -- Page header, card titles, "Upload a product image" text
9. **`src/features/dashboard/pages/components/DashboardStats.tsx`** -- All stat titles, "from last month" text
10. **`src/features/dashboard/pages/components/QuickActions.tsx`** -- All action labels, card titles
11. **`src/features/dashboard/pages/components/RecentAnalyses.tsx`** -- Card titles, descriptions, empty state text, mode labels

---

#### Phase 3: Landing Page Components (7 files)

12. **`src/components/landing/Hero.tsx`** -- Headline, subtitle, mode labels, upload zone text, buttons, feature pills, stats
13. **`src/components/landing/Features.tsx`** -- Section header, all 8 feature titles and descriptions
14. **`src/components/landing/HowItWorks.tsx`** -- Section header, all 4 step titles and descriptions
15. **`src/components/landing/RoleCards.tsx`** -- Section header, all 3 role cards
16. **`src/components/landing/Testimonials.tsx`** -- Section header, testimonial text
17. **`src/components/landing/CTA.tsx`** -- All text and buttons
18. **`src/components/landing/Footer.tsx`** -- All link categories, link labels, tagline, copyright

---

#### Phase 4: Auth Pages (2 files)

19. **`src/features/auth/pages/LoginPage.tsx`** -- Form labels, placeholders, hero text, feature bullets, buttons, links
20. **`src/features/auth/pages/SignupPage.tsx`** -- Form labels, placeholders, hero text, feature bullets, role options, buttons, links

---

#### Phase 5: Mode Selector (1 file)

21. **`src/features/dashboard/components/ModeSelector.tsx`** -- Mode labels and descriptions (translate via `t()` using keys from `modeConfig`)

---

### Technical Approach

All components will:
1. Import `useTranslation` from `react-i18next`
2. Add `const { t } = useTranslation();` at the top
3. Replace every hardcoded English string with `t("section.key")`

For static arrays defined outside components (like `features`, `steps`, `roles`, `keyActions`, `statsConfig`), they will be moved inside the component function so they can access `t()`.

For the `modeConfig` in `navigation.ts`, the ModeSelector and DashboardPage will translate labels via `t()` using a lookup map (same pattern as the sidebar).

### RTL Support
Arabic RTL is already handled by the existing LanguageContext. All flex/grid layouts will automatically flip. No additional RTL CSS changes needed.

### Total: ~21 component files + 4 locale files = 25 files modified

