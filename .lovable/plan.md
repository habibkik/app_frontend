
# Component Supplier Page for Producer Mode

## Overview
This plan creates an enhanced "Component Supply" page in Producer mode that shows all component search history and results, with detailed supplier information in popup windows. The popup includes enhanced team tabs with role-specific departments and a comprehensive Supply Chain Risk section.

## What You'll Get

### 1. Enhanced Component Supply Page
- **Search History**: View all past component searches organized by component
- **Component-based Results**: See suppliers grouped by each component you've searched for
- **Clickable Supplier Names**: Open full supplier details in popup windows

### 2. Enhanced Supplier Detail Popup (4 Tabs)
- **Overview**: Location with Google Maps, description, specializations, certifications
- **Contact**: Email, phone, website, LinkedIn (all clickable)
- **Business**: Revenue, company size, establishment year, industry
- **Team**: Enhanced with department-grouped employees

### 3. Enhanced Team Tab - Department Organization
People organized by department:
- **Sales**: Sales Directors, Account Managers, Business Development
- **After Sales**: Customer Success, Support Engineers, Service Managers
- **Technical**: Technical Sales Engineers, Application Engineers
- **Production**: Production Managers, Quality Engineers, Manufacturing Leads

### 4. NEW Supply Chain Risk Section
Visual dashboard showing:
- **Supply Chain Flow Visualization**: Component → Supplier → Delivery flow diagram
- **Lead Time Risk Assessment**: Risk level based on delivery times
- **Single Supplier Dependency Risk**: Warning when only one supplier available
- **Geographic Concentration Risk**: Risk when suppliers concentrated in one region
- **Overall Risk Score**: 0-100 composite score with color-coded indicator

---

## Technical Implementation

### 1. Extend SupplierEmployee Type

**File**: `src/data/suppliers.ts`

Add department categorization to employees:

```typescript
export type EmployeeDepartment = 
  | "sales" 
  | "after_sales" 
  | "technical" 
  | "production" 
  | "management"
  | "other";

export interface SupplierEmployee {
  name: string;
  role: string;
  linkedIn: string;
  avatar?: string;
  department: EmployeeDepartment; // NEW
}
```

### 2. Create Component Supplier Store

**New File**: `src/stores/componentSupplierStore.ts`

Zustand store to persist component search history:

```typescript
interface ComponentSearchResult {
  id: string;
  componentId: string;
  componentName: string;
  category: string;
  searchedAt: Date;
  suppliers: ComponentSupplierMatch[];
}

interface ComponentSupplierMatch {
  id: string;
  name: string;
  location: string;
  unitPrice: number;
  moq: number;
  leadTime: string;
  leadTimeDays: number;
  rating: number;
  certifications: string[];
  inStock: boolean;
  // Full supplier details
  geoLocation?: GeoLocation;
  contact?: SupplierContact;
  businessProfile?: SupplierBusinessProfile;
  employees?: SupplierEmployee[];
}

interface ComponentSupplierStore {
  searchHistory: ComponentSearchResult[];
  addSearchResult: (result: ComponentSearchResult) => void;
  clearHistory: () => void;
  getSuppliersByComponent: (componentId: string) => ComponentSupplierMatch[];
}
```

### 3. Create Supply Chain Risk Calculator

**New File**: `src/lib/supply-chain-risk.ts`

Utility to calculate various risk metrics:

```typescript
interface SupplyChainRiskScore {
  overall: number; // 0-100
  leadTimeRisk: {
    score: number;
    level: "low" | "medium" | "high";
    details: string;
  };
  singleSupplierRisk: {
    score: number;
    level: "low" | "medium" | "high";
    affectedComponents: string[];
  };
  geographicRisk: {
    score: number;
    level: "low" | "medium" | "high";
    concentrationDetails: { region: string; percentage: number }[];
  };
}

export function calculateLeadTimeRisk(suppliers: SupplierQuote[]): RiskLevel;
export function calculateSingleSupplierRisk(components: ComponentPart[], quotes: SupplierQuote[]): RiskLevel;
export function calculateGeographicConcentrationRisk(suppliers: SupplierQuote[]): RiskLevel;
export function calculateOverallRiskScore(metrics: RiskMetrics): number;
```

### 4. Create Supply Chain Flow Visualization Component

**New File**: `src/components/components/SupplyChainFlow.tsx`

Visual flow diagram showing:
```text
+-------------+     +---------------+     +-------------+
| Components  | --> |   Suppliers   | --> |  Delivery   |
|  (Parts)    |     |  (Sources)    |     |  (Timeline) |
+-------------+     +---------------+     +-------------+
     ↓                    ↓                     ↓
  5 Parts          12 Suppliers           18 avg days
```

### 5. Create Supply Chain Risk Panel Component

**New File**: `src/components/components/SupplyChainRiskPanel.tsx`

Dashboard card showing all risk metrics:

```text
+----------------------------------------------------------+
|  Supply Chain Risk Assessment                             |
+----------------------------------------------------------+
|                                                          |
|  Overall Risk Score: [====72====] MEDIUM                 |
|                                                          |
|  +-------------------+  +-------------------+            |
|  | Lead Time Risk    |  | Dependency Risk   |            |
|  | 🟡 MEDIUM         |  | 🔴 HIGH           |            |
|  | Avg: 18 days      |  | 2 single-source   |            |
|  +-------------------+  +-------------------+            |
|                                                          |
|  +-------------------+                                   |
|  | Geographic Risk   |                                   |
|  | 🟡 MEDIUM         |                                   |
|  | 60% in China      |                                   |
|  +-------------------+                                   |
|                                                          |
|  [View Detailed Analysis]                                |
+----------------------------------------------------------+
```

