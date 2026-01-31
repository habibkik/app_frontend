

# Project Restructuring: Bulletproof-React Migration Plan

## ✅ PHASE 1 COMPLETE - Core Infrastructure

The following has been implemented:

### Core App Layer (`src/app/`)
- ✅ `App.tsx` - Root component with providers
- ✅ `Router.tsx` - Centralized route definitions

### Shared Infrastructure
- ✅ `src/stores/` - Zustand stores (modeStore, uiStore, authStore)
- ✅ `src/services/api/` - API client and endpoints
- ✅ `src/utils/` - Helpers, formatters, validators, constants
- ✅ `src/types/` - Common and API types
- ✅ `src/hooks/` - Shared hooks (useApi, useAsync, useDebounce, etc.)

### Feature Module Barrel Exports
- ✅ `src/features/auth/index.ts`
- ✅ `src/features/dashboard/index.ts`
- ✅ `src/features/landing/index.ts`
- ✅ `src/features/buyer/index.ts`
- ✅ `src/features/producer/index.ts`
- ✅ `src/features/seller/index.ts`
- ✅ `src/features/agents/index.ts` (scaffolds for MiroMind, MiroThinker)

### Entry Point
- ✅ `src/main.tsx` updated to use new `src/app/App.tsx`

---

## REMAINING WORK (Phase 2)

The barrel exports are in place and routing through the new app structure. The next phase involves:
1. Moving individual component files into their feature folders
2. Updating all internal imports to use feature barrel exports
3. Converting remaining Context providers to Zustand stores
4. Cleaning up old folder structure

---


## Executive Summary

This plan migrates the current Lovable project from a file-type organization to the target feature-based Bulletproof-React architecture you've defined. The migration involves moving approximately **85 files** into the new structure while preserving all existing functionality.

---

## Current State Analysis

### Existing File Count by Category

| Current Location | File Count | Status |
|-----------------|------------|--------|
| `src/components/ui/` | 50 files | Keep in place |
| `src/components/auth/` | 3 files | Migrate to `features/auth/` |
| `src/components/bom/` | 6 files | Migrate to `features/producer/` |
| `src/components/suppliers/` | 7 files | Migrate to `features/buyer/` |
| `src/components/market/` | 6 files | Migrate to `features/seller/` |
| `src/components/dashboard/` | 5 files | Migrate to `features/dashboard/` |
| `src/components/landing/` | 8 files | Create `features/landing/` |
| `src/components/rfqs/` | 1 file | Migrate to `features/buyer/` |
| `src/components/conversations/` | 1 file | Migrate to `features/buyer/` |
| `src/components/components/` | 6 files | Migrate to `features/producer/` |
| `src/pages/` | 5 + 13 files | Distribute to features |
| `src/contexts/` | 4 files | Migrate to `stores/` |
| `src/lib/` | 6 files | Distribute to features/services |
| `src/data/` | 6 files | Distribute to feature APIs |
| `src/hooks/` | 3 files | Migrate to `hooks/` |
| `src/config/` | 1 file | Migrate to `features/dashboard/` |

---

## Target Structure Mapping

### Phase 1: Core App Layer

Create the central app module:

```text
src/app/
├── App.tsx          # Root component with providers
└── Router.tsx       # Centralized route definitions
```

**Files to create:**
- `src/app/App.tsx` - Extract provider composition from current `src/App.tsx`
- `src/app/Router.tsx` - Extract route definitions

---

### Phase 2: Feature Modules

#### 2.1 Auth Feature

