

# Unified AI Trade Platform - PRD Alignment Plan

## Executive Summary

Based on the PRD analysis, the core vision is clear: **Image is the universal language of trade**. Every mode (Buyer, Producer, Seller) should start from an image upload, and the AI should generate all relevant intelligence based on the selected mode.

Currently, only the **Producer mode** has image-based analysis (BOM page with MiroMind). The Buyer and Seller modes lack this image-first approach entirely.

---

## Current State vs PRD Requirements

| Stage | PRD Requirement | Current Implementation | Gap |
|-------|-----------------|----------------------|-----|
| Stage 1 | Image as universal input for ALL modes | Only BOM page (Producer) has image upload | Buyer and Seller need image entry points |
| Stage 3 | Buyer: Supplier discovery from image | Text-based supplier search only | Need image-to-supplier flow |
| Stage 4 | Producer: Image to BOM | Implemented with MiroMind | Working |
| Stage 5 | Seller: Market intelligence from image | Text-based market search only | Need image-to-market flow |

---

## Implementation Plan

### Phase 1: Create Universal Image Upload Component

Create a reusable, mode-aware image upload component that serves as the entry point for all modes.

**Files to Create:**
- `src/components/shared/UniversalImageUpload.tsx` - Shared image upload with mode context
- `src/features/agents/miromind/analyzers/` - Mode-specific analysis functions

**Component Features:**
- Drag-and-drop image upload
- Camera capture (mobile)
- Mode-aware messaging ("Find suppliers for this product" vs "Analyze production requirements")
- Processing animation with mode-specific steps

---

### Phase 2: Adapt Dashboard Home to Image-First Experience

Transform the main Dashboard page from a stats overview to an **image-centric entry point**.

**Changes to `src/features/dashboard/pages/DashboardPage.tsx`:**

```text
Current: Stats cards + Recent Activity + Quick Actions
Target:  Central image upload + Mode-specific guidance + Recent analyses
```

**New Layout:**
1. Hero section with large image upload zone
2. Mode-specific prompt ("Upload a product image to...")
   - Buyer: "...find suppliers and get quotes"
   - Producer: "...generate BOM and source components"
   - Seller: "...analyze market and optimize pricing"
3. Recent analyses cards (from stored results)
4. Quick action buttons as secondary navigation

---

### Phase 3: Buyer Mode - Image-to-Supplier Flow

Implement the PRD Stage 3 requirements for Buyer intelligence.

**New Components:**
- `src/components/buyer/ImageSupplierDiscovery.tsx` - Main image analysis for buyers
- `src/components/buyer/SubstituteProducts.tsx` - Alternative product suggestions
- `src/components/buyer/SupplierMatchResults.tsx` - AI-matched suppliers panel

**Flow:**
1. User uploads product image
2. MiroMind identifies product category, attributes, specifications
3. AI matches to supplier database based on product type
4. Display: Matched suppliers, price ranges, MOQ, substitutes

**API Updates (`src/features/agents/miromind/api.ts`):**
- Add `analyzeForSourcing()` function
- Returns: product identification, category, suggested suppliers, substitutes

---

### Phase 4: Seller Mode - Image-to-Market Flow

Implement PRD Stage 5 requirements for Seller intelligence.

**New Components:**
- `src/components/seller/ImageMarketAnalysis.tsx` - Market analysis from image
- `src/components/seller/CompetitorFromImage.tsx` - Find competitors selling similar products
- `src/components/seller/PricingRecommendation.tsx` - AI pricing suggestions

**Flow:**
1. User uploads product image they want to sell
2. MiroMind identifies product, category, key attributes
3. AI generates:
   - Competitor list (who else sells this)
   - Market price ranges
   - Recommended pricing with margin scenarios
   - Marketing content (already built with ContentGenerationPanel)

**API Updates:**
- Add `analyzeForSelling()` function
- Returns: market analysis, competitors, pricing recommendations

---

