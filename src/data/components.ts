export interface ComponentPart {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: string;
  requiredQuantity: number;
  unit: string;
}

export interface SupplierQuote {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierLogo: string;
  supplierLocation: string;
  componentId: string;
  unitPrice: number;
  moq: number;
  leadTime: string;
  leadTimeDays: number;
  rating: number;
  certifications: string[];
  inStock: boolean;
  stockQuantity?: number;
}

export interface ComparisonSelection {
  componentId: string;
  selectedQuoteId: string | null;
}

export const mockComponentParts: ComponentPart[] = [
  {
    id: "part-001",
    name: "Microcontroller Unit (MCU)",
    category: "Electronics",
    description: "ARM Cortex-M4 based MCU with integrated WiFi",
    specifications: "32-bit, 168MHz, 1MB Flash, 256KB RAM",
    requiredQuantity: 1000,
    unit: "pieces",
  },
  {
    id: "part-002",
    name: "OLED Display Module",
    category: "Display",
    description: "1.3 inch OLED with SPI interface",
    specifications: "128x64 resolution, SSD1306 driver",
    requiredQuantity: 1000,
    unit: "pieces",
  },
  {
    id: "part-003",
    name: "Lithium Battery Pack",
    category: "Power",
    description: "Rechargeable Li-Po battery with protection circuit",
    specifications: "3.7V, 2500mAh, JST connector",
    requiredQuantity: 1000,
    unit: "pieces",
  },
  {
    id: "part-004",
    name: "Aluminum Enclosure",
    category: "Mechanical",
    description: "CNC machined aluminum housing",
    specifications: "6061-T6, anodized finish, 120x80x25mm",
    requiredQuantity: 1000,
    unit: "pieces",
  },
  {
    id: "part-005",
    name: "USB-C Connector Assembly",
    category: "Connectivity",
    description: "USB Type-C receptacle with ESD protection",
    specifications: "24-pin, 10Gbps, waterproof",
    requiredQuantity: 1000,
    unit: "pieces",
  },
];