```text
src/features/auth/
├── api/
│   └── authApi.ts              ← src/lib/auth-api.ts
├── components/
│   ├── LoginForm.tsx           ← NEW (extract from Login page)
│   └── SignupForm.tsx          ← NEW (extract from Signup page)
├── hooks/
│   ├── useAuth.ts              ← src/hooks/use-auth.ts
│   ├── useLogin.ts             ← NEW
│   ├── useLogout.ts            ← NEW
│   ├── useSession.ts           ← NEW
│   ├── useSignup.ts            ← NEW
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx           ← src/pages/Login.tsx
│   ├── SignupPage.tsx          ← src/pages/Signup.tsx
│   ├── EmailVerificationPage.tsx  ← NEW (placeholder)
│   └── ForgotPasswordPage.tsx  ← NEW (placeholder)
├── types/
│   └── auth.types.ts           ← NEW (extract from auth-api.ts)
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/lib/auth-api.ts` | `src/features/auth/api/authApi.ts` |
| `src/hooks/use-auth.ts` | `src/features/auth/hooks/useAuth.ts` |
| `src/components/auth/AuthProvider.tsx` | `src/features/auth/components/AuthProvider.tsx` |
| `src/components/auth/PasswordStrengthMeter.tsx` | `src/features/auth/components/PasswordStrengthMeter.tsx` |
| `src/components/auth/ProtectedRoute.tsx` | `src/features/auth/components/ProtectedRoute.tsx` |
| `src/pages/Login.tsx` | `src/features/auth/pages/LoginPage.tsx` |
| `src/pages/Signup.tsx` | `src/features/auth/pages/SignupPage.tsx` |

---

#### 2.2 Buyer Feature

```text
src/features/buyer/
├── api/
│   ├── buyerApi.ts             ← NEW
│   ├── productApi.ts           ← NEW
│   ├── rfqApi.ts               ← src/data/rfqs.ts
│   └── supplierApi.ts          ← src/data/suppliers.ts
├── components/
│   ├── BulkActionsToolbar.tsx  ← src/components/suppliers/
│   ├── BulkTagAssignModal.tsx  ← src/components/suppliers/
│   ├── ContactSupplierModal.tsx ← src/components/suppliers/
│   ├── CreateRFQDialog.tsx     ← src/components/rfqs/
│   ├── SupplierCard.tsx        ← src/components/suppliers/
│   ├── SupplierDetailModal.tsx ← src/components/suppliers/
│   ├── SupplierFilters.tsx     ← src/components/suppliers/
│   ├── SupplierNotesTagsModal.tsx ← src/components/suppliers/
│   ├── TypingIndicator.tsx     ← src/components/conversations/
│   └── ...                     ← Additional new components
├── hooks/
│   ├── useProductUpload.ts     ← NEW
│   ├── useRFQ.ts               ← NEW
│   ├── useRFQStatus.ts         ← NEW
│   └── useSupplierSearch.ts    ← NEW
├── pages/
│   ├── BuyerDashboard.tsx      ← NEW (mode-specific dashboard)
│   ├── ProductUploadPage.tsx   ← NEW
│   ├── RFQBuilderPage.tsx      ← src/pages/dashboard/RFQs.tsx
│   ├── RFQStatusPage.tsx       ← NEW
│   ├── SearchResultsPage.tsx   ← src/pages/dashboard/Suppliers.tsx
│   └── index.ts
├── state/
│   └── buyerStore.ts           ← src/contexts/SavedSuppliersContext.tsx + ConversationsContext.tsx
├── types/
│   ├── buyer.types.ts          ← NEW
│   ├── product.types.ts        ← NEW
│   ├── rfq.types.ts            ← NEW
│   └── supplier.types.ts       ← NEW
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/components/suppliers/BulkActionsToolbar.tsx` | `src/features/buyer/components/BulkActionsToolbar.tsx` |
| `src/components/suppliers/BulkTagAssignModal.tsx` | `src/features/buyer/components/BulkTagAssignModal.tsx` |
| `src/components/suppliers/ContactSupplierModal.tsx` | `src/features/buyer/components/ContactSupplierModal.tsx` |
| `src/components/suppliers/SupplierCard.tsx` | `src/features/buyer/components/SupplierCard.tsx` |
| `src/components/suppliers/SupplierDetailModal.tsx` | `src/features/buyer/components/SupplierDetailModal.tsx` |
| `src/components/suppliers/SupplierFilters.tsx` | `src/features/buyer/components/SupplierFilters.tsx` |
| `src/components/suppliers/SupplierNotesTagsModal.tsx` | `src/features/buyer/components/SupplierNotesTagsModal.tsx` |
| `src/components/rfqs/CreateRFQDialog.tsx` | `src/features/buyer/components/CreateRFQDialog.tsx` |
| `src/components/conversations/TypingIndicator.tsx` | `src/features/buyer/components/TypingIndicator.tsx` |
| `src/pages/dashboard/Suppliers.tsx` | `src/features/buyer/pages/SearchResultsPage.tsx` |
| `src/pages/dashboard/RFQs.tsx` | `src/features/buyer/pages/RFQBuilderPage.tsx` |
| `src/pages/dashboard/Conversations.tsx` | `src/features/buyer/pages/ConversationsPage.tsx` |
| `src/pages/dashboard/SavedSuppliers.tsx` | `src/features/buyer/pages/SavedSuppliersPage.tsx` |
| `src/data/suppliers.ts` | `src/features/buyer/api/supplierApi.ts` |
| `src/data/rfqs.ts` | `src/features/buyer/api/rfqApi.ts` |
| `src/data/conversations.ts` | `src/features/buyer/api/conversationApi.ts` |
| `src/contexts/SavedSuppliersContext.tsx` | `src/features/buyer/state/buyerStore.ts` (convert to Zustand) |
| `src/contexts/ConversationsContext.tsx` | `src/features/buyer/state/buyerStore.ts` (convert to Zustand) |