### Phase 5: Integrate Mode-Specific Navigation

Update navigation to reflect image-first approach.

**Changes to `src/features/dashboard/config/navigation.ts`:**

```text
Buyer Navigation:
- Dashboard (with image upload)
- Supplier Results (shows after image analysis)
- My RFQs
- Conversations
- Saved Suppliers

Producer Navigation:
- Dashboard (with image upload)
- BOM Results (shows after image analysis)
- Component Supply
- Production Feasibility
- Go-To-Market

Seller Navigation:
- Dashboard (with image upload)
- Market Results (shows after image analysis)
- Pricing Strategy
- Campaigns
- Website Builder
```

---

### Phase 6: Shared Analysis Results Store

Create a centralized store for analysis results that persists across navigation.

**New File: `src/stores/analysisStore.ts`**

```typescript
interface AnalysisStore {
  // Current active analysis
  currentAnalysis: ProductAnalysis | null;
  
  // Mode-specific results
  buyerResults: SupplierDiscoveryResult | null;
  producerResults: BOMAnalysisResult | null;
  sellerResults: MarketAnalysisResult | null;
  
  // Analysis history
  history: AnalysisHistoryItem[];
  
  // Actions
  setAnalysis: (analysis: ProductAnalysis, mode: DashboardMode) => void;
  clearAnalysis: () => void;
}
```

---

## Technical Details

### MiroMind Agent Extensions

**New prompt templates (`src/features/agents/miromind/prompts.ts`):**

1. **Buyer Analysis Prompt:**
   - Identify product for sourcing
   - Extract specifications for supplier matching
   - Suggest alternative/substitute products

2. **Seller Analysis Prompt:**
   - Identify product for market positioning
   - Extract sellable attributes
   - Analyze potential competitive positioning

### API Endpoints (Backend Reference)

Add to `docs/miromind-backend-example.md`:

```text
POST /api/miromind/analyze-for-sourcing
POST /api/miromind/analyze-for-selling
POST /api/miromind/generate-marketing  (existing)
POST /api/miromind/analyze             (existing - for BOM)
```

---

## File Changes Summary

| Action | File Path | Purpose |
|--------|-----------|---------|
| Create | `src/components/shared/UniversalImageUpload.tsx` | Reusable mode-aware upload |
| Create | `src/components/buyer/ImageSupplierDiscovery.tsx` | Buyer image analysis |
| Create | `src/components/buyer/SupplierMatchResults.tsx` | Show matched suppliers |
| Create | `src/components/seller/ImageMarketAnalysis.tsx` | Seller image analysis |
| Create | `src/components/seller/PricingRecommendation.tsx` | AI pricing panel |
| Create | `src/stores/analysisStore.ts` | Centralized analysis state |
| Modify | `src/features/dashboard/pages/DashboardPage.tsx` | Image-first home |
| Modify | `src/features/agents/miromind/api.ts` | Add mode-specific APIs |
| Modify | `src/features/agents/miromind/prompts.ts` | Add buyer/seller prompts |
| Modify | `src/pages/dashboard/Suppliers.tsx` | Integrate with image results |
| Modify | `src/pages/dashboard/MarketIntelligence.tsx` | Integrate with image results |
| Update | `docs/miromind-backend-example.md` | Add new endpoints |

---

## Implementation Order

1. **Universal Image Upload** - Foundation component
2. **Analysis Store** - State management for results
3. **Dashboard Redesign** - Image-first entry point
4. **Buyer Flow** - Image to supplier discovery
5. **Seller Flow** - Image to market analysis
6. **Navigation Updates** - Reflect new flows
7. **Backend Documentation** - Update API reference

---

## Questions Addressed

**"The main purpose of the app is to generate all from an image upload for each mode"**

This plan ensures:
- Every mode starts with image upload
- MiroMind analyzes based on selected mode context
- Results are mode-specific (suppliers for buyers, BOM for producers, market data for sellers)
- The same image can be analyzed differently when switching modes

