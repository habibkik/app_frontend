import type { 
  SupplierGeoLocation, 
  SupplierContact, 
  SupplierBusinessProfile, 
  SupplierEmployee 
} from "./suppliers";

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
  // Extended supplier details
  geoLocation?: SupplierGeoLocation;
  contact?: SupplierContact;
  businessProfile?: SupplierBusinessProfile;
  employees?: SupplierEmployee[];
  industry?: string;
  specializations?: string[];
  description?: string;
  yearEstablished?: number;
  verified?: boolean;
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
    industry: "Electronics",
    specializations: ["PCB Assembly", "IoT Devices", "Consumer Electronics"],
    description: "Leading manufacturer of electronic components and PCB assemblies with ISO 9001 certification.",
    yearEstablished: 2008,
    verified: true,
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
      { name: "David Chen", role: "Sales Director", linkedIn: "https://linkedin.com/in/david-chen-techparts", avatar: "DC", department: "sales" },
      { name: "Lisa Wang", role: "Key Account Manager", linkedIn: "https://linkedin.com/in/lisa-wang-techparts", avatar: "LW", department: "sales" },
      { name: "Michael Liu", role: "Technical Sales Engineer", linkedIn: "https://linkedin.com/in/michael-liu-techparts", avatar: "ML", department: "technical" },
      { name: "Wei Zhang", role: "Production Manager", linkedIn: "https://linkedin.com/in/wei-zhang-techparts", avatar: "WZ", department: "production" },
      { name: "Emily Chen", role: "Customer Success", linkedIn: "https://linkedin.com/in/emily-chen-techparts", avatar: "EC", department: "after_sales" },
    ],
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
    industry: "Semiconductors",
    specializations: ["MCU", "Memory Chips", "Power ICs"],
    description: "Taiwan-based semiconductor distributor with extensive chip inventory.",
    yearEstablished: 2001,
    verified: true,
    geoLocation: {
      latitude: 25.0330,
      longitude: 121.5654,
      formattedAddress: "88 Zhongxiao E Rd, Da'an District, Taipei 106, Taiwan",
      city: "Taipei",
      country: "Taiwan",
    },
    contact: {
      email: "sales@chipsource.tw",
      phone: "+886-2-2345-6789",
      website: "https://chipsource.tw",
      linkedIn: "https://linkedin.com/company/chipsource-global",
    },
    businessProfile: {
      annualRevenue: "$80M - $150M",
      companySize: "200-500",
    },
    employees: [
      { name: "Jason Lin", role: "VP Sales", linkedIn: "https://linkedin.com/in/jason-lin-cs", avatar: "JL", department: "management" },
      { name: "Amy Wu", role: "Application Engineer", linkedIn: "https://linkedin.com/in/amy-wu-cs", avatar: "AW", department: "technical" },
      { name: "Tom Lee", role: "Support Engineer", linkedIn: "https://linkedin.com/in/tom-lee-cs", avatar: "TL", department: "after_sales" },
    ],
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
    industry: "Electronics",
    specializations: ["Automotive Electronics", "Industrial Components"],
    description: "Premium European electronics supplier for automotive and industrial applications.",
    yearEstablished: 1995,
    verified: true,
    geoLocation: {
      latitude: 48.1351,
      longitude: 11.5820,
      formattedAddress: "Leopoldstraße 50, 80802 Munich, Germany",
      city: "Munich",
      state: "Bavaria",
      country: "Germany",
    },
    contact: {
      email: "sales@euroelectronics.de",
      phone: "+49-89-555-1234",
      website: "https://euroelectronics.de",
      linkedIn: "https://linkedin.com/company/euro-electronics",
    },
    businessProfile: {
      annualRevenue: "$30M - $60M",
      companySize: "100-200",
    },
    employees: [
      { name: "Klaus Schmidt", role: "Sales Director", linkedIn: "https://linkedin.com/in/klaus-schmidt-ee", avatar: "KS", department: "sales" },
      { name: "Anna Mueller", role: "Technical Consultant", linkedIn: "https://linkedin.com/in/anna-mueller-ee", avatar: "AM", department: "technical" },
      { name: "Hans Weber", role: "Quality Engineer", linkedIn: "https://linkedin.com/in/hans-weber-ee", avatar: "HW", department: "production" },
    ],
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
    industry: "Display Technology",
    specializations: ["OLED Panels", "LCD Modules", "Touch Screens"],
    description: "Leading Korean display manufacturer with cutting-edge OLED technology.",
    yearEstablished: 2005,
    verified: true,
    geoLocation: {
      latitude: 37.5665,
      longitude: 126.9780,
      formattedAddress: "123 Gangnam-daero, Seocho-gu, Seoul 06626, Korea",
      city: "Seoul",
      country: "South Korea",
    },
    contact: {
      email: "sales@displaytech.kr",
      phone: "+82-2-123-4567",
      website: "https://displaytech.kr",
      linkedIn: "https://linkedin.com/company/displaytech-asia",
    },
    businessProfile: {
      annualRevenue: "$100M - $200M",
      companySize: "500-1000",
    },
    employees: [
      { name: "Park Min-jun", role: "International Sales", linkedIn: "https://linkedin.com/in/park-minjun-dt", avatar: "PM", department: "sales" },
      { name: "Kim Soo-yeon", role: "Display Engineer", linkedIn: "https://linkedin.com/in/kim-sooyeon-dt", avatar: "KS", department: "technical" },
    ],
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
    industry: "Electronics",
    verified: true,
    employees: [
      { name: "David Chen", role: "Sales Director", linkedIn: "https://linkedin.com/in/david-chen-techparts", avatar: "DC", department: "sales" },
    ],
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
    industry: "Optoelectronics",
    specializations: ["OLED", "Laser Diodes", "Optical Sensors"],
    description: "Japanese precision optoelectronics manufacturer.",
    yearEstablished: 1990,
    verified: true,
    geoLocation: {
      latitude: 35.6762,
      longitude: 139.6503,
      formattedAddress: "1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan",
      city: "Tokyo",
      country: "Japan",
    },
    contact: {
      email: "sales@optomax.jp",
      phone: "+81-3-1234-5678",
      website: "https://optomax.jp",
      linkedIn: "https://linkedin.com/company/optomax-solutions",
    },
    businessProfile: {
      annualRevenue: "$200M - $400M",
      companySize: "1000-2000",
    },
    employees: [
      { name: "Tanaka Kenji", role: "Export Manager", linkedIn: "https://linkedin.com/in/tanaka-kenji-om", avatar: "TK", department: "sales" },
      { name: "Suzuki Yuki", role: "Production Lead", linkedIn: "https://linkedin.com/in/suzuki-yuki-om", avatar: "SY", department: "production" },
      { name: "Yamamoto Aiko", role: "Technical Support", linkedIn: "https://linkedin.com/in/yamamoto-aiko-om", avatar: "YA", department: "after_sales" },
    ],
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
    industry: "Battery Technology",
    specializations: ["Li-Po Batteries", "Battery Packs", "BMS"],
    description: "Specialized battery manufacturer with safety certifications.",
    yearEstablished: 2010,
    verified: true,
    employees: [
      { name: "Chen Wei", role: "Sales Representative", linkedIn: "https://linkedin.com/in/chen-wei-pc", avatar: "CW", department: "sales" },
      { name: "Liu Ming", role: "Battery Engineer", linkedIn: "https://linkedin.com/in/liu-ming-pc", avatar: "LM", department: "technical" },
    ],
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
    industry: "Battery Technology",
    specializations: ["High-capacity Batteries", "EV Batteries"],
    description: "Premium Japanese battery manufacturer with UL certification.",
    yearEstablished: 1998,
    verified: true,
    employees: [
      { name: "Kato Hiroshi", role: "Sales Director", linkedIn: "https://linkedin.com/in/kato-hiroshi-bp", avatar: "KH", department: "sales" },
      { name: "Saito Mika", role: "Quality Manager", linkedIn: "https://linkedin.com/in/saito-mika-bp", avatar: "SM", department: "production" },
    ],
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
    industry: "Precision Manufacturing",
    specializations: ["CNC Machining", "Metal Enclosures", "Automotive Parts"],
    description: "German precision metal works for automotive and industrial applications.",
    yearEstablished: 1982,
    verified: true,
    employees: [
      { name: "Hans Mueller", role: "Sales Director EMEA", linkedIn: "https://linkedin.com/in/hans-mueller-pmw", avatar: "HM", department: "sales" },
      { name: "Klaus Weber", role: "Technical Consultant", linkedIn: "https://linkedin.com/in/klaus-weber-pmw", avatar: "KW", department: "technical" },
    ],
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
    industry: "CNC Manufacturing",
    verified: true,
    employees: [
      { name: "Wang Li", role: "Account Manager", linkedIn: "https://linkedin.com/in/wang-li-cm", avatar: "WL", department: "sales" },
    ],
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
    industry: "Metal Fabrication",
    specializations: ["Aerospace Parts", "Custom Enclosures"],
    description: "US-based metal fabricator with aerospace certifications.",
    yearEstablished: 1975,
    verified: true,
    employees: [
      { name: "Mike Johnson", role: "Sales Manager", linkedIn: "https://linkedin.com/in/mike-johnson-mf", avatar: "MJ", department: "sales" },
      { name: "Sarah Williams", role: "Production Supervisor", linkedIn: "https://linkedin.com/in/sarah-williams-mf", avatar: "SW", department: "production" },
    ],
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
    verified: true,
    employees: [
      { name: "David Chen", role: "Sales Director", linkedIn: "https://linkedin.com/in/david-chen-techparts", avatar: "DC", department: "sales" },
    ],
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
    industry: "Connectors",
    specializations: ["USB Connectors", "HDMI", "Power Connectors"],
    description: "Hong Kong connector distributor with fast delivery.",
    yearEstablished: 2008,
    verified: false,
    employees: [
      { name: "Tony Chan", role: "Sales Executive", linkedIn: "https://linkedin.com/in/tony-chan-cw", avatar: "TC", department: "sales" },
    ],
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