---

#### 2.3 Producer Feature

```text
src/features/producer/
├── api/
│   └── producerApi.ts          ← src/lib/ai-analysis-service.ts + comparison-storage.ts
├── components/
│   ├── AIAnalysisPanel.tsx     ← src/components/bom/AIAnalysisPanel.tsx
│   ├── BOMComponentsTable.tsx  ← src/components/bom/BOMComponentsTable.tsx
│   ├── BOMCostSummary.tsx      ← src/components/bom/BOMCostSummary.tsx
│   ├── BOMEditor.tsx           ← NEW (enhanced)
│   ├── BOMExportActions.tsx    ← src/components/bom/BOMExportActions.tsx
│   ├── BOMSupplierMatchModal.tsx ← src/components/bom/BOMSupplierMatchModal.tsx
│   ├── BOMUploadZone.tsx       ← src/components/bom/BOMUploadZone.tsx
│   ├── ComparisonSummary.tsx   ← src/components/components/ComparisonSummary.tsx
│   ├── ComponentCard.tsx       ← src/components/components/ComponentCard.tsx
│   ├── ComponentSupply.tsx     ← NEW
│   ├── CostComparisonChart.tsx ← src/components/components/CostComparisonChart.tsx
│   ├── FeasibilityAnalysis.tsx ← NEW
│   ├── LoadComparisonDialog.tsx ← src/components/components/LoadComparisonDialog.tsx
│   ├── SaveComparisonDialog.tsx ← src/components/components/SaveComparisonDialog.tsx
│   └── SupplierQuoteList.tsx   ← src/components/components/SupplierQuoteList.tsx
├── hooks/
│   ├── useBOM.ts               ← NEW
│   └── useProductionCost.ts    ← NEW
├── pages/
│   ├── BOMs.tsx                ← src/pages/dashboard/BOM.tsx
│   ├── ComponentsPage.tsx      ← src/pages/dashboard/Components.tsx
│   ├── FeasibilityPage.tsx     ← src/pages/dashboard/Feasibility.tsx
│   ├── GTMPage.tsx             ← src/pages/dashboard/GTM.tsx
│   └── ProducerDashboard.tsx   ← NEW
├── types/
│   ├── producer.types.ts       ← NEW
│   └── bom.types.ts            ← NEW
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/components/bom/AIAnalysisPanel.tsx` | `src/features/producer/components/AIAnalysisPanel.tsx` |
| `src/components/bom/BOMComponentsTable.tsx` | `src/features/producer/components/BOMComponentsTable.tsx` |
| `src/components/bom/BOMCostSummary.tsx` | `src/features/producer/components/BOMCostSummary.tsx` |
| `src/components/bom/BOMExportActions.tsx` | `src/features/producer/components/BOMExportActions.tsx` |
| `src/components/bom/BOMSupplierMatchModal.tsx` | `src/features/producer/components/BOMSupplierMatchModal.tsx` |
| `src/components/bom/BOMUploadZone.tsx` | `src/features/producer/components/BOMUploadZone.tsx` |
| `src/components/components/ComparisonSummary.tsx` | `src/features/producer/components/ComparisonSummary.tsx` |
| `src/components/components/ComponentCard.tsx` | `src/features/producer/components/ComponentCard.tsx` |
| `src/components/components/CostComparisonChart.tsx` | `src/features/producer/components/CostComparisonChart.tsx` |
| `src/components/components/LoadComparisonDialog.tsx` | `src/features/producer/components/LoadComparisonDialog.tsx` |
| `src/components/components/SaveComparisonDialog.tsx` | `src/features/producer/components/SaveComparisonDialog.tsx` |
| `src/components/components/SupplierQuoteList.tsx` | `src/features/producer/components/SupplierQuoteList.tsx` |
| `src/pages/dashboard/BOM.tsx` | `src/features/producer/pages/BOMs.tsx` |
| `src/pages/dashboard/Components.tsx` | `src/features/producer/pages/ComponentsPage.tsx` |
| `src/pages/dashboard/Feasibility.tsx` | `src/features/producer/pages/FeasibilityPage.tsx` |
| `src/pages/dashboard/GTM.tsx` | `src/features/producer/pages/GTMPage.tsx` |
| `src/lib/ai-analysis-service.ts` | `src/features/producer/api/aiAnalysisApi.ts` |
| `src/lib/comparison-storage.ts` | `src/features/producer/api/comparisonStorage.ts` |
| `src/data/bom.ts` | `src/features/producer/api/bomApi.ts` |
| `src/data/components.ts` | `src/features/producer/api/componentsApi.ts` |

