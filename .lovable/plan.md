
# Demo Data & Supplier Detail Popup Implementation Plan

## Overview
This plan adds two key features:
1. **Demo data for AI Market Analysis** - Pre-populated sample data that shows when users view the Market Intelligence page without running an analysis
2. **Supplier detail popup modal** - A comprehensive popup window showing all business information when clicking on a supplier in the discovery results

## What You'll Get

### 1. AI Market Analysis Demo Data
When visiting the Market Intelligence page, users will see sample market analysis data demonstrating the platform's capabilities:
- Pre-populated competitor data with full business profiles
- Market heat map regions with geographic coordinates
- Pricing insights and demand indicators
- Substitute competitors with location data

### 2. Supplier Detail Popup
When clicking any supplier in the Supplier Discovery results:
- Full-screen modal with all business information
- Company overview (size, year established, revenue)
- Contact details (email, phone, website, LinkedIn)
- Full address with Google Maps integration
- Certifications and specializations
- Pricing and lead time details
- "Contact Supplier" and "Save" action buttons

---

## Technical Implementation

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/dashboard/MarketIntelligence.tsx` | Edit | Add demo data toggle and sample market analysis results |
| `src/components/buyer/SupplierDetailModal.tsx` | Create | New modal component for supplier business details |
| `src/components/buyer/ImageSupplierDiscovery.tsx` | Edit | Add state and handler for supplier detail modal |
| `src/components/buyer/SupplierMatchResults.tsx` | Edit | Make supplier cards clickable to open detail modal |
| `src/components/buyer/index.ts` | Edit | Export new SupplierDetailModal component |

### 1. Create Supplier Detail Modal

**New File**: `src/components/buyer/SupplierDetailModal.tsx`

A comprehensive dialog showing:

```text
+------------------------------------------------------------------+
|  [Logo]  Supplier Name            [Verified Badge]    [X Close]  |
|          Location • Industry                                      |
+------------------------------------------------------------------+
|                                                                   |
|  [Match Score] 95% Match                                          |
|  [Progress Bar]                                                   |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | Price Range      |  | MOQ              |  | Lead Time        | |
|  | $120 - $180/unit |  | 100 units        |  | 10-15 days       | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  [Tabs: Overview | Contact | Business Profile | Certifications]  |
|                                                                   |
|  === Overview Tab ===                                             |
|  - Full Address with Google Maps link                             |
|  - City, State, Country                                           |
|  - Delivery estimates if available                                |
|                                                                   |
|  === Contact Tab ===                                              |
|  - Email (clickable mailto)                                       |
|  - Phone (clickable tel)                                          |
|  - Website (external link)                                        |
|  - LinkedIn (external link)                                       |
|                                                                   |
|  === Business Profile Tab ===                                     |
|  - Company Size                                                   |
|  - Year Established                                               |
|  - Annual Revenue                                                 |
|  - Employee Count                                                 |
|  - Specializations                                                |
|                                                                   |
|  === Certifications Tab ===                                       |
|  - List of certifications with verified badges                    |
|                                                                   |
|  +----------------------+  +----------------------+               |
|  |   Contact Supplier   |  |   Save to List       |               |
|  +----------------------+  +----------------------+               |
+------------------------------------------------------------------+
```

### 2. Add Demo Data to Market Intelligence

**Edit**: `src/pages/dashboard/MarketIntelligence.tsx`

Add a "View Demo" button and sample data:

```typescript
const DEMO_MARKET_RESULT: MarketAnalysisResult = {
  productIdentification: {
    name: "Wireless Bluetooth Speaker",
    category: "Consumer Electronics",
    attributes: {
      "Power Output": "20W",
      "Battery Life": "12 hours",
      "Connectivity": "Bluetooth 5.0",
      "Material": "Aluminum + Fabric",
    },
  },
  competitors: [
    {
      name: "SoundMax Electronics",
      marketShare: "28%",
      priceRange: { min: 45, max: 89 },
      strengths: ["Brand recognition", "Wide distribution"],
      geoLocation: {
        latitude: 34.0522,
        longitude: -118.2437,
        formattedAddress: "456 Electronics Blvd, Los Angeles, CA 90001",
        city: "Los Angeles",
        state: "California",
        country: "USA",
      },
      contact: {
        email: "sales@soundmax.com",
        phone: "+1-800-555-1234",
        website: "https://soundmax.com",
      },
      businessProfile: {
        companySize: "201-500",
        yearEstablished: 2012,
        annualRevenue: "$50M - $100M",
        certifications: ["ISO 9001", "FCC", "CE"],
      },
    },
    // ... more competitors
  ],
  substituteCompetitors: [...],
  marketHeatMap: [...],
  marketPriceRange: { min: 35, max: 120, average: 65 },
  pricingRecommendation: {...},
  demandIndicators: {...},
  confidence: 92,
};
```

Add button to load demo:
```tsx
<Button onClick={() => loadDemoData()} variant="outline">
  <Sparkles className="h-4 w-4 mr-2" />
  View Demo Analysis
