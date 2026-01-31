/**
 * Demo data for Market Intelligence page
 * Shows sample market analysis results without requiring image upload
 */
import type { MarketAnalysisResult, CompetitorInfo, SubstituteCompetitor, MarketHeatMapRegion } from "@/stores/analysisStore";

export const DEMO_COMPETITORS: CompetitorInfo[] = [
  {
    name: "SoundMax Electronics",
    marketShare: "28%",
    priceRange: { min: 45, max: 89 },
    strengths: ["Brand recognition", "Wide distribution network", "Quality products"],
    geoLocation: {
      latitude: 34.0522,
      longitude: -118.2437,
      formattedAddress: "456 Electronics Blvd, Los Angeles, CA 90001, USA",
      city: "Los Angeles",
      state: "California",
      country: "USA",
    },
    contact: {
      email: "sales@soundmax.com",
      phone: "+1-800-555-1234",
      website: "https://soundmax.com",
      linkedIn: "https://linkedin.com/company/soundmax",
    },
    businessProfile: {
      companySize: "201-500",
      yearEstablished: 2012,
      annualRevenue: "$50M - $100M",
      employeeCount: 350,
      certifications: ["ISO 9001", "FCC", "CE", "RoHS"],
      specializations: ["Wireless Audio", "Smart Home Devices"],
    },
  },
  {
    name: "AudioTech Global",
    marketShare: "22%",
    priceRange: { min: 35, max: 75 },
    strengths: ["Competitive pricing", "Fast shipping", "Good customer support"],
    geoLocation: {
      latitude: 22.3193,
      longitude: 114.1694,
      formattedAddress: "88 Technology Road, Shenzhen 518057, China",
      city: "Shenzhen",
      state: "Guangdong",
      country: "China",
    },
    contact: {
      email: "export@audiotech.cn",
      phone: "+86-755-8888-9999",
      website: "https://audiotech-global.com",
    },
    businessProfile: {
      companySize: "500+",
      yearEstablished: 2008,
      annualRevenue: "$100M - $500M",
      employeeCount: 1200,
      certifications: ["ISO 9001", "ISO 14001", "CE", "FCC"],
      specializations: ["OEM Manufacturing", "Bluetooth Audio", "Consumer Electronics"],
    },
  },
  {
    name: "EuroSound GmbH",
    marketShare: "15%",
    priceRange: { min: 65, max: 120 },
    strengths: ["Premium quality", "European design", "Sustainability focus"],
    geoLocation: {
      latitude: 52.52,
      longitude: 13.405,
      formattedAddress: "Friedrichstraße 123, 10117 Berlin, Germany",
      city: "Berlin",
      state: "Berlin",
      country: "Germany",
    },
    contact: {
      email: "info@eurosound.de",
      phone: "+49-30-1234567",
      website: "https://eurosound.de",
      linkedIn: "https://linkedin.com/company/eurosound",
    },
    businessProfile: {
      companySize: "51-200",
      yearEstablished: 2015,
      annualRevenue: "$10M - $50M",
      employeeCount: 85,
      certifications: ["ISO 9001", "ISO 14001", "CE", "Blue Angel"],
      specializations: ["Sustainable Audio", "Premium Design"],
    },
  },
];

export const DEMO_SUBSTITUTE_COMPETITORS: SubstituteCompetitor[] = [
  {
    id: "sub-comp-1",
    name: "BassWave Audio",
    substituteProduct: "Portable Party Speaker",
    similarity: 75,
    priceRange: { min: 55, max: 95 },
    marketShare: "8%",
    threat: "medium",
    differentiators: ["Higher power output", "RGB lighting", "Outdoor focused"],
    geoLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      formattedAddress: "789 Market Street, San Francisco, CA 94103, USA",
      city: "San Francisco",
      state: "California",
      country: "USA",
    },
    contact: {
      email: "partnerships@basswave.com",
      website: "https://basswave.com",
    },
  },
  {
    id: "sub-comp-2",
    name: "MiniSound Co.",
    substituteProduct: "Ultra-Compact Travel Speaker",
    similarity: 68,
    priceRange: { min: 25, max: 45 },
    marketShare: "5%",
    threat: "low",
    differentiators: ["Ultra-portable", "Budget-friendly", "Travel-focused"],
    geoLocation: {
      latitude: 35.6762,
      longitude: 139.6503,
      formattedAddress: "1-1 Shibuya, Tokyo 150-0002, Japan",
      city: "Tokyo",
      country: "Japan",
    },
    contact: {
      email: "sales@minisound.jp",
      phone: "+81-3-1234-5678",
      website: "https://minisound.co.jp",
    },
  },
];