---

#### 2.4 Seller Feature

```text
src/features/seller/
├── api/
│   ├── marketIntelligenceApi.ts ← src/lib/market-intel-service.ts
│   └── sellerApi.ts            ← NEW
├── components/
│   ├── AnalysisHistory.tsx     ← src/components/market/AnalysisHistory.tsx
│   ├── AnalysisSummaryCard.tsx ← src/components/market/AnalysisSummaryCard.tsx
│   ├── CompetitorAnalysisCard.tsx ← src/components/market/CompetitorAnalysisCard.tsx
│   ├── ContentStudio.tsx       ← NEW
│   ├── MarketIntelligence.tsx  ← NEW (refactored component)
│   ├── MarketSearch.tsx        ← src/components/market/MarketSearch.tsx
│   ├── PricingAnalysisCard.tsx ← src/components/market/PricingAnalysisCard.tsx
│   ├── PricingOptimizer.tsx    ← NEW
│   ├── SocialPublisher.tsx     ← NEW
│   └── TrendAnalysisCard.tsx   ← src/components/market/TrendAnalysisCard.tsx
├── hooks/
│   ├── useCompetitorPrices.ts  ← NEW
│   ├── useMarketingContent.ts  ← NEW
│   └── usePricingStrategy.ts   ← NEW
├── pages/
│   ├── Campaigns.tsx           ← src/pages/dashboard/Campaigns.tsx
│   ├── MarketIntelligencePage.tsx ← src/pages/dashboard/MarketIntelligence.tsx
│   ├── PricingPage.tsx         ← src/pages/dashboard/Pricing.tsx
│   ├── SellerDashboard.tsx     ← NEW
│   └── WebsiteBuilderPage.tsx  ← src/pages/dashboard/WebsiteBuilder.tsx
├── types/
│   └── seller.types.ts         ← NEW
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/components/market/AnalysisHistory.tsx` | `src/features/seller/components/AnalysisHistory.tsx` |
| `src/components/market/AnalysisSummaryCard.tsx` | `src/features/seller/components/AnalysisSummaryCard.tsx` |
| `src/components/market/CompetitorAnalysisCard.tsx` | `src/features/seller/components/CompetitorAnalysisCard.tsx` |
| `src/components/market/MarketSearch.tsx` | `src/features/seller/components/MarketSearch.tsx` |
| `src/components/market/PricingAnalysisCard.tsx` | `src/features/seller/components/PricingAnalysisCard.tsx` |
| `src/components/market/TrendAnalysisCard.tsx` | `src/features/seller/components/TrendAnalysisCard.tsx` |
| `src/pages/dashboard/MarketIntelligence.tsx` | `src/features/seller/pages/MarketIntelligencePage.tsx` |
| `src/pages/dashboard/Pricing.tsx` | `src/features/seller/pages/PricingPage.tsx` |
| `src/pages/dashboard/Campaigns.tsx` | `src/features/seller/pages/Campaigns.tsx` |
| `src/pages/dashboard/WebsiteBuilder.tsx` | `src/features/seller/pages/WebsiteBuilderPage.tsx` |
| `src/lib/market-intel-service.ts` | `src/features/seller/api/marketIntelligenceApi.ts` |

