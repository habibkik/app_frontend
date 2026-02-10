

## Full i18n Translation Plan: Arabic, French, and Spanish

### Overview
The i18n infrastructure (i18next, LanguageContext, LanguageSelector) is fully set up, but no component currently uses `useTranslation()` to render translated text. Switching language in the UI has no visible effect. This plan adds translation keys for the Content Studio (primary focus) and wires up the key shared components so the entire app responds to language changes.

### Scope of Changes

#### 1. Translation Files (4 files)
Add a `contentStudio` section with ~80 keys covering all UI labels in the Content Studio, plus a `sidebar` section for navigation items. All 4 locale files will be updated:

- `src/i18n/locales/en.json` -- English keys
- `src/i18n/locales/ar.json` -- Arabic translations
- `src/i18n/locales/fr.json` -- French translations
- `src/i18n/locales/es.json` -- Spanish translations

New translation sections:
- `contentStudio` -- All Content Studio labels (Content Settings, Product, Target Audience, audiences, content types, tones, tab names, button labels, placeholder text, toast messages, history section, actions bar, landing page section labels)
- `sidebar` -- Navigation group labels and item titles for all 3 modes (buyer, seller, producer)

#### 2. Content Studio Component
**File:** `src/features/seller/components/ContentStudio.tsx`

- Import `useTranslation` from `react-i18next`
- Add `const { t } = useTranslation();` at the top of the component
- Replace all hardcoded English strings with `t("contentStudio.xxx")` calls
- This includes: card titles, labels, dropdown options (audiences, tones, content types), tab triggers, button text, toast messages, placeholder text, section headings

Key strings to translate (examples):
- "Content Settings" -> `t("contentStudio.title")`
- "Configure your content generation" -> `t("contentStudio.subtitle")`
- "Select a product" -> `t("contentStudio.selectProduct")`
- "Target Audience" -> `t("contentStudio.targetAudience")`
- "E-commerce Shoppers" -> `t("contentStudio.audiences.ecommerce")`
- "Generate Content" -> `t("contentStudio.generate")`
- "Generating..." -> `t("contentStudio.generating")`
- Tab labels: "Headlines", "Copy", "Description", "Email", "Social", "Landing"
- Button labels: "Use in Ad", "Copy", "Edit", "Save", "Post Directly", etc.
- Section titles: "Subject Lines", "Email Body", "Hero Section", "Value Proposition", "Feature Highlights", "Call to Action"
- History: "Recently Generated", "Restore", "Delete"
- Actions: "Save as Template", "Load Template", "Export ZIP", "Share with Team"

#### 3. Dashboard Sidebar
**File:** `src/features/dashboard/components/DashboardSidebar.tsx`

- Import `useTranslation`
- Translate group labels and item titles using `t("sidebar.xxx")`
- The navigation config (`navigation.ts`) returns static English strings; the sidebar will map them through `t()` using a key lookup

#### 4. Dashboard Header
**File:** `src/features/dashboard/components/DashboardHeader.tsx`

- Import `useTranslation`
- Translate: "Search products, suppliers...", "Profile", "Settings", "Currency", "API Keys", "Billing", "Sign out"

#### 5. Landing Navigation
**File:** `src/components/landing/Navigation.tsx`

- Import `useTranslation`
- Translate nav link labels: "Try Demo", "For Buyers", "For Sellers", "For Producers", "Pricing", "Sign In", "Get Started"

### Technical Details

**Translation key structure example (en.json):**
```json
{
  "contentStudio": {
    "title": "Content Settings",
    "subtitle": "Configure your content generation",
    "product": "Product",
    "selectProduct": "Select a product",
    "targetAudience": "Target Audience",
    "audiences": {
      "ecommerce": "E-commerce Shoppers",
      "wholesale": "Wholesale Buyers",
      "retailers": "Retailers",
      "b2b": "Corporate/B2B",
      "other": "Other"
    },
    "contentTypes": {
      "label": "Content Types",
      "adCopy": "Ad copy (short)",
      "description": "Product description (long)",
      "email": "Email campaign",
      "social": "Social media posts",
      "landing": "Landing page copy"
    },
    "tone": "Tone",
    "tones": {
      "professional": "Professional",
      "friendly": "Friendly",
      "humorous": "Humorous",
      "urgent": "Urgent/FOMO"
    },
    "generate": "Generate Content",
    "generating": "Generating...",
    "tabs": {
      "headlines": "Headlines",
      "copy": "Copy",
      "description": "Description",
      "email": "Email",
      "social": "Social",
      "landing": "Landing"
    },
    ...
  }
}
```

**Arabic example:**
```json
{
  "contentStudio": {
    "title": "إعدادات المحتوى",
    "subtitle": "قم بتكوين إنشاء المحتوى الخاص بك",
    "product": "المنتج",
    "selectProduct": "اختر منتجاً",
    "targetAudience": "الجمهور المستهدف",
    "audiences": {
      "ecommerce": "متسوقو التجارة الإلكترونية",
      "wholesale": "مشترو الجملة",
      "retailers": "تجار التجزئة",
      "b2b": "الشركات/B2B",
      "other": "أخرى"
    },
    ...
  }
}
```

**How dropdown options are translated:**
The static arrays (`audiences`, `contentTypeOptions`, `toneOptions`) will be moved inside the component function so they can use `t()`:

```tsx
const audiences = [
  { value: "ecommerce", label: t("contentStudio.audiences.ecommerce") },
  { value: "wholesale", label: t("contentStudio.audiences.wholesale") },
  ...
];
```

### RTL Support
RTL layout is already handled by the LanguageContext (sets `document.documentElement.dir = "rtl"` and adds a `rtl` class). All Tailwind styles will respond automatically since the app uses standard flex/grid layouts.

### Files Modified (Total: 8)
1. `src/i18n/locales/en.json` -- Add contentStudio, sidebar, header, landingNav sections
2. `src/i18n/locales/ar.json` -- Arabic translations for all new keys
3. `src/i18n/locales/fr.json` -- French translations for all new keys
4. `src/i18n/locales/es.json` -- Spanish translations for all new keys
5. `src/features/seller/components/ContentStudio.tsx` -- Wire up `t()` for all strings
6. `src/features/dashboard/components/DashboardSidebar.tsx` -- Wire up `t()` for nav labels
7. `src/features/dashboard/components/DashboardHeader.tsx` -- Wire up `t()` for header labels
8. `src/components/landing/Navigation.tsx` -- Wire up `t()` for nav links

