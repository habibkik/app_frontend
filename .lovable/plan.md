

# Competitor Detail Popup for Competitor Tracking Page

## Overview
Add a comprehensive popup modal that displays all business information for a competitor when clicking on their card in the Competitors page in the three dot in the top right corner of the box. This will be similar to the existing `BuyerSupplierDetailModal` but adapted for competitor data.

## What You'll Get
When you click on any competitor in the "Competitors" card on the Competitor Tracking page:
- A full-screen modal opens with all business details
- Company overview with logo and tracking status
- Tabbed interface showing:
  - Overview (location, description)
  - Contact (email, phone, website)
  - Business Profile (company size, revenue, year established)
  - Analysis (strengths, weaknesses, pricing strategy)
- Quick action buttons for tracking and visiting website

## Technical Implementation

### 1. Create Competitor Detail Modal
**New File**: `src/components/seller/CompetitorDetailModal.tsx`

A comprehensive dialog component with:

```text
+------------------------------------------------------------------+
|  [Logo]  Competitor Name           [Tracking Badge]   [X Close]  |
|          website.com                                              |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | Price Index      |  | Market Share     |  | Products         | |
|  | 105              |  | 23%              |  | 1,250            | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  [Tabs: Overview | Contact | Business | Analysis]                 |
|                                                                   |
|  === Overview Tab ===                                             |
|  - Full Address with Google Maps link                             |
|  - Business description                                           |
|  - Last updated timestamp                                         |
|                                                                   |
|  === Contact Tab ===                                              |
|  - Email (clickable mailto)                                       |
|  - Phone (clickable tel)                                          |
|  - Website (external link)                                        |
|  - LinkedIn profile                                               |
|                                                                   |
|  === Business Tab ===                                             |
|  - Company Size                                                   |
|  - Year Established                                               |
|  - Annual Revenue                                                 |
|  - Certifications                                                 |
|                                                                   |
|  === Analysis Tab ===                                             |
|  - Strengths (green badges)                                       |
|  - Weaknesses (red badges)                                        |
|  - Pricing strategy insights                                      |
|  - Trend indicator                                                |
|                                                                   |
|  +----------------------+  +----------------------+               |
|  |   Visit Website      |  |   Toggle Tracking    |               |
|  +----------------------+  +----------------------+               |
+------------------------------------------------------------------+
```

### 2. Enhance Mock Competitor Data
**Edit**: `src/pages/dashboard/Competitors.tsx`

Add geographic and business profile data to the mock competitors:

```typescript
const mockCompetitors = [
  {
    id: "1",
    name: "TechSupply Co",
    website: "techsupply.com",
    // ... existing fields ...
    
    // New fields
    geoLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      formattedAddress: "550 Market Street, San Francisco, CA 94104, USA",
      city: "San Francisco",
      state: "California",
      country: "USA",
    },
    contact: {
      email: "sales@techsupply.com",
      phone: "+1-888-555-0123",
      website: "https://techsupply.com",
      linkedIn: "https://linkedin.com/company/techsupply",
    },
    businessProfile: {
      companySize: "201-500",
      yearEstablished: 2010,
      annualRevenue: "$25M - $50M",
      certifications: ["ISO 9001", "SOC 2"],
      specializations: ["Industrial Equipment", "Fast Shipping"],
    },
    description: "Leading supplier of industrial components with 24/7 support and extensive product catalog.",
  },
  // ... similar updates for other competitors
];
```

### 3. Add Modal State and Handler
**Edit**: `src/pages/dashboard/Competitors.tsx`

Add state for the detail modal:

```typescript
const [detailModalOpen, setDetailModalOpen] = useState(false);

const handleViewCompetitorDetails = (competitor: typeof mockCompetitors[0]) => {
  setSelectedCompetitor(competitor);
  setDetailModalOpen(true);
};
```

### 4. Update Competitor Cards to Open Modal
**Edit**: `src/pages/dashboard/Competitors.tsx`

Modify the competitor card click handler to open the modal:

```typescript
<motion.div
  onClick={() => handleViewCompetitorDetails(competitor)}
  className="cursor-pointer..."
>
  {/* existing content */}
</motion.div>
```

### 5. Export New Component
**Edit**: `src/components/seller/index.ts`

Export the new modal component.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/seller/CompetitorDetailModal.tsx` | Create | New modal component for competitor details |
| `src/pages/dashboard/Competitors.tsx` | Edit | Add enhanced mock data, modal state, and click handler |
| `src/components/seller/index.ts` | Edit | Export new CompetitorDetailModal |
| `src/features/seller/index.ts` | Edit | Re-export CompetitorDetailModal |

---

## User Experience Flow

1. User navigates to Competitor Tracking page
2. User clicks on any competitor card in the "Competitors" section
3. Detail modal opens with comprehensive business information
4. User can browse tabs (Overview, Contact, Business, Analysis)
5. User can click "Visit Website" or "Toggle Tracking" from the modal
6. Modal closes and user returns to the competitor list