export const DEMO_HEAT_MAP_REGIONS: MarketHeatMapRegion[] = [
  {
    region: "North America",
    demand: "high",
    competitorCount: 45,
    avgPrice: 65,
    growth: "+12%",
    opportunity: "excellent",
    demandConcentration: 78,
    geoLocation: {
      latitude: 37.0902,
      longitude: -95.7129,
      formattedAddress: "United States",
      city: "Kansas City",
      country: "USA",
    },
  },
  {
    region: "Western Europe",
    demand: "high",
    competitorCount: 38,
    avgPrice: 85,
    growth: "+8%",
    opportunity: "good",
    demandConcentration: 65,
    geoLocation: {
      latitude: 48.8566,
      longitude: 2.3522,
      formattedAddress: "Paris, France",
      city: "Paris",
      country: "France",
    },
  },
  {
    region: "East Asia",
    demand: "high",
    competitorCount: 120,
    avgPrice: 45,
    growth: "+18%",
    opportunity: "moderate",
    demandConcentration: 88,
    geoLocation: {
      latitude: 35.6762,
      longitude: 139.6503,
      formattedAddress: "Tokyo, Japan",
      city: "Tokyo",
      country: "Japan",
    },
  },
  {
    region: "Southeast Asia",
    demand: "medium",
    competitorCount: 55,
    avgPrice: 35,
    growth: "+22%",
    opportunity: "excellent",
    demandConcentration: 52,
    geoLocation: {
      latitude: 1.3521,
      longitude: 103.8198,
      formattedAddress: "Singapore",
      city: "Singapore",
      country: "Singapore",
    },
  },
  {
    region: "Latin America",
    demand: "medium",
    competitorCount: 25,
    avgPrice: 55,
    growth: "+15%",
    opportunity: "good",
    demandConcentration: 42,
    geoLocation: {
      latitude: -23.5505,
      longitude: -46.6333,
      formattedAddress: "São Paulo, Brazil",
      city: "São Paulo",
      country: "Brazil",
    },
  },
];

export const DEMO_MARKET_RESULT: MarketAnalysisResult = {
  productIdentification: {
    name: "Wireless Bluetooth Speaker",
    category: "Consumer Electronics",
    attributes: {
      "Power Output": "20W",
      "Battery Life": "12 hours",
      "Connectivity": "Bluetooth 5.0",
      "Material": "Aluminum + Fabric",
      "Water Resistance": "IPX5",
    },
  },
  competitors: DEMO_COMPETITORS,
  substituteCompetitors: DEMO_SUBSTITUTE_COMPETITORS,
  marketHeatMap: DEMO_HEAT_MAP_REGIONS,
  marketPriceRange: {
    min: 35,
    max: 120,
    average: 65,
  },
  pricingRecommendation: {
    suggested: 59,
    marginScenarios: [
      { margin: "20%", price: 52, competitiveness: "Very Competitive" },
      { margin: "35%", price: 59, competitiveness: "Competitive" },
      { margin: "50%", price: 68, competitiveness: "Premium" },
    ],
  },
  demandIndicators: {
    searchVolume: "85,000/mo",
    trend: "rising",
    seasonality: "Q4 peak (holiday season)",
  },
  confidence: 92,
};