### 6. Create Component Supplier Detail Modal

**New File**: `src/components/components/ComponentSupplierDetailModal.tsx`

Enhanced version of SupplierDetailModal with:
- All 4 existing tabs (Overview, Contact, Business, Team)
- Enhanced Team tab with department grouping:

```text
+----------------------------------------------------------+
| Team Tab                                                  |
+----------------------------------------------------------+
|                                                          |
| 🏢 SALES DEPARTMENT                                       |
| +------------------------------------------------------+ |
| | [Avatar] David Chen - Sales Director    [LinkedIn →] | |
| | [Avatar] Sarah Kim - Account Manager    [LinkedIn →] | |
| +------------------------------------------------------+ |
|                                                          |
| 🔧 TECHNICAL DEPARTMENT                                   |
| +------------------------------------------------------+ |
| | [Avatar] Tom Lee - Technical Sales Eng  [LinkedIn →] | |
| | [Avatar] Amy Wu - Application Engineer  [LinkedIn →] | |
| +------------------------------------------------------+ |
|                                                          |
| 🛠️ PRODUCTION DEPARTMENT                                  |
| +------------------------------------------------------+ |
| | [Avatar] Mike Chen - Production Manager [LinkedIn →] | |
| | [Avatar] Liu Wei - Quality Engineer     [LinkedIn →] | |
| +------------------------------------------------------+ |
|                                                          |
| 📞 AFTER SALES / SUPPORT                                  |
| +------------------------------------------------------+ |
| | [Avatar] Jenny Lin - Customer Success   [LinkedIn →] | |
| | [Avatar] Wang Fei - Support Engineer    [LinkedIn →] | |
| +------------------------------------------------------+ |
|                                                          |
+----------------------------------------------------------+
```

### 7. Update Components Page

**Edit**: `src/pages/dashboard/Components.tsx`

Add new sections:
- Search history sidebar
- Supply chain risk panel
- Clickable supplier names that open detail modal
- Filter by component searches

### 8. Update Mock Data

**Edit**: `src/data/components.ts` and `src/data/suppliers.ts`

Add department-categorized employees to supplier quotes:

```typescript
employees: [
  { name: "David Chen", role: "Sales Director", department: "sales", linkedIn: "..." },
  { name: "Amy Wu", role: "Technical Engineer", department: "technical", linkedIn: "..." },
  { name: "Mike Zhang", role: "Production Manager", department: "production", linkedIn: "..." },
  { name: "Jenny Lin", role: "Customer Success", department: "after_sales", linkedIn: "..." },
]
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/suppliers.ts` | Edit | Add `EmployeeDepartment` type and `department` field to employees |
| `src/data/components.ts` | Edit | Add employee data to supplier quotes with departments |
| `src/stores/componentSupplierStore.ts` | Create | New store for component search history |
| `src/lib/supply-chain-risk.ts` | Create | Risk calculation utilities |
| `src/components/components/SupplyChainFlow.tsx` | Create | Flow visualization component |
| `src/components/components/SupplyChainRiskPanel.tsx` | Create | Risk dashboard panel |
| `src/components/components/ComponentSupplierDetailModal.tsx` | Create | Enhanced supplier detail modal with department-grouped team |
| `src/pages/dashboard/Components.tsx` | Edit | Add history, risk panel, clickable suppliers |
| `src/features/producer/index.ts` | Edit | Export new components |
| `src/stores/index.ts` | Edit | Export new store |

---

## Risk Score Calculation Logic

```typescript
// Lead Time Risk (0-100)
// < 7 days: 10 (low)
// 7-14 days: 30 (low-medium)
// 14-21 days: 50 (medium)
// 21-30 days: 70 (medium-high)
// > 30 days: 90 (high)

// Single Supplier Dependency Risk (0-100)
// All components have 3+ suppliers: 10
// 1-2 components single-sourced: 50
// 3+ components single-sourced: 80
// Any critical component single-sourced: 95

// Geographic Concentration Risk (0-100)
// Spread across 3+ regions: 20
// 50%+ in one region: 50
// 70%+ in one region: 75
// 90%+ in one region: 90

// Overall Score = weighted average
// Lead Time: 30%
// Single Supplier: 40%
// Geographic: 30%
```

---

## User Experience Flow

1. User navigates to Producer Mode → Component Supply
2. Sees list of components with supplier quotes (existing)
3. **NEW**: Clicks on supplier name → Opens detailed popup with 4 tabs
4. **NEW**: Team tab shows employees grouped by department (Sales, Technical, Production, After Sales)
5. **NEW**: Supply Chain Risk panel shows overall health score
6. **NEW**: Flow visualization shows component → supplier → delivery pipeline
7. **NEW**: Risk warnings highlight single-source and geographic concentration issues
8. User can click LinkedIn profiles to connect with relevant contacts

---

## Visual Design

### Risk Score Indicator
```text
0-30: 🟢 LOW    - Green gradient, "Supply chain healthy"
31-60: 🟡 MEDIUM - Yellow gradient, "Some risks identified"  
61-80: 🟠 HIGH  - Orange gradient, "Significant risks"
81-100: 🔴 CRITICAL - Red gradient, "Urgent action needed"
```

### Department Icons in Team Tab
```text
Sales: 💼 (briefcase)
Technical: ⚙️ (gear)
Production: 🏭 (factory)
After Sales: 🛎️ (service bell)
Management: 👔 (business)
```
