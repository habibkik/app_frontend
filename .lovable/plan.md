
# Enhanced Production Feasibility Analysis Component

## Overview
This plan creates a comprehensive `FeasibilityAnalysisComponent` in `src/features/producer/components/` that provides detailed cost breakdown, feasibility scoring, make vs buy analysis, scenario simulation, and risk assessment - all integrated into the existing Feasibility page.

## What You'll Get

### 1. Header Section
- Product name with BOM component count
- "Calculate Feasibility" button to trigger analysis

### 2. Cost Breakdown Cards (4 Cards)
- **Component Cost**: Total cost breakdown by component, per-unit cost
- **Production Cost**: Labor, equipment, facility allocation
- **Logistics Cost**: Shipping, import duties, handling/storage
- **Total Cost Summary**: Combined per-unit cost with breakdown

### 3. Feasibility Score (Circular Visual)
- Large circular progress indicator (0-100)
- Color-coded: Red (<50), Yellow (50-70), Green (70+)
- Label: "Production Viable" or "Needs Optimization"

### 4. Key Feasibility Factors (Left Sidebar)
- Component availability status
- Lead time assessment
- Single supplier risk warnings
- Cost competitiveness check
- Local vs imported sourcing ratio

### 5. Production Decision Matrix
- Make vs Buy cost comparison
- Savings calculation
- Recommendation with percentage difference

### 6. Scenario Simulation (Collapsible)
- Production volume slider (100 - 10,000 units)
- Component cost increase slider (0 - 30%)
- Labor cost/hour slider
- Real-time unit cost recalculation
- Volume discount threshold indicator

### 7. Risk Factors Section
- Red flags with specific warnings
- Mitigation suggestions for each risk

### 8. Recommendations Banner
- Feasible: Green with recommended order size and break-even
- Risky: Yellow with risks and cost reduction opportunities
- Not Feasible: Red with reason and alternatives

### 9. Action Buttons
- "Proceed to Production" (if feasible)
- "Optimize BOM" (find cheaper alternatives)
- "Request RFQ from all suppliers"
- "Export Report" (PDF)

---

## Technical Implementation

### 1. Create Feasibility Types

**New File**: `src/features/producer/types/feasibility.ts`

```typescript
export interface ComponentCostBreakdown {
  componentId: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierCount: number;
}

export interface ProductionCostEstimate {
  laborCostPerUnit: number;
  equipmentCostPerUnit: number;
  facilityCostPerUnit: number;
  totalProductionCostPerUnit: number;
}

export interface LogisticsCostEstimate {
  shippingCostPerUnit: number;
  importDuties: number;
  handlingStorage: number;
  totalLandedCostPerUnit: number;
}

export interface FeasibilityFactors {
  componentAvailability: { status: "pass" | "warn" | "fail"; message: string };
  leadTime: { status: "pass" | "warn" | "fail"; days: number; message: string };
  singleSupplierRisk: { status: "pass" | "warn" | "fail"; count: number; message: string };
  costCompetitiveness: { status: "pass" | "warn" | "fail"; message: string };
  localSourcing: { status: "pass" | "warn" | "fail"; localPercent: number; importedPercent: number };
}

export interface MakeVsBuyAnalysis {
  makeCost: number;
  buyCost: number;
  difference: number;
  savingsPercent: number;
  recommendation: "make" | "buy";
}

export interface ScenarioParams {
  productionVolume: number;
  costIncrease: number;
  laborCostPerHour: number;
}

export interface RiskFactor {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  mitigation?: string;
}

export interface FeasibilityAnalysis {
  productName: string;
  componentCount: number;
  score: number;
  status: "feasible" | "risky" | "not-feasible";
  componentCosts: ComponentCostBreakdown[];
  productionCost: ProductionCostEstimate;
  logisticsCost: LogisticsCostEstimate;
  totalCostPerUnit: number;
  factors: FeasibilityFactors;
  makeVsBuy: MakeVsBuyAnalysis;
  risks: RiskFactor[];
  breakEvenUnits: number;
  recommendedMinOrder: number;
}
```

### 2. Create Feasibility Calculator

**New File**: `src/features/producer/utils/feasibilityCalculator.ts`

Utility functions to calculate:
- Component costs from BOM data
- Production costs based on labor rates
- Logistics costs with duty calculations
- Overall feasibility score (weighted factors)
- Make vs Buy analysis
- Scenario simulations

### 3. Create Circular Score Component

**New File**: `src/features/producer/components/FeasibilityScoreCircle.tsx`

