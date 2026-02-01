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
  department: EmployeeDepartment;
}

export interface SupplierGeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state?: string;
  country: string;
}

export interface SupplierContact {
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
}

export interface SupplierBusinessProfile {
  annualRevenue?: string;
  companySize?: string;
}

export interface Supplier {
  id: string;
  name: string;
  logo: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  industry: string;
  specializations: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;
  minOrderValue: number;
  yearEstablished: number;
  employeeCount: string;
  description: string;
  certifications: string[];
  geoLocation?: SupplierGeoLocation;
  contact?: SupplierContact;
  businessProfile?: SupplierBusinessProfile;
  employees?: SupplierEmployee[];
  // AI Discovery metadata (optional)
  isAIDiscovered?: boolean;
  matchScore?: number;
  discoveredAt?: Date;
  substituteOf?: string; // Original product if substitute
}

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "TechParts Manufacturing Co.",
    logo: "TP",
    location: { city: "Shenzhen", country: "China", countryCode: "CN" },
    industry: "Electronics",
    specializations: ["PCB Assembly", "IoT Devices", "Consumer Electronics"],
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    responseTime: "< 12 hours",
    minOrderValue: 5000,
    yearEstablished: 2008,
    employeeCount: "500-1000",
    description: "Leading manufacturer of electronic components and PCB assemblies with ISO 9001 certification.",
    certifications: ["ISO 9001", "ISO 14001", "RoHS"],
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
    ],
  },
  {
    id: "sup-002",
    name: "Global Textile Solutions",
    logo: "GT",
    location: { city: "Mumbai", country: "India", countryCode: "IN" },
    industry: "Textiles",
    specializations: ["Cotton Fabrics", "Sustainable Materials", "Custom Prints"],
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    responseTime: "< 24 hours",
    minOrderValue: 2000,
    yearEstablished: 1995,
    employeeCount: "1000-5000",
    description: "Premium textile manufacturer specializing in sustainable and organic cotton products.",
    certifications: ["GOTS", "OEKO-TEX", "Fair Trade"],
    geoLocation: {
      latitude: 19.0760,
      longitude: 72.8777,
      formattedAddress: "Plot 42, Textile Hub, Andheri East, Mumbai 400093, India",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    contact: {
      email: "export@globaltextile.in",
      phone: "+91-22-4567-8901",
      website: "https://globaltextile.in",
      linkedIn: "https://linkedin.com/company/global-textile-solutions",
    },
    businessProfile: {
      annualRevenue: "$100M - $250M",
      companySize: "1000-5000",
    },
    employees: [
      { name: "Priya Sharma", role: "Export Manager", linkedIn: "https://linkedin.com/in/priya-sharma-gts", avatar: "PS", department: "sales" },
      { name: "Rahul Patel", role: "Business Development", linkedIn: "https://linkedin.com/in/rahul-patel-gts", avatar: "RP", department: "sales" },
    ],
  },
  {
    id: "sup-003",
    name: "Precision Metal Works",
    logo: "PM",
    location: { city: "Stuttgart", country: "Germany", countryCode: "DE" },
    industry: "Machinery",
    specializations: ["CNC Machining", "Precision Parts", "Automotive Components"],
    verified: true,
    rating: 4.9,
    reviewCount: 234,
    responseTime: "< 6 hours",
    minOrderValue: 10000,
    yearEstablished: 1982,
    employeeCount: "100-500",
    description: "High-precision metal components for automotive and aerospace industries with German engineering standards.",
    certifications: ["ISO 9001", "IATF 16949", "AS9100"],
    geoLocation: {
      latitude: 48.7758,
      longitude: 9.1829,
      formattedAddress: "Industriestraße 25, 70565 Stuttgart, Germany",
      city: "Stuttgart",
      state: "Baden-Württemberg",
      country: "Germany",
    },
    contact: {
      email: "sales@precision-metal.de",
      phone: "+49-711-555-1234",
      website: "https://precision-metal.de",
      linkedIn: "https://linkedin.com/company/precision-metal-works",
    },
    businessProfile: {
      annualRevenue: "$25M - $50M",
      companySize: "100-500",
    },
    employees: [
      { name: "Hans Mueller", role: "Sales Director EMEA", linkedIn: "https://linkedin.com/in/hans-mueller-pmw", avatar: "HM", department: "sales" },
      { name: "Klaus Weber", role: "Technical Consultant", linkedIn: "https://linkedin.com/in/klaus-weber-pmw", avatar: "KW", department: "technical" },
      { name: "Anna Schmidt", role: "Customer Success Manager", linkedIn: "https://linkedin.com/in/anna-schmidt-pmw", avatar: "AS", department: "after_sales" },
    ],
  },
  {
    id: "sup-004",
    name: "EcoPackage Industries",
    logo: "EP",
    location: { city: "Bangkok", country: "Thailand", countryCode: "TH" },
    industry: "Packaging",
    specializations: ["Biodegradable Packaging", "Food Containers", "Custom Boxes"],
    verified: false,
    rating: 4.3,
    reviewCount: 45,
    responseTime: "< 48 hours",
    minOrderValue: 1000,
    yearEstablished: 2015,
    employeeCount: "50-100",
    description: "Eco-friendly packaging solutions focusing on biodegradable and compostable materials.",
    certifications: ["FSC", "BPI Certified"],
    geoLocation: {
      latitude: 13.7563,
      longitude: 100.5018,
      formattedAddress: "88 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand",
      city: "Bangkok",
      country: "Thailand",
    },
    contact: {
      email: "info@ecopackage.th",
      phone: "+66-2-123-4567",
      website: "https://ecopackage.th",
      linkedIn: "https://linkedin.com/company/ecopackage-industries",
    },
    businessProfile: {
      annualRevenue: "$5M - $10M",
      companySize: "50-100",
    },
    employees: [
      { name: "Somchai Prasert", role: "Sales Manager", linkedIn: "https://linkedin.com/in/somchai-prasert", avatar: "SP", department: "sales" },
    ],
  },
  {
    id: "sup-005",
    name: "MedSupply International",
    logo: "MS",
    location: { city: "Dublin", country: "Ireland", countryCode: "IE" },
    industry: "Medical",
    specializations: ["Medical Devices", "Surgical Instruments", "Diagnostic Equipment"],
    verified: true,
    rating: 4.7,
    reviewCount: 112,
    responseTime: "< 12 hours",
    minOrderValue: 15000,
    yearEstablished: 2001,
    employeeCount: "100-500",
    description: "FDA-approved medical device manufacturer with cleanroom facilities and strict quality controls.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark"],
    geoLocation: {
      latitude: 53.3498,
      longitude: -6.2603,
      formattedAddress: "Innovation House, 45 Grand Canal Dock, Dublin D02 X525, Ireland",
      city: "Dublin",
      country: "Ireland",
    },
    contact: {
      email: "sales@medsupply.ie",
      phone: "+353-1-555-7890",
      website: "https://medsupply.ie",
      linkedIn: "https://linkedin.com/company/medsupply-international",
    },
    businessProfile: {
      annualRevenue: "$75M - $150M",
      companySize: "100-500",
    },
    employees: [
      { name: "Aoife O'Connor", role: "VP Sales", linkedIn: "https://linkedin.com/in/aoife-oconnor-msi", avatar: "AO", department: "sales" },
      { name: "Liam Murphy", role: "Account Executive", linkedIn: "https://linkedin.com/in/liam-murphy-msi", avatar: "LM", department: "sales" },
      { name: "Siobhan Kelly", role: "Customer Success", linkedIn: "https://linkedin.com/in/siobhan-kelly-msi", avatar: "SK", department: "after_sales" },
    ],
  },
  {
    id: "sup-006",
    name: "FoodTech Ingredients",
    logo: "FT",
    location: { city: "São Paulo", country: "Brazil", countryCode: "BR" },
    industry: "Food & Beverage",
    specializations: ["Natural Flavors", "Food Additives", "Organic Ingredients"],
    verified: true,
    rating: 4.5,
    reviewCount: 78,
    responseTime: "< 24 hours",
    minOrderValue: 3000,
    yearEstablished: 2010,
    employeeCount: "100-500",
    description: "Natural and organic food ingredients supplier with full traceability and sustainability focus.",
    certifications: ["FSSC 22000", "Organic Certified", "Kosher"],
    geoLocation: {
      latitude: -23.5505,
      longitude: -46.6333,
      formattedAddress: "Av. Paulista 1000, Bela Vista, São Paulo - SP, 01310-100, Brazil",
      city: "São Paulo",
      state: "São Paulo",
      country: "Brazil",
    },
    contact: {
      email: "vendas@foodtech.com.br",
      phone: "+55-11-3456-7890",
      website: "https://foodtech.com.br",
      linkedIn: "https://linkedin.com/company/foodtech-ingredients",
    },
    businessProfile: {
      annualRevenue: "$20M - $40M",
      companySize: "100-500",
    },
    employees: [
      { name: "Carlos Silva", role: "Commercial Director", linkedIn: "https://linkedin.com/in/carlos-silva-fti", avatar: "CS", department: "management" },
      { name: "Maria Santos", role: "Export Coordinator", linkedIn: "https://linkedin.com/in/maria-santos-fti", avatar: "MS", department: "sales" },
    ],
  },
  {
    id: "sup-007",
    name: "AutoParts Direct",
    logo: "AP",
    location: { city: "Detroit", country: "USA", countryCode: "US" },
    industry: "Automotive",
    specializations: ["OEM Parts", "Aftermarket Components", "EV Parts"],
    verified: true,
    rating: 4.4,
    reviewCount: 198,
    responseTime: "< 6 hours",
    minOrderValue: 5000,
    yearEstablished: 1998,
    employeeCount: "500-1000",
    description: "Trusted automotive parts supplier serving OEMs and aftermarket distributors across North America.",
    certifications: ["IATF 16949", "ISO 9001"],
    geoLocation: {
      latitude: 42.3314,
      longitude: -83.0458,
      formattedAddress: "1500 Woodward Ave, Detroit, MI 48226, USA",
      city: "Detroit",
      state: "Michigan",
      country: "USA",
    },
    contact: {
      email: "sales@autopartsdirect.com",
      phone: "+1-313-555-0199",
      website: "https://autopartsdirect.com",
      linkedIn: "https://linkedin.com/company/autoparts-direct",
    },
    businessProfile: {
      annualRevenue: "$150M - $300M",
      companySize: "500-1000",
    },
    employees: [
      { name: "John Williams", role: "VP Sales", linkedIn: "https://linkedin.com/in/john-williams-apd", avatar: "JW", department: "management" },
      { name: "Sarah Johnson", role: "Regional Sales Manager", linkedIn: "https://linkedin.com/in/sarah-johnson-apd", avatar: "SJ", department: "sales" },
      { name: "Robert Davis", role: "Key Account Manager", linkedIn: "https://linkedin.com/in/robert-davis-apd", avatar: "RD", department: "sales" },
    ],
  },
  {
    id: "sup-008",
    name: "HomeGoods Factory",
    logo: "HG",
    location: { city: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN" },
    industry: "Home & Garden",
    specializations: ["Furniture", "Home Decor", "Outdoor Living"],
    verified: false,
    rating: 4.2,
    reviewCount: 56,
    responseTime: "< 48 hours",
    minOrderValue: 2500,
    yearEstablished: 2012,
    employeeCount: "500-1000",
    description: "Handcrafted furniture and home decor items with focus on sustainable materials and fair labor practices.",
    certifications: ["FSC", "BSCI"],
    geoLocation: {
      latitude: 10.8231,
      longitude: 106.6297,
      formattedAddress: "123 Nguyen Hue Boulevard, District 1, Ho Chi Minh City, Vietnam",
      city: "Ho Chi Minh City",
      country: "Vietnam",
    },
    contact: {
      email: "export@homegoods.vn",
      phone: "+84-28-1234-5678",
      website: "https://homegoods.vn",
      linkedIn: "https://linkedin.com/company/homegoods-factory",
    },
    businessProfile: {
      annualRevenue: "$15M - $30M",
      companySize: "500-1000",
    },
    employees: [
      { name: "Nguyen Minh", role: "Export Sales Manager", linkedIn: "https://linkedin.com/in/nguyen-minh-hgf", avatar: "NM", department: "sales" },
      { name: "Tran Linh", role: "Product Specialist", linkedIn: "https://linkedin.com/in/tran-linh-hgf", avatar: "TL", department: "technical" },
    ],
  },
];

export const industries = [
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

export const countries = [
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "TH", name: "Thailand" },
  { code: "IE", name: "Ireland" },
  { code: "BR", name: "Brazil" },
  { code: "US", name: "USA" },
  { code: "VN", name: "Vietnam" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
];

export const certifications = [
  "ISO 9001",
  "ISO 14001",
  "ISO 13485",
  "IATF 16949",
  "AS9100",
  "FDA Registered",
  "CE Mark",
  "RoHS",
  "GOTS",
  "FSC",
];
