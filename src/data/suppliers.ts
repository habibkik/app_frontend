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