Large circular progress using SVG with:
- Animated fill based on score
- Color transitions (red → yellow → green)
- Center text with score and label
- Pulsing animation for attention

### 4. Create Cost Breakdown Cards

**New File**: `src/features/producer/components/CostBreakdownCards.tsx`

Four cards displaying:
- Component Cost with expandable breakdown list
- Production Cost with labor/equipment/facility split
- Logistics Cost with shipping/duties/handling
- Total Summary card with pie chart visualization

### 5. Create Feasibility Factors Panel

**New File**: `src/features/producer/components/FeasibilityFactorsPanel.tsx`

Left sidebar showing:
- Status icons (✓, ⚠, ✗) for each factor
- Color-coded backgrounds
- Detailed tooltips on hover

### 6. Create Make vs Buy Card

**New File**: `src/features/producer/components/MakeVsBuyCard.tsx`

Decision matrix showing:
- Side-by-side cost comparison
- Visual bar chart comparison
- Savings calculation
- AI recommendation badge

### 7. Create Scenario Simulator

**New File**: `src/features/producer/components/ScenarioSimulator.tsx`

Collapsible panel with:
- Three sliders (volume, cost increase, labor rate)
- Real-time cost recalculation
- Volume discount notification
- Reset button

### 8. Create Risk Factors Panel

**New File**: `src/features/producer/components/RiskFactorsPanel.tsx`

Display critical warnings:
- Red/Yellow/Blue color coding by severity
- Expandable mitigation suggestions
- Link to relevant actions (find supplier, etc.)

### 9. Create Recommendation Banner

**New File**: `src/features/producer/components/RecommendationBanner.tsx`

Top-of-page banner:
- Green/Yellow/Red based on status
- Key metrics (min order, break-even)
- Call-to-action buttons

### 10. Create Main Analysis Component

**New File**: `src/features/producer/components/FeasibilityAnalysisComponent.tsx`

Main orchestrating component that:
- Accepts BOM/component data
- Runs feasibility calculations
- Manages simulation state
- Renders all sub-components in layout

### 11. Update Feasibility Page

**Edit**: `src/pages/dashboard/Feasibility.tsx`

Replace/enhance existing content with:
- New FeasibilityAnalysisComponent
- Integration with producerResults from analysisStore
- Tab system to switch between projects

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/producer/types/feasibility.ts` | Create | TypeScript interfaces for feasibility analysis |
| `src/features/producer/utils/feasibilityCalculator.ts` | Create | Calculation utilities for costs and scores |
| `src/features/producer/components/FeasibilityScoreCircle.tsx` | Create | Circular score visualization |
| `src/features/producer/components/CostBreakdownCards.tsx` | Create | Four cost breakdown cards |
| `src/features/producer/components/FeasibilityFactorsPanel.tsx` | Create | Key factors sidebar |
| `src/features/producer/components/MakeVsBuyCard.tsx` | Create | Make vs Buy decision matrix |
| `src/features/producer/components/ScenarioSimulator.tsx` | Create | Collapsible simulation panel |
| `src/features/producer/components/RiskFactorsPanel.tsx` | Create | Risk warnings and mitigations |
| `src/features/producer/components/RecommendationBanner.tsx` | Create | Top recommendation banner |
| `src/features/producer/components/FeasibilityAnalysisComponent.tsx` | Create | Main orchestrating component |
| `src/features/producer/index.ts` | Edit | Export new components |
| `src/pages/dashboard/Feasibility.tsx` | Edit | Integrate new analysis component |

---

## Component Layout

```text
+------------------------------------------------------------------+
| RECOMMENDATION BANNER (Green/Yellow/Red)                          |
| ✓ Production is viable at $45.20/unit | Break-even: 500 units    |
+------------------------------------------------------------------+

+---------------------------+  +------------------------------------+
| HEADER                    |  | FEASIBILITY SCORE                  |
| Product: Smart Device     |  |      ╭──────────╮                  |
| BOM: 10 components        |  |     │    87    │                  |
| [Calculate Feasibility]   |  |     │  VIABLE  │                  |
+---------------------------+  |      ╰──────────╯                  |
                               +------------------------------------+