export const mockSupplierQuotes: SupplierQuote[] = [
  // MCU Quotes
  {
    id: "quote-001-a",
    supplierId: "sup-001",
    supplierName: "TechParts Manufacturing",
    supplierLogo: "TP",
    supplierLocation: "Shenzhen, China",
    componentId: "part-001",
    unitPrice: 4.25,
    moq: 500,
    leadTime: "2-3 weeks",
    leadTimeDays: 18,
    rating: 4.8,
    certifications: ["ISO 9001", "RoHS"],
    inStock: true,
    stockQuantity: 5000,
  },
  {
    id: "quote-001-b",
    supplierId: "sup-002",
    supplierName: "ChipSource Global",
    supplierLogo: "CS",
    supplierLocation: "Taipei, Taiwan",
    componentId: "part-001",
    unitPrice: 3.85,
    moq: 1000,
    leadTime: "3-4 weeks",
    leadTimeDays: 25,
    rating: 4.6,
    certifications: ["ISO 9001", "ISO 14001"],
    inStock: true,
    stockQuantity: 12000,
  },
  {
    id: "quote-001-c",
    supplierId: "sup-003",
    supplierName: "Euro Electronics",
    supplierLogo: "EE",
    supplierLocation: "Munich, Germany",
    componentId: "part-001",
    unitPrice: 5.10,
    moq: 250,
    leadTime: "1-2 weeks",
    leadTimeDays: 10,
    rating: 4.9,
    certifications: ["ISO 9001", "IATF 16949"],
    inStock: true,
    stockQuantity: 2500,
  },

  // OLED Display Quotes
  {
    id: "quote-002-a",
    supplierId: "sup-004",
    supplierName: "DisplayTech Asia",
    supplierLogo: "DT",
    supplierLocation: "Seoul, Korea",
    componentId: "part-002",
    unitPrice: 8.50,
    moq: 500,
    leadTime: "2-3 weeks",
    leadTimeDays: 18,
    rating: 4.7,
    certifications: ["ISO 9001"],
    inStock: true,
    stockQuantity: 3000,
  },
  {
    id: "quote-002-b",
    supplierId: "sup-001",
    supplierName: "TechParts Manufacturing",
    supplierLogo: "TP",
    supplierLocation: "Shenzhen, China",
    componentId: "part-002",
    unitPrice: 6.75,
    moq: 1000,
    leadTime: "3-4 weeks",
    leadTimeDays: 25,
    rating: 4.8,
    certifications: ["ISO 9001", "RoHS"],
    inStock: false,
  },
  {
    id: "quote-002-c",
    supplierId: "sup-005",
    supplierName: "OptoMax Solutions",
    supplierLogo: "OM",
    supplierLocation: "Tokyo, Japan",
    componentId: "part-002",
    unitPrice: 9.25,
    moq: 200,
    leadTime: "1 week",
    leadTimeDays: 7,
    rating: 4.9,
    certifications: ["ISO 9001", "ISO 14001"],
    inStock: true,
    stockQuantity: 8000,
  },

  // Battery Pack Quotes
  {
    id: "quote-003-a",
    supplierId: "sup-006",
    supplierName: "PowerCell Industries",
    supplierLogo: "PC",
    supplierLocation: "Dongguan, China",
    componentId: "part-003",
    unitPrice: 5.80,
    moq: 500,
    leadTime: "2-3 weeks",
    leadTimeDays: 18,
    rating: 4.5,
    certifications: ["UN38.3", "IEC 62133"],
    inStock: true,
    stockQuantity: 10000,
  },
  {
    id: "quote-003-b",
    supplierId: "sup-007",
    supplierName: "BatteryPro Corp",
    supplierLogo: "BP",
    supplierLocation: "Osaka, Japan",
    componentId: "part-003",
    unitPrice: 7.20,
    moq: 200,
    leadTime: "1-2 weeks",
    leadTimeDays: 10,
    rating: 4.8,
    certifications: ["UN38.3", "IEC 62133", "UL"],
    inStock: true,
    stockQuantity: 4000,
  },

  // Aluminum Enclosure Quotes
  {
    id: "quote-004-a",
    supplierId: "sup-008",
    supplierName: "Precision Metal Works",
    supplierLogo: "PM",
    supplierLocation: "Stuttgart, Germany",
    componentId: "part-004",
    unitPrice: 12.50,
    moq: 100,
    leadTime: "3-4 weeks",
    leadTimeDays: 25,
    rating: 4.9,
    certifications: ["ISO 9001", "IATF 16949"],
    inStock: false,
  },
  {
    id: "quote-004-b",
    supplierId: "sup-009",
    supplierName: "CNC Masters",
    supplierLogo: "CM",
    supplierLocation: "Suzhou, China",
    componentId: "part-004",
    unitPrice: 8.75,
    moq: 500,
    leadTime: "2-3 weeks",
    leadTimeDays: 18,
    rating: 4.6,
    certifications: ["ISO 9001"],
    inStock: true,
    stockQuantity: 2000,
  },
  {
    id: "quote-004-c",
    supplierId: "sup-010",
    supplierName: "MetalForm USA",
    supplierLogo: "MF",
    supplierLocation: "Detroit, USA",
    componentId: "part-004",
    unitPrice: 15.00,
    moq: 50,
    leadTime: "1-2 weeks",
    leadTimeDays: 10,
    rating: 4.7,
    certifications: ["ISO 9001", "AS9100"],
    inStock: true,
    stockQuantity: 500,
  },

  // USB-C Connector Quotes
  {
    id: "quote-005-a",
    supplierId: "sup-001",
    supplierName: "TechParts Manufacturing",
    supplierLogo: "TP",
    supplierLocation: "Shenzhen, China",
    componentId: "part-005",
    unitPrice: 1.25,
    moq: 1000,
    leadTime: "2 weeks",
    leadTimeDays: 14,
    rating: 4.8,
    certifications: ["ISO 9001", "RoHS"],
    inStock: true,
    stockQuantity: 25000,
  },
  {
    id: "quote-005-b",
    supplierId: "sup-011",
    supplierName: "ConnectorWorld",
    supplierLogo: "CW",
    supplierLocation: "Hong Kong",
    componentId: "part-005",
    unitPrice: 1.45,
    moq: 500,
    leadTime: "1-2 weeks",
    leadTimeDays: 10,
    rating: 4.5,
    certifications: ["ISO 9001"],
    inStock: true,
    stockQuantity: 15000,
  },
];

export function getQuotesForComponent(componentId: string): SupplierQuote[] {
  return mockSupplierQuotes.filter((q) => q.componentId === componentId);
}

export function calculateTotalCost(
  selections: ComparisonSelection[],
  parts: ComponentPart[]
): { totalCost: number; breakdown: { componentId: string; cost: number; quote: SupplierQuote | null }[] } {
  const breakdown = selections.map((sel) => {
    const part = parts.find((p) => p.id === sel.componentId);
    const quote = mockSupplierQuotes.find((q) => q.id === sel.selectedQuoteId);
    
    if (!part || !quote) {
      return { componentId: sel.componentId, cost: 0, quote: null };
    }
    
    return {
      componentId: sel.componentId,
      cost: quote.unitPrice * part.requiredQuantity,
      quote,
    };
  });

  const totalCost = breakdown.reduce((sum, item) => sum + item.cost, 0);
  
  return { totalCost, breakdown };
}
