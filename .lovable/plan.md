

## Auto-Fill AI Landing Page Generator from Market Intelligence

### Overview
When the AI Landing Page Generator dialog opens, it will automatically detect analyzed products from the market intelligence store and either auto-fill the form immediately (if one product exists) or show a dropdown to select which analyzed product to use. All relevant data -- product name, category, specifications, competitors, pricing, demand trends -- will be mapped to the corresponding form fields.

### What Changes

**1. Add "Market Intelligence" data source dropdown**
At the top of the AI Landing Page Generator form, a new section will appear:
- If `sellerResults` exists in the analysis store, show a prominent banner with a "Use Market Intelligence Data" button that auto-fills all fields
- If analysis `history` has multiple seller-mode entries, show a dropdown to pick which analyzed product to use
- The existing "Auto-fill from existing product" dropdown remains below it for database products

**2. Auto-fill mapping from `sellerResults` (MarketAnalysisResult)**
When the user selects market intelligence data, the form fields are populated:

| Form Field | Source from `sellerResults` |
|---|---|
| Product Name | `productIdentification.name` |
| Category | `productIdentification.category` |
| Key Features | `productIdentification.attributes` (converted to comma-separated) |
| Specs | `productIdentification.attributes` (formatted as key: value) |
| Competitive Advantages | Derived from competitors' strengths (inverted -- what user's product does better) |
| Market Positioning | Derived from `marketPriceRange.average` vs `pricingRecommendation.suggested` |
| Pricing Strategy | `pricingRecommendation.suggested` + margin scenarios |
| Pain Points | Derived from `demandIndicators` trend context |
| Desires | Derived from demand trend + seasonality |
| Brand Tone | Auto-selected based on positioning (premium -> luxury, affordable -> minimal, etc.) |

**3. Pass richer market intelligence to the edge function**
The existing `marketIntelligence` object sent to the edge function already includes competitors, pricing, and demand data. This remains unchanged -- the improvement is purely on the frontend auto-fill side.

### Technical Details

**File: `src/features/seller/components/website-builder/AILandingGenerator.tsx`**

Changes:
- Import `history` from `useAnalysisStore` in addition to `sellerResults`
- Add a new `useEffect` that runs when `open` changes: if `sellerResults` exists and form is still empty (initial state), auto-fill the form immediately
- Add a helper function `fillFromSellerResults(results: MarketAnalysisResult)` that maps all fields
- Add a "Source" selector at the top of the form with options:
  - "Market Intelligence: [product name]" (if `sellerResults` exists) -- selected by default
  - Each seller-mode history item (from `history` filtered by `mode === "seller"`)
  - "Database Product" (existing product dropdown)
  - "Manual Entry" (blank form)
- When "Market Intelligence" is selected, auto-fill and show a green badge "Fields populated from analysis"
- The existing product dropdown moves under the source selector and only shows when "Database Product" is selected
- All fields remain fully editable after auto-fill

**No other files need to change** -- the edge function already receives and uses market intelligence data, and the store already exposes all needed data.

### User Experience Flow

1. User analyzes a product image in Seller mode (market intelligence generated)
2. User navigates to Website Builder
3. User clicks "AI Generate" button
4. Dialog opens with form **already pre-filled** from the latest market intelligence analysis
5. A green banner shows: "Auto-filled from Market Intelligence: [Product Name]"
6. User can switch source via dropdown if multiple analyses exist, or choose a database product
7. User reviews/adjusts fields and clicks "Generate Landing Page"
8. The AI receives both the form data AND the raw market intelligence for optimal generation