---

#### 2.5 Dashboard Feature

```text
src/features/dashboard/
├── components/
│   ├── Header.tsx              ← src/components/dashboard/DashboardHeader.tsx
│   ├── ModeSelector.tsx        ← src/components/dashboard/ModeSelector.tsx
│   ├── Sidebar.tsx             ← src/components/dashboard/DashboardSidebar.tsx
│   └── DashboardLayout.tsx     ← src/components/dashboard/DashboardLayout.tsx
├── config/
│   └── navigation.ts           ← src/config/navigation.ts
├── hooks/
│   └── useDashboard.ts         ← NEW
├── pages/
│   ├── DashboardPage.tsx       ← src/pages/Dashboard.tsx
│   └── AnalyticsPage.tsx       ← src/pages/dashboard/Analytics.tsx
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/components/dashboard/DashboardHeader.tsx` | `src/features/dashboard/components/Header.tsx` |
| `src/components/dashboard/DashboardLayout.tsx` | `src/features/dashboard/components/DashboardLayout.tsx` |
| `src/components/dashboard/DashboardSidebar.tsx` | `src/features/dashboard/components/Sidebar.tsx` |
| `src/components/dashboard/ModeSelector.tsx` | `src/features/dashboard/components/ModeSelector.tsx` |
| `src/components/dashboard/PlaceholderPage.tsx` | `src/features/dashboard/components/PlaceholderPage.tsx` |
| `src/pages/Dashboard.tsx` | `src/features/dashboard/pages/DashboardPage.tsx` |
| `src/pages/dashboard/Analytics.tsx` | `src/features/dashboard/pages/AnalyticsPage.tsx` |
| `src/config/navigation.ts` | `src/features/dashboard/config/navigation.ts` |
| `src/contexts/DashboardModeContext.tsx` | `src/stores/modeStore.ts` (convert to Zustand) |
| `src/data/analytics.ts` | `src/features/dashboard/api/analyticsApi.ts` |

---

#### 2.6 Landing Feature

```text
src/features/landing/
├── components/
│   ├── CTA.tsx                 ← src/components/landing/CTA.tsx
│   ├── Features.tsx            ← src/components/landing/Features.tsx
│   ├── Footer.tsx              ← src/components/landing/Footer.tsx
│   ├── Hero.tsx                ← src/components/landing/Hero.tsx
│   ├── HowItWorks.tsx          ← src/components/landing/HowItWorks.tsx
│   ├── Navigation.tsx          ← src/components/landing/Navigation.tsx
│   ├── RoleCards.tsx           ← src/components/landing/RoleCards.tsx
│   └── Testimonials.tsx        ← src/components/landing/Testimonials.tsx
├── pages/
│   └── IndexPage.tsx           ← src/pages/Index.tsx
└── index.ts
```