+------------------------------------------------------------------+
| COST BREAKDOWN CARDS                                              |
| +---------------+ +---------------+ +-----------+ +-------------+ |
| | COMPONENT     | | PRODUCTION    | | LOGISTICS | | TOTAL       | |
| | $28.50/unit   | | $8.20/unit    | | $8.50/unit| | $45.20/unit | |
| | - MCU: $4.25  | | - Labor: $5   | | - Ship: $3| | ───────────  | |
| | - OLED: $6.75 | | - Equip: $2   | | - Duty: $4| | [Pie Chart] | |
| | - Battery: $5 | | - Facil: $1.2 | | - Hand: $1| |             | |
| +---------------+ +---------------+ +-----------+ +-------------+ |
+------------------------------------------------------------------+

+------------------------+  +--------------------------------------+
| KEY FACTORS            |  | MAKE vs BUY DECISION                  |
| ✓ All suppliers found  |  | +----------------+  +----------------+ |
| ⚠ Lead time: 28 days   |  | |    MAKE        |  |     BUY        | |
| ✗ 3 single-source      |  | |   $45.20       |  |    $68.00      | |
| ✓ Below market avg     |  | +----------------+  +----------------+ |
| ⚠ 60% imported         |  | Recommendation: Making saves 34%      |
+------------------------+  +--------------------------------------+

+------------------------------------------------------------------+
| SCENARIO SIMULATION (Collapsible)                                 |
| Volume:  [====500=====] 100 - 10,000 units                       |
| Cost +%: [====10%=====] 0% - 30%                                 |
| Labor:   [====$25=====] $15 - $50/hr                             |
|                                                                   |
| Projected Unit Cost: $47.85  (+5.8% from baseline)               |
| Volume discount kicks in at 500 units                            |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| RISK FACTORS                                                      |
| 🔴 Only 1 supplier for Motor - Consider finding backup           |
| 🟡 45-day lead time aggressive for timeline                      |
| 🟡 15% of cost in import duties - Consider local alternatives    |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| ACTION BUTTONS                                                    |
| [Proceed to Production] [Optimize BOM] [Request RFQ] [Export PDF]|
+------------------------------------------------------------------+
```

---

## Feasibility Score Calculation

```typescript
// Score weights
const WEIGHTS = {
  componentAvailability: 20,  // All suppliers found
  leadTime: 20,               // Lead time acceptable
  singleSupplierRisk: 20,     // Multi-source components
  costCompetitiveness: 25,    // Below market average
  localSourcing: 15,          // Local vs imported ratio
};

// Score calculation
function calculateFeasibilityScore(factors: FeasibilityFactors): number {
  let score = 0;
  
  // Component availability: 20 points
  score += factors.componentAvailability.status === "pass" ? 20 :
           factors.componentAvailability.status === "warn" ? 10 : 0;
  
  // Lead time: 20 points
  if (factors.leadTime.days <= 14) score += 20;
  else if (factors.leadTime.days <= 28) score += 15;
  else if (factors.leadTime.days <= 45) score += 8;
  
  // Single supplier risk: 20 points
  if (factors.singleSupplierRisk.count === 0) score += 20;
  else if (factors.singleSupplierRisk.count <= 2) score += 12;
  else if (factors.singleSupplierRisk.count <= 4) score += 5;
  
  // Cost competitiveness: 25 points
  score += factors.costCompetitiveness.status === "pass" ? 25 :
           factors.costCompetitiveness.status === "warn" ? 15 : 5;
  
  // Local sourcing: 15 points
  score += Math.round(factors.localSourcing.localPercent / 100 * 15);
  
  return Math.min(100, Math.max(0, score));
}

// Status determination
function getStatus(score: number): "feasible" | "risky" | "not-feasible" {
  if (score >= 70) return "feasible";
  if (score >= 50) return "risky";
  return "not-feasible";
}
```

---

## Data Integration

The component will use data from:
1. **BOM Components** (`src/data/bom.ts`): Component list with costs
2. **Supplier Quotes** (`src/data/components.ts`): Supplier pricing and lead times
3. **Analysis Store** (`src/stores/analysisStore.ts`): Producer analysis results
4. **Supply Chain Risk** (`src/lib/supply-chain-risk.ts`): Risk calculations

---

## Styling Guidelines

- Professional, data-forward design
- Charts using Recharts (PieChart for cost breakdown)
- Color coding:
  - Green (#10b981): Good/Pass/Feasible
  - Yellow (#f59e0b): Caution/Warning/Risky  
  - Red (#ef4444): Risk/Fail/Not Feasible
- Framer Motion animations for:
  - Score circle fill animation
  - Card entrance animations
  - Slider value changes
- Mobile responsive with stacked layout on small screens
- Collapsible sections for complex data
