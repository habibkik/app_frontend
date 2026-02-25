export type RFQStatus = "draft" | "pending" | "quoted" | "awarded" | "closed" | "expired";

export type Incoterm = "EXW" | "FOB" | "CIF" | "DDP" | "DAP" | "FCA" | "CPT" | "CIP";

export type PaymentTerm = "Net 30" | "Net 60" | "Net 90" | "LC at Sight" | "LC 30 Days" | "TT Advance" | "TT 50/50" | "Open Account";

export interface EvaluationCriterion {
  criterion: string;
  weight: number;
}

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
  // Professional procurement fields
  incoterm?: Incoterm;
  paymentTerms?: PaymentTerm;
  qualityStandards?: string[];
  certificationsRequired?: string[];
  evaluationCriteria?: EvaluationCriterion[];
  pricingBreakdownRequired?: boolean;
  clarificationDeadline?: string;
  sampleRequired?: boolean;
  warrantyTerms?: string;
  complianceNotes?: string;
}

export interface SupplierQuote {
  id: string;
  supplierName: string;
  supplierCountry: string;
  unitPrice: number;
  toolingCost: number;
  moq: number;
  logisticsCost: number;
  taxes: number;
  leadTimeDays: number;
  paymentTermsOffered: string;
  certifications: string[];
  totalScore?: number;
  submittedAt: string;
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
    incoterm: "FOB",
    paymentTerms: "Net 30",
    qualityStandards: ["ISO 9001", "IPC-A-610"],
    certificationsRequired: ["ISO 9001", "UL Listed"],
    evaluationCriteria: [
      { criterion: "Price", weight: 40 },
      { criterion: "Quality", weight: 25 },
      { criterion: "Delivery", weight: 20 },
      { criterion: "Terms", weight: 15 },
    ],
    pricingBreakdownRequired: true,
    clarificationDeadline: "2024-01-25",
    sampleRequired: true,
    warrantyTerms: "12 months",
    complianceNotes: "Must comply with RoHS and REACH regulations.",
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
    incoterm: "CIF",
    paymentTerms: "TT 50/50",
    qualityStandards: ["GOTS", "OEKO-TEX"],
    certificationsRequired: ["GOTS Certified"],
    evaluationCriteria: [
      { criterion: "Price", weight: 30 },
      { criterion: "Quality", weight: 35 },
      { criterion: "Sustainability", weight: 20 },
      { criterion: "Delivery", weight: 15 },
    ],
    pricingBreakdownRequired: true,
    sampleRequired: true,
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
    incoterm: "DDP",
    paymentTerms: "Net 60",
    qualityStandards: ["ISO 13485", "ISO 9001"],
    certificationsRequired: ["ISO 13485", "FDA Registered"],
    evaluationCriteria: [
      { criterion: "Quality", weight: 35 },
      { criterion: "Price", weight: 25 },
      { criterion: "Compliance", weight: 20 },
      { criterion: "Delivery", weight: 20 },
    ],
    pricingBreakdownRequired: true,
    clarificationDeadline: "2024-01-20",
    sampleRequired: true,
    warrantyTerms: "24 months",
    complianceNotes: "FDA Class II medical device components. Full traceability required.",
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
    incoterm: "FOB",
    paymentTerms: "Net 30",
    qualityStandards: ["BPI Certified"],
    pricingBreakdownRequired: false,
    sampleRequired: true,
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
    incoterm: "DDP",
    paymentTerms: "LC at Sight",
    qualityStandards: ["ISO 13485", "ISO 9001"],
    certificationsRequired: ["FDA 510(k)", "CE Mark", "ISO 13485"],
    evaluationCriteria: [
      { criterion: "Quality", weight: 40 },
      { criterion: "Compliance", weight: 25 },
      { criterion: "Price", weight: 20 },
      { criterion: "Delivery", weight: 15 },
    ],
    pricingBreakdownRequired: true,
    clarificationDeadline: "2024-02-10",
    sampleRequired: true,
    warrantyTerms: "36 months",
    complianceNotes: "Full FDA compliance. Must provide PPAP documentation and complete traceability.",
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
    incoterm: "CIF",
    paymentTerms: "Net 30",
    qualityStandards: ["FSSC 22000"],
    certificationsRequired: ["USDA Organic", "Kosher"],
    pricingBreakdownRequired: true,
    sampleRequired: true,
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
    incoterm: "DAP",
    paymentTerms: "TT 50/50",
    qualityStandards: ["IATF 16949", "ISO 9001"],
    certificationsRequired: ["UN 38.3", "IEC 62660"],
    evaluationCriteria: [
      { criterion: "Quality", weight: 30 },
      { criterion: "Price", weight: 25 },
      { criterion: "Innovation", weight: 25 },
      { criterion: "Delivery", weight: 20 },
    ],
    pricingBreakdownRequired: true,
    sampleRequired: false,
    warrantyTerms: "60 months / 100,000 km",
    complianceNotes: "Must meet UN transport safety standards for lithium batteries.",
  },
];

