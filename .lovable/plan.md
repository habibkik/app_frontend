

## Add Missing Features: Email Verification, RFQ Campaign Builder, and Settings Tabs

### What's Being Added

After auditing all 15 prompts against the codebase, three features are entirely missing:

1. **Email Verification Page** -- A post-signup page with a 6-digit OTP input, countdown resend timer, and redirect on success.
2. **RFQ Campaign Builder** -- A multi-step wizard (4 steps) for selecting suppliers, composing messages with templates/variables, choosing contact channels, and reviewing/sending RFQs.
3. **Settings: Company, Billing, and Integrations tabs** -- Three new sections to complete the Settings page.

---

### 1. Email Verification Page

**New file:** `src/features/auth/pages/EmailVerificationPage.tsx`

- Full-page layout matching login/signup design (gradient left panel + form right panel)
- 6-digit OTP input using the existing `input-otp` component
- Countdown timer (45 seconds) for the "Resend code" button
- "Wrong email? Change email" link back to signup
- Loading state during verification
- On success: redirect to `/dashboard`
- i18n ready with `useTranslation()`

**New route:** `/verify-email` added to `src/app/Router.tsx`

**Update:** `src/features/auth/index.ts` to export the new page

**Locale updates:** Add `emailVerification` section to all 4 locale files with keys for title, subtitle, resend, wrongEmail, verifying, etc.

---

### 2. RFQ Campaign Builder

**New file:** `src/components/rfqs/RFQCampaignBuilder.tsx`

A 4-step wizard component:

- **Step 1 -- Select Suppliers:** Search input, show saved/recent suppliers, multi-select with checkboxes, selected count badge
- **Step 2 -- Customize Message:** Template dropdown (Quick Quote, Bulk Order, Custom Spec), rich textarea with variable insertion (supplier_name, product_name, quantity, desired_delivery), character count
- **Step 3 -- Select Channels:** Checkboxes for Email/WhatsApp/Phone (with availability indicators), email subject line input, per-channel preview
- **Step 4 -- Review and Send:** Summary card, confirmation checkbox, send button

Progress indicator at the top showing current step. Back/Next navigation.

**New file:** `src/pages/dashboard/RFQCampaign.tsx` -- Page wrapper using DashboardLayout

**Update:** `src/app/Router.tsx` -- Add route `/dashboard/rfq-campaign`

**Update:** `src/pages/dashboard/RFQs.tsx` -- Add "New Campaign" button linking to the campaign builder

**Locale updates:** Add `rfqCampaign` section to all 4 locale files

---

### 3. Settings: Company, Billing, and Integrations Tabs

**New file:** `src/components/settings/CompanySection.tsx`
- Company name, logo upload, industry dropdown, company size dropdown, website URL, timezone, currency selector, save button

**New file:** `src/components/settings/BillingSection.tsx`
- Current plan card (plan name, price, billing date, renewal date)
- Upgrade/downgrade button with plan comparison modal
- Payment method display (masked card, expiration, update button)
- Billing history table (date, description, amount, invoice link)

**New file:** `src/components/settings/IntegrationsSection.tsx`
- Connected services list: Slack, Google Drive, Zapier, Custom Webhooks
- Each service: connect/disconnect button, last sync time, status badge

**Update:** `src/pages/dashboard/Settings.tsx` -- Add 3 new tabs (Company, Billing, Integrations) alongside existing 7 tabs (total: 10)

**Update:** `src/components/settings/index.ts` -- Export new sections

**Locale updates:** Add `settings.company`, `settings.billing`, `settings.integrations` sections to all 4 locale files

---

### Technical Details

**Files to create (5):**
1. `src/features/auth/pages/EmailVerificationPage.tsx`
2. `src/components/rfqs/RFQCampaignBuilder.tsx`
3. `src/components/settings/CompanySection.tsx`
4. `src/components/settings/BillingSection.tsx`
5. `src/components/settings/IntegrationsSection.tsx`

**Files to modify (7):**
1. `src/app/Router.tsx` -- Add 2 new routes
2. `src/features/auth/index.ts` -- Export EmailVerificationPage
3. `src/pages/dashboard/Settings.tsx` -- Add 3 new tabs
4. `src/components/settings/index.ts` -- Export 3 new sections
5. `src/i18n/locales/en.json` -- Add ~120 new keys
6. `src/i18n/locales/ar.json` -- Arabic translations
7. `src/i18n/locales/fr.json` -- French translations
8. `src/i18n/locales/es.json` -- Spanish translations

**Total: 13 files (5 new + 8 modified)**

All new components will use `useTranslation()` from the start, following existing patterns. All use shadcn/ui components already installed in the project. No new dependencies needed -- `input-otp` is already installed for the OTP input.

