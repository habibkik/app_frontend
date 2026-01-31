
# Enhanced Supplier Detail Popup with Business Information & Worker Profiles

## Overview
This plan enhances the existing supplier detail popup in the "Browse All" section of Supplier Discovery to show comprehensive business information and LinkedIn profiles of workers at each supplier.

## What You'll Get
When you click on any supplier card in Browse All:
- A comprehensive popup with all business information
- **New Contact tab**: Email, phone, website, LinkedIn company page
- **New Location info**: Full address with Google Maps integration
- **Enhanced Business details**: Revenue, company size, year established
- **New Team tab**: LinkedIn profiles of key employees at the supplier (sales reps, account managers, etc.)

---

## Technical Implementation

### 1. Enhance Supplier Data Type
**File**: `src/data/suppliers.ts`

Add new fields to the `Supplier` interface:

```typescript
export interface SupplierEmployee {
  name: string;
  role: string;
  linkedIn: string;
  avatar?: string;
}

export interface Supplier {
  // ... existing fields ...
  
  // Geographic location with coordinates
  geoLocation?: {
    latitude: number;
    longitude: number;
    formattedAddress: string;
    city: string;
    state?: string;
    country: string;
  };
  
  // Contact information
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    linkedIn?: string;
  };
  
  // Business profile
  businessProfile?: {
    annualRevenue?: string;
    companySize?: string;
  };
  
  // Key employees/contacts
  employees?: SupplierEmployee[];
}
```

### 2. Update Mock Supplier Data
**File**: `src/data/suppliers.ts`

Enhance each mock supplier with the new data:

```typescript
{
  id: "sup-001",
  name: "TechParts Manufacturing Co.",
  // ... existing fields ...
  
  geoLocation: {
    latitude: 22.5431,
    longitude: 114.0579,
    formattedAddress: "Building 8, Tech Park, Nanshan District, Shenzhen 518057, China",
    city: "Shenzhen",
    state: "Guangdong",
    country: "China",
  },
  contact: {
    email: "sales@techparts.cn",
    phone: "+86-755-8888-9999",
    website: "https://techparts.cn",
    linkedIn: "https://linkedin.com/company/techparts-manufacturing",
  },
  businessProfile: {
    annualRevenue: "$50M - $100M",
    companySize: "500-1000",
  },
  employees: [
    {
      name: "David Chen",
      role: "Sales Director",
      linkedIn: "https://linkedin.com/in/david-chen-techparts",
    },
    {
      name: "Lisa Wang",
      role: "Key Account Manager",
      linkedIn: "https://linkedin.com/in/lisa-wang-techparts",
    },
    {
      name: "Michael Liu",
      role: "Technical Sales Engineer",
      linkedIn: "https://linkedin.com/in/michael-liu-techparts",
    },
  ],
}
```

### 3. Enhance Supplier Detail Modal
**File**: `src/components/suppliers/SupplierDetailModal.tsx`

Update the modal to include 4 tabs:

```text
+------------------------------------------------------------------+
|  [Logo]  Supplier Name            [Verified Badge]    [X Close]  |
|          Location • Industry                                      |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | Rating           |  | Response Time    |  | Min. Order       | |
|  | 4.8 ★            |  | < 12 hours       |  | $5,000           | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  [Tabs: Overview | Contact | Business | Team]                     |
|                                                                   |
|  === Overview Tab ===                                             |
|  - Full Address with Google Maps link                             |
|  - About / Description                                            |
|  - Specializations badges                                         |
|  - Certifications list                                            |
|                                                                   |
|  === Contact Tab ===                                              |
|  - Email (clickable mailto:)                                      |
|  - Phone (clickable tel:)                                         |
|  - Website (external link)                                        |
|  - Company LinkedIn page (external link)                          |
|                                                                   |
|  === Business Tab ===                                             |
|  - Company Size                                                   |
|  - Year Established                                               |
|  - Annual Revenue                                                 |
|  - Employee Count                                                 |
|  - Industry Focus                                                 |
|                                                                   |
|  === Team Tab (NEW) ===                                           |
|  +----------------------------------------------------------+     |
|  | [Avatar] David Chen                                       |     |
|  |          Sales Director                                   |     |
|  |          [LinkedIn Icon] View Profile →                   |     |
|  +----------------------------------------------------------+     |
|  | [Avatar] Lisa Wang                                        |     |
|  |          Key Account Manager                              |     |
|  |          [LinkedIn Icon] View Profile →                   |     |
|  +----------------------------------------------------------+     |
|  | [Avatar] Michael Liu                                      |     |
|  |          Technical Sales Engineer                         |     |
|  |          [LinkedIn Icon] View Profile →                   |     |
|  +----------------------------------------------------------+     |
|                                                                   |
|  +----------------------+  +----------------------+               |
|  |   Contact Supplier   |  |   Save               |               |
|  +----------------------+  +----------------------+               |
+------------------------------------------------------------------+
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/suppliers.ts` | Edit | Add SupplierEmployee interface and new fields to Supplier type |
| `src/data/suppliers.ts` | Edit | Update mockSuppliers with contact, geo, businessProfile, and employees data |
| `src/components/suppliers/SupplierDetailModal.tsx` | Edit | Add Contact tab with clickable links |
| `src/components/suppliers/SupplierDetailModal.tsx` | Edit | Add Team tab with employee LinkedIn profiles |
| `src/components/suppliers/SupplierDetailModal.tsx` | Edit | Enhance Overview tab with Google Maps link |

---

## Sample Employee Data Structure

```json
{
  "employees": [
    {
      "name": "David Chen",
      "role": "Sales Director",
      "linkedIn": "https://linkedin.com/in/david-chen-techparts",
      "avatar": "DC"
    },
    {
      "name": "Lisa Wang",
      "role": "Key Account Manager", 
      "linkedIn": "https://linkedin.com/in/lisa-wang-techparts",
      "avatar": "LW"
    },
    {
      "name": "Michael Liu",
      "role": "Technical Sales Engineer",
      "linkedIn": "https://linkedin.com/in/michael-liu-techparts",
      "avatar": "ML"
    }
  ]
}
```

---

## User Experience Flow

1. User navigates to Supplier Discovery → Browse All tab
2. User clicks on any supplier card
3. Detail modal opens with enhanced information
4. User can browse tabs (Overview, Contact, Business, Team)
5. In **Contact tab**: User clicks email/phone/website to reach out
6. In **Team tab**: User clicks LinkedIn profiles to connect with key people at the supplier
7. User can click "Contact Supplier" to send an inquiry or "Save" to save for later