---

#### 2.7 Agents Feature (Scaffold)

```text
src/features/agents/
├── miroflow/
│   └── priceCollectionPipeline.ts  ← NEW (scaffold)
├── miromind/
│   ├── contentGeneration.ts    ← NEW (scaffold)
│   ├── productUnderstanding.ts ← NEW (scaffold)
│   └── index.ts
├── mirorl/
│   ├── feedbackLogger.ts       ← NEW (scaffold)
│   └── performanceTracker.ts   ← NEW (scaffold)
├── mirothinker/
│   ├── priceExtraction.ts      ← NEW (scaffold)
│   ├── productValidation.ts    ← NEW (scaffold)
│   ├── supplierValidation.ts   ← NEW (scaffold)
│   └── index.ts
└── index.ts
```

---

### Phase 3: Shared Infrastructure

#### 3.1 Components (Keep + Restructure)

```text
src/components/
├── ui/                         ← KEEP AS-IS (50 shadcn files)
├── common/
│   ├── Badge.tsx               ← NEW (wrapper)
│   ├── Button.tsx              ← NEW (wrapper)
│   ├── Card.tsx                ← NEW (wrapper)
│   ├── ErrorBoundary.tsx       ← NEW
│   ├── Input.tsx               ← NEW (wrapper)
│   ├── Modal.tsx               ← NEW (wrapper)
│   └── index.ts
├── layout/
│   ├── AuthLayout.tsx          ← NEW
│   ├── MainLayout.tsx          ← NEW
│   └── index.ts
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/components/NavLink.tsx` | `src/components/common/NavLink.tsx` |
| `src/components/ThemeToggle.tsx` | `src/components/common/ThemeToggle.tsx` |

---

#### 3.2 Services Layer

```text
src/services/
├── api/
│   ├── apiClient.ts            ← NEW (axios/fetch wrapper)
│   ├── endpoints.ts            ← NEW (API constants)
│   └── interceptors.ts         ← NEW
├── auth/
│   ├── sessionManager.ts       ← NEW
│   └── supabaseAuth.ts         ← NEW (placeholder)
├── claude/
│   ├── claudeClient.ts         ← NEW (placeholder)
│   └── modelConfig.ts          ← NEW (placeholder)
├── social/
│   ├── emailMessenger.ts       ← NEW (placeholder)
│   ├── facebookMessenger.ts    ← NEW (placeholder)
│   ├── instagramDM.ts          ← NEW (placeholder)
│   └── whatsappMessenger.ts    ← NEW (placeholder)
├── supabase/
│   ├── dbQueries.ts            ← NEW
│   ├── supabaseClient.ts       ← NEW (placeholder)
│   └── index.ts
├── apiClient.ts                ← NEW
├── env.ts                      ← NEW
├── init.ts                     ← NEW
└── index.ts
```

---

#### 3.3 Stores (Context to Zustand Migration)

```text
src/stores/
├── authStore.ts                ← NEW (from use-auth.ts patterns)
├── modeStore.ts                ← src/contexts/DashboardModeContext.tsx
├── uiStore.ts                  ← src/contexts/ThemeContext.tsx
└── index.ts
```

---

#### 3.4 Shared Hooks

```text
src/hooks/
├── useApi.ts                   ← NEW
├── useAsync.ts                 ← NEW
├── useDebounce.ts              ← NEW
├── useLocalStorage.ts          ← NEW
├── useMobile.ts                ← src/hooks/use-mobile.tsx (rename)
├── useToast.ts                 ← src/hooks/use-toast.ts
└── index.ts
```

---

#### 3.5 Types

```text
src/types/
├── api.types.ts                ← NEW
├── common.types.ts             ← NEW
└── index.ts
```

