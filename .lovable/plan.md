
# Mapbox Integration with Enhanced Geographic & Business Data

## Overview
This plan adds comprehensive geographic coordinates (Mapbox-compatible), full business information, and demand concentration data to all entities across the platform. Suppliers, competitors, and producers will have complete location data that powers an interactive map on the Heat Map page.

## What You'll Get

### For Buyer Mode
- Supplier addresses with GPS coordinates and Google Maps links
- Business profiles: company size, year established, revenue, certifications
- Contact information: website, email, phone
- Regional supplier density visualization on Heat Map

### For Producer & Seller Modes  
- Competitor addresses with coordinates
- Demand concentration data per region (percentage showing where buyers are)
- Full business profiles for competitors
- Regional market opportunity visualization

### Interactive Mapbox Map
- Real map showing entity locations worldwide
- Clickable markers with popup details
- Toggle between map view and grid view
- Mode-specific marker colors

---

## Technical Implementation

### 1. Install Mapbox Dependencies

Add packages for interactive mapping:
- `react-map-gl` - React wrapper for Mapbox GL JS
- `mapbox-gl` - Core Mapbox library

**Note**: Mapbox requires a public access token. You'll be prompted to add it as a secret. The token is safe for client-side use.

### 2. Update Type Definitions

**File**: `src/stores/analysisStore.ts`

Add new shared interfaces:

```typescript
// Geographic location with coordinates
interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

// Business contact information
interface BusinessContact {
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
}

// Company profile details
interface BusinessProfile {
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  yearEstablished?: number;
  annualRevenue?: string;
  employeeCount?: number;
  certifications?: string[];
  specializations?: string[];
}

// Demand concentration for regions
interface RegionalDemand {
  region: string;
  demandLevel: "high" | "medium" | "low";
  concentration: number; // 0-100 percentage
  geoLocation?: GeoLocation;
}
```

Update existing types to include new fields:
- `SupplierMatch` - Add geoLocation, contact, businessProfile
- `SubstituteSupplier` - Add geoLocation, contact
- `ProducerCompetitor` - Add geoLocation, contact, businessProfile, demandConcentration
- `CompetitorInfo` - Add geoLocation, contact, businessProfile
- `SubstituteCompetitor` - Add geoLocation, contact
- `MarketHeatMapRegion` - Add geoLocation, demandConcentration percentage

### 3. Update Edge Functions

#### A. Product Supplier Analysis (Buyer Mode)
**File**: `supabase/functions/product-supplier-analysis/index.ts`

Enhance AI prompt to request:
- Full business address with GPS coordinates
- Contact information (website, email, phone)
- Company profile (size, revenue, certifications)
- Regional supplier distribution data

Updated response structure per supplier:
```json
{
  "geoLocation": {
    "latitude": 22.5431,
    "longitude": 114.0579,
    "formattedAddress": "Building 8, Tech Park, Shenzhen 518057, China",
    "city": "Shenzhen",
    "country": "China"
  },
  "contact": {
    "website": "https://example.com",
    "email": "sales@example.com",
    "phone": "+86-755-8888-9999"
  },
  "businessProfile": {
    "companySize": "201-500",
    "yearEstablished": 2008,
    "certifications": ["ISO 9001", "CE"]
  }
}
```

#### B. Competitor Analysis (Producer/Seller Modes)
**File**: `supabase/functions/competitor-analysis/index.ts`

Add support for:
- Image-based analysis (alongside URL-based)
- Competitor geographic data extraction
- Demand concentration by region
- Market heat map data with coordinates

### 4. Create Mapbox Components

**New Files in `src/components/shared/`:**

#### A. `MapboxMap.tsx`
Interactive map component featuring:
- Configurable viewport (auto-fits to markers)
- Support for markers and clustering
- Custom marker icons by entity type
- Click popup with entity details
- Navigation controls (zoom, pan)
- Mode-specific styling (different colors for buyer/seller/producer)

#### B. `LocationMarker.tsx`
Custom marker component showing:
- Entity type icon (factory, store, supplier badge)
- Color coding by demand level or match score
- Hover tooltip with entity name

#### C. `MapPopupCard.tsx`
Popup card displaying:
- Entity name and type badge
- Full address with "Open in Google Maps" link
- Key metrics (price, lead time, market share)
- Contact quick actions

#### D. `BusinessProfileCard.tsx`
Expandable card showing:
- Company overview
- Contact information with action buttons
- Business metrics (size, revenue, year established)
- Certifications and specializations

### 5. Update Heat Map Page

**File**: `src/pages/dashboard/HeatMap.tsx`

Transform into dual-view experience:

```text
+------------------------------------------------------------------+
|  [Map Icon] Regional Heat Map                    [Map] [Grid]     |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |              [INTERACTIVE MAPBOX MAP]                      |  |
|  |         Markers for suppliers/competitors                  |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  [Summary Stats Cards]                                            |
|  +--------------------+  +--------------------+  +-------------+  |
|  | Region Card 1      |  | Region Card 2      |  | Region 3    |  |
|  +--------------------+  +--------------------+  +-------------+  |
+------------------------------------------------------------------+
```

Mode-specific behavior:
| Mode | Shows on Map | Marker Color |
|------|-------------|--------------|
| Buyer | Supplier locations | Blue markers |
| Producer | Competitor factories | Indigo markers |
| Seller | Competitor locations | Purple markers |

### 6. Update Display Components

Add business profile sections and map links:

**Buyer Mode**:
- `SupplierMatchResults.tsx` - Add address display, "View on Map" link, contact info
- `SubstituteSuppliers.tsx` - Add location with coordinates

**Producer Mode**:
- `ProducerCompetition.tsx` - Add factory address, demand concentration, business profile
- `SubstituteProducers.tsx` - Add location display

**Seller Mode**:
- `CompetitorDisplay.tsx` - Add headquarters location, business profile
- `SubstituteCompetitors.tsx` - Add address and contact info
- `MarketHeatMap.tsx` - Add demand concentration percentage display

### 7. Update Landing Page Demos

Add mock geographic and business data:
- `InteractiveDemo.tsx` - Buyer demo with supplier locations
- `SellerInteractiveDemo.tsx` - Competitor locations and demand data
- `ProducerInteractiveDemo.tsx` - Producer locations

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Edit | Add react-map-gl, mapbox-gl |
| `src/stores/analysisStore.ts` | Edit | Add GeoLocation, BusinessContact, BusinessProfile types |
| `src/components/shared/MapboxMap.tsx` | Create | Interactive map component |
| `src/components/shared/LocationMarker.tsx` | Create | Custom marker component |
| `src/components/shared/MapPopupCard.tsx` | Create | Popup card for markers |
| `src/components/shared/BusinessProfileCard.tsx` | Create | Business info display |
| `src/components/shared/index.ts` | Edit | Export new components |
| `src/pages/dashboard/HeatMap.tsx` | Edit | Add Mapbox map with toggle |
| `supabase/functions/product-supplier-analysis/index.ts` | Edit | Add geo/business data to prompt |
| `supabase/functions/competitor-analysis/index.ts` | Edit | Support image analysis with locations |
| `src/components/buyer/SupplierMatchResults.tsx` | Edit | Add business profile section |
| `src/components/buyer/SubstituteSuppliers.tsx` | Edit | Add location info |
| `src/components/producer/ProducerCompetition.tsx` | Edit | Add demand concentration |
| `src/components/seller/CompetitorDisplay.tsx` | Edit | Add business profile |
| `src/components/seller/SubstituteCompetitors.tsx` | Edit | Add location |
| `src/components/seller/MarketHeatMap.tsx` | Edit | Add demand concentration display |
| `src/components/landing/InteractiveDemo.tsx` | Edit | Add mock geo data |
| `src/components/landing/SellerInteractiveDemo.tsx` | Edit | Add mock geo data |
| `src/components/landing/ProducerInteractiveDemo.tsx` | Edit | Add mock geo data |

---

## Sample Data Structures

### Supplier with Full Business Info
```json
{
  "id": "sup_1",
  "name": "GlobalTech Manufacturing",
  "location": "Shenzhen, China",
  "geoLocation": {
    "latitude": 22.5431,
    "longitude": 114.0579,
    "formattedAddress": "Building 8, Tech Park, Nanshan District, Shenzhen 518057, China",
    "city": "Shenzhen",
    "country": "China"
  },
  "contact": {
    "email": "sales@globaltech.com",
    "phone": "+86-755-8888-9999",
    "website": "https://globaltech.com"
  },
  "businessProfile": {
    "companySize": "201-500",
    "yearEstablished": 2008,
    "annualRevenue": "$50M - $100M",
    "certifications": ["ISO 9001", "ISO 14001", "CE"]
  }
}
```

### Heat Map Region with Demand Concentration
```json
{
  "region": "East Asia",
  "demand": "high",
  "competitorCount": 45,
  "avgPrice": 245,
  "growth": "+15%",
  "opportunity": "excellent",
  "demandConcentration": 78,
  "geoLocation": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "city": "Tokyo",
    "country": "Japan"
  }
}
```

---

## API Key Requirement

Mapbox requires a public access token. After approval, you'll be prompted to add:

**Secret Name**: `VITE_MAPBOX_ACCESS_TOKEN`

This is a publishable key safe for client-side code. Get it free at mapbox.com (50,000 map loads/month on free tier).

---

## Dependencies Summary

**New packages**:
- `react-map-gl` (^7.x) - React bindings for Mapbox GL
- `mapbox-gl` (^3.x) - Core Mapbox GL library