// Mock supplier quotes for RFQ-2024-001
export const mockSupplierQuotes: Record<string, SupplierQuote[]> = {
  "RFQ-2024-001": [
    { id: "Q1", supplierName: "Shenzhen PCB Solutions", supplierCountry: "China", unitPrice: 10.20, toolingCost: 2500, moq: 1000, logisticsCost: 1800, taxes: 450, leadTimeDays: 21, paymentTermsOffered: "Net 30", certifications: ["ISO 9001", "UL Listed"], submittedAt: "2024-01-20" },
    { id: "Q2", supplierName: "TechAssembly Vietnam", supplierCountry: "Vietnam", unitPrice: 11.80, toolingCost: 1800, moq: 500, logisticsCost: 2200, taxes: 380, leadTimeDays: 28, paymentTermsOffered: "TT 50/50", certifications: ["ISO 9001"], submittedAt: "2024-01-22" },
    { id: "Q3", supplierName: "EuroCircuits GmbH", supplierCountry: "Germany", unitPrice: 14.50, toolingCost: 3200, moq: 250, logisticsCost: 800, taxes: 620, leadTimeDays: 14, paymentTermsOffered: "Net 60", certifications: ["ISO 9001", "UL Listed", "IATF 16949"], submittedAt: "2024-01-18" },
    { id: "Q4", supplierName: "IndiaCircuit Technologies", supplierCountry: "India", unitPrice: 9.80, toolingCost: 2000, moq: 2000, logisticsCost: 2500, taxes: 520, leadTimeDays: 35, paymentTermsOffered: "LC at Sight", certifications: ["ISO 9001"], submittedAt: "2024-01-25" },
  ],
  "RFQ-2024-003": [
    { id: "Q5", supplierName: "Precision Metal Works", supplierCountry: "USA", unitPrice: 42.00, toolingCost: 8000, moq: 100, logisticsCost: 500, taxes: 0, leadTimeDays: 18, paymentTermsOffered: "Net 30", certifications: ["ISO 13485", "FDA Registered"], submittedAt: "2024-01-15" },
    { id: "Q6", supplierName: "SinoMach CNC", supplierCountry: "China", unitPrice: 28.50, toolingCost: 5000, moq: 200, logisticsCost: 3200, taxes: 1200, leadTimeDays: 30, paymentTermsOffered: "TT 50/50", certifications: ["ISO 9001", "ISO 13485"], submittedAt: "2024-01-18" },
    { id: "Q7", supplierName: "SwissPrecision AG", supplierCountry: "Switzerland", unitPrice: 52.00, toolingCost: 12000, moq: 50, logisticsCost: 1800, taxes: 800, leadTimeDays: 12, paymentTermsOffered: "Net 60", certifications: ["ISO 13485", "FDA Registered", "CE Mark"], submittedAt: "2024-01-16" },
  ],
};

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

export const incoterms: Incoterm[] = ["EXW", "FCA", "FOB", "CIF", "CIP", "CPT", "DAP", "DDP"];

export const paymentTermsOptions: PaymentTerm[] = [
  "Net 30", "Net 60", "Net 90", "LC at Sight", "LC 30 Days", "TT Advance", "TT 50/50", "Open Account",
];

export const qualityStandardsList = [
  "ISO 9001", "ISO 13485", "ISO 14001", "ISO 45001",
  "IATF 16949", "AS9100", "IPC-A-610",
  "FDA Registered", "CE Mark", "UL Listed",
  "GOTS", "OEKO-TEX", "BPI Certified",
  "FSSC 22000", "GMP",
];

export const certificationsList = [
  "ISO 9001", "ISO 13485", "ISO 14001",
  "FDA 510(k)", "FDA Registered", "CE Mark", "UL Listed",
  "IATF 16949", "AS9100",
  "GOTS Certified", "USDA Organic", "Kosher", "Halal",
  "UN 38.3", "IEC 62660", "RoHS", "REACH",
];

export const statusConfig: Record<RFQStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  draft: { label: "Draft", variant: "secondary", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", variant: "default", className: "bg-warning/10 text-warning border-warning/30" },
  quoted: { label: "Quoted", variant: "default", className: "bg-info/10 text-info border-info/30" },
  awarded: { label: "Awarded", variant: "default", className: "bg-success/10 text-success border-success/30" },
  closed: { label: "Closed", variant: "secondary", className: "bg-muted text-muted-foreground" },
  expired: { label: "Expired", variant: "destructive", className: "bg-destructive/10 text-destructive border-destructive/30" },
};