</Button>
```

### 3. Update ImageSupplierDiscovery

**Edit**: `src/components/buyer/ImageSupplierDiscovery.tsx`

Add modal state and pass handler:

```typescript
const [selectedSupplier, setSelectedSupplier] = useState<SupplierMatch | null>(null);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

const handleViewSupplierDetails = (supplier: SupplierMatch) => {
  setSelectedSupplier(supplier);
  setIsDetailModalOpen(true);
};

// Render modal at bottom of component
<SupplierDetailModal
  supplier={selectedSupplier}
  open={isDetailModalOpen}
  onOpenChange={setIsDetailModalOpen}
  onContact={onContactSupplier}
/>
```

### 4. Update SupplierMatchResults

**Edit**: `src/components/buyer/SupplierMatchResults.tsx`

Make supplier cards fully clickable:

```typescript
// Add onClick to motion.div wrapper
<motion.div
  onClick={() => onViewDetails?.(supplier)}
  className="cursor-pointer hover:shadow-lg transition-all"
>
  {/* existing content */}
</motion.div>
```

---

## Demo Data Structure

### Sample Competitors with Full Business Data
```json
{
  "name": "SoundMax Electronics",
  "marketShare": "28%",
  "priceRange": { "min": 45, "max": 89 },
  "strengths": ["Brand recognition", "Wide distribution", "Quality products"],
  "geoLocation": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "formattedAddress": "456 Electronics Blvd, Los Angeles, CA 90001, USA",
    "city": "Los Angeles",
    "state": "California",
    "country": "USA"
  },
  "contact": {
    "email": "sales@soundmax.com",
    "phone": "+1-800-555-1234",
    "website": "https://soundmax.com",
    "linkedIn": "https://linkedin.com/company/soundmax"
  },
  "businessProfile": {
    "companySize": "201-500",
    "yearEstablished": 2012,
    "annualRevenue": "$50M - $100M",
    "certifications": ["ISO 9001", "FCC", "CE"]
  }
}
```

### Sample Heat Map Regions
```json
{
  "region": "North America",
  "demand": "high",
  "competitorCount": 45,
  "avgPrice": 65,
  "growth": "+12%",
  "opportunity": "excellent",
  "demandConcentration": 78,
  "geoLocation": {
    "latitude": 37.0902,
    "longitude": -95.7129,
    "formattedAddress": "United States",
    "city": "Kansas City",
    "country": "USA"
  }
}
```

---

## User Experience Flow

### Market Intelligence Demo
1. User navigates to Market Intelligence page
2. Sees empty state with "View Demo Analysis" button
3. Clicks button to load sample data
4. Full market analysis displayed with competitors, heat map, pricing
5. Can interact with all tabs and features

### Supplier Detail Popup
1. User uploads product image in Buyer mode
2. AI returns matched suppliers
3. User clicks any supplier card
4. Full-screen modal opens with complete business profile
5. User can view all tabs (Overview, Contact, Business, Certifications)
6. User can click "Contact Supplier" or "Save" from modal
7. Modal closes and user returns to results

---

## Component Dependencies

```text
ImageSupplierDiscovery
    ├── SupplierMatchResults
    │   └── BusinessProfileCard (existing inline)
    ├── SupplierDetailModal (NEW)
    │   ├── Dialog from ui/dialog
    │   ├── Tabs from ui/tabs
    │   └── Badge from ui/badge
    └── SubstituteSuppliers
```

---

## Summary

This implementation adds:
1. **Demo data** for Market Intelligence so users can explore the platform without uploading images
2. **Supplier detail modal** providing a comprehensive view of all business information when clicking on any supplier result
3. Enhanced UX with clickable supplier cards and full business profiles
4. Google Maps integration for supplier addresses
5. Quick contact actions (email, phone, website) directly from the modal
