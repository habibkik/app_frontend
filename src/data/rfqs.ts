export type RFQStatus = "draft" | "pending" | "quoted" | "awarded" | "closed" | "expired";

export interface RFQItem {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  currency: string;
  deliveryLocation: string;
  deliveryDate: string;
  status: RFQStatus;
  createdAt: string;
  expiresAt: string;
  quotesReceived: number;
  attachments: number;
}

export const mockRFQs: RFQItem[] = [
  {
    id: "RFQ-2024-001",
    title: "PCB Assembly for IoT Sensors",
    description: "Looking for PCB assembly services for our new IoT sensor product line. Requires SMT and through-hole components.",
    category: "Electronics",
    quantity: 5000,
    unit: "units",
    targetPrice: 12.50,
    currency: "USD",
    deliveryLocation: "Los Angeles, USA",
    deliveryDate: "2024-04-15",
    status: "quoted",
    createdAt: "2024-01-15",
    expiresAt: "2024-02-15",
    quotesReceived: 8,
    attachments: 3,
  },
  {
    id: "RFQ-2024-002",
    title: "Organic Cotton Fabric - Custom Print",
    description: "Need organic cotton fabric with custom digital prints for sustainable fashion line.",
    category: "Textiles",
    quantity: 2000,
    unit: "meters",
    targetPrice: 8.00,
    currency: "USD",
    deliveryLocation: "New York, USA",
    deliveryDate: "2024-03-30",
    status: "pending",
    createdAt: "2024-01-20",
    expiresAt: "2024-02-20",
    quotesReceived: 3,
    attachments: 2,
  },
  {
    id: "RFQ-2024-003",
    title: "CNC Machined Aluminum Parts",
    description: "Precision CNC machined aluminum housing components for medical devices.",
    category: "Machinery",
    quantity: 500,
    unit: "units",
    targetPrice: 45.00,
    currency: "USD",
    deliveryLocation: "Boston, USA",
    deliveryDate: "2024-05-01",
    status: "awarded",
    createdAt: "2024-01-10",
    expiresAt: "2024-02-10",
    quotesReceived: 5,
    attachments: 4,
  },
  {
    id: "RFQ-2024-004",
    title: "Biodegradable Food Containers",
    description: "Eco-friendly food containers for restaurant chain. Must be compostable and microwave-safe.",
    category: "Packaging",
    quantity: 50000,
    unit: "units",
    targetPrice: 0.35,
    currency: "USD",
    deliveryLocation: "Chicago, USA",
    deliveryDate: "2024-04-01",
    status: "pending",
    createdAt: "2024-01-25",
    expiresAt: "2024-02-25",
    quotesReceived: 2,
    attachments: 1,
  },
  {
    id: "RFQ-2024-005",
    title: "Surgical Grade Stainless Steel Instruments",
    description: "Custom surgical instruments for minimally invasive procedures. FDA compliance required.",
    category: "Medical",
    quantity: 200,
    unit: "sets",
    targetPrice: 250.00,
    currency: "USD",
    deliveryLocation: "San Francisco, USA",
    deliveryDate: "2024-06-01",
    status: "draft",
    createdAt: "2024-01-28",
    expiresAt: "2024-02-28",
    quotesReceived: 0,
    attachments: 5,
  },
  {
    id: "RFQ-2024-006",
    title: "Natural Food Flavoring Extracts",
    description: "Organic vanilla and citrus extracts for beverage manufacturing.",
    category: "Food & Beverage",
    quantity: 1000,
    unit: "liters",
    targetPrice: 75.00,
    currency: "USD",
    deliveryLocation: "Miami, USA",
    deliveryDate: "2024-03-15",
    status: "closed",
    createdAt: "2023-12-15",
    expiresAt: "2024-01-15",
    quotesReceived: 6,
    attachments: 2,
  },
  {
    id: "RFQ-2024-007",
    title: "EV Battery Pack Components",
    description: "Battery cells and BMS components for electric vehicle prototype.",
    category: "Automotive",
    quantity: 100,
    unit: "units",
    targetPrice: 1200.00,
    currency: "USD",
    deliveryLocation: "Detroit, USA",
    deliveryDate: "2024-05-15",
    status: "expired",
    createdAt: "2023-11-01",
    expiresAt: "2023-12-01",
    quotesReceived: 4,
    attachments: 3,
  },
];

export const rfqCategories = [
  "Electronics",
  "Textiles",
  "Machinery",
  "Packaging",
  "Medical",
  "Food & Beverage",
  "Automotive",
  "Home & Garden",
  "Chemicals",
  "Construction",
];

export const rfqUnits = [
  "units",
  "pieces",
  "sets",
  "meters",
  "kilograms",
  "liters",
  "boxes",
  "pallets",
];

export const statusConfig: Record<RFQStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  draft: { label: "Draft", variant: "secondary", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", variant: "default", className: "bg-warning/10 text-warning border-warning/30" },
  quoted: { label: "Quoted", variant: "default", className: "bg-info/10 text-info border-info/30" },
  awarded: { label: "Awarded", variant: "default", className: "bg-success/10 text-success border-success/30" },
  closed: { label: "Closed", variant: "secondary", className: "bg-muted text-muted-foreground" },
  expired: { label: "Expired", variant: "destructive", className: "bg-destructive/10 text-destructive border-destructive/30" },
};