---

#### 3.6 Utils

```text
src/utils/
├── cn.ts                       ← Extract from src/lib/utils.ts
├── constants.ts                ← NEW
├── formatters.ts               ← NEW
├── helpers.ts                  ← src/lib/utils.ts
├── utils.ts                    ← Keep for compatibility
├── validators.ts               ← NEW
└── index.ts
```

**Existing files to migrate:**
| From | To |
|------|-----|
| `src/lib/utils.ts` | `src/utils/helpers.ts` + `src/utils/cn.ts` |
| `src/lib/notification-sound.ts` | `src/utils/notifications.ts` |

---

#### 3.7 Styles

```text
src/styles/
├── globals.css                 ← src/index.css
├── tailwind.css                ← NEW (Tailwind imports)
└── variables.css               ← NEW (CSS custom properties)
```

---

## Implementation Phases

### Execution Order

| Phase | Description | Files Affected | Priority |
|-------|-------------|----------------|----------|
| 1 | Create `src/app/` structure | 2 new files | Critical |
| 2 | Create shared infrastructure (`stores/`, `services/`, `utils/`) | ~25 new files | Critical |
| 3 | Migrate Dashboard feature | 10 files | Critical |
| 4 | Migrate Auth feature | 10 files | Critical |
| 5 | Migrate Buyer feature | 20 files | High |
| 6 | Migrate Producer feature | 20 files | High |
| 7 | Migrate Seller feature | 15 files | High |
| 8 | Migrate Landing feature | 9 files | Medium |
| 9 | Create Agents scaffolds | 10 files | Low |
| 10 | Update all imports + barrel exports | All files | Critical |

---

## Technical Details

### Import Path Updates

All imports will change from file-type paths to feature paths:

```typescript
// BEFORE
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/auth-api';

// AFTER  
import { SupplierCard, useSupplierSearch } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { authApi } from '@/features/auth';
```

### Barrel Export Pattern

Each feature will have an `index.ts` that exports public API:

```typescript
// src/features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { SignupForm } from './components/SignupForm';
export { AuthProvider } from './components/AuthProvider';
export { ProtectedRoute } from './components/ProtectedRoute';
export { useAuth, useLogin, useLogout } from './hooks';
export { authApi } from './api/authApi';
export type { User, AuthState, LoginFormData } from './types/auth.types';
```

### Zustand Store Migration

Contexts will be converted to Zustand stores:

```typescript
// src/stores/modeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DashboardMode = 'buyer' | 'producer' | 'seller';

interface ModeStore {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: 'buyer',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'dashboard-mode' }
  )
);
```

---

## File Count Summary

| Category | Move/Rename | Create New | Delete |
|----------|-------------|------------|--------|
| App Core | 1 | 2 | 0 |
| Auth Feature | 7 | 6 | 0 |
| Buyer Feature | 17 | 8 | 0 |
| Producer Feature | 18 | 5 | 0 |
| Seller Feature | 11 | 6 | 0 |
| Dashboard Feature | 9 | 2 | 0 |
| Landing Feature | 9 | 1 | 0 |
| Agents Feature | 0 | 10 | 0 |
| Shared Components | 2 | 8 | 0 |
| Services | 0 | 15 | 0 |
| Stores | 0 | 4 | 4 |
| Hooks | 3 | 4 | 0 |
| Utils | 2 | 5 | 0 |
| Types | 0 | 3 | 0 |
| Styles | 1 | 2 | 1 |
| **Total** | **~80** | **~81** | **5** |

---

## Dependencies to Add

```json
{
  "zustand": "^4.5.0"
}
```

This is required for the Zustand store pattern used in your target structure.

---

## Risk Mitigation

1. **Incremental migration** - Complete one feature at a time before moving to the next
2. **Import aliases maintained** - The `@/` alias continues to work
3. **No logic changes** - All business logic remains identical, only file locations change
4. **TypeScript validation** - Compiler catches broken imports immediately

