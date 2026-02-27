export interface BOMComponent {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  alternatives: number;
  matchedSuppliers: number;
  specifications?: string;
  material?: string;
  bomLevel?: number;
  kraljicQuadrant?: "strategic" | "leverage" | "bottleneck" | "commodity";
  riskClassification?: "high" | "medium" | "low";
}

export interface BOMAnalysis {
  id: string;
  productName: string;
  productImage?: string;
  analyzedAt: Date;
  status: "analyzing" | "complete" | "failed";
  components: BOMComponent[];
  totalCost: number;
  confidence: number;
}

export const mockBOMComponents: BOMComponent[] = [
  {
    id: "comp-001",
    name: "Aluminum Housing Frame",
    category: "Structural",
    quantity: 1,
    unit: "piece",
    unitCost: 12.50,
    totalCost: 12.50,
    alternatives: 4,
    matchedSuppliers: 8,
    specifications: "6061-T6, CNC machined",
    material: "Aluminum",
  },
  {
    id: "comp-002",
    name: "PCB Main Board",
    category: "Electronics",
    quantity: 1,
    unit: "piece",
    unitCost: 8.75,
    totalCost: 8.75,
    alternatives: 3,
    matchedSuppliers: 12,
    specifications: "4-layer, FR-4, ENIG finish",
    material: "FR-4",
  },
  {
    id: "comp-003",
    name: "LCD Display Module",
    category: "Electronics",
    quantity: 1,
    unit: "piece",
    unitCost: 15.00,
    totalCost: 15.00,
    alternatives: 6,
    matchedSuppliers: 5,
    specifications: "2.4\" TFT, 320x240, SPI",
    material: "Glass/Plastic",
  },
  {
    id: "comp-004",
    name: "Li-Po Battery 3.7V 2000mAh",
    category: "Power",
    quantity: 1,
    unit: "piece",
    unitCost: 4.25,
    totalCost: 4.25,
    alternatives: 8,
    matchedSuppliers: 15,
    specifications: "3.7V, 2000mAh, JST connector",
    material: "Lithium Polymer",
  },
  {
    id: "comp-005",
    name: "Tactile Push Buttons",
    category: "Input",
    quantity: 5,
    unit: "pieces",
    unitCost: 0.15,
    totalCost: 0.75,
    alternatives: 10,
    matchedSuppliers: 20,
    specifications: "6x6mm, 5mm height",
    material: "Plastic/Metal",
  },
  {
    id: "comp-006",
    name: "USB-C Connector",
    category: "Connectivity",
    quantity: 1,
    unit: "piece",
    unitCost: 0.85,
    totalCost: 0.85,
    alternatives: 5,
    matchedSuppliers: 18,
    specifications: "16-pin, SMD mount",
    material: "Metal/Plastic",
  },
  {
    id: "comp-007",
    name: "Silicone Gasket",
    category: "Sealing",
    quantity: 2,
    unit: "pieces",
    unitCost: 0.45,
    totalCost: 0.90,
    alternatives: 3,
    matchedSuppliers: 6,
    specifications: "IP67 rated, custom profile",
    material: "Silicone",
  },
  {
    id: "comp-008",
    name: "M3 Screws Stainless",
    category: "Fasteners",
    quantity: 8,
    unit: "pieces",
    unitCost: 0.05,
    totalCost: 0.40,
    alternatives: 12,
    matchedSuppliers: 25,
    specifications: "M3x8mm, Phillips head",
    material: "Stainless Steel",
  },
  {
    id: "comp-009",
    name: "Bluetooth Module",
    category: "Connectivity",
    quantity: 1,
    unit: "piece",
    unitCost: 3.50,
    totalCost: 3.50,
    alternatives: 7,
    matchedSuppliers: 10,
    specifications: "BLE 5.0, integrated antenna",
    material: "PCB/IC",
  },
  {
    id: "comp-010",
    name: "Vibration Motor",
    category: "Output",
    quantity: 1,
    unit: "piece",
    unitCost: 1.20,
    totalCost: 1.20,
    alternatives: 4,
    matchedSuppliers: 8,
    specifications: "10mm coin type, 3V",
    material: "Metal/Plastic",
  },
];

export const componentCategories = [
  "All Categories",
  "Structural",
  "Electronics",
  "Power",
  "Input",
  "Output",
  "Connectivity",
  "Sealing",
  "Fasteners",
];

export interface AlternativeComponent {
  id: string;
  name: string;
  supplier: string;
  unitCost: number;
  savings: number;
  leadTime: string;
  moq: number;
  rating: number;
}

export const mockAlternatives: Record<string, AlternativeComponent[]> = {
  "comp-001": [
    { id: "alt-001-1", name: "Aluminum Frame Type B", supplier: "Precision Metal Works", unitCost: 10.25, savings: 18, leadTime: "2-3 weeks", moq: 100, rating: 4.8 },
    { id: "alt-001-2", name: "Die-Cast Housing", supplier: "AutoParts Direct", unitCost: 11.00, savings: 12, leadTime: "3-4 weeks", moq: 250, rating: 4.5 },
    { id: "alt-001-3", name: "Magnesium Alloy Frame", supplier: "Global Metal Co", unitCost: 14.50, savings: -16, leadTime: "2 weeks", moq: 50, rating: 4.7 },
  ],
  "comp-002": [
    { id: "alt-002-1", name: "PCB 4-Layer Economy", supplier: "TechParts Manufacturing", unitCost: 6.50, savings: 26, leadTime: "1-2 weeks", moq: 500, rating: 4.6 },
    { id: "alt-002-2", name: "PCB Premium Grade", supplier: "CircuitPro Asia", unitCost: 9.25, savings: -6, leadTime: "1 week", moq: 200, rating: 4.9 },
  ],
  "comp-003": [
    { id: "alt-003-1", name: "LCD 2.4\" Budget", supplier: "Display Tech Ltd", unitCost: 11.50, savings: 23, leadTime: "2 weeks", moq: 100, rating: 4.2 },
    { id: "alt-003-2", name: "OLED 2.4\" Premium", supplier: "ScreenMaster Inc", unitCost: 22.00, savings: -47, leadTime: "3 weeks", moq: 50, rating: 4.8 },
  ],
};
